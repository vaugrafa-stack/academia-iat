import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { questionBank } from './courseData.js';

const catalog = JSON.parse(
  readFileSync(resolve(import.meta.dirname, 'data/content-catalog.json'), 'utf8'),
);

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
  const learningSections = catalog.documents.find((document) => document.id === 'pop').learningSections;
  const coveredSections = Object.keys(metrics.bySection).length;

  console.info(
    `[validade editorial] ${questionBank.length} questões; `
    + `${metrics.strictLongest} corretas estritamente mais longas; `
    + `${metrics.extremeLengthSignal} com razão >= 2; `
    + `${coveredSections}/${learningSections} seções didáticas citadas; `
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

  it('contabiliza a cobertura das fontes sem alterar a distribuição por seção', () => {
    expect(Object.values(metrics.bySection).reduce((sum, count) => sum + count, 0))
      .toBe(questionBank.length);
    expect(coveredSections).toBe(82);
    expect(Math.max(...Object.values(metrics.bySection))).toBe(8);
  });
});
