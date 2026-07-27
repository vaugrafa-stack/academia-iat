const ACTION_RULES = [
  [/(refer[eê]ncia|norma|lei|decreto|instru[cç][aã]o)/i, 'localizar o fundamento citado, verificar sua vigência e explicar como ele condiciona a análise'],
  [/(compet[eê]ncia|delega[cç][aã]o|act|rtaa)/i, 'distinguir competência originária de execução delegada e registrar o fundamento antes do mérito'],
  [/(consulta pr[eé]via|enquadramento|modalidade|porte|pot[eê]ncia)/i, 'enquadrar a fase e a modalidade sem confundir orientação preliminar com decisão de viabilidade'],
  [/(document|triagem|checklist|sufici[eê]ncia|protocolo)/i, 'classificar cada documento como exigível, apresentado e suficiente, justificando as lacunas encontradas'],
  [/(cartograf|mapa|coordenad|ada|app|kmz|geoespacial)/i, 'conferir a consistência espacial das evidências e apontar o efeito técnico de cada lacuna cartográfica'],
  [/(unidade de conserva|apa|plano de manejo|zona de amortecimento)/i, 'confrontar categoria, ato de criação, zoneamento e Plano de Manejo antes de concluir sobre compatibilidade'],
  [/(pacuera|reservat[oó]rio|uth|entorno)/i, 'avaliar diagnóstico, zoneamento, participação e implementação do PACUERA como sistema contínuo de gestão'],
  [/(condicionante|dilig[eê]ncia|pend[eê]ncia)/i, 'separar pendência sanável, impedimento material e condicionante verificável, escolhendo encaminhamento proporcional'],
  [/(informa[cç][aã]o t[eé]cnica|parecer|conclus[aã]o|revis[aã]o|assinatura)/i, 'construir uma conclusão rastreável que conecte evidência, fundamento, consequência e encaminhamento'],
  [/(t[ií]tulo|numera[cç][aã]o|sum[aá]rio|navega[cç][aã]o)/i, 'auditar títulos, numeração, sumário e navegação do produto técnico e registrar cada inconsistência antes da entrega'],
  [/(impacto|mitiga[cç][aã]o|compensa[cç][aã]o|programa ambiental)/i, 'relacionar impacto, medida, indicador e forma de comprovação sem transformar lacuna crítica em condicionante'],
  [/(lp|licen[cç]a pr[eé]via|li|licen[cç]a de instala[cç][aã]o|lo|opera[cç][aã]o|renova[cç][aã]o)/i, 'distinguir o objeto da fase, confrontar o que foi licenciado com a evidência atual e motivar o próximo ato'],
];

const CLEAN_PREFIX = /^\s*(?:\d+(?:\.\d+)*\.?\s*)?/;

function normalizedTitle(lesson) {
  return String(lesson?.title || '').replace(CLEAN_PREFIX, '').trim();
}

function actionFor(lesson) {
  const haystack = `${lesson?.number || ''} ${normalizedTitle(lesson)}`;
  const match = ACTION_RULES.find(([pattern]) => pattern.test(haystack));
  return match?.[1] || 'explicar o critério central da seção, aplicá-lo a uma evidência e justificar um encaminhamento proporcional';
}

function meaningfulParagraph(blocks = []) {
  return blocks
    .filter((block) => block?.type === 'paragraph' && block.paragraph?.text && !block.paragraph?.headingLevel)
    .map((block) => block.paragraph.text.replace(/\s+/g, ' ').trim())
    .find((text) => text.length >= 45 && !/^(quadro|tabela|figura)\s+\d/i.test(text));
}

export function getLearningDesign(lesson, blocks = []) {
  const title = normalizedTitle(lesson) || 'esta seção';
  const action = actionFor(lesson);
  const sourceBasis = meaningfulParagraph(blocks);
  const section = lesson?.number ? `seção ${lesson.number}` : 'seção introdutória';

  return {
    objective: `Ao final, você conseguirá ${action}, usando os critérios da ${section}.`,
    levels: [
      {
        id: 'iniciante',
        label: 'Reconhecer',
        description: `Explique com suas palavras qual problema “${title}” resolve e identifique no texto a evidência que sustenta essa explicação.`,
      },
      {
        id: 'aplicacao',
        label: 'Aplicar',
        description: 'Diante de um caso, separe fato, documento, fundamento e lacuna; então proponha o próximo passo sem antecipar a conclusão.',
      },
      {
        id: 'especialista',
        label: 'Auditar',
        description: 'Defenda ou conteste a decisão, explicite limitações e registre qual evidência nova poderia alterar o encaminhamento.',
      },
    ],
    mastery: [
      'identifica a evidência usada, sem confundir presença com suficiência',
      'relaciona o critério da seção à consequência técnica',
      'registra incerteza, fonte e encaminhamento de forma auditável',
    ],
    challenge: `Que erro de decisão pode ocorrer se “${title}” for tratado apenas como formalidade? Responda citando uma evidência da seção.`,
    sourceBasis: sourceBasis
      ? sourceBasis.slice(0, 360) + (sourceBasis.length > 360 ? '…' : '')
      : 'Esta é uma seção de organização. Use os subtópicos vinculados como base para a atividade.',
  };
}

export function learningDesignFingerprint(design) {
  return [
    design.objective,
    ...design.levels.map((level) => level.description),
    ...design.mastery,
    design.challenge,
  ].join('|');
}
