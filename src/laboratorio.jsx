import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Eye,
  FileText,
  FlaskConical,
  Lightbulb,
  ListFilter,
  Lock,
  RotateCcw,
  Search,
  ShieldCheck,
  Table2,
  Trophy,
  X,
} from 'lucide-react';
import { PageHeader } from './ui.jsx';
import { AutoAvaliacao } from './painelAluno.jsx';
import CaseAnswerSheet from './CaseAnswerSheet.jsx';
import { buildScenarioDocument, minimumEvidenceRequired } from './scenarioDocuments.js';
import { tracks } from './courseData.js';
import {
  getLabSources,
  getPopLabSource,
  LAB_SOURCE_POLICY,
} from './labSources.js';
import { nivelDoCaso } from './niveisLab.js';
import { useMediaQuery } from './useMediaQuery.js';
import './routeStyles.css';
// As regras do Laboratorio sairam daqui em 05/08/2026. Esta tela passou a
// consumi-las como qualquer outro modulo, e os testes que exercitam regra
// deixaram de carregar React, icones e folha de estilo para isso.
import {
  calcularIndicadoresLaboratorio,
  conclusaoLaboratorioValida,
  conferirElementos,
  conteudoAjudaLaboratorio,
  criarRascunhoLaboratorio,
  criarCatalogoLaboratorio,
  filtrarCatalogoLaboratorio,
  moveCatalogFocus,
  normalizarRascunhoLaboratorio,
  percentual,
  perguntaBloqueadaLaboratorio,
  registrarConclusaoLaboratorio,
  registrarRascunhoLaboratorio,
  resolverCasoInicialLaboratorio,
  resolverProvenienciaDecisao,
  resolverRemediacaoModulo,
  rotuloResposta,
  scrollLaboratorio,
  scrollToWorkspace,
} from './laboratorioLogica.js';

function rotuloAula(lesson, fallbackId) {
  if (!lesson) return fallbackId;
  return [lesson.number, lesson.title].filter(Boolean).join(' · ');
}

function DecisionProvenance({ provenance, lessonMap }) {
  if (!provenance) return null;
  const mixed = provenance.supportMode === 'mixed';
  const pending = provenance.reviewStatus === 'needs-technical-review';
  return (
    <details className={`lab-source-details${pending ? ' pending' : ''}`}>
      <summary>
        Fundamento e evidências desta decisão
        <span>{provenance.popSources.length} {provenance.popSources.length === 1 ? 'trecho' : 'trechos'}</span>
      </summary>
      <div className="lab-source-body">
        <div className="lab-source-badges" aria-label="Situação da fundamentação">
          <span>{mixed ? 'POP + caso sintético' : 'Fundamento da minuta POP'}</span>
          <span>{pending ? 'Pendente de revisão técnica' : 'Mapeamento preliminar'}</span>
        </div>
        {pending && (
          <p className="lab-source-warning">
            Esta conclusão combina interpretação ou dado do caso que a minuta não resolve
            sozinha. Ela deve ser revisada por pessoa tecnicamente responsável antes de
            qualquer uso fora do treinamento.
          </p>
        )}
        {provenance.popSources.map((source) => {
          const lesson = lessonMap?.get?.(source.sec);
          return (
            <figure className="lab-source-quote" key={source.id}>
              <blockquote>{source.quote}</blockquote>
              <figcaption>
                <a href={`#/aula/${encodeURIComponent(source.sec)}`}>
                  Minuta POP v1.9 · {rotuloAula(lesson, source.sec)}
                  <ArrowRight aria-hidden="true" />
                </a>
              </figcaption>
            </figure>
          );
        })}
        {provenance.evidenceTitles.length > 0 && (
          <div className="lab-case-evidence">
            <strong>Dados sintéticos usados neste caso</strong>
            <ul>
              {provenance.evidenceTitles.map((title) => <li key={title}>{title}</li>)}
            </ul>
          </div>
        )}
        <p className="fund-nota">
          {LAB_SOURCE_POLICY.reviewStatuses[provenance.reviewStatus]}
        </p>
      </div>
    </details>
  );
}

