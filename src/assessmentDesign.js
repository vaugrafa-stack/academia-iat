function seedNumber(seed) {
  let value = 2166136261;
  for (const character of String(seed)) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function randomFromSeed(seed) {
  let value = seedNumber(seed);
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function newAssessmentSeed() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random()}`;
}

// O diagnóstico usa os mesmos itens-âncora na primeira aplicação e na
// reaplicação. A ordem das perguntas e das alternativas muda por tentativa,
// mas o conteúdo medido não muda silenciosamente.
export function selectDiagnosticAnchors(questions, tracks, perTrack = 3) {
  return tracks.flatMap((track) => (
    questions
      .filter((question) => question.track === track.id)
      .slice(0, perTrack)
  ));
}

export function prepareAssessment(questions, seed) {
  const random = randomFromSeed(seed);
  const ordered = shuffled(questions, random);
  const positionCounts = new Map();

  return ordered.map((question) => {
    const counts = positionCounts.get(question.track) || [0, 0, 0, 0];
    const available = question.options.map((_, index) => index);
    const minimum = Math.min(...available.map((position) => counts[position]));
    const candidates = shuffled(
      available.filter((position) => counts[position] === minimum),
      random,
    );
    const target = candidates[0];
    counts[target] += 1;
    positionCounts.set(question.track, counts);

    const options = [...question.options];
    [options[target], options[question.answer]] = [
      options[question.answer],
      options[target],
    ];
    return { ...question, options, answer: target };
  });
}
