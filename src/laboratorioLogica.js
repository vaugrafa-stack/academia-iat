// Regras do Laboratório, sem tela.
//
// Saiu de laboratorio.jsx em 05/08/2026. São 415 linhas que não têm nem JSX nem
// hook: catálogo, filtro, rascunho, conferência de elementos, indicadores,
// ajuda progressiva e proveniência da decisão. Ficavam dentro do arquivo da
// tela só por vizinhança histórica.
//
// O ganho não é estético. Trinta testes já exercitavam estas funções e, para
// isso, carregavam a tela inteira, com React, ícones e a folha de estilo. Agora
// carregam um módulo que só depende de três símbolos: `tracks`, `nivelDoCaso`
// e `getLabSources`.
//
// O que NÃO mudou: nenhuma linha de regra. Uma extração que aproveita para
// corrigir impede saber, quando algo quebra, se foi a mudança de lugar ou a
// mudança de comportamento.
import { tracks } from './courseData.js';
import { getLabSources } from './labSources.js';
import { nivelDoCaso } from './niveisLab.js';
import { bateTermo, normalizarTexto as normalizar } from './textoTermos.js';

const LAB_DRAFT_VERSION = 2;
const LAB_COMPLETION_HISTORY_LIMIT = 5;

function ehRegistro(valor) {
  return Boolean(valor) && typeof valor === 'object' && !Array.isArray(valor);
}

export function conclusaoLaboratorioValida(registro) {
  return Boolean(
    ehRegistro(registro)
    && registro.versao >= 3
    && registro.status === 'concluido',
  );
}

/**
 * O progresso global aceita objetos extensíveis em `labs`. O rascunho continua
 * aninhado e passa por uma normalização restrita ao caso antes de voltar à UI:
 * respostas desconhecidas, títulos de evidência alheios e tipos incompatíveis
 * são descartados.
 */
export function normalizarRascunhoLaboratorio(registro, scenario) {
  const raw = registro?.rascunho;
  if (!ehRegistro(raw) || ![1, LAB_DRAFT_VERSION].includes(raw.versao) || !scenario) return null;

  const respostas = {};
  if (ehRegistro(raw.respostas)) {
    (scenario.questions || []).forEach((_, index) => {
      const resposta = raw.respostas[index];
      if (resposta === 'sim' || resposta === 'nao') respostas[index] = resposta;
    });
  }

  const evidenciasPermitidas = new Set(scenario.evidence || []);
  const evidenciasConsultadas = Array.isArray(raw.evidenciasConsultadas)
    ? [...new Set(raw.evidenciasConsultadas.filter(
      (titulo) => typeof titulo === 'string' && evidenciasPermitidas.has(titulo),
    ))]
    : [];
  const evidenciasAnotadas = {};
  if (ehRegistro(raw.evidenciasAnotadas)) {
    for (const titulo of evidenciasPermitidas) {
      if (typeof raw.evidenciasAnotadas[titulo] === 'string') {
        evidenciasAnotadas[titulo] = raw.evidenciasAnotadas[titulo];
      }
    }
  }

  const classificacoesEvidencias = {};
  const classificacoesPermitidas = new Set(
    (scenario.evidenceTask?.choices || []).map((choice) => choice.id),
  );
  if (ehRegistro(raw.classificacoesEvidencias)) {
    for (const item of scenario.evidenceTask?.items || []) {
      const titulo = scenario.evidence?.[item.evidenceIndex];
      const classificacao = raw.classificacoesEvidencias[titulo];
      if (titulo && classificacoesPermitidas.has(classificacao)) {
        classificacoesEvidencias[titulo] = classificacao;
      }
    }
  }

  const atualizadoEm = typeof raw.atualizadoEm === 'string'
    && Number.isFinite(Date.parse(raw.atualizadoEm))
    ? raw.atualizadoEm
    : null;

  return {
    versao: LAB_DRAFT_VERSION,
    atualizadoEm,
    respostas,
    texto: typeof raw.texto === 'string' ? raw.texto : '',
    evidenciasConsultadas,
    evidenciasAnotadas,
    classificacoesEvidencias,
    modo: raw.modo === 'desafio' ? 'desafio' : 'guiado',
    nivelAjuda: Math.max(0, Math.min(3, Number(raw.nivelAjuda) || 0)),
  };
}