function EvidenceDocument({
  document,
  note,
  onNote,
  onClose,
  panelId,
  panelRef,
  readOnly = false,
}) {
  if (!document) return null;
  return (
    <article
      id={panelId}
      ref={panelRef}
      className="evidence-document"
      data-watermark={document.watermark}
      aria-labelledby={`evidence-${document.id}`}
      tabIndex={-1}
    >
      <header>
        <div>
          <small>{document.id} · {document.subtitle}</small>
          <h4 id={`evidence-${document.id}`}>{document.title}</h4>
        </div>
        <button type="button" onClick={onClose} aria-label={`Fechar ${document.title}`}>
          <X aria-hidden="true" />
        </button>
      </header>
      <dl>
        {document.fields.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <p className="evidence-checkpoint">
        <strong>Ponto de controle:</strong> {document.checkpoint}
      </p>
      <label className="evidence-note" htmlFor={`evidence-note-${document.id}`}>
        Registro de análise desta peça
        <textarea
          id={`evidence-note-${document.id}`}
          value={note}
          readOnly={readOnly}
          onChange={(event) => onNote(event.target.value)}
          placeholder="Registre o achado, o trecho usado, a limitação e como esta peça afeta a decisão..."
        />
        <small>{note.trim().length}/40 caracteres mínimos para considerar a peça analisada</small>
      </label>
      <p className="evidence-limit">{document.limitations}</p>
    </article>
  );
}

function DecisionReview({ scenario, answers, lessonMap }) {
  const remediation = resolverRemediacaoModulo(scenario);
  return (
    <>
      <ol className="lab-answer-review" aria-label="Revisão das decisões">
        {scenario.questions.map((question, index) => {
          const learner = answers[index];
          const expected = question[1];
          const correct = learner === expected;
          const provenance = resolverProvenienciaDecisao(scenario, index);
          return (
            <li key={question[0]}>
              <span>{question[0]}</span>
              <b className={correct ? 'correct' : 'incorrect'}>
                {correct ? 'Alinhada' : 'Revisar'}
              </b>
              <span>
                sua resposta: {rotuloResposta(learner)} · esperado no caso: {rotuloResposta(expected)}
              </span>
              <p>
                Confronte a decisão com{' '}
                <strong>
                  {provenance?.evidenceTitles?.join(', ')
                    || 'as evidências sintéticas indicadas no cenário'}
                </strong>.
                O gabarito vale apenas para este cenário sintético; revise o fundamento
                {remediation ? <> no módulo {remediation.code}</> : ' no módulo correspondente'}
                {' '}antes de transferir a conclusão para outro caso.
              </p>
              <DecisionProvenance provenance={provenance} lessonMap={lessonMap} />
            </li>
          );
        })}
      </ol>
      {remediation && (
        <>
          <a className="source-jump" href={remediation.href}>
            Revisar {remediation.code} · {remediation.title}
            <ArrowRight aria-hidden="true" />
          </a>
          <p className="fund-nota">
            Remediação geral do módulo: o link abre a primeira aula existente do percurso.
            Ele não identifica uma fonte específica para cada decisão deste cenário.
          </p>
        </>
      )}
    </>
  );
}

function conclusaoCompativelComTarefa(registro, scenario) {
  if (!conclusaoLaboratorioValida(registro)) return false;
  const revisaoAtual = Number(scenario?.taskRevision) || 0;
  return revisaoAtual === 0 || Number(registro.taskRevision) === revisaoAtual;
}

function EvidenceClassificationReview({ scenario, classifications, lessonMap }) {
  const task = scenario.evidenceTask;
  if (!task) return null;
  const choiceLabels = new Map(task.choices.map((choice) => [choice.id, choice.label]));
  return (
    <section className="lab-classification-review" aria-label="Revisão da classificação das evidências">
      <h4>Uso das evidências</h4>
      <p>{task.prompt}</p>
      <ol>
        {task.items.map((item) => {
          const title = scenario.evidence[item.evidenceIndex];
          const learner = classifications[title];
          const aligned = learner === item.expectedUse;
          const sources = item.sourceRefs
            .map((sectionId) => getPopLabSource(
              sectionId,
              `lab-task-${scenario.id}-e${item.evidenceIndex + 1}-${sectionId}`,
            ))
            .filter(Boolean);
          return (
            <li key={title}>
              <div>
                <strong>{title}</strong>
                <b className={aligned ? 'correct' : 'incorrect'}>
                  {aligned ? 'Alinhada' : 'Revisar'}
                </b>
              </div>
              <p>
                Sua classificação: {choiceLabels.get(learner) || 'não informada'} · esperado: {' '}
                {choiceLabels.get(item.expectedUse)}.
              </p>
              <p>{item.rationale}</p>
              <details className="lab-source-details">
                <summary>{sources.length} {sources.length === 1 ? 'fonte' : 'fontes'} no POP</summary>
                <div className="lab-source-body">
                  {sources.map((source) => {
                    const lesson = lessonMap?.get?.(source.sec);
                    return (
                      <figure className="lab-source-quote" key={`${scenario.id}-${item.evidenceIndex}-${source.sec}`}>
                        <blockquote>{source.quote}</blockquote>
                        <figcaption>
                          <a href={`#/aula/${encodeURIComponent(source.sec)}`}>
                            Minuta POP v1.9 · {rotuloAula(lesson, source.sec)}
                            <ArrowRight aria-hidden="true" />
                          </a>
                        </figcaption>
                      </figure>
                    );
                  })}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const HELP_LEVELS = [
  {
    action: 'Ver o que observar',
    description: 'Reúne os fatos declarados e as peças que precisam ser confrontadas.',
  },
  {
    action: 'Abrir perguntas-guia',
    description: 'Transforma o percurso em perguntas, sem indicar respostas.',
  },
  {
    action: 'Mostrar critérios mínimos',
    description: 'Exibe os pontos que uma fundamentação defensável precisa abordar.',
  },
];

function ProgressiveHelp({ scenario, level, onAdvance, mode }) {
  const content = conteudoAjudaLaboratorio(scenario, level);
  const next = HELP_LEVELS[level];
  return (
    <section className={`lab-help-ladder mode-${mode}`} aria-labelledby="lab-help-title">
      <header>
        <div>
          <Lightbulb aria-hidden="true" />
          <div>
            <h3 id="lab-help-title">Ajuda progressiva</h3>
            <p>
              Consulte somente o apoio necessário. As respostas esperadas continuam
              reservadas para o debriefing.
            </p>
          </div>
        </div>
        <span aria-label={`Nível de ajuda ${content.level} de 3`}>
          {content.level}/3
        </span>
      </header>

      {content.level === 0 && (
        <p className="lab-help-empty">
          {mode === 'desafio'
            ? 'No modo Desafio, o apoio começa fechado.'
            : 'Comece pelas peças do caso. Se travar, abra a orientação em etapas.'}
        </p>
      )}

      {content.level >= 1 && (
        <div className="lab-help-section">
          <strong>1. Fatos e peças a confrontar</strong>
          <div className="lab-help-columns">
            <ul>
              {content.facts.map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
            <ul>
              {content.evidence.map((title) => <li key={title}>{title}</li>)}
              {content.ausentes.map((title) => (
                <li key={title} className="lab-ausente">
                  <span>não consta</span> {title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {content.level >= 2 && (
        <div className="lab-help-section">
          <strong>2. Perguntas para organizar o raciocínio</strong>
          <ol>
            {content.questions.map((question) => <li key={question}>{question}</li>)}
          </ol>
        </div>
      )}

      {content.level >= 3 && (
        <div className="lab-help-section">
          <strong>3. Conteúdo mínimo da fundamentação</strong>
          <ul className="lab-help-criteria">
            {content.criteria.map((criterion) => (
              <li key={criterion}><Circle aria-hidden="true" /> {criterion}</li>
            ))}
          </ul>
        </div>
      )}

      {next && (
        <button type="button" onClick={onAdvance}>
          <span>
            <strong>{next.action}</strong>
            <small>{next.description}</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

export default function Laboratorio({
  state,
  setState,
  scenarios,
  grupos,
  lessonMap,
  initialScenarioId,
  onSelectScenario,
}) {
  const [selected, setSelected] = useState(() => resolverCasoInicialLaboratorio({
    scenarios,
    grupos,
    labs: state.labs,
    initialScenarioId,
  }));
  const [answers, setAnswers] = useState({});
  const [reason, setReason] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [seenEvidence, setSeenEvidence] = useState({});
  const [evidenceNotes, setEvidenceNotes] = useState({});
  const [evidenceClassifications, setEvidenceClassifications] = useState({});
  const [activeEvidence, setActiveEvidence] = useState(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [complexityFilter, setComplexityFilter] = useState('todas');
  const [mode, setMode] = useState('guiado');
  const [helpLevels, setHelpLevels] = useState({});
  const [catalogOpen, setCatalogOpen] = useState(false);
  const evidencePanelRef = useRef(null);
  const evidenceTriggerRef = useRef(null);
  const catalogRef = useRef(null);
  const catalogTriggerRef = useRef(null);
  const mobileCatalog = useMediaQuery('(max-width: 760px)');

  const catalog = useMemo(
    () => criarCatalogoLaboratorio(scenarios, grupos),
    [scenarios, grupos],
  );
  const filteredCatalog = useMemo(
    () => filtrarCatalogoLaboratorio(catalog, {
      query,
      categoria: categoryFilter,
      complexidade: complexityFilter,
    }),
    [catalog, query, categoryFilter, complexityFilter],
  );
  const catalogProgress = useMemo(
    () => catalog.reduce((summary, entry) => {
      const saved = state.labs?.[entry.scenario.id];
      if (normalizarRascunhoLaboratorio(saved, entry.scenario)) {
        summary.inProgress += 1;
      } else if (
        conclusaoCompativelComTarefa(saved, entry.scenario)
        || (saved && saved.status == null && !entry.scenario.taskRevision)
      ) {
        summary.completed += 1;
      }
      return summary;
    }, { completed: 0, inProgress: 0 }),
    [catalog, state.labs],
  );
  const selectedEntry = catalog.find((entry) => entry.scenario.id === selected) || catalog[0];
  const scenario = selectedEntry?.scenario || scenarios[0];
  const group = selectedEntry?.group
    || grupos.find((item) => item.ids.includes(scenario.id));
  const selectedSaved = state.labs?.[scenario.id];
  const selectedDraft = normalizarRascunhoLaboratorio(selectedSaved, scenario);
  // Complexidades oferecidas no filtro sao as que EXISTEM no catalogo, na
  // ordem da escada. Listar degrau vazio faria o filtro devolver zero caso e
  // parecer defeito.
  const complexities = useMemo(() => {
    const presentes = new Map();
    for (const item of catalog) {
      if (item.nivel && !presentes.has(item.nivel.id)) presentes.set(item.nivel.id, item.nivel);
    }
    return [...presentes.values()].sort((a, b) => a.ordem - b.ordem);
  }, [catalog]);
  const helpLevel = helpLevels[selected] || 0;
  const measuredLevel = nivelDoCaso(scenario);
  const requiresAllEvidence = measuredLevel.ordem >= 4;
  const minimumEvidence = requiresAllEvidence
    ? scenario.evidence.length
    : minimumEvidenceRequired(scenario);
  const answered = Object.keys(answers).length;
  const score = scenario.questions.filter((question, index) => answers[index] === question[1]).length;
  const classificationItems = scenario.evidenceTask?.items || [];
  const classifiedCount = classificationItems.filter((item) => (
    evidenceClassifications[scenario.evidence[item.evidenceIndex]]
  )).length;
  const classificationScore = classificationItems.filter((item) => (
    evidenceClassifications[scenario.evidence[item.evidenceIndex]] === item.expectedUse
  )).length;
  const reviewedEvidence = scenario.evidence.filter(
    (title) => seenEvidence[title] && (evidenceNotes[title] || '').trim().length >= 40,
  );
  const reviewedCount = reviewedEvidence.length;
  const conference = useMemo(
    () => conferirElementos(scenario, reason),
    [scenario, reason],
  );
  const minimumReasonLength = scenario.openTask?.minCharacters || 180;
  const ready = answered === scenario.questions.length
    && (!classificationItems.length || classifiedCount === classificationItems.length)
    && reviewedCount >= minimumEvidence
    && reason.trim().length >= minimumReasonLength;
  const nextUnanswered = scenario.questions.findIndex((_, index) => !answers[index]);
  const readiness = [
    {
      label: 'Responder às decisões',
      detail: `${answered}/${scenario.questions.length}`,
      done: answered === scenario.questions.length,
      percent: percentual(answered, scenario.questions.length),
    },
    ...(classificationItems.length ? [{
      label: 'Classificar o uso das evidências',
      detail: `${classifiedCount}/${classificationItems.length}`,
      done: classifiedCount === classificationItems.length,
      percent: percentual(classifiedCount, classificationItems.length),
    }] : []),
    {
      label: 'Analisar as evidências mínimas',
      detail: `${reviewedCount}/${minimumEvidence}`,
      done: reviewedCount >= minimumEvidence,
      percent: Math.min(100, percentual(reviewedCount, minimumEvidence)),
    },
    {
      label: 'Registrar a fundamentação',
      detail: `${reason.trim().length}/${minimumReasonLength}`,
      done: reason.trim().length >= minimumReasonLength,
      percent: Math.min(100, percentual(reason.trim().length, minimumReasonLength)),
    },
  ];
  const completedReadiness = readiness.filter((item) => item.done).length;

  const {
    rubrica: rubric,
    indiceCompletude: rubricTotal,
    objetivoPercentual,
  } = calcularIndicadoresLaboratorio({
    decisoesAlinhadas: score,
    totalDecisoes: scenario.questions.length,
    evidenciasRegistradas: reviewedCount,
    minimoEvidencias: minimumEvidence,
    elementosDetectados: conference.tocados,
    totalElementos: conference.total,
    classificacoesAlinhadas: classificationScore,
    totalClassificacoes: classificationItems.length,
    tarefaAberta: Boolean(scenario.openTask),
  });

  useEffect(() => {
    if (
      initialScenarioId
      && initialScenarioId !== selected
      && scenarios.some((item) => item.id === initialScenarioId)
    ) {
      setSelected(initialScenarioId);
    }
  }, [initialScenarioId, scenarios, selected]);

  useLayoutEffect(() => {
    const saved = state.labs?.[selected];
    const draft = normalizarRascunhoLaboratorio(saved, scenario);
    const currentConclusion = conclusaoCompativelComTarefa(saved, scenario);
    const source = draft || (currentConclusion ? saved : null);
    const savedAnswers = draft?.respostas
      || (currentConclusion && saved?.respostas
        ? saved.respostas
        : {});
    setAnswers(savedAnswers);
    setReason(source?.texto || '');
    setShowResult(Boolean(
      !draft
      && currentConclusion,
    ));
    setShowSummary(false);
    setSeenEvidence(Object.fromEntries(
      (source?.evidenciasConsultadas || []).map((title) => [title, true]),
    ));
    setEvidenceNotes(source?.evidenciasAnotadas || {});
    setEvidenceClassifications(source?.classificacoesEvidencias || {});
    setActiveEvidence(null);
    evidenceTriggerRef.current = null;
    setMode(source?.modo === 'desafio' ? 'desafio' : 'guiado');
    setHelpLevels((current) => ({
      ...current,
      [selected]: Math.max(0, Math.min(3, source?.nivelAjuda || 0)),
    }));
  }, [scenario, selected]);

  useEffect(() => {
    if (!activeEvidence) return undefined;
    const frame = requestAnimationFrame(() => evidencePanelRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [activeEvidence]);

  useEffect(() => {
    if (!mobileCatalog || !catalogOpen) return undefined;
    const dialog = catalogRef.current;
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const focusable = () => [...(dialog?.querySelectorAll(selector) || [])]
      .filter((element) => element.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      dialog?.querySelector('#lab-case-search')?.focus();
    });
    const containFocus = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setCatalogOpen(false);
        requestAnimationFrame(() => catalogTriggerRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', containFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', containFocus);
    };
  }, [catalogOpen, mobileCatalog]);

  useEffect(() => {
    if (!mobileCatalog && catalogOpen) setCatalogOpen(false);
  }, [catalogOpen, mobileCatalog]);

  function salvarRascunho(patch = {}) {
    const atualizadoEm = new Date().toISOString();
    const rascunho = criarRascunhoLaboratorio({
      answers: patch.answers ?? answers,
      reason: patch.reason ?? reason,
      seenEvidence: patch.seenEvidence ?? seenEvidence,
      evidenceNotes: patch.evidenceNotes ?? evidenceNotes,
      evidenceClassifications: patch.evidenceClassifications ?? evidenceClassifications,
      mode: patch.mode ?? mode,
      helpLevel: patch.helpLevel ?? helpLevel,
      atualizadoEm,
    });
    setState((current) => ({
      ...current,
      labs: {
        ...(current.labs || {}),
        [scenario.id]: registrarRascunhoLaboratorio(
          current.labs?.[scenario.id],
          rascunho,
        ),
      },
    }));
  }

  function selecionarModo(nextMode) {
    setMode(nextMode);
    salvarRascunho({ mode: nextMode });
  }

  function responder(index, value) {
    const nextAnswers = { ...answers, [index]: value };
    setAnswers(nextAnswers);
    salvarRascunho({ answers: nextAnswers });
  }

  function atualizarFundamentacao(value) {
    setReason(value);
    salvarRascunho({ reason: value });
  }

  function avancarAjuda() {
    const nextLevel = Math.min(3, helpLevel + 1);
    setHelpLevels((current) => ({
      ...current,
      [selected]: nextLevel,
    }));
    salvarRascunho({ helpLevel: nextLevel });
  }

  function reiniciarTentativa() {
    const nextAnswers = {};
    const nextSeenEvidence = {};
    const nextEvidenceNotes = {};
    const nextEvidenceClassifications = {};
    setAnswers(nextAnswers);
    setReason('');
    setShowResult(false);
    setShowSummary(false);
    setSeenEvidence(nextSeenEvidence);
    setEvidenceNotes(nextEvidenceNotes);
    setEvidenceClassifications(nextEvidenceClassifications);
    setActiveEvidence(null);
    setMode('guiado');
    setHelpLevels((current) => ({ ...current, [selected]: 0 }));
    salvarRascunho({
      answers: nextAnswers,
      reason: '',
      seenEvidence: nextSeenEvidence,
      evidenceNotes: nextEvidenceNotes,
      evidenceClassifications: nextEvidenceClassifications,
      mode: 'guiado',
      helpLevel: 0,
    });
  }

  function selectScenario(id) {
    setSelected(id);
    onSelectScenario?.(id);
    if (mobileCatalog) {
      setCatalogOpen(false);
      setTimeout(scrollToWorkspace, 0);
    }
  }

  function closeCatalog() {
    setCatalogOpen(false);
    requestAnimationFrame(() => catalogTriggerRef.current?.focus());
  }

  function openEvidence(title, index, trigger) {
    const nextSeenEvidence = { ...seenEvidence, [title]: true };
    evidenceTriggerRef.current = trigger || null;
    setSeenEvidence(nextSeenEvidence);
    setActiveEvidence(buildScenarioDocument(scenario, title, index));
    salvarRascunho({ seenEvidence: nextSeenEvidence });
  }

  function closeEvidence() {
    const trigger = evidenceTriggerRef.current;
    setActiveEvidence(null);
    requestAnimationFrame(() => trigger?.focus?.());
  }

  function atualizarNotaEvidencia(title, value) {
    const nextEvidenceNotes = {
      ...evidenceNotes,
      [title]: value,
    };
    setEvidenceNotes(nextEvidenceNotes);
    salvarRascunho({ evidenceNotes: nextEvidenceNotes });
  }

  function classificarEvidencia(title, value) {
    const nextClassifications = {
      ...evidenceClassifications,
      [title]: value,
    };
    setEvidenceClassifications(nextClassifications);
    salvarRascunho({ evidenceClassifications: nextClassifications });
  }

  function finish() {
    if (!ready) return;
    const now = new Date().toISOString();
    setShowResult(true);
    setState((current) => {
      const conclusaoAtual = {
        score,
        total: scenario.questions.length,
        date: now,
        status: 'concluido',
        respostas: { ...answers },
        texto: reason,
        elementos: conference.tocados,
        elementosTotal: conference.total,
        evidenciasConsultadas: Object.keys(seenEvidence).filter((key) => seenEvidence[key]),
        evidenciasAnotadas: Object.fromEntries(
          Object.entries(evidenceNotes).filter(([, value]) => value.trim().length >= 40),
        ),
        classificacoesEvidencias: { ...evidenceClassifications },
        classificacoesAlinhadas: classificationScore,
        classificacoesTotal: classificationItems.length,
        rubrica: rubric,
        rubricaTotal: rubricTotal,
        indiceCompletude: rubricTotal,
        objetivoPercentual,
        taskRevision: scenario.taskRevision || 0,
        conferenciaTecnicaPendente: true,
        modo: mode,
        apoioUtilizado: helpLevel > 0,
        nivelAjuda: helpLevel,
        versao: 3,
      };
      return {
        ...current,
        labs: {
          ...(current.labs || {}),
          [scenario.id]: registrarConclusaoLaboratorio(
            current.labs?.[scenario.id],
            conclusaoAtual,
          ),
        },
      };
    });
  }

  return (
    <div className="page lab-page lab-premium">
      <PageHeader
        title="Pratique antes de assinar"
        subtitle="Abra peças do caso, confronte evidências, decida e sustente a conclusão com uma rubrica explícita."
        icon={FlaskConical}
      />

      <div className="lab-trust-note">
        <ShieldCheck aria-hidden="true" />
        <p>
          <strong>Ambiente de treinamento.</strong> Casos e documentos são sintéticos,
          e o debriefing separa o fundamento extraído da minuta POP v1.9 dos fatos,
          cálculos e inferências produzidos para a prática. Nada aqui reproduz processo,
          empreendimento, assinatura, decisão ou aprovação institucional.
        </p>
      </div>

      <button
        type="button"
        className="lab-catalog-open"
        ref={catalogTriggerRef}
        aria-expanded={catalogOpen}
        aria-controls="lab-case-catalog-drawer"
        onClick={() => setCatalogOpen(true)}
      >
        <ListFilter aria-hidden="true" />
        <span>
          <strong>Escolher outro caso</strong>
          <small>{scenario.label} · {scenario.title}</small>
        </span>
        <ArrowRight aria-hidden="true" />
      </button>

      {mobileCatalog && catalogOpen && (
        <button
          type="button"
          className="lab-catalog-scrim"
          aria-label="Fechar catálogo de casos"
          onClick={closeCatalog}
        />
      )}

      <section
        id="lab-case-catalog-drawer"
        ref={catalogRef}
        className={`lab-catalog ${catalogOpen ? 'mobile-open' : ''}`}
        aria-labelledby="lab-catalog-title"
        aria-hidden={mobileCatalog && !catalogOpen}
        aria-modal={mobileCatalog && catalogOpen ? 'true' : undefined}
        role={mobileCatalog ? 'dialog' : undefined}
        inert={mobileCatalog && !catalogOpen}
      >
        <header className="lab-catalog-header">
          <div>
            <span className="lab-eyebrow"><ListFilter aria-hidden="true" /> Biblioteca de casos</span>
            <h2 id="lab-catalog-title">Escolha o caso certo para praticar</h2>
            <p>
              Pesquise um tema ou combine categoria e complexidade. Seu último caso
              praticado é retomado automaticamente.
            </p>
          </div>
          <span className="lab-catalog-total">
            {catalogProgress.completed}
            <small>
              de {catalog.length} concluídos · {catalogProgress.inProgress} em andamento
            </small>
          </span>
          <button
            type="button"
            className="lab-catalog-close"
            aria-label="Fechar catálogo de casos"
            onClick={closeCatalog}
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="lab-catalog-toolbar">
          <label className="lab-catalog-search" htmlFor="lab-case-search">
            <span>Pesquisar casos</span>
            <div>
              <Search aria-hidden="true" />
              <input
                id="lab-case-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: transição, PACUERA, condicionantes"
              />
            </div>
          </label>
          <label htmlFor="lab-category-filter">
            <span>Categoria</span>
            <select
              id="lab-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="todas">Todas as categorias</option>
              {grupos.map((item) => (
                <option value={item.id} key={item.id}>{item.titulo}</option>
              ))}
            </select>
          </label>
          <label htmlFor="lab-complexity-filter">
            <span>Complexidade</span>
            <select
              id="lab-complexity-filter"
              value={complexityFilter}
              onChange={(event) => setComplexityFilter(event.target.value)}
            >
              <option value="todas">Todas as complexidades</option>
              {complexities.map((complexity) => (
                <option value={complexity.id} key={complexity.id}>
                  {complexity.ordem}. {complexity.titulo} · {complexity.tarefa}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="lab-catalog-results">
          <p aria-live="polite">
            <strong>{filteredCatalog.length}</strong>
            {' '}{filteredCatalog.length === 1 ? 'caso encontrado' : 'casos encontrados'}
          </p>
          {(query || categoryFilter !== 'todas' || complexityFilter !== 'todas') && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategoryFilter('todas');
                setComplexityFilter('todas');
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>

        {filteredCatalog.length > 0 ? (
          <ol className="lab-case-catalog" aria-label="Catálogo de casos">
            {filteredCatalog.map(({ scenario: candidate, group: candidateGroup, nivel: candidateNivel }, index) => {
              const saved = state.labs?.[candidate.id];
              const draft = normalizarRascunhoLaboratorio(saved, candidate);
              const practiced = conclusaoCompativelComTarefa(saved, candidate)
                || Boolean(saved && saved.status == null && !candidate.taskRevision);
              const isSelected = selected === candidate.id;
              return (
                <li key={candidate.id}>
                  <button
                    type="button"
                    data-lab-case={candidate.id}
                    className={isSelected ? 'active' : ''}
                    aria-pressed={isSelected}
                    onKeyDown={(event) => moveCatalogFocus(event, index)}
                    onClick={() => selectScenario(candidate.id)}
                  >
                    <span>
                      <small>{candidateGroup.titulo} · {candidateNivel?.titulo || candidateGroup.nivel}</small>
                      <strong>{candidate.label}</strong>
                    </span>
                    {draft ? (
                      <span className="lab-case-status in-progress">
                        <Activity aria-hidden="true" />
                        Em andamento
                      </span>
                    ) : practiced ? (
                      <span className="lab-case-status">
                        <CheckCircle2 aria-hidden="true" />
                        {saved.nivelAjuda > 0 ? 'Praticado com apoio' : 'Praticado'}
                      </span>
                    ) : (
                      <ArrowRight aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="lab-catalog-empty" role="status">
            <Search aria-hidden="true" />
            <strong>Nenhum caso corresponde aos filtros.</strong>
            <span>Experimente remover um filtro ou buscar por outro termo.</span>
          </div>
        )}

        <article className="lab-selected-overview" aria-live="polite">
          <div>
            <span className="lab-eyebrow">Caso selecionado · {group?.titulo}</span>
            <h3>{scenario.label}</h3>
            <p>{scenario.title}</p>
            <ul>
              {scenario.facts.slice(0, 2).map((fact) => <li key={fact}>{fact}</li>)}
            </ul>
          </div>
          <div className="lab-selected-meta" aria-label="Resumo do caso selecionado">
            <span><strong>{nivelDoCaso(scenario)?.titulo || group?.nivel || 'Prática'}</strong>complexidade</span>
            <span><strong>{scenario.evidence.length}</strong>evidências</span>
            <span><strong>{scenario.questions.length}</strong>decisões</span>
            <button type="button" onClick={scrollToWorkspace}>
              {selectedDraft
                ? 'Continuar caso'
                : selectedSaved
                  ? 'Rever caso'
                  : 'Começar caso'}
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </article>
      </section>

      <section className="lab-mode-bar" aria-labelledby="lab-mode-title">
        <div>
          <span className="lab-eyebrow">Formato da prática</span>
          <h2 id="lab-mode-title">Como você quer resolver este caso?</h2>
          <p>
            {mode === 'guiado'
              ? 'No modo Guiado, as decisões são liberadas em sequência e o apoio pode ser aberto por etapas.'
              : 'No modo Desafio, todas as decisões ficam disponíveis desde o início e o apoio começa fechado.'}
          </p>
        </div>
        <div className="lab-mode-options" role="group" aria-label="Modo de resolução">
          <button
            type="button"
            className={mode === 'guiado' ? 'active' : ''}
            aria-pressed={mode === 'guiado'}
            onClick={() => selecionarModo('guiado')}
          >
            Guiado
            <small>Sequência orientada</small>
          </button>
          <button
            type="button"
            className={mode === 'desafio' ? 'active' : ''}
            aria-pressed={mode === 'desafio'}
            onClick={() => selecionarModo('desafio')}
          >
            Desafio
            <small>Decisões livres</small>
          </button>
        </div>
      </section>

      <div className={`lab-workspace mode-${mode}`}>
        <section className="lab-canvas" key={selected}>
          <div className="case-header">
            <div>
              <small>CENÁRIO · {scenario.type} · {group?.nivel || 'Prática'}</small>
              <h2>{scenario.title}</h2>
            </div>
            <div className="case-header-actions">
              <button
                type="button"
                className={showSummary ? 'active' : ''}
                aria-expanded={showSummary}
                onClick={() => setShowSummary((current) => !current)}
              >
                <FileText aria-hidden="true" /> Resumo do caso
              </button>
              <div
                className="lab-answer-sheet-slot"
                data-answer-sheet-slot={scenario.id}
              >
                <CaseAnswerSheet
                  caseData={scenario}
                  groups={grupos}
                  lessonMap={lessonMap}
                />
              </div>
            </div>
          </div>

          {showSummary && (
            <div className="case-summary">
              <p><strong>{scenario.title}</strong>, cenário de {scenario.type}.</p>
              <ul>{scenario.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
              <p>
                {scenario.evidence.length} evidências · {scenario.questions.length} decisões ·
                debriefing e rubrica ao finalizar. As peças reúnem os dados complementares
                que precisam ser confrontados durante a análise.
              </p>
            </div>
          )}

          <div className="case-facts" aria-label="Fatos declarados no caso">
            {scenario.facts.map((fact) => (
              <span key={fact}><Activity aria-hidden="true" />{fact}</span>
            ))}
          </div>

          {scenario.serie && (
            <figure className="lab-serie">
              <figcaption><Table2 aria-hidden="true" size={15} /> {scenario.serie.titulo}</figcaption>
              <div className="ls-rolagem">
                <table>
                  <thead><tr>{scenario.serie.colunas.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                  <tbody>
                    {scenario.serie.linhas.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {scenario.serie.nota && <small><Lightbulb aria-hidden="true" size={13} /> {scenario.serie.nota}</small>}
            </figure>
          )}

          <ProgressiveHelp
            scenario={scenario}
            level={helpLevel}
            mode={mode}
            onAdvance={avancarAjuda}
          />

          <div className="decision-path" aria-label="Percurso de decisão">
            <div className="path-node complete"><span>1</span><strong>Triagem</strong><Check aria-hidden="true" /></div>
            {scenario.questions.map((question, index) => (
              <React.Fragment key={question[0]}>
                <i className={answers[index] ? 'active' : ''} aria-hidden="true" />
                <button
                  type="button"
                  className={`path-node ${answers[index] ? 'complete ' : ''}${index === nextUnanswered ? 'current' : ''}`}
                  aria-label={`Ir para a decisão ${index + 1}: ${scenario.steps?.[index] || `Etapa ${index + 2}`}`}
                  onClick={() => scrollLaboratorio(
                    document.getElementById(`lab-question-${index}`),
                    'center',
                  )}
                >
                  <span>{index + 2}</span>
                  <strong>{scenario.steps?.[index] || `Etapa ${index + 2}`}</strong>
                  {answers[index] ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                </button>
              </React.Fragment>
            ))}
            <i className={answered === scenario.questions.length ? 'active' : ''} aria-hidden="true" />
            <div className={`path-node ${showResult ? 'complete' : ''}`}>
              <span>{scenario.questions.length + 2}</span><strong>Parecer</strong>
              {showResult ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
            </div>
          </div>

          <div className="lab-evidence">
            <div>
              <h3>Evidências disponíveis</h3>
              <p className="evidence-instruction">
                Abra e confronte ao menos {minimumEvidence} {minimumEvidence === 1 ? 'peça' : 'peças'}
                {requiresAllEvidence ? `, no nível ${measuredLevel.titulo}, todas são obrigatórias.` : '.'}
              </p>
              {scenario.evidenceTask && (
                <aside className="lab-evidence-task" role="note">
                  <strong>Classifique antes de concluir</strong>
                  <p>{scenario.evidenceTask.prompt}</p>
                </aside>
              )}
              {scenario.evidence.map((title, index) => {
                const taskItem = scenario.evidenceTask?.items.find(
                  (item) => item.evidenceIndex === index,
                );
                return (
                  <div className="lab-evidence-item" key={title}>
                    <button
                      type="button"
                      className={seenEvidence[title] ? 'seen' : ''}
                      aria-expanded={activeEvidence?.title === title}
                      aria-controls={`evidence-panel-${scenario.id}`}
                      onClick={(event) => openEvidence(title, index, event.currentTarget)}
                    >
                      <FileText aria-hidden="true" />
                      <span>{title}<small>{reviewedEvidence.includes(title) ? 'Análise registrada' : seenEvidence[title] ? 'Aberta · falta registrar a análise' : 'Documento sintético do cenário'}</small></span>
                      {reviewedEvidence.includes(title) ? <CheckCircle2 aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </button>
                    {taskItem && (
                      <label htmlFor={`lab-evidence-use-${scenario.id}-${index}`}>
                        <span>Como esta peça pode ser usada?</span>
                        <select
                          id={`lab-evidence-use-${scenario.id}-${index}`}
                          value={evidenceClassifications[title] || ''}
                          disabled={showResult}
                          onChange={(event) => classificarEvidencia(title, event.target.value)}
                        >
                          <option value="">Escolha uma classificação</option>
                          {scenario.evidenceTask.choices.map((choice) => (
                            <option value={choice.id} key={choice.id}>{choice.label}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                );
              })}
              <EvidenceDocument
                document={activeEvidence}
                note={activeEvidence ? evidenceNotes[activeEvidence.title] || '' : ''}
                readOnly={showResult}
                panelId={`evidence-panel-${scenario.id}`}
                panelRef={evidencePanelRef}
                onNote={(value) => atualizarNotaEvidencia(activeEvidence.title, value)}
                onClose={closeEvidence}
              />
            </div>

            <div className="question-stack">
              <h3>Decisões do percurso</h3>
              {scenario.questions.map((question, index) => {
                const locked = perguntaBloqueadaLaboratorio(mode, index, answers);
                return (
                  <fieldset
                    id={`lab-question-${index}`}
                    key={question[0]}
                    className={locked ? 'locked' : ''}
                  >
                    <legend>{index + 1}. {question[0]}</legend>
                    {locked ? (
                      <span><Lock aria-hidden="true" /> Responda à etapa anterior</span>
                    ) : (
                      <div>
                        <button
                          type="button"
                          disabled={showResult}
                          className={answers[index] === 'sim' ? 'selected' : ''}
                          aria-pressed={answers[index] === 'sim'}
                          onClick={() => responder(index, 'sim')}
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          disabled={showResult}
                          className={answers[index] === 'nao' ? 'selected' : ''}
                          aria-pressed={answers[index] === 'nao'}
                          onClick={() => responder(index, 'nao')}
                        >
                          Não
                        </button>
                      </div>
                    )}
                  </fieldset>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="lab-inspector">
          <div>
            <small>SEU PARECER DIDÁTICO</small>
            <h2>Fundamente a decisão</h2>
            <p>Relacione evidência, fundamento, consequência técnica, incerteza e encaminhamento.</p>
          </div>
          {scenario.openTask && (
            <div className="lab-open-task" role="note">
              <strong>Produto escrito deste caso</strong>
              <p>{scenario.openTask.prompt}</p>
            </div>
          )}
          <label className="lab-reason-label" htmlFor="lab-reason">
            {scenario.openTask ? 'Resposta à tarefa aberta' : 'Fundamentação do caso'}
          </label>
          <textarea
            id="lab-reason"
            value={reason}
            readOnly={showResult}
            onChange={(event) => atualizarFundamentacao(event.target.value)}
            placeholder="Escreva uma fundamentação rastreável. Cite as peças consultadas e explique o efeito das lacunas..."
          />

          <div className="decision-readiness">
            <strong>Critérios para finalizar</strong>
            <ul>
              {readiness.map((item) => (
                <li className={item.done ? 'complete' : ''} key={item.label}>
                  {item.done
                    ? <CheckCircle2 aria-hidden="true" />
                    : <Circle aria-hidden="true" />}
                  <span>
                    <span>{item.label}<b>{item.detail}</b></span>
                    <i><em style={{ width: `${item.percent}%` }} /></i>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="lab-readiness-note" aria-live="polite">
            <span>{ready ? 'Pronto para debriefing' : 'Complete os critérios para finalizar'}</span>
            <span>{ready ? '100%' : `${completedReadiness}/${readiness.length}`}</span>
          </p>

          <button type="button" className="primary" disabled={!ready || showResult} onClick={finish}>
            Finalizar e ver debriefing <ArrowRight aria-hidden="true" />
          </button>

          <div className="lab-tip">
            <Lightbulb aria-hidden="true" />
            <p><strong>Regra de qualidade</strong> “Sim” ou “não” só vale quando a evidência e a consequência estão explícitas.</p>
          </div>

          {showResult && (
            <div className="debrief" aria-live="polite">
              <Trophy aria-hidden="true" />
              <small>DEBRIEFING · RUBRICA V3</small>
              <h3>{rubricTotal}% dos critérios automatizáveis registrados</h3>
              <p>{scenario.outcome}</p>
              <div className="lab-rubric">
                <div>
                  <span>Decisões alinhadas · peso {classificationItems.length > 0 ? '30%' : '40%'}</span>
                  <b>{rubric.decisions}%</b>
                </div>
                <div><span>Evidências com registro mínimo · peso 20%</span><b>{rubric.evidence}%</b></div>
                <div>
                  <span>Indícios textuais encontrados · peso {classificationItems.length > 0 ? '30%' : '40%'}</span>
                  <b>{rubric.reasoning}%</b>
                </div>
                {classificationItems.length > 0 && (
                  <div>
                    <span>Classificações de evidência alinhadas · peso 20%</span>
                    <b>{rubric.classification}%</b>
                  </div>
                )}
              </div>
              <p className="fund-nota">
                Este índice mede respostas objetivas e presença/completude observável. Não avalia
                coerência, mérito técnico ou competência; a conferência técnica continua pendente.
              </p>
              <DecisionReview
                scenario={scenario}
                answers={answers}
                lessonMap={lessonMap}
              />
              <EvidenceClassificationReview
                scenario={scenario}
                classifications={evidenceClassifications}
                lessonMap={lessonMap}
              />
              {conference.total > 0 && (
                <div className="fund-check">
                  <strong>Sua fundamentação mencionou {conference.tocados} de {conference.total} elementos esperados</strong>
                  <ul>
                    {conference.els.map((element) => (
                      <li key={element.rot} className={element.ok ? 'ok' : ''}>
                        {element.ok ? <Check aria-hidden="true" size={14} /> : <Circle aria-hidden="true" size={14} />}
                        <span>
                          {element.rot}
                          {element.sourceRefs?.length > 0 && (
                            <small>
                              {element.sourceRefs.map((sourceId, index) => (
                                <React.Fragment key={sourceId}>
                                  {index > 0 ? ' · ' : ''}
                                  <a href={`#/aula/${encodeURIComponent(sourceId)}`}>
                                    {rotuloAula(lessonMap?.get?.(sourceId), sourceId)}
                                  </a>
                                </React.Fragment>
                              ))}
                            </small>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="fund-nota">
                    A detecção de termos não julga a correção do raciocínio. Use a redação-modelo e a autoavaliação para revisar coerência, suficiência e limites.
                  </p>
                  <details className="fund-modelo" open>
                    <summary>Comparar com a redação-modelo</summary>
                    <p>{scenario.modelo}</p>
                  </details>
                  <AutoAvaliacao
                    caso={scenario}
                    texto={reason}
                    conf={conference}
                    state={state}
                    setState={setState}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={reiniciarTentativa}
              >
                <RotateCcw aria-hidden="true" /> Revisar e iniciar nova tentativa
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
