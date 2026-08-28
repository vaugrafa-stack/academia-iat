import { describe, expect, it } from 'vitest';
import pop from './data/pop-content.json';
import answerReasons from './data/lab-answer-reasons.json';
import { scenarios } from './scenarios.js';
import { isLessonSection } from './lessons.js';
import { LAB_SOURCE_INDEX, getLabSourceIndex } from './labSourceIndex.js';
import { validateLabAnswerReasons } from './labAnswerReasons.js';
import {
  LAB_SOURCE_POLICY,
  LAB_SOURCES,
  LAB_SOURCES_BY_SCENARIO,
  POP_LAB_QUOTES,
  getLabSources,
  getPopLabSource,
} from './labSources.js';

const blockById = new Map(pop.blocks.map((block) => [block.id, block]));
const tableById = new Map(pop.tables.map((table) => [table.id, table]));
const sectionById = new Map(pop.sections.map((section) => [section.id, section]));
const validLessonIds = new Set(pop.sections.filter(isLessonSection).map((section) => section.id));

function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(strings);
}

function literalTextsForSection(sectionId) {
  const section = sectionById.get(sectionId);
  return section.blockIds.flatMap((blockId) => {
    const block = blockById.get(blockId);
    const values = strings(block?.paragraph);
    if (block?.tableId) values.push(...strings(tableById.get(block.tableId)));
    return values;
  });
}

