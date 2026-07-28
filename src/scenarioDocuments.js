const DOCUMENT_PROFILES = [
  {
    pattern: /mapa|kmz|kml|cart|geo|poligonal|carta-imagem/i,
    kind: 'Peça cartográfica',
    control: 'Conferir escala, datum, projeção, legenda, data, autoria e compatibilidade entre mapa e vetores.',
    expected: 'A geometria precisa permitir localizar, delimitar e quantificar o objeto analisado.',
  },
  {
    pattern: /relat|monitor|automonitor|campanha|laudo|vistoria/i,
    kind: 'Relatório técnico',
    control: 'Conferir período, metodologia, resultados, anexos, responsável técnico e rastreabilidade das evidências.',
    expected: 'Declaração ou cronograma não substitui comprovação de execução e resultado.',
  },
  {
    pattern: /outorga|aneel|iphan|manifesta|anuência|licença|autoriz|consulta|ato/i,
    kind: 'Ato ou manifestação',
    control: 'Conferir emissor competente, objeto, titularidade, validade, condicionantes, versão e relação com a fase.',
    expected: 'O licenciamento verifica existência e compatibilidade sem substituir a competência do emissor.',
  },
  {
    pattern: /pacuera|pba|rdpa|eia|rima|estudo|plano|programa|memorial|projeto|tr\b/i,
    kind: 'Estudo ou plano ambiental',
    control: 'Conferir versão, escopo, diagnóstico, método, cartografia, autoria, ART/RRT e aderência ao termo aplicável.',
    expected: 'Presença formal do arquivo não demonstra suficiência material nem coerência com o restante do processo.',
  },
  {
    pattern: /requerimento|protocolo|histórico|sga|cadastro|checklist/i,
    kind: 'Registro processual',
    control: 'Conferir datas, objeto, interessado, fase, sequência de juntadas e coerência com o histórico.',
    expected: 'A cronologia deve permitir identificar transição, tempestividade, alteração e fato superveniente.',
  },
  {
    pattern: /.*/,
    kind: 'Peça documental',
    control: 'Conferir autoria, data, objeto, versão, integridade e compatibilidade com as demais peças.',
    expected: 'A conclusão deve registrar o que a peça comprova, o que não comprova e qual consequência decorre.',
  },
];

function scenarioCode(scenario, index) {
  return `EX-DID-${String(scenario.id || 'CASO').toUpperCase()}-${String(index + 1).padStart(2, '0')}`;
}

function profileFor(title) {
  return DOCUMENT_PROFILES.find((profile) => profile.pattern.test(title))
    || DOCUMENT_PROFILES.at(-1);
}

export function buildScenarioDocument(scenario, evidenceTitle, index) {
  const facts = scenario.facts || [];
  const questions = scenario.questions || [];
  const profile = profileFor(evidenceTitle);
  const primaryFact = facts[index % Math.max(1, facts.length)]
    || 'Informação não fornecida no cenário.';
  const crossFact = facts[(index + 1) % Math.max(1, facts.length)]
    || 'Não há segundo dado disponível para confronto.';
  const checkpoint = questions[index % Math.max(1, questions.length)]?.[0]
    || 'A suficiência desta peça precisa ser justificada.';

  return {
    id: scenarioCode(scenario, index),
    title: evidenceTitle,
    subtitle: `${profile.kind} · ${scenario.type} · ${scenario.label}`,
    watermark: 'EXEMPLO DIDÁTICO — SEM VALIDADE',
    fields: [
      ['Identificador sintético', scenarioCode(scenario, index)],
      ['Tipo documental', profile.kind],
      ['Objeto do exercício', scenario.title],
      ['Informação contida nesta peça', primaryFact],
      ['Dado que exige confronto', crossFact],
      ['Controle de integridade', profile.control],
      ['Critério de suficiência', profile.expected],
    ],
    checkpoint,
    limitations: 'Peça sintética e incompleta, criada exclusivamente para treinamento. Os fatos vêm do cenário didático; nomes, assinaturas, números oficiais, coordenadas e dados pessoais não representam processo real nem validação do IAT.',
  };
}

export function minimumEvidenceRequired(scenario) {
  return Math.min(2, Math.max(1, scenario?.evidence?.length || 0));
}
