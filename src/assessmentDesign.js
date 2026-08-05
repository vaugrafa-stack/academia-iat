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

// Espalha a posição da resposta certa dentro de cada módulo, para que ela não
// caia sempre no mesmo lugar e a pessoa não aprenda a marcar por posição.
//
// A contagem por posição é ESPARSA de propósito. Ela já foi um `[0, 0, 0, 0]`
// fixo, e isso ligava a correção do exercício a um número mágico: numa questão
// com cinco alternativas, `counts[4]` era `undefined`, o mínimo virava `NaN`,
// nenhuma posição empatava com ele, e a troca acontecia contra `undefined`. O
// efeito não era um erro visível: a alternativa correta era APAGADA da lista,
// virava `null`, e `answer` ficava `undefined`. A pessoa recebia uma questão
// sem resposta certa possível e errava fizesse o que fizesse.
//
// Hoje nenhuma questão passa de quatro alternativas. O defeito nasceria da
// primeira que passasse, calado.
const contagem = (counts, posicao) => counts[posicao] || 0;

export function prepareAssessment(questions, seed) {
  const random = randomFromSeed(seed);
  const ordered = shuffled(questions, random);
  const positionCounts = new Map();

  return ordered.map((question) => {
    const counts = positionCounts.get(question.track) || [];
    const available = question.options.map((_, index) => index);
    const minimum = Math.min(...available.map((position) => contagem(counts, position)));
    const candidates = shuffled(
      available.filter((position) => contagem(counts, position) === minimum),
      random,
    );
    const target = candidates[0];
    counts[target] = contagem(counts, target) + 1;
    positionCounts.set(question.track, counts);

    const options = [...question.options];
    [options[target], options[question.answer]] = [
      options[question.answer],
      options[target],
    ];
    return { ...question, options, answer: target };
  });
}
