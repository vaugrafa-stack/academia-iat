import { describe, expect, it } from 'vitest';
import { prepareAssessment, selectDiagnosticAnchors } from './assessmentDesign.js';
import { questionBank } from './questions.js';
import { tracks } from './courseData.js';

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

  it('não depende do número de alternativas', () => {
    // A contagem por posição já foi um `[0, 0, 0, 0]` fixo, e isso ligava a
    // correção do exercício a um número mágico. Com cinco alternativas,
    // `counts[4]` era `undefined`, o mínimo virava `NaN`, nenhuma posição
    // empatava e a troca acontecia contra `undefined`. O efeito não era erro
    // visível: a alternativa CORRETA era apagada da lista, virava `null`, e
    // `answer` ficava `undefined`. A pessoa recebia uma questão sem resposta
    // certa possível e errava fizesse o que fizesse.
    for (const total of [2, 3, 4, 5, 6, 8]) {
      const options = Array.from({ length: total }, (_, i) => `alternativa ${i}`);
      const original = {
        id: `q${total}`,
        track: 'm01',
        question: 'pergunta',
        options,
        answer: total - 1,
      };
      const [preparada] = prepareAssessment([original], 'semente');

      expect(preparada.options).toHaveLength(total);
      expect(preparada.options.filter((o) => o == null)).toEqual([]);
      expect(new Set(preparada.options)).toEqual(new Set(options));
      expect(typeof preparada.answer).toBe('number');
      expect(preparada.options[preparada.answer]).toBe(options[original.answer]);
    }
  });

  it('nunca corrompe uma questão do banco real', () => {
    const preparadas = prepareAssessment(questionBank, 'tentativa-integridade');
    const corrompidas = preparadas.filter((q) => (
      typeof q.answer !== 'number'
      || q.options.some((o) => o == null)
      || q.options.length !== questionBank.find((i) => i.id === q.id).options.length
    ));
    expect(corrompidas.map((q) => q.id)).toEqual([]);
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
