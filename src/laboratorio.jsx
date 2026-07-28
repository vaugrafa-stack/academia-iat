import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
  Lock,
  RotateCcw,
  ShieldCheck,
  Table2,
  Trophy,
  X,
} from 'lucide-react';
import { PageHeader } from './ui.jsx';
import { AutoAvaliacao } from './painelAluno.jsx';
import { buildScenarioDocument, minimumEvidenceRequired } from './scenarioDocuments.js';
import { tracks } from './courseData.js';
import { getLabSources, LAB_SOURCE_POLICY } from './labSources.js';

function normalizar(valor = '') {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function bateTermo(texto, termo) {
  const normalizado = normalizar(termo).trim();
  if (!normalizado) return false;
  if (normalizado.length <= 3) {
    const seguro = normalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${seguro}([^a-z0-9]|$)`).test(texto);
  }
  return texto.includes(normalizado);
}

function conferirElementos(cenario, texto) {
  const base = normalizar(texto || '');
  const els = (cenario.elementos || []).map((elemento) => ({
    rot: elemento.rot,
    ok: elemento.termos.some((termo) => bateTermo(base, termo)),
  }));
  return {
    els,
    tocados: els.filter((elemento) => elemento.ok).length,
    total: els.length,
  };
}

function percentual(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0;
}

export function calcularIndicadoresLaboratorio({
  decisoesAlinhadas,
  totalDecisoes,
  evidenciasRegistradas,
  minimoEvidencias,
  elementosDetectados,
  totalElementos,
}) {
  const rubrica = {
    decisions: percentual(decisoesAlinhadas, totalDecisoes),
    evidence: Math.min(100, percentual(evidenciasRegistradas, minimoEvidencias)),
    reasoning: percentual(elementosDetectados, totalElementos),
  };
  return {
    rubrica,
    indiceCompletude: Math.round(
      rubrica.decisions * 0.4 + rubrica.evidence * 0.2 + rubrica.reasoning * 0.4,
    ),
  };
}

function rotuloResposta(valor) {
  if (valor === 'sim') return 'Sim';
  if (valor === 'nao') return 'Não';
  return 'Não respondida';
}

export function resolverRemediacaoModulo(scenario, trackRegistry = tracks) {
  if (!scenario?.track || !Array.isArray(trackRegistry)) return null;
  const track = trackRegistry.find((candidate) => candidate.id === scenario.track);
  if (!track?.code || !track?.title || !track?.remediationLessonId) return null;
  return {
    trackId: track.id,
    code: track.code,
    title: track.title,
    lessonId: track.remediationLessonId,
    href: `#/aula/${encodeURIComponent(track.remediationLessonId)}`,
  };
}

function tituloEvidenciaPorReferencia(scenario, referenceId) {
  const ordinal = Number(/-e(\d+)$/.exec(referenceId)?.[1]);
  return Number.isInteger(ordinal) && ordinal > 0
    ? scenario?.evidence?.[ordinal - 1] || null
    : null;
}

export function resolverProvenienciaDecisao(scenario, questionIndex) {
  const record = getLabSources(scenario?.id);
  const decision = record?.decisions?.[questionIndex];
  if (!decision) return null;
  return {
    ...decision,
    evidenceTitles: decision.caseEvidenceRefs
      .map((referenceId) => tituloEvidenciaPorReferencia(scenario, referenceId))
      .filter(Boolean),
  };
}

function rotuloAula(lesson, fallbackId) {
  if (!lesson) return fallbackId;
  return [lesson.number, lesson.title].filter(Boolean).join(' — ');
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
                  Minuta POP v1.7 · {rotuloAula(lesson, source.sec)}
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

function EvidenceDocument({ document, note, onNote, onClose, readOnly = false }) {
  if (!document) return null;
  return (
    <article
      className="evidence-document"
      data-watermark={document.watermark}
      aria-labelledby={`evidence-${document.id}`}
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

export default function Laboratorio({
  state,
  setState,
  scenarios,
  grupos,
  lessonMap,
  initialScenarioId,
  onSelectScenario,
}) {
  const initialId = scenarios.some((item) => item.id === initialScenarioId)
    ? initialScenarioId
    : scenarios[2]?.id || scenarios[0]?.id;
  const [selected, setSelected] = useState(initialId);
  const [answers, setAnswers] = useState({});
  const [reason, setReason] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [seenEvidence, setSeenEvidence] = useState({});
  const [evidenceNotes, setEvidenceNotes] = useState({});
  const [activeEvidence, setActiveEvidence] = useState(null);

  const scenario = scenarios.find((item) => item.id === selected) || scenarios[0];
  const group = grupos.find((item) => item.ids.includes(scenario.id));
  const requiresAllEvidence = ['Avançado', 'Especialista'].includes(group?.nivel);
  const minimumEvidence = requiresAllEvidence
    ? scenario.evidence.length
    : minimumEvidenceRequired(scenario);
  const answered = Object.keys(answers).length;
  const score = scenario.questions.filter((question, index) => answers[index] === question[1]).length;
  const reviewedEvidence = scenario.evidence.filter(
    (title) => seenEvidence[title] && (evidenceNotes[title] || '').trim().length >= 40,
  );
  const reviewedCount = reviewedEvidence.length;
  const conference = useMemo(
    () => conferirElementos(scenario, reason),
    [scenario, reason],
  );
  const minimumReasonLength = 180;
  const ready = answered === scenario.questions.length
    && reviewedCount >= minimumEvidence
    && reason.trim().length >= minimumReasonLength;

  const { rubrica: rubric, indiceCompletude: rubricTotal } = calcularIndicadoresLaboratorio({
    decisoesAlinhadas: score,
    totalDecisoes: scenario.questions.length,
    evidenciasRegistradas: reviewedCount,
    minimoEvidencias: minimumEvidence,
    elementosDetectados: conference.tocados,
    totalElementos: conference.total,
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
    const savedAnswers = saved?.versao >= 3 && saved?.respostas
      ? saved.respostas
      : {};
    setAnswers(savedAnswers);
    setReason(saved?.texto || '');
    setShowResult(Boolean(saved?.versao >= 3 && saved?.status === 'concluido'));
    setShowSummary(false);
    setSeenEvidence(Object.fromEntries(
      (saved?.evidenciasConsultadas || []).map((title) => [title, true]),
    ));
    setEvidenceNotes(saved?.evidenciasAnotadas || {});
    setActiveEvidence(null);
  }, [selected]);

  function selectScenario(id) {
    setSelected(id);
    onSelectScenario?.(id);
  }

  function openEvidence(title, index) {
    setSeenEvidence((current) => ({ ...current, [title]: true }));
    setActiveEvidence(buildScenarioDocument(scenario, title, index));
  }

  function finish() {
    if (!ready) return;
    const now = new Date().toISOString();
    setShowResult(true);
    setState((current) => ({
      ...current,
      labs: {
        ...current.labs,
        [scenario.id]: {
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
          rubrica: rubric,
          rubricaTotal: rubricTotal,
          indiceCompletude: rubricTotal,
          conferenciaTecnicaPendente: true,
          versao: 3,
        },
      },
    }));
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
          e o debriefing separa o fundamento extraído da minuta POP v1.7 dos fatos,
          cálculos e inferências produzidos para a prática. Nada aqui reproduz processo,
          empreendimento, assinatura, decisão ou aprovação institucional.
        </p>
      </div>

      <div className="lab-grupos">
        {grupos.map((item) => {
          const cases = item.ids.map((id) => scenarios.find((candidate) => candidate.id === id)).filter(Boolean);
          const completed = cases.filter((candidate) => state.labs?.[candidate.id]).length;
          return (
            <section className="lab-grupo" key={item.id}>
              <header>
                <div>
                  <h3>{item.titulo}</h3>
                  <p>{item.resumo}</p>
                </div>
                <span className={`lg-nivel n-${item.id}`}>{item.nivel}</span>
              </header>
              <div className="scenario-tabs" role="list" aria-label={`Casos de ${item.titulo}`}>
                {cases.map((candidate) => (
                  <button
                    type="button"
                    className={selected === candidate.id ? 'active' : ''}
                    aria-pressed={selected === candidate.id}
                    onClick={() => {
                      selectScenario(candidate.id);
                      setTimeout(
                        () => document.querySelector('.lab-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                        70,
                      );
                    }}
                    key={candidate.id}
                  >
                    {candidate.label}
                    {state.labs?.[candidate.id] && <CheckCircle2 aria-label="Caso já praticado" />}
                  </button>
                ))}
              </div>
              <small className="lg-progresso">{completed} de {cases.length} praticados</small>
            </section>
          );
        })}
      </div>

      <div className="lab-workspace">
        <section className="lab-canvas" key={selected}>
          <div className="case-header">
            <div>
              <small>CENÁRIO · {scenario.type} · {group?.nivel || 'Prática'}</small>
              <h2>{scenario.title}</h2>
            </div>
            <button
              type="button"
              className={showSummary ? 'active' : ''}
              aria-expanded={showSummary}
              onClick={() => setShowSummary((current) => !current)}
            >
              <FileText aria-hidden="true" /> Resumo do caso
            </button>
          </div>

          {showSummary && (
            <div className="case-summary">
              <p><strong>{scenario.title}</strong>, cenário de {scenario.type}.</p>
              <ul>{scenario.facts.slice(0, 2).map((fact) => <li key={fact}>{fact}</li>)}</ul>
              <p>
                {scenario.evidence.length} evidências · {scenario.questions.length} decisões ·
                debriefing e rubrica ao finalizar. Os demais dados estão deliberadamente
                distribuídos nas peças para evitar antecipar o achado.
              </p>
            </div>
          )}

          <div className="case-facts" aria-label="Fatos declarados no caso">
            {scenario.facts.slice(0, 2).map((fact) => (
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

          <div className="decision-path" aria-label="Percurso de decisão">
            <div className="path-node complete"><span>1</span><strong>Triagem</strong><Check aria-hidden="true" /></div>
            {scenario.questions.map((question, index) => (
              <React.Fragment key={question[0]}>
                <i className={answers[index] ? 'active' : ''} aria-hidden="true" />
                <button
                  type="button"
                  className={`path-node ${answers[index] ? 'complete ' : ''}${index === answered ? 'current' : ''}`}
                  aria-label={`Ir para a decisão ${index + 1}: ${scenario.steps?.[index] || `Etapa ${index + 2}`}`}
                  onClick={() => document.getElementById(`lab-question-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
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
                {requiresAllEvidence ? ' — nos níveis avançado e especialista, todas são obrigatórias.' : '.'}
              </p>
              {scenario.evidence.map((title, index) => (
                <button
                  type="button"
                  key={title}
                  className={seenEvidence[title] ? 'seen' : ''}
                  aria-pressed={Boolean(seenEvidence[title])}
                  onClick={() => openEvidence(title, index)}
                >
                  <FileText aria-hidden="true" />
                  <span>{title}<small>{reviewedEvidence.includes(title) ? 'Análise registrada' : seenEvidence[title] ? 'Aberta · falta registrar a análise' : 'Documento sintético do cenário'}</small></span>
                  {reviewedEvidence.includes(title) ? <CheckCircle2 aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              ))}
              <EvidenceDocument
                document={activeEvidence}
                note={activeEvidence ? evidenceNotes[activeEvidence.title] || '' : ''}
                readOnly={showResult}
                onNote={(value) => setEvidenceNotes((current) => ({
                  ...current,
                  [activeEvidence.title]: value,
                }))}
                onClose={() => setActiveEvidence(null)}
              />
            </div>

            <div className="question-stack">
              <h3>Decisões do percurso</h3>
              {scenario.questions.map((question, index) => (
                <fieldset
                  id={`lab-question-${index}`}
                  key={question[0]}
                  className={index > answered ? 'locked' : ''}
                >
                  <legend>{index + 1}. {question[0]}</legend>
                  {index > answered ? (
                    <span><Lock aria-hidden="true" /> Responda à etapa anterior</span>
                  ) : (
                    <div>
                      <button
                        type="button"
                        disabled={showResult}
                        className={answers[index] === 'sim' ? 'selected' : ''}
                        aria-pressed={answers[index] === 'sim'}
                        onClick={() => setAnswers((current) => ({ ...current, [index]: 'sim' }))}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        disabled={showResult}
                        className={answers[index] === 'nao' ? 'selected' : ''}
                        aria-pressed={answers[index] === 'nao'}
                        onClick={() => setAnswers((current) => ({ ...current, [index]: 'nao' }))}
                      >
                        Não
                      </button>
                    </div>
                  )}
                </fieldset>
              ))}
            </div>
          </div>
        </section>

        <aside className="lab-inspector">
          <div>
            <small>SEU PARECER DIDÁTICO</small>
            <h2>Fundamente a decisão</h2>
            <p>Relacione evidência, fundamento, consequência técnica, incerteza e encaminhamento.</p>
          </div>
          <label className="lab-reason-label" htmlFor="lab-reason">Fundamentação do caso</label>
          <textarea
            id="lab-reason"
            value={reason}
            readOnly={showResult}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Escreva uma fundamentação rastreável. Cite as peças consultadas e explique o efeito das lacunas..."
          />

          <div className="decision-readiness">
            <span>Decisões <b>{answered}/{scenario.questions.length}</b></span>
            <i><em style={{ width: `${percentual(answered, scenario.questions.length)}%` }} /></i>
            <span>Evidências analisadas <b>{reviewedCount}/{minimumEvidence} mín.</b></span>
            <i><em style={{ width: `${Math.min(100, percentual(reviewedCount, minimumEvidence))}%` }} /></i>
            <span>Fundamentação <b>{reason.trim().length}/{minimumReasonLength} caracteres</b></span>
            <i><em style={{ width: `${Math.min(100, percentual(reason.trim().length, minimumReasonLength))}%` }} /></i>
          </div>

          <p className="lab-readiness-note" aria-live="polite">
            <span>{ready ? 'Pronto para debriefing' : 'Complete os três critérios para finalizar'}</span>
            <span>{ready ? '100%' : `${[answered === scenario.questions.length, reviewedCount >= minimumEvidence, reason.trim().length >= minimumReasonLength].filter(Boolean).length}/3`}</span>
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
                <div><span>Decisões alinhadas · peso 40%</span><b>{rubric.decisions}%</b></div>
                <div><span>Evidências com registro mínimo · peso 20%</span><b>{rubric.evidence}%</b></div>
                <div><span>Indícios textuais encontrados · peso 40%</span><b>{rubric.reasoning}%</b></div>
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
              {scenario.elementos && (
                <div className="fund-check">
                  <strong>Sua fundamentação mencionou {conference.tocados} de {conference.total} elementos esperados</strong>
                  <ul>
                    {conference.els.map((element) => (
                      <li key={element.rot} className={element.ok ? 'ok' : ''}>
                        {element.ok ? <Check aria-hidden="true" size={14} /> : <Circle aria-hidden="true" size={14} />}
                        <span>{element.rot}</span>
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
                onClick={() => {
                  setShowResult(false);
                  setActiveEvidence(null);
                }}
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
