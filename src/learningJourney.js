export function hasStartedJourney(state = {}) {
  if (state.lastLesson || state.lastVisit) return true;
  const listFields = [state.completed, state.bookmarks, state.videoSeen];
  if (listFields.some((value) => Array.isArray(value) && value.length > 0)) return true;
  const recordFields = [
    state.notes,
    state.quizScores,
    state.labs,
    state.checks,
    state.lessonEvidence,
    state.diagnostico,
    state.revisao,
    state.its,
  ];
  return recordFields.some(
    (value) => value && typeof value === "object" && Object.keys(value).length > 0,
  );
}
