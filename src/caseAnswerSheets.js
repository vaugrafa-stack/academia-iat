import {
  getLabSources,
  getPopLabSource,
  LAB_SOURCE_POLICY,
} from './labSources.js';
import { nivelDoCaso } from './niveisLab.js';

export const CASE_ANSWER_SHEET_TITLE = 'Folha-resposta: conteúdo mínimo esperado';

const EXPECTED_ANSWER_LABELS = Object.freeze({
  sim: 'Sim',
  nao: 'Não',
});

const SUPPORT_LABELS = Object.freeze({
  direct: 'Apoio direto na minuta do POP',
  mixed: 'Aplicação ao caso: confira os fatos e a regra de apoio',
});

const ACRONYM_DEFINITIONS = Object.freeze({
  ACT: 'Acordo de Cooperação Técnica',
  ADA: 'Área Diretamente Afetada',
  ANEEL: 'Agência Nacional de Energia Elétrica',
  APA: 'Área de Proteção Ambiental',
  APP: 'Área de Preservação Permanente',
  ART: 'Anotação de Responsabilidade Técnica',
  CGH: 'Central Geradora Hidrelétrica',
  CP: 'Consulta Prévia',
  DRDH: 'Declaração de Reserva de Disponibilidade Hídrica',
  EIA: 'Estudo de Impacto Ambiental',
  FCA: 'Ficha de Caracterização da Atividade',
  IAT: 'Instituto Água e Terra',
  IBAMA: 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis',
  IDA: 'Índice de Degradação Ambiental',
  IPHAN: 'Instituto do Patrimônio Histórico e Artístico Nacional',
  LAS: 'Licença Ambiental Simplificada',
  LI: 'Licença de Instalação',
  LO: 'Licença de Operação',
  LP: 'Licença Prévia',
  PACUERA: 'Plano Ambiental de Conservação e Uso do Entorno do Reservatório Artificial',
  PAE: 'Plano de Ação de Emergência',
  PBA: 'Projeto Básico Ambiental ou Plano Básico Ambiental',
  PCH: 'Pequena Central Hidrelétrica',
  PNSB: 'Política Nacional de Segurança de Barragens',
  PSB: 'Plano de Segurança da Barragem',
  RAS: 'Relatório Ambiental Simplificado',
  RDPA: 'Relatório Detalhado de Programas Ambientais',
  RIMA: 'Relatório de Impacto Ambiental',
  RLO: 'Renovação de Licença de Operação',
  RTAA: 'Relatório Técnico Anual de Atividades',
  SAIP: 'Sistema de Avaliação de Impacto ao Patrimônio',
  SEI: 'Sistema Eletrônico de Informações',
  SGA: 'Sistema de Gestão Ambiental',
  TR: 'Termo de Referência',
  TVR: 'Trecho de Vazão Reduzida',
  UC: 'Unidade de Conservação',
  UHE: 'Usina Hidrelétrica',
  UTH: 'Unidade Territorial Homogênea',
  ZA: 'Zona de Amortecimento',
});

function sectionOrdinal(sectionId = '') {
  const match = String(sectionId).match(/(\d+)$/);
  return match ? String(Number(match[1])) : sectionId;
}

function resolveLessonLabel(sectionId, lessonMap) {
  const lesson = lessonMap?.get?.(sectionId);
  if (lesson?.title) return lesson.title;
  return `Seção ${sectionOrdinal(sectionId)} do POP`;
}

function evidenceOrdinal(reference = '') {
  const match = String(reference).match(/-e(\d+)$/);
  return match ? Number(match[1]) : null;
}

function groupForCase(caseId, groups = []) {
  return groups.find((group) => group.ids?.includes(caseId)) || null;
}

function decisionEvidence(caseData, refs = []) {
  return refs
    .map((reference) => {
      const ordinal = evidenceOrdinal(reference);
      const text = ordinal ? caseData.evidence?.[ordinal - 1] : null;
      return text ? { id: reference, ordinal, text } : null;
    })
    .filter(Boolean);
}

function decisionSources(sourceData, lessonMap) {
  return (sourceData?.popSources || []).map((source) => ({
    id: source.id,
    sectionId: source.sec,
    label: resolveLessonLabel(source.sec, lessonMap),
    quote: source.quote,
  }));
}

