// Contrato mínimo para decidir se uma tentativa ainda demonstra os objetivos
// atuais. Ele cabe no índice leve usado pelo Perfil e não leva enunciados,
// justificativas, rubricas editoriais nem gabaritos das decisões binárias.
export function buildLabObjectiveContract(scenario = {}) {
  const revision = Number(scenario.taskRevision) || 0;
  if (!revision) return null;

  const classificationChoices = (scenario.evidenceTask?.choices || [])
    .map((choice) => choice.id)
    .filter(Boolean);
  const classificationItems = (scenario.evidenceTask?.items || [])
    .map((item) => ({
      evidenceTitle: scenario.evidence?.[item.evidenceIndex] || null,
      expectedUse: item.expectedUse,
    }))
    .filter((item) => item.evidenceTitle && item.expectedUse);

  return {
    revision,
    minTextCharacters: scenario.openTask?.minCharacters || 180,
    classificationChoices,
    classificationItems,
    openCriteriaCount: scenario.openTask?.criteria?.length || 0,
  };
}
