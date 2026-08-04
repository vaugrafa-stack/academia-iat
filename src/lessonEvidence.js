import { getLabSourceIndex } from "./labSourceIndex.js";

export const MIN_ACTIVE_RECALL_CHARS = 80;

export function normalizedResponseLength(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim().length;
}

export function normalizeCriterionIds(value, criterionCount = 3) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)]
    .filter(
      (item) =>
        Number.isInteger(item) && item >= 0 && item < Math.max(0, criterionCount),
    )
    .sort((a, b) => a - b);
}

export function lessonEvidenceStatus(
  record,
  { criterionCount = 3, hasObjectiveCheck = true } = {},
) {
  const responseLength = normalizedResponseLength(record?.response);
  const criteria = normalizeCriterionIds(record?.criteria, criterionCount);
  const responseRecorded = responseLength >= MIN_ACTIVE_RECALL_CHARS;
  const selfAuditRecorded =
    criterionCount === 0 || criteria.length >= Math.min(2, criterionCount);
  const objectiveMet =
    hasObjectiveCheck && record?.objectiveCorrect === true;
  const objectiveRequirementMet = !hasObjectiveCheck || objectiveMet;

  return {
    responseLength,
    criteria,
    responseRecorded,
    selfAuditRecorded,
    objectiveMet,
    objectiveRequirementMet,
    ready:
      responseRecorded && selfAuditRecorded && objectiveRequirementMet,
  };
}

export function lessonQuestionProvesObjective(selection) {
  return selection?.scope === "section" && Boolean(selection.question);
}

export function selectLessonQuestion(questionBank, lesson, lessonIndex = 0) {
  const bank = Array.isArray(questionBank) ? questionBank : [];
  if (!lesson) return null;
  const exact = bank.filter((question) => question?.source?.sec === lesson.id);
  if (exact.length) {
    return {
      question: exact[Math.abs(lessonIndex) % exact.length],
      scope: "section",
    };
  }
  const moduleQuestions = bank.filter(
    (question) => question?.track === lesson.trackId,
  );
  if (!moduleQuestions.length) return null;
  return {
    question: moduleQuestions[Math.abs(lessonIndex) % moduleQuestions.length],
    scope: "module",
  };
}

export function selectLessonScenario(
  scenarios,
  trackId,
  lessonIndex = 0,
  lessonId = "",
) {
  const allScenarios = Array.isArray(scenarios) ? scenarios : [];
  const exact = lessonId
    ? allScenarios.filter((scenario) =>
        getLabSourceIndex(scenario?.id)?.sourceLessonIds.includes(lessonId),
      )
    : [];
  const moduleScenarios = allScenarios.filter(
    (scenario) => scenario?.track === trackId,
  );
  const available = exact.length ? exact : moduleScenarios;
  if (!available.length) return null;
  const scenario = available[Math.abs(lessonIndex) % available.length];
  const questionCount = Array.isArray(scenario.questions)
    ? scenario.questions.length
    : 0;
  const matchingQuestionIndexes = exact.length
    ? (getLabSourceIndex(scenario.id)?.decisionSourceLessonIds || [])
        .map((sourceIds, index) => (sourceIds.includes(lessonId) ? index : -1))
        .filter((index) => index >= 0 && index < questionCount)
    : [];
  return {
    scenario,
    questionIndex: matchingQuestionIndexes.length
      ? matchingQuestionIndexes[
          Math.abs(lessonIndex) % matchingQuestionIndexes.length
        ]
      : questionCount
        ? Math.abs(lessonIndex) % questionCount
        : 0,
    scope: exact.length ? "section" : "module",
  };
}