export function criarRascunhoLaboratorio({
  answers,
  reason,
  seenEvidence,
  evidenceNotes,
  evidenceClassifications,
  mode,
  helpLevel,
  atualizadoEm,
}) {
  return {
    versao: LAB_DRAFT_VERSION,
    atualizadoEm,
    respostas: Object.fromEntries(
      Object.entries(answers || {}).filter(([, value]) => value === 'sim' || value === 'nao'),
    ),
    texto: typeof reason === 'string' ? reason : '',
    evidenciasConsultadas: Object.keys(seenEvidence || {}).filter((key) => seenEvidence[key]),
    evidenciasAnotadas: Object.fromEntries(
      Object.entries(evidenceNotes || {}).filter(([, value]) => typeof value === 'string'),
    ),
    classificacoesEvidencias: Object.fromEntries(
      Object.entries(evidenceClassifications || {}).filter(([, value]) => typeof value === 'string'),
    ),
    modo: mode === 'desafio' ? 'desafio' : 'guiado',
    nivelAjuda: Math.max(0, Math.min(3, Number(helpLevel) || 0)),
  };
}

export function registrarRascunhoLaboratorio(registroAnterior, rascunho) {
  if (conclusaoLaboratorioValida(registroAnterior)) {
    return {
      ...registroAnterior,
      rascunho,
    };
  }
  return {
    versao: 3,
    status: 'em_andamento',
    date: rascunho.atualizadoEm,
    rascunho,
  };
}

function snapshotConclusaoLaboratorio(registro) {
  const {
    rascunho: _rascunho,
    historicoConclusoes: _historico,
    ...conclusao
  } = registro;
  return conclusao;
}

export function registrarConclusaoLaboratorio(registroAnterior, conclusaoAtual) {
  const historicoExistente = Array.isArray(registroAnterior?.historicoConclusoes)
    ? registroAnterior.historicoConclusoes.filter(ehRegistro)
    : [];
  const historicoConclusoes = conclusaoLaboratorioValida(registroAnterior)
    ? [
      ...historicoExistente,
      snapshotConclusaoLaboratorio(registroAnterior),
    ].slice(-LAB_COMPLETION_HISTORY_LIMIT)
    : historicoExistente.slice(-LAB_COMPLETION_HISTORY_LIMIT);

  return {
    ...conclusaoAtual,
    ...(historicoConclusoes.length ? { historicoConclusoes } : {}),
  };
}

export function conferirElementos(cenario, texto) {
  const base = normalizar(texto || '');
  const criteriosAbertos = cenario.openTask?.criteria || [];
  const els = criteriosAbertos.length
    ? criteriosAbertos.map((criterio) => ({
        rot: criterio.label,
        ok: criterio.requiredConceptGroups.every((grupo) => (
          grupo.some((termo) => bateTermo(base, termo))
        )),
        sourceRefs: criterio.sourceRefs,
      }))
    : (cenario.elementos || []).map((elemento) => ({
        rot: elemento.rot,
        ok: elemento.termos.some((termo) => bateTermo(base, termo)),
        sourceRefs: [],
      }));
  return {
    els,
    tocados: els.filter((elemento) => elemento.ok).length,
    total: els.length,
  };
}

export function percentual(parte, total) {
  return total ? Math.round((parte / total) * 100) : 0;
}

export function criarCatalogoLaboratorio(scenarios = [], grupos = []) {
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  return grupos.flatMap((group) => (
    group.ids
      .map((id) => scenarioById.get(id))
      .filter(Boolean)
      .map((scenario) => ({
        scenario,
        group,
        // Nivel MEDIDO pelo que o caso pede, e nao o rotulo que o grupo
        // anuncia. Ate 01/08/2026 o cartao exibia o nivel do grupo, e a
        // medicao mostrou que ele nao correspondia a nada: os 26 casos tinham
        // a mesma forma, entao "Especialista" e "Primeiro contato" pediam o
        // mesmo tipo de raciocinio. Rotulo que promete progressao inexistente
        // e pior do que rotulo nenhum.
        nivel: nivelDoCaso(scenario),
        searchableText: normalizar([
          scenario.label,
          scenario.title,
          scenario.type,
          group.titulo,
          nivelDoCaso(scenario).titulo,
          ...(scenario.facts || []),
          ...(scenario.evidence || []),
          ...(scenario.ausentes || []),
          scenario.evidenceTask?.prompt,
          scenario.openTask?.prompt,
        ].join(' ')),
      }))
  ));
}

export function filtrarCatalogoLaboratorio(
  catalogo = [],
  { query = '', categoria = 'todas', complexidade = 'todas' } = {},
) {
  const normalizedQuery = normalizar(query).trim();
  return catalogo.filter(({ group, nivel, searchableText }) => {
    const matchesCategory = categoria === 'todas' || group.id === categoria;
    // Filtra pelo que o caso EXIGE, nao pelo que o grupo anuncia. Assim
    // escolher "Decidir" devolve os casos em que falta evidencia, e nao os que
    // alguem rotulou de avancados.
    const matchesComplexity = complexidade === 'todas' || nivel?.id === complexidade;
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    return matchesCategory && matchesComplexity && matchesQuery;
  });
}

