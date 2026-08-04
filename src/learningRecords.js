import { buildLabObjectiveContract } from './labObjectiveContract.js';

const MINIMUM_OBJECTIVE_PERCENT = 80;
const LEGACY_PENDING_REVIEW_KEY = ['revisao', 'Humana', 'Pendente'].join('');
const LEGACY_APPROVED_REVIEW_KEY = ['revisao', 'Humana', 'Aprovada'].join('');

function savedAttemptStatus(scenario, saved) {
  const expectedTotal = scenario.questions?.length || 0;
  const total = Number(saved?.total);
  const score = Number(saved?.score);
  const objectiveContract = scenario.objectiveContract
    || buildLabObjectiveContract(scenario);
  const taskRevision = Number(objectiveContract?.revision) || 0;
  const taskCompatible = taskRevision === 0
    || Number(saved?.taskRevision) === taskRevision;
  const evidenceChoices = new Set(
    objectiveContract?.classificationChoices || [],
  );
  const classificationItems = objectiveContract?.classificationItems || [];
  const classifications = saved?.classificacoesEvidencias || {};
  const classified = classificationItems.filter((item) => {
    return evidenceChoices.has(classifications[item.evidenceTitle]);
  });
  const classificationsAligned = classificationItems.filter((item) => {
    return classifications[item.evidenceTitle] === item.expectedUse;
  }).length;
  const classificationSubmitted = !classificationItems.length
    || classified.length === classificationItems.length;
  const classificationPercent = classificationItems.length
    ? Math.round((classificationsAligned / classificationItems.length) * 100)
    : null;
  const openCriteriaTotal = objectiveContract?.openCriteriaCount || 0;
  const storedCriteriaTotal = Number(saved?.elementosTotal);
  const storedCriteriaMet = Number(saved?.elementos);
  const openTaskSubmitted = !openCriteriaTotal || (
    storedCriteriaTotal === openCriteriaTotal
    && Number.isFinite(storedCriteriaMet)
    && storedCriteriaMet >= 0
    && storedCriteriaMet <= openCriteriaTotal
  );
  const openTaskPercent = openCriteriaTotal
    ? Math.round((storedCriteriaMet / openCriteriaTotal) * 100)
    : null;
  const minimumTextLength = objectiveContract?.minTextCharacters || 180;
  const submitted = Boolean(
    saved
      && saved.versao >= 3
      && saved.status === 'concluido'
      && taskCompatible
      && total === expectedTotal
      && expectedTotal > 0
      && Object.keys(saved.respostas || {}).length === expectedTotal
      && saved.texto?.trim().length >= minimumTextLength
      && Number(saved.rubrica?.evidence) >= 100
      && classificationSubmitted
      && openTaskSubmitted
  );
  const decisionPercent = Number.isFinite(score) && total > 0
    ? Math.round((score / total) * 100)
    : 0;
  const objectiveComponents = [
    decisionPercent,
    ...(classificationPercent == null ? [] : [classificationPercent]),
    ...(openTaskPercent == null ? [] : [openTaskPercent]),
  ];
  const objectivePercent = submitted && objectiveComponents.length
    ? Math.round(
        objectiveComponents.reduce((sum, value) => sum + value, 0)
        / objectiveComponents.length,
      )
    : 0;

  return {
    submitted,
    objectivePercent: Number.isFinite(objectivePercent) ? objectivePercent : 0,
    objectiveMet: submitted
      && Number.isFinite(score)
      && score >= 0
      && score <= total
      && objectiveComponents.every((value) => value >= MINIMUM_OBJECTIVE_PERCENT),
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
