import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tracks } from './courseData.js';
import { derivarAulas } from './lessons.js';
import { questionBank } from './questions.js';

const pop = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'data/pop-content.json'), 'utf8'),
);
const learningLessons = derivarAulas(pop, tracks).lessons;

const TARGETED_IDS = [
  'q001',
  'q002',
  'q003',
  'q005',
  'q015',
  'q016',
  'q020',
  'q021',
  'q059',
  'q081',
  'q084',
  'q094',
  'q101',
  'q103',
  'q106',
  'q111',
  'q113',
  'q116',
  'q118',
  'q127',
];

function lengthSignal(question) {
  const correctLength = question.options[question.answer].length;
  const distractorLengths = question.options
    .filter((_, index) => index !== question.answer)
    .map((option) => option.length);
  const longestDistractor = Math.max(...distractorLengths);
  const allLengths = question.options.map((option) => option.length);

  return {
    correctLength,
    ratio: correctLength / longestDistractor,
    strictLongest:
      correctLength === Math.max(...allLengths)
      && allLengths.filter((length) => length === correctLength).length === 1,
  };
}

function editorialMetrics(questions) {
  const signals = questions.map((question) => ({
    id: question.id,
    ...lengthSignal(question),
  }));
  const bySection = questions.reduce((counts, question) => {
    counts[question.source.sec] = (counts[question.source.sec] || 0) + 1;
    return counts;
  }, {});

  return {
    strictLongest: signals.filter((signal) => signal.strictLongest).length,
    extremeLengthSignal: signals.filter((signal) => signal.ratio >= 2).length,
    bySection,
    signals,
  };
}

describe('validade editorial do banco de questões', () => {
  const metrics = editorialMetrics(questionBank);
  const coveredSections = Object.keys(metrics.bySection).length;

  console.info(
    `[validade editorial] ${questionBank.length} questões; `
    + `${metrics.strictLongest} corretas estritamente mais longas; `
    + `${metrics.extremeLengthSignal} com razão >= 2; `
    + `${coveredSections}/${learningLessons.length} aulas com fonte exclusiva; `
    + `1–${Math.max(...Object.values(metrics.bySection))} questões por seção citada.`,
  );

  it('elimina a pista extrema de comprimento nos 20 itens priorizados', () => {
    const targeted = metrics.signals.filter((signal) => TARGETED_IDS.includes(signal.id));

    expect(targeted).toHaveLength(TARGETED_IDS.length);
    expect(targeted.filter((signal) => signal.strictLongest)).toEqual([]);
    expect(targeted.filter((signal) => signal.ratio >= 2)).toEqual([]);
  });

  it('impede regressão para a linha de base de respostas corretas mais longas', () => {
    // Linha de base antes desta revisão: 103/136 corretas eram a alternativa
    // estritamente mais longa e 19 tinham pelo menos o dobro do maior distrator.
    expect(metrics.strictLongest).toBeLessThanOrEqual(83);
    expect(metrics.extremeLengthSignal).toBe(0);
  });

  it('mantém uma questão exclusiva e alinhada para cada aula', () => {
    expect(Object.values(metrics.bySection).reduce((sum, count) => sum + count, 0))
      .toBe(questionBank.length);
    expect(
      learningLessons.filter((lesson) => !questionBank.some(
        (question) => question.track === lesson.trackId
          && question.source.sec === lesson.id,
      )),
    ).toEqual([]);
    expect(coveredSections).toBe(learningLessons.length);
    expect(Math.max(...Object.values(metrics.bySection))).toBe(8);
  });
});