function buildGlossary(caseData) {
  const searchableText = JSON.stringify({
    label: caseData.label,
    title: caseData.title,
    type: caseData.type,
    facts: caseData.facts,
    evidence: caseData.evidence,
    questions: caseData.questions,
    outcome: caseData.outcome,
    model: caseData.modelo,
    evidenceTask: caseData.evidenceTask,
    openTask: caseData.openTask,
  });

  return Object.entries(ACRONYM_DEFINITIONS)
    .filter(([acronym]) => new RegExp(`\\b${acronym}\\b`).test(searchableText))
    .map(([acronym, definition]) => ({
      id: `glossary-${acronym.toLowerCase()}`,
      acronym,
      definition,
    }));
}

function buildDecision(caseData, question, index, sourceData, answerReason, lessonMap) {
  const [prompt, expectedKey] = question;
  const sources = decisionSources(sourceData, lessonMap);
  const justification = answerReason;

  return {
    id: sourceData?.id || `lab-${caseData.id}-q${index + 1}`,
    ordinal: index + 1,
    prompt,
    expectedKey,
    expectedAnswer: EXPECTED_ANSWER_LABELS[expectedKey] || expectedKey,
    answerReason: justification,
    justification,
    supportCaveat: sourceData?.reviewReason || null,
    evidence: decisionEvidence(caseData, sourceData?.caseEvidenceRefs),
    sources,
    supportMode: sourceData?.supportMode || 'contextual',
    supportLabel: SUPPORT_LABELS[sourceData?.supportMode]
      || 'Apoio construído com os dados do cenário',
  };
}

function sourcesForRefs(sourceRefs = [], lessonMap, overrideIdFor = null) {
  return sourceRefs
    .map((sectionId) => getPopLabSource(sectionId, overrideIdFor?.(sectionId)))
    .filter(Boolean)
    .map((source) => ({
      id: source.id,
      sectionId: source.sec,
      label: resolveLessonLabel(source.sec, lessonMap),
      quote: source.quote,
    }));
}

function buildGaps(caseData, decisions) {
  const reviewPoints = [...new Set(decisions
    .map((decision) => decision.supportCaveat)
    .filter(Boolean))];

  return [
    ...((caseData.ausentes || []).length
      ? [{
          id: 'ausentes',
          title: 'Evidências declaradas como não apresentadas',
          text: `Não constam no cenário: ${(caseData.ausentes || []).join('; ')}. A ausência deve permanecer explícita na análise e receber consequência técnica e encaminhamento proporcionais.`,
        }]
      : []),
    {
      id: 'cadastro',
      title: 'Dados cadastrais da peça completa',
      text: 'O cenário não fornece de forma completa empreendedor, município, corpo hídrico, bacia, número e data do protocolo, coordenadas e demais identificadores processuais. Registre cada campo não comprovado como “a confirmar”; não deduza nem crie valores.',
    },
    {
      id: 'documentos',
      title: 'Conteúdo e autenticidade dos documentos',
      text: 'A lista de evidências informa o que deve ser confrontado, mas não substitui a leitura dos arquivos integrais, a verificação de autoria, data, versão, assinatura, responsabilidade técnica e correspondência com o empreendimento.',
    },
    {
      id: 'normas',
      title: 'Vigência e aplicação ao caso concreto',
      text: 'Confirme a versão vigente das normas, dos Termos de Referência, dos atos anteriores e do modelo institucional antes de transportar o raciocínio do exercício para um processo.',
    },
    ...(reviewPoints.length
      ? [{
          id: 'conferencia',
          title: 'Pontos que dependem de conferência adicional',
          text: reviewPoints.join(' '),
        }]
      : []),
  ];
}

/**
 * Deriva uma folha-resposta exclusivamente dos dados editoriais já associados
 * ao caso. Dados cadastrais ausentes permanecem explicitamente "a confirmar".
 */
