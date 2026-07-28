export const LEARNING_PATHS = [
  {
    id: "essencial",
    label: "Trilha Essencial",
    audience: "Ingresso na unidade",
    description:
      "Base de escopo, método, triagem, enquadramento, modalidades, fases e qualidade da conclusão.",
    trackIds: ["m00", "m01", "m02", "m03", "m04", "m05", "m12", "m13"],
  },
  {
    id: "analista",
    label: "Trilha Analista",
    audience: "Formação integral pretendida",
    description:
      "Percorre todos os módulos, práticas e interfaces do POP, sem substituir supervisão e avaliação técnica.",
    trackIds: [
      "m00",
      "m01",
      "m02",
      "m03",
      "m04",
      "m05",
      "m06",
      "m07",
      "m08",
      "m09",
      "m10",
      "m11",
      "m15",
      "m16",
      "m12",
      "m13",
      "m14",
    ],
  },
  {
    id: "pacuera",
    label: "Trilha PACUERA",
    audience: "Análise e revisão territorial",
    description:
      "Prioriza enquadramento, estudos, PACUERA, cartografia, UCs/APAs, conclusão e controle de qualidade.",
    trackIds: [
      "m00",
      "m01",
      "m03",
      "m08",
      "m09",
      "m10",
      "m15",
      "m12",
      "m13",
    ],
  },
  {
    id: "revisor",
    label: "Trilha Revisor",
    audience: "Revisão e coordenação",
    description:
      "Concentra normas, situações especiais, estudos, interfaces, suficiência, redação e auditoria final.",
    trackIds: [
      "m01",
      "m06",
      "m07",
      "m08",
      "m09",
      "m10",
      "m11",
      "m15",
      "m16",
      "m12",
      "m13",
      "m14",
    ],
  },
];

export function resolveLearningPath(id) {
  return (
    LEARNING_PATHS.find((path) => path.id === id) ||
    LEARNING_PATHS.find((path) => path.id === "analista")
  );
}

export function learningPathStats(path, trackLessons, completed = []) {
  const selected = resolveLearningPath(path?.id || path);
  const completedSet = new Set(Array.isArray(completed) ? completed : []);
  const lessonIds = selected.trackIds.flatMap((trackId) =>
    (trackLessons.get(trackId) || []).map((lesson) => lesson.id),
  );
  const done = lessonIds.filter((id) => completedSet.has(id)).length;
  return {
    tracks: selected.trackIds.length,
    lessons: lessonIds.length,
    completed: done,
    percent: lessonIds.length ? Math.round((done / lessonIds.length) * 100) : 0,
  };
}
