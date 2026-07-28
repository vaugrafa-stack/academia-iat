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
  const objectiveMet = !hasObjectiveCheck || record?.objectiveCorrect === true;

  return {
    responseLength,
    criteria,
    responseRecorded,
    selfAuditRecorded,
    objectiveMet,
    ready: responseRecorded && selfAuditRecorded && objectiveMet,
  };
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

export function selectLessonScenario(scenarios, trackId, lessonIndex = 0) {
  const available = (Array.isArray(scenarios) ? scenarios : []).filter(
    (scenario) => scenario?.track === trackId,
  );
  if (!available.length) return null;
  const scenario = available[Math.abs(lessonIndex) % available.length];
  const questionCount = Array.isArray(scenario.questions)
    ? scenario.questions.length
    : 0;
  return {
    scenario,
    questionIndex: questionCount
      ? Math.abs(lessonIndex) % questionCount
      : 0,
  };
}
