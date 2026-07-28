const MINIMUM_OBJECTIVE_PERCENT = 80;
const LEGACY_PENDING_REVIEW_KEY = ['revisao', 'Humana', 'Pendente'].join('');
const LEGACY_APPROVED_REVIEW_KEY = ['revisao', 'Humana', 'Aprovada'].join('');

function savedAttemptStatus(scenario, saved) {
  const expectedTotal = scenario.questions?.length || 0;
  const total = Number(saved?.total);
  const score = Number(saved?.score);
  const submitted = Boolean(
    saved
      && saved.versao >= 3
      && saved.status === 'concluido'
      && total === expectedTotal
      && expectedTotal > 0
      && Object.keys(saved.respostas || {}).length === expectedTotal
      && saved.texto?.trim().length >= 180
      && Number(saved.rubrica?.evidence) >= 100,
  );
  const objectivePercent = submitted
    ? Math.round((score / total) * 100)
    : 0;

  return {
    submitted,
    objectivePercent: Number.isFinite(objectivePercent) ? objectivePercent : 0,
    objectiveMet: submitted
      && Number.isFinite(score)
      && score >= 0
      && score <= total
      && objectivePercent >= MINIMUM_OBJECTIVE_PERCENT,
    technicalReviewApproved: submitted
      && (saved.conferenciaTecnicaPendente ?? saved[LEGACY_PENDING_REVIEW_KEY]) === false
      && (saved.conferenciaTecnicaAprovada ?? saved[LEGACY_APPROVED_REVIEW_KEY]) === true,
  };
}

// Separa o que a plataforma consegue comprovar automaticamente (entrega e
// decisões objetivas) do que só uma pessoa revisora pode aprovar (mérito da
// fundamentação). Assim, texto longo ou formulário completo não vira
// competência por decreto.
export function practiceRecordStatus(scenarios = [], labs = {}) {
  if (!scenarios.length) {
    return {
      applies: false,
      submitted: true,
      objectiveMet: true,
      technicalReviewApproved: false,
      bestObjectivePercent: null,
    };
  }

  const attempts = scenarios.map((scenario) => (
    savedAttemptStatus(scenario, labs?.[scenario.id])
  ));
  return {
    applies: true,
    submitted: attempts.some((attempt) => attempt.submitted),
    objectiveMet: attempts.some((attempt) => attempt.objectiveMet),
    technicalReviewApproved: attempts.some(
      (attempt) => attempt.technicalReviewApproved,
    ),
    bestObjectivePercent: Math.max(
      0,
      ...attempts.map((attempt) => attempt.objectivePercent),
    ),
  };
}

export { MINIMUM_OBJECTIVE_PERCENT };