describe('proveniência estruturada dos cenários do laboratório', () => {
  it('cobre exatamente os 26 cenários e as 130 decisões atuais', () => {
    expect(scenarios).toHaveLength(26);
    expect(LAB_SOURCES).toHaveLength(26);
    expect(Object.keys(LAB_SOURCE_INDEX)).toHaveLength(26);
    expect(new Set(LAB_SOURCES.map((record) => record.scenarioId))).toEqual(
      new Set(scenarios.map((scenario) => scenario.id)),
    );
    expect(LAB_SOURCES.reduce((total, record) => total + record.decisions.length, 0)).toBe(130);

    for (const scenario of scenarios) {
      expect(scenario.questions).toHaveLength(5);
      expect(scenario.evidence).toHaveLength(4);
      expect(getLabSources(scenario.id)).toBe(LAB_SOURCES_BY_SCENARIO[scenario.id]);
      expect(getLabSourceIndex(scenario.id)).toBe(LAB_SOURCE_INDEX[scenario.id]);
    }
    expect(getLabSources('cenario-inexistente')).toBeNull();
    expect(getLabSourceIndex('cenario-inexistente')).toBeNull();
  });

  it('mantém IDs estáveis, únicos e referências internas válidas', () => {
    const allIds = [];

    for (const record of LAB_SOURCES) {
      expect(record.id).toBe(`lab-${record.scenarioId}-sources`);
      expect(record.caseEvidenceIds).toEqual(
        [1, 2, 3, 4].map((ordinal) => `lab-${record.scenarioId}-e${ordinal}`),
      );
      expect(record.decisions).toHaveLength(5);
      allIds.push(record.id, ...record.caseEvidenceIds);

      record.decisions.forEach((decision, index) => {
        expect(decision.id).toBe(`lab-${record.scenarioId}-q${index + 1}`);
        expect(decision.questionIndex).toBe(index + 1);
        expect(decision.popSources.length).toBeGreaterThan(0);
        expect(Array.isArray(decision.caseEvidenceRefs)).toBe(true);
        expect(decision.caseEvidenceRefs.every((id) => record.caseEvidenceIds.includes(id))).toBe(true);
        expect(decision.popSources.map((source) => source.sec)).toEqual(
          LAB_SOURCE_INDEX[record.scenarioId].decisionSourceLessonIds[index],
        );
        allIds.push(decision.id, ...decision.popSources.map((source) => source.id));
      });
    }

    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('aponta apenas para aulas válidas e preserva o índice leve', () => {
    for (const record of LAB_SOURCES) {
      const index = LAB_SOURCE_INDEX[record.scenarioId];
      expect(validLessonIds.has(record.primaryLessonId)).toBe(true);
      expect(record.primaryLessonId).toBe(index.primaryLessonId);
      expect(new Set(index.sourceLessonIds).size).toBe(index.sourceLessonIds.length);

      const flattened = [...new Set(index.decisionSourceLessonIds.flat())];
      expect(index.sourceLessonIds).toEqual(flattened);
      expect(index.sourceLessonIds.every((id) => validLessonIds.has(id))).toBe(true);

      for (const decision of record.decisions) {
        expect(decision.popSources.every((source) => validLessonIds.has(source.sec))).toBe(true);
        expect(decision.popSources.every((source) => !('title' in source) && !('number' in source))).toBe(true);
      }
    }
  });

  it('usa somente trechos literais existentes no conteúdo da aula indicada', () => {
    const usedSections = new Set();

    for (const record of LAB_SOURCES) {
      for (const decision of record.decisions) {
        for (const source of decision.popSources) {
          usedSections.add(source.sec);
          expect(source.quote.trim().length).toBeGreaterThanOrEqual(20);
          expect(literalTextsForSection(source.sec).some((text) => text.includes(source.quote))).toBe(true);
        }
      }
    }

    expect(new Set(Object.keys(POP_LAB_QUOTES))).toEqual(usedSections);
  });

  it('rastreia as tarefas de classificação e fundamentação a trechos literais do POP', () => {
    const classificationCases = scenarios.filter((scenario) => scenario.evidenceTask);
    const openCases = scenarios.filter((scenario) => scenario.openTask);
    expect(classificationCases).toHaveLength(5);
    expect(openCases).toHaveLength(4);

    for (const scenario of classificationCases) {
      const choiceIds = new Set(scenario.evidenceTask.choices.map((choice) => choice.id));
      expect(choiceIds.size).toBe(scenario.evidenceTask.choices.length);
      expect(scenario.evidenceTask.items.map((item) => item.evidenceIndex)).toEqual([0, 1, 2, 3]);
      expect(scenario.evidenceTask.items.filter((item) => item.distrator)).toHaveLength(1);
      for (const item of scenario.evidenceTask.items) {
        expect(choiceIds.has(item.expectedUse), scenario.id).toBe(true);
        expect(item.rationale.length, scenario.id).toBeGreaterThan(30);
        for (const sectionId of item.sourceRefs) {
          const source = getPopLabSource(
            sectionId,
            `lab-task-${scenario.id}-e${item.evidenceIndex + 1}-${sectionId}`,
          );
          expect(source, `${scenario.id}: ${sectionId}`).not.toBeNull();
          expect(validLessonIds.has(source.sec), `${scenario.id}: ${sectionId}`).toBe(true);
          expect(literalTextsForSection(source.sec).some((text) => text.includes(source.quote))).toBe(true);
        }
      }
    }

    for (const scenario of openCases) {
      expect(scenario.openTask.requiredEvidenceIndexes).toEqual([0, 1, 2, 3]);
      expect(scenario.openTask.criteria).toHaveLength(5);
      expect(new Set(scenario.openTask.criteria.map((criterion) => criterion.id)).size).toBe(5);
      for (const criterion of scenario.openTask.criteria) {
        expect(criterion.requiredConceptGroups.length).toBeGreaterThan(0);
        expect(criterion.requiredConceptGroups.every((group) => group.length > 0)).toBe(true);
        for (const sectionId of criterion.sourceRefs) {
          const source = getPopLabSource(
            sectionId,
            `lab-task-${scenario.id}-${criterion.id}-${sectionId}`,
          );
          expect(source, `${scenario.id}: ${sectionId}`).not.toBeNull();
          expect(validLessonIds.has(source.sec), `${scenario.id}: ${sectionId}`).toBe(true);
          expect(literalTextsForSection(source.sec).some((text) => text.includes(source.quote))).toBe(true);
        }
      }
    }

    expect(JSON.stringify([...classificationCases, ...openCases])).not.toMatch(
      /\bIA\b|intelig[eê]ncia artificial|chatgpt|claude|openai/i,
    );
  });

  it('usa trechos específicos da alegação nas fontes das tarefas determinantes', () => {
    const expectations = [
      [
        'pop-section-006',
        'lab-task-cp-antiga-e1-pop-section-006',
        'fundamento vigente',
      ],
      [
        'pop-section-019',
        'lab-task-triagem-e2-pop-section-019',
        'Estudo antigo pode ser aproveitado',
      ],
      [
        'pop-section-019',
        'lab-task-triagem-e3-pop-section-019',
        'outro empreendimento',
      ],
      [
        'pop-section-095',
        'lab-task-integrador-territorio-pop-section-095',
        'não deve ser convertida',
      ],
      [
        'pop-section-132',
        'lab-task-delegado-delegacao-pop-section-132',
        'não converte o processo',
      ],
    ];

    for (const [sectionId, sourceId, excerpt] of expectations) {
      const source = getPopLabSource(sectionId, sourceId);
      expect(source.id).toBe(sourceId);
      expect(source.quote).toContain(excerpt);
      expect(literalTextsForSection(sectionId).some((text) => text.includes(source.quote))).toBe(true);
    }
  });

  it('mapeia evidências por pertinência sem impor regra global à quinta decisão', () => {
    const expected = {
      'lab-cp-q5': [],
      'lab-pacuera-q5': ['lab-pacuera-e1', 'lab-pacuera-e4'],
      'lab-rlo-vencida-q5': [
        'lab-rlo-vencida-e1',
        'lab-rlo-vencida-e2',
        'lab-rlo-vencida-e3',
        'lab-rlo-vencida-e4',
      ],
      'lab-cp-antiga-q5': [
        'lab-cp-antiga-e1',
        'lab-cp-antiga-e3',
        'lab-cp-antiga-e4',
      ],
      'lab-prog-semestral-q5': [
        'lab-prog-semestral-e1',
        'lab-prog-semestral-e2',
        'lab-prog-semestral-e3',
      ],
      'lab-prog-residuos-q5': [
        'lab-prog-residuos-e1',
        'lab-prog-residuos-e2',
        'lab-prog-residuos-e4',
      ],
      'lab-integrador-q3': ['lab-integrador-e3'],
      'lab-integrador-q5': ['lab-integrador-e1'],
    };

    const decisions = new Map(
      LAB_SOURCES.flatMap((record) => record.decisions)
        .map((decision) => [decision.id, decision]),
    );
    for (const [id, refs] of Object.entries(expected)) {
      expect(decisions.get(id)?.caseEvidenceRefs, id).toEqual(refs);
    }
  });

  it('possui uma explicação editorial explícita, específica e separada da citação para cada decisão', () => {
    expect(validateLabAnswerReasons(answerReasons)).toBe(answerReasons);
    expect(Object.keys(answerReasons)).toHaveLength(26);
    const allAnswerReasons = Object.values(answerReasons).flat();
    expect(allAnswerReasons).toHaveLength(130);
    expect(new Set(allAnswerReasons).size).toBe(130);
    expect(JSON.stringify(answerReasons)).not.toMatch(
      /\bIA\b|intelig[eê]ncia artificial|chatgpt|claude|openai/i,
    );

    for (const record of LAB_SOURCES) {
      for (const [index, decision] of record.decisions.entries()) {
        const answerReason = answerReasons[record.scenarioId][index];
        expect(decision.answerReasonId, decision.id).toBe(decision.id);
        expect(answerReason, decision.id).toMatch(/^(Sim|Não)\./);
        expect(answerReason.length, decision.id).toBeGreaterThanOrEqual(35);
        expect(
          decision.popSources.some((source) => source.quote === answerReason),
          decision.id,
        ).toBe(false);
        if (decision.reviewReason) {
          expect(answerReason, decision.id).not.toBe(decision.reviewReason);
        }
      }
    }
  });

  it('mantém inferências frágeis em modo misto e revisão técnica', () => {
    const reviewExpected = new Set([
      'lab-cp-q1',
      'lab-cp-q3',
      'lab-las-q1',
      'lab-rlo-q1',
      'lab-rlo-vencida-q1',
      'lab-rlo-vencida-q5',
      'lab-prog-semestral-q2',
      'lab-prog-residuos-q5',
      'lab-prog-compensacao-q3',
      'lab-prog-app-q4',
    ]);
    const caseApplied = new Set([
      'lab-prog-semestral-q1',
      'lab-prog-semestral-q4',
      'lab-prog-residuos-q1',
      'lab-prog-residuos-q2',
      'lab-prog-residuos-q3',
      'lab-prog-residuos-q4',
      'lab-prog-compensacao-q1',
      'lab-prog-compensacao-q2',
      'lab-prog-compensacao-q4',
      'lab-prog-compensacao-q5',
      'lab-prog-app-q1',
      'lab-prog-app-q2',
      'lab-prog-app-q3',
      'lab-prog-app-q5',
    ]);
    const actual = new Set(
      LAB_SOURCES.flatMap((record) => record.decisions)
        .filter((decision) => decision.reviewStatus === 'needs-technical-review')
        .map((decision) => decision.id),
    );

    expect(actual).toEqual(reviewExpected);
    for (const decision of LAB_SOURCES.flatMap((record) => record.decisions)) {
      if (reviewExpected.has(decision.id)) {
        expect(decision.supportMode).toBe('mixed');
        expect(decision.reviewStatus).toBe('needs-technical-review');
        expect(decision.reviewReason.length).toBeGreaterThanOrEqual(30);
      } else {
        expect(decision.supportMode).toBe(caseApplied.has(decision.id) ? 'mixed' : 'direct');
        expect(decision.reviewStatus).toBe('mapped-draft');
        expect(decision.reviewReason).toBeNull();
      }
    }
  });

  it('identifica inequivocamente a minuta técnica usada como fonte', () => {
    expect(LAB_SOURCE_POLICY).toMatchObject({
      schemaVersion: 1,
      sourceVersion: '1.9, agosto de 2026',
      sourceSha256: 'ad33a4939ac5f73d5669fc4784c43319d1c1cae0193c7c3a0aa04bdfd669b353',
      institutionalStatus: 'technical-draft',
    });
  });
});
