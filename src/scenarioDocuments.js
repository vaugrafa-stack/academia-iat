function scenarioCode(scenario, index) {
  return `EX-DID-${String(scenario.id || 'CASO').toUpperCase()}-${String(index + 1).padStart(2, '0')}`;
}

export function buildScenarioDocument(scenario, evidenceTitle, index) {
  const facts = scenario.facts || [];
  const questions = scenario.questions || [];
  const primaryFact = facts[index % Math.max(1, facts.length)] || 'Informação não fornecida no cenário.';
  const crossFact = facts[(index + 1) % Math.max(1, facts.length)] || primaryFact;
  const checkpoint = questions[index % Math.max(1, questions.length)]?.[0] || 'A suficiência deste documento precisa ser justificada.';

  return {
    id: scenarioCode(scenario, index),
    title: evidenceTitle,
    subtitle: `${scenario.type} · ${scenario.label}`,
    watermark: 'EXEMPLO DIDÁTICO — SEM VALIDADE',
    fields: [
      ['Processo', scenarioCode(scenario, index).replace(/-\d{2}$/, '')],
      ['Empreendimento', scenario.title],
      ['Peça simulada', evidenceTitle],
      ['Situação declarada', primaryFact],
      ['Dado para confronto', crossFact],
    ],
    checkpoint,
    limitations: 'Documento sintético construído somente com os fatos do cenário. Não reproduz processo real, assinatura, ato oficial ou validação do IAT.',
  };
}

export function minimumEvidenceRequired(scenario) {
  return Math.min(2, Math.max(1, scenario?.evidence?.length || 0));
}