export function buildCaseAnswerSheet(caseData, groups = [], options = {}) {
  if (!caseData?.id) throw new Error('Um caso válido é obrigatório para montar a folha-resposta.');

  const sourceRecord = getLabSources(caseData.id);
  const group = groupForCase(caseData.id, groups);
  const questions = caseData.questions || [];
  const answerReasons = options.answerReasons?.[caseData.id];
  if (
    !Array.isArray(answerReasons)
    || answerReasons.length < questions.length
    || answerReasons.some((reason) => typeof reason !== 'string' || !reason.trim())
  ) {
    throw new Error(`Explicações editoriais ausentes para o caso ${caseData.id}.`);
  }
  const decisions = questions.map((question, index) => (
    buildDecision(
      caseData,
      question,
      index,
      sourceRecord?.decisions?.[index],
      answerReasons[index],
      options.lessonMap,
    )
  ));
  const evidenceTaskItems = new Map(
    (caseData.evidenceTask?.items || []).map((item) => [item.evidenceIndex, item]),
  );
  const evidenceTaskChoices = new Map(
    (caseData.evidenceTask?.choices || []).map((choice) => [choice.id, choice.label]),
  );
  const complexity = nivelDoCaso(caseData);
  const openCriteria = caseData.openTask?.criteria || [];

  const sheet = {
    id: `answer-sheet-${caseData.id}`,
    title: CASE_ANSWER_SHEET_TITLE,
    caseId: caseData.id,
    caseLabel: caseData.label,
    caseTitle: caseData.title,
    type: caseData.type,
    trackId: caseData.track,
    group: group
      ? { id: group.id, title: group.titulo, summary: group.resumo }
      : null,
    complexity: {
      id: complexity.id,
      title: complexity.titulo,
      task: complexity.tarefa,
    },
    facts: [...(caseData.facts || [])],
    series: caseData.serie
      ? {
          title: caseData.serie.titulo,
          columns: [...caseData.serie.colunas],
          rows: caseData.serie.linhas.map((row) => [...row]),
          note: caseData.serie.nota || null,
        }
      : null,
    evidence: (caseData.evidence || []).map((text, index) => {
      const taskItem = evidenceTaskItems.get(index);
      return {
        id: `lab-${caseData.id}-e${index + 1}`,
        ordinal: index + 1,
        text,
        classification: taskItem
          ? {
              expectedUse: taskItem.expectedUse,
              expectedLabel: evidenceTaskChoices.get(taskItem.expectedUse) || taskItem.expectedUse,
              rationale: taskItem.rationale,
              sources: sourcesForRefs(
                taskItem.sourceRefs,
                options.lessonMap,
                (sectionId) => `lab-task-${caseData.id}-e${index + 1}-${sectionId}`,
              ),
            }
          : null,
      };
    }),
    missingEvidence: (caseData.ausentes || []).map((text, index) => ({
      id: `lab-${caseData.id}-missing-${index + 1}`,
      ordinal: index + 1,
      text,
    })),
    evidenceTask: caseData.evidenceTask
      ? {
          prompt: caseData.evidenceTask.prompt,
        }
      : null,
    openTask: caseData.openTask
      ? {
          prompt: caseData.openTask.prompt,
          minCharacters: caseData.openTask.minCharacters,
          requiredEvidenceIndexes: [...caseData.openTask.requiredEvidenceIndexes],
          criteria: openCriteria.map((criterion) => ({
            id: criterion.id,
            label: criterion.label,
            sources: sourcesForRefs(
              criterion.sourceRefs,
              options.lessonMap,
              (sectionId) => `lab-task-${caseData.id}-${criterion.id}-${sectionId}`,
            ),
          })),
        }
      : null,
    decisions,
    minimumElements: (openCriteria.length ? openCriteria : (caseData.elementos || [])).map((element, index) => ({
      id: `${caseData.id}-minimum-${index + 1}`,
      ordinal: index + 1,
      label: element.label || element.rot,
      sources: sourcesForRefs(
        element.sourceRefs,
        options.lessonMap,
        (sectionId) => `lab-task-${caseData.id}-${element.id}-${sectionId}`,
      ),
    })),
    expectedOutcome: caseData.outcome || '',
    commentedModel: caseData.modelo || '',
    glossary: buildGlossary(caseData),
    gaps: [],
    source: {
      title: LAB_SOURCE_POLICY.sourceTitle,
      document: LAB_SOURCE_POLICY.sourceDocument,
      version: LAB_SOURCE_POLICY.sourceVersion,
      sha256: LAB_SOURCE_POLICY.sourceSha256,
      institutionalStatus: LAB_SOURCE_POLICY.institutionalStatus,
      institutionalStatusLabel: LAB_SOURCE_POLICY.institutionalStatusLabel,
      primarySectionId: sourceRecord?.primaryLessonId || null,
      primarySectionLabel: sourceRecord?.primaryLessonId
        ? resolveLessonLabel(sourceRecord.primaryLessonId, options.lessonMap)
        : null,
    },
  };
  sheet.gaps = buildGaps(caseData, decisions);
  return sheet;
}

function addList(lines, items, render) {
  items.forEach((item, index) => lines.push(`${index + 1}. ${render(item)}`));
}

