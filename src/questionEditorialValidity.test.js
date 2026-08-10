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

const REVISED_DUPLICATE_PAIRS = [
  ['q035', 'q091'],
  ['q036', 'q092'],
  ['q050', 'q107'],
  ['q066', 'q123'],
  ['q069', 'q128'],
];

const SIMILARITY_STOPWORDS = new Set(
  (
    'a o as os um uma de da do das dos e em no na nos nas para por que qual quais '
    + 'como quando se ao aos com sem entre sua seu suas seus esta este essa esse depois sobre'
  ).split(' '),
);

function questionTokens(text) {
  return new Set(
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !SIMILARITY_STOPWORDS.has(token)),
  );
}

function jaccardSimilarity(left, right) {
  const leftTokens = questionTokens(left);
  const rightTokens = questionTokens(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 0;
}

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

  it('mantém distintos os cinco pares antes repetidos', () => {
    const byId = new Map(questionBank.map((question) => [question.id, question]));

    for (const [firstId, secondId] of REVISED_DUPLICATE_PAIRS) {
      const first = byId.get(firstId);
      const second = byId.get(secondId);
      expect(first, firstId).toBeTruthy();
      expect(second, secondId).toBeTruthy();
      expect(jaccardSimilarity(first.question, second.question)).toBeLessThanOrEqual(0.3);
    }
  });
});