export function resolverCasoInicialLaboratorio({
  scenarios = [],
  grupos = [],
  labs = {},
  initialScenarioId,
} = {}) {
  const validIds = new Set(scenarios.map((scenario) => scenario.id));
  if (initialScenarioId && validIds.has(initialScenarioId)) return initialScenarioId;

  let lastSavedId = null;
  let lastSavedTime = Number.NEGATIVE_INFINITY;
  for (const [id, attempt] of Object.entries(labs || {})) {
    if (!validIds.has(id) || !attempt) continue;
    const scenario = scenarios.find((candidate) => candidate.id === id);
    const draft = normalizarRascunhoLaboratorio(attempt, scenario);
    const parsed = Date.parse(draft?.atualizadoEm || attempt.date || '');
    const timestamp = Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
    if (lastSavedId === null || timestamp >= lastSavedTime) {
      lastSavedId = id;
      lastSavedTime = timestamp;
    }
  }
  if (lastSavedId) return lastSavedId;

  const introductoryId = grupos
    .flatMap((group) => group.ids)
    .find((id) => validIds.has(id));
  return introductoryId || scenarios[0]?.id || null;
}

export function conteudoAjudaLaboratorio(scenario, level = 0) {
  const safeLevel = Math.max(0, Math.min(3, Number(level) || 0));
  return {
    level: safeLevel,
    facts: safeLevel >= 1 ? [...(scenario?.facts || [])] : [],
    evidence: safeLevel >= 1 ? [...(scenario?.evidence || [])] : [],
    // Documentos que o caso afirma nao constarem do processo. Aparecem junto
    // das pecas, e nao escondidos num fato solto, porque perceber a falta faz
    // parte da decisao: apresentar nao e sinonimo de suficiente.
    ausentes: safeLevel >= 1 ? [...(scenario?.ausentes || [])] : [],
    questions: safeLevel >= 2
      ? (scenario?.questions || []).map((question) => question[0])
      : [],
    criteria: safeLevel >= 3
      ? (scenario?.openTask?.criteria || scenario?.elementos || [])
        .map((element) => element.label || element.rot)
      : [],
  };
}

export function perguntaBloqueadaLaboratorio(mode, questionIndex, answers = {}) {
  if (mode === 'desafio') return false;
  return Array.from(
    { length: questionIndex },
    (_, index) => Boolean(answers[index]),
  ).some((answered) => !answered);
}

export function scrollLaboratorio(target, block = 'start') {
  const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  target?.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block,
  });
}

export function scrollToWorkspace() {
  scrollLaboratorio(document.querySelector('.lab-workspace'));
}

export function moveCatalogFocus(event, index) {
  const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
  if (!keys.includes(event.key)) return;
  const buttons = [...event.currentTarget
    .closest('.lab-case-catalog')
    ?.querySelectorAll('[data-lab-case]') || []];
  if (!buttons.length) return;
  event.preventDefault();
  let nextIndex = index;
  if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = buttons.length - 1;
  else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    nextIndex = Math.min(buttons.length - 1, index + 1);
  } else {
    nextIndex = Math.max(0, index - 1);
  }
  buttons[nextIndex]?.focus();
}

export function calcularIndicadoresLaboratorio({
  decisoesAlinhadas,
  totalDecisoes,
  evidenciasRegistradas,
  minimoEvidencias,
  elementosDetectados,
  totalElementos,
  classificacoesAlinhadas = 0,
  totalClassificacoes = 0,
  tarefaAberta = false,
}) {
  const rubrica = {
    decisions: percentual(decisoesAlinhadas, totalDecisoes),
    evidence: Math.min(100, percentual(evidenciasRegistradas, minimoEvidencias)),
    reasoning: percentual(elementosDetectados, totalElementos),
    ...(totalClassificacoes > 0
      ? { classification: percentual(classificacoesAlinhadas, totalClassificacoes) }
      : {}),
  };
  const componentesObjetivo = {
    decisions: rubrica.decisions,
    ...(totalClassificacoes > 0 ? { classification: rubrica.classification } : {}),
    ...(tarefaAberta ? { openTask: rubrica.reasoning } : {}),
  };
  const valoresObjetivo = Object.values(componentesObjetivo);
  const indiceCompletude = totalClassificacoes > 0
    ? Math.round(
        rubrica.decisions * 0.3
        + rubrica.evidence * 0.2
        + rubrica.reasoning * 0.3
        + rubrica.classification * 0.2
      )
    : Math.round(
        rubrica.decisions * 0.4 + rubrica.evidence * 0.2 + rubrica.reasoning * 0.4
      );
  return {
    rubrica,
    componentesObjetivo,
    objetivoPercentual: valoresObjetivo.length
      ? Math.round(valoresObjetivo.reduce((total, value) => total + value, 0) / valoresObjetivo.length)
      : 0,
    indiceCompletude,
  };
}

export function rotuloResposta(valor) {
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

