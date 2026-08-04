import { describe, expect, it } from 'vitest';
import labIndex from './data/lab-index.json';
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

const classificationScenario = {
  ...scenario,
  taskRevision: 1,
  evidence: ['E1', 'E2', 'E3', 'E4'],
  evidenceTask: {
    choices: [{ id: 'direta' }, { id: 'inapta' }],
    items: [
      { evidenceIndex: 0, expectedUse: 'direta' },
      { evidenceIndex: 1, expectedUse: 'inapta' },
      { evidenceIndex: 2, expectedUse: 'direta' },
      { evidenceIndex: 3, expectedUse: 'inapta' },
    ],
  },
};

const openScenario = {
  ...scenario,
  taskRevision: 1,
  openTask: {
    minCharacters: 240,
    criteria: Array.from({ length: 5 }, (_, index) => ({ id: `c${index + 1}` })),
  },
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

  it('invalida conclusão anterior quando a tarefa atual possui nova revisão', () => {
    const result = practiceRecordStatus(
      [classificationScenario],
      { 'caso-1': attempt() },
    );

    expect(result.submitted).toBe(false);
    expect(result.objectiveMet).toBe(false);
    expect(result.bestObjectivePercent).toBe(0);
  });

  it('exige classificações alinhadas além das cinco decisões binárias', () => {
    const result = practiceRecordStatus(
      [classificationScenario],
      {
        'caso-1': attempt({
          taskRevision: 1,
          score: 5,
          classificacoesEvidencias: {
            E1: 'inapta',
            E2: 'direta',
            E3: 'inapta',
            E4: 'direta',
          },
        }),
      },
    );

    expect(result.submitted).toBe(true);
    expect(result.objectiveMet).toBe(false);
    expect(result.bestObjectivePercent).toBe(50);
  });

  it('exige desempenho mínimo nos critérios da tarefa aberta', () => {
    const incomplete = practiceRecordStatus(
      [openScenario],
      {
        'caso-1': attempt({
          taskRevision: 1,
          score: 5,
          texto: 'x'.repeat(240),
          elementos: 3,
          elementosTotal: 5,
        }),
      },
    );
    const sufficient = practiceRecordStatus(
      [openScenario],
      {
        'caso-1': attempt({
          taskRevision: 1,
          score: 5,
          texto: 'x'.repeat(240),
          elementos: 4,
          elementosTotal: 5,
        }),
      },
    );

    expect(incomplete.submitted).toBe(true);
    expect(incomplete.objectiveMet).toBe(false);
    expect(sufficient.objectiveMet).toBe(true);
  });

  it('aplica o contrato objetivo do lab-index real usado pelo Perfil', () => {
    const indexedClassification = labIndex.casos.find((candidate) => candidate.id === 'escopo');
    const indexedOpenTask = labIndex.casos.find((candidate) => candidate.id === 'condicionantes');

    expect(indexedClassification.objectiveContract.revision).toBe(1);
    expect(indexedOpenTask.objectiveContract.openCriteriaCount).toBe(5);
    expect(practiceRecordStatus([indexedClassification], { escopo: attempt() }).objectiveMet)
      .toBe(false);
    expect(practiceRecordStatus(
      [indexedOpenTask],
      {
        condicionantes: attempt({
          taskRevision: 1,
          score: 5,
          texto: 'x'.repeat(240),
          elementos: 0,
          elementosTotal: 5,
        }),
      },
    ).objectiveMet).toBe(false);
  });
});
