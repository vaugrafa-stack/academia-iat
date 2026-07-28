import { describe, expect, it } from 'vitest';
import { prepareAssessment, selectDiagnosticAnchors } from './assessmentDesign.js';
import { questionBank, tracks } from './courseData.js';

describe('preparação de tentativas', () => {
  it('mantém os mesmos itens-âncora no diagnóstico e muda apenas a apresentação', () => {
    const anchors = selectDiagnosticAnchors(questionBank, tracks, 3);
    const first = prepareAssessment(anchors, 'diagnostico-entrada');
    const second = prepareAssessment(anchors, 'diagnostico-reaplicacao');

    expect(anchors).toHaveLength(tracks.length * 3);
    expect(new Set(first.map((question) => question.id))).toEqual(
      new Set(second.map((question) => question.id)),
    );
    for (const track of tracks) {
      expect(anchors.filter((question) => question.track === track.id)).toHaveLength(3);
    }
  });

  it('preserva pergunta, alternativa correta e identificador', () => {
    const prepared = prepareAssessment(questionBank, 'tentativa-1');
    expect(prepared).toHaveLength(questionBank.length);
    for (const question of prepared) {
      const original = questionBank.find((item) => item.id === question.id);
      expect(question.question).toBe(original.question);
      expect(question.options[question.answer]).toBe(
        original.options[original.answer],
      );
    }
  });

  it('muda ordem e posições entre tentativas sem criar viés de letra', () => {
    const first = prepareAssessment(questionBank, 'tentativa-1');
    const second = prepareAssessment(questionBank, 'tentativa-2');
    expect(first.map((question) => question.id)).not.toEqual(
      second.map((question) => question.id),
    );
    expect(first.map((question) => question.answer)).not.toEqual(
      second.map((question) => question.answer),
    );

    for (const track of tracks) {
      const questions = first.filter((question) => question.track === track.id);
      const counts = [0, 1, 2].map((position) => (
        questions.filter((question) => question.answer === position).length
      ));
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });
});