export function serializeCaseAnswerSheet(sheet) {
  const lines = [
    sheet.title.toUpperCase(),
    'Material de consulta do exercício. Não é peça processual e não preenche dados ausentes.',
    '',
    `Caso: ${sheet.caseLabel} · ${sheet.caseTitle}`,
    `Tipologia do exercício: ${sheet.type}`,
    ...(sheet.group ? [`Categoria: ${sheet.group.title}`] : []),
    `Complexidade da tarefa: ${sheet.complexity.title} · ${sheet.complexity.task}`,
    '',
    '1. FATOS DISPONÍVEIS',
  ];
  addList(lines, sheet.facts, (fact) => fact);

  if (sheet.series) {
    lines.push('', `SÉRIE APRESENTADA${sheet.series.title ? ` · ${sheet.series.title}` : ''}`);
    lines.push(sheet.series.columns.join(' | '));
    sheet.series.rows.forEach((row) => lines.push(row.join(' | ')));
    if (sheet.series.note) lines.push(`Nota: ${sheet.series.note}`);
  }

  lines.push('', '2. EVIDÊNCIAS A CONFRONTAR');
  addList(lines, sheet.evidence, (evidence) => {
    if (!evidence.classification) return evidence.text;
    const sourceLines = evidence.classification.sources
      .map((source) => `   Fonte: ${source.label}: “${source.quote}”`)
      .join('\n');
    return [
      evidence.text,
      `   Uso esperado: ${evidence.classification.expectedLabel}. ${evidence.classification.rationale}`,
      sourceLines,
    ].filter(Boolean).join('\n');
  });

  if (sheet.missingEvidence.length) {
    lines.push('', '2.1 EVIDÊNCIAS NÃO APRESENTADAS');
    addList(lines, sheet.missingEvidence, (evidence) => evidence.text);
  }

  if (sheet.evidenceTask) {
    lines.push('', '2.2 TAREFA DE CLASSIFICAÇÃO', sheet.evidenceTask.prompt);
  }

  lines.push('', '3. DECISÕES ESPERADAS');
  sheet.decisions.forEach((decision) => {
    lines.push(`${decision.ordinal}. ${decision.prompt}`);
    lines.push(`Resposta esperada: ${decision.expectedAnswer}`);
    lines.push(`Justificativa: ${decision.justification}`);
    lines.push(`Tipo de apoio: ${decision.supportLabel}`);
    if (decision.supportCaveat) {
      lines.push(`Ressalva de aplicação: ${decision.supportCaveat}`);
    }
    if (decision.evidence.length) {
      lines.push(`Evidências relacionadas: ${decision.evidence.map((item) => item.text).join('; ')}`);
    }
    if (decision.sources.length) {
      lines.push('Fontes de apoio e trechos literais:');
      decision.sources.forEach((source) => {
        lines.push(`- ${source.label}: “${source.quote}”`);
      });
    }
    lines.push('');
  });

  if (sheet.openTask) {
    lines.push('3.1 TAREFA ABERTA DE FUNDAMENTAÇÃO');
    lines.push(sheet.openTask.prompt);
    lines.push(`Registro mínimo: ${sheet.openTask.minCharacters} caracteres.`);
    lines.push('Critérios e fontes:');
    sheet.openTask.criteria.forEach((criterion, index) => {
      lines.push(`${index + 1}. ${criterion.label}`);
      criterion.sources.forEach((source) => lines.push(`- ${source.label}: “${source.quote}”`));
    });
    lines.push('');
  }

  lines.push('4. CONTEÚDO MÍNIMO DA FUNDAMENTAÇÃO');
  addList(lines, sheet.minimumElements, (element) => {
    const sourceLabels = element.sources?.map((source) => source.label).join('; ');
    return sourceLabels ? `${element.label} [fontes: ${sourceLabels}]` : element.label;
  });
  lines.push('', '5. DESFECHO ESPERADO', sheet.expectedOutcome);
  lines.push('', '6. MODELO COMENTADO', sheet.commentedModel);
  lines.push('', '7. LACUNAS E DADOS A CONFIRMAR');
  addList(lines, sheet.gaps, (gap) => `${gap.title}: ${gap.text}`);
  if (sheet.glossary.length) {
    lines.push('', 'GLOSSÁRIO DO CASO');
    addList(lines, sheet.glossary, (entry) => `${entry.acronym}: ${entry.definition}`);
  }
  lines.push(
    '',
    'FONTE EDITORIAL',
    `${sheet.source.title} · ${sheet.source.version}`,
    `Natureza da fonte: ${sheet.source.institutionalStatusLabel}`,
    `Arquivo de origem: ${sheet.source.document}`,
    `SHA-256: ${sheet.source.sha256}`,
  );

  return lines.join('\n');
}
