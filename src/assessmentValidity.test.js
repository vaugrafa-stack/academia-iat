import { describe, expect, it } from 'vitest';
import { questionBank } from './questions.js';
import { tracks } from './courseData.js';

function blindRate(questions, position) {
  return questions.filter((question) => question.answer === position).length
    / questions.length;
}

function canonical(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function beginsWithNo(option) {
  return /^(nao|nunca)\b/.test(canonical(option));
}

function beginsWithYes(option) {
  return /^sim\b/.test(canonical(option));
}

describe('validade mínima do banco de avaliações', () => {
  it('mantém cada gabarito dentro das alternativas disponíveis', () => {
    for (const question of questionBank) {
      expect(question.answer).toBeGreaterThanOrEqual(0);
      expect(question.answer).toBeLessThan(question.options.length);
      expect(new Set(question.options).size).toBe(question.options.length);
    }
  });

  it('não permite aprovação escolhendo sempre a mesma letra', () => {
    for (const track of tracks) {
      const questions = questionBank.filter((question) => question.track === track.id);
      expect(questions.length).toBeGreaterThanOrEqual(8);
      const bestBlindRate = Math.max(
        ...[0, 1, 2, 3].map((position) => blindRate(questions, position)),
      );
      expect(bestBlindRate).toBeLessThanOrEqual(0.4);
    }
  });

  it('equilibra as três primeiras questões de cada módulo no diagnóstico geral', () => {
    const diagnostic = tracks.flatMap((track) => (
      questionBank.filter((question) => question.track === track.id).slice(0, 3)
    ));
    expect(diagnostic).toHaveLength(tracks.length * 3);
    for (const position of [0, 1, 2]) {
      expect(blindRate(diagnostic, position)).toBeCloseTo(1 / 3, 5);
    }
  });

  it('limita a pista de polaridade nas questões explícitas de sim ou não', () => {
    const polarQuestions = questionBank.filter((question) =>
      question.options.some((option) => beginsWithNo(option) || beginsWithYes(option)),
    );
    const correctNo = polarQuestions.filter((question) =>
      beginsWithNo(question.options[question.answer]),
    ).length;
    const correctYes = polarQuestions.filter((question) =>
      beginsWithYes(question.options[question.answer]),
    ).length;

    expect(polarQuestions.length).toBeGreaterThan(0);
    expect(correctNo / polarQuestions.length).toBeLessThanOrEqual(0.75);
    expect(correctYes).toBeGreaterThanOrEqual(10);
  });

  it('preserva as distinções determinantes corrigidas na revisão editorial', () => {
    const lac = questionBank.find((item) => (
      item.question.includes('critérios')
      && item.question.includes('LAC de CGH')
    ));
    expect(lac.options[lac.answer]).toMatch(/ausência.*supressão/i);

    const memorial = questionBank.find((item) => (
      item.question.includes('estudo ambiental antigo')
      && item.question.includes('Memorial Descritivo')
    ));
    expect(memorial.question).not.toContain('estudo ambiental atualizado');

    const eiaPch = questionBank.filter((item) => (
      item.question.includes('situações passíveis de EIA e RIMA')
      && item.question.includes('PCH')
    ));
    expect(eiaPch.length).toBeGreaterThanOrEqual(2);
    expect(eiaPch.every((item) => (
      item.explanation.includes('inicialmente simplificado')
      && /confirmad/iu.test(item.explanation)
    ))).toBe(true);

    const lacuna = questionBank.find((item) => (
      item.question.includes('lacuna sanável')
      && item.question.includes('conclusão segura')
    ));
    expect(lacuna.options[lacuna.answer]).toMatch(/diligência ou complementação/i);
    expect(lacuna.options[lacuna.answer]).not.toMatch(/condicionante/i);
  });
});
