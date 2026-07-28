import { describe, expect, it } from 'vitest';
import { practiceRecordStatus } from './learningRecords.js';

const scenario = {
  id: 'caso-1',
  questions: [
    ['Decisão 1', 'sim'],
    ['Decisão 2', 'nao'],
    ['Decisão 3', 'sim'],
    ['Decisão 4', 'nao'],
    ['Decisão 5', 'sim'],
  ],
};

function attempt(overrides = {}) {
  return {
    versao: 3,
    status: 'concluido',
    score: 4,
    total: 5,
    respostas: { 0: 'sim', 1: 'nao', 2: 'sim', 3: 'nao', 4: 'sim' },
    texto: 'x'.repeat(180),
    rubrica: { evidence: 100 },
    conferenciaTecnicaPendente: true,
    ...overrides,
  };
}

describe('registro honesto da prática', () => {
  it('não transforma mera entrega tecnicamente errada em requisito cumprido', () => {
    const result = practiceRecordStatus(
      [scenario],
      { 'caso-1': attempt({ score: 0 }) },
    );

    expect(result.submitted).toBe(true);
    expect(result.objectiveMet).toBe(false);
    expect(result.bestObjectivePercent).toBe(0);
  });

  it('separa desempenho objetivo de aprovação técnica', () => {
    const result = practiceRecordStatus([scenario], { 'caso-1': attempt() });

    expect(result.objectiveMet).toBe(true);
    expect(result.technicalReviewApproved).toBe(false);
    expect(result.bestObjectivePercent).toBe(80);
  });

  it('só reconhece aprovação técnica quando ela está registrada explicitamente', () => {
    const result = practiceRecordStatus(
      [scenario],
      {
        'caso-1': attempt({
          conferenciaTecnicaPendente: false,
          conferenciaTecnicaAprovada: true,
        }),
      },
    );

    expect(result.technicalReviewApproved).toBe(true);
  });

  it('mantém compatibilidade com o registro legado sem expor sua nomenclatura', () => {
    const result = practiceRecordStatus(
      [scenario],
      {
        'caso-1': attempt({
          conferenciaTecnicaPendente: undefined,
          revisaoHumanaPendente: false,
          revisaoHumanaAprovada: true,
        }),
      },
    );

    expect(result.technicalReviewApproved).toBe(true);
  });
});
