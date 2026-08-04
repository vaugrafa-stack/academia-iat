import { describe, expect, it } from 'vitest';
import answerReasons from './data/lab-answer-reasons.json';
import { GRUPOS_LAB, scenarios } from './scenarios.js';
import { nivelDoCaso } from './niveisLab.js';
import {
  buildCaseAnswerSheet,
  CASE_ANSWER_SHEET_TITLE,
  serializeCaseAnswerSheet,
} from './caseAnswerSheets.js';

function buildSheet(caseData, groups = GRUPOS_LAB) {
  return buildCaseAnswerSheet(caseData, groups, { answerReasons });
}

describe('folhas-resposta dos casos práticos', () => {
  it('cobre os 26 casos sem duplicação e com a estrutura mínima completa', () => {
    expect(scenarios).toHaveLength(26);
    expect(new Set(scenarios.map((scenario) => scenario.id)).size).toBe(26);

    for (const scenario of scenarios) {
      const sheet = buildSheet(scenario);
      expect(sheet.title).toBe(CASE_ANSWER_SHEET_TITLE);
      expect(sheet.facts).toHaveLength(4);
      expect(sheet.evidence).toHaveLength(4);
      expect(sheet.decisions).toHaveLength(5);
      expect(sheet.minimumElements).toHaveLength(scenario.openTask?.criteria.length || 4);
      expect(sheet.complexity.id).toBe(nivelDoCaso(scenario).id);
      expect(sheet.group).not.toHaveProperty('level');
      expect(sheet.expectedOutcome.length).toBeGreaterThan(40);
      expect(sheet.commentedModel.length).toBeGreaterThan(80);
      expect(sheet.glossary.length).toBeGreaterThan(0);
      expect(sheet.gaps.length).toBeGreaterThanOrEqual(3);
      expect(sheet.source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(sheet.source.title).toBe('POP de Licenciamento Ambiental de Empreendimentos Hidrelétricos');
      expect(sheet.source.institutionalStatusLabel).toBe('Minuta técnica');
    }
  });

  it('expõe classificações, ausências e tarefas abertas sem substituir as decisões binárias', () => {
    const classificationIds = ['escopo', 'las', 'cp-antiga', 'triagem', 'intervenientes'];
    const openIds = ['condicionantes', 'revisao', 'integrador', 'delegado'];
    const missingIds = ['rlo-vencida', 'barragem', 'integrador'];

    for (const id of classificationIds) {
      const scenario = scenarios.find((candidate) => candidate.id === id);
      const sheet = buildSheet(scenario);
      expect(sheet.evidenceTask?.prompt).toBe(scenario.evidenceTask.prompt);
      expect(sheet.evidence.filter((item) => item.classification)).toHaveLength(4);
      for (const evidence of sheet.evidence) {
        expect(evidence.classification.expectedUse).toBeTruthy();
        expect(evidence.classification.rationale.length).toBeGreaterThan(30);
        expect(evidence.classification.sources.length).toBeGreaterThan(0);
      }
      expect(sheet.decisions).toHaveLength(5);
    }

    for (const id of openIds) {
      const scenario = scenarios.find((candidate) => candidate.id === id);
      const sheet = buildSheet(scenario);
      expect(sheet.openTask?.prompt).toBe(scenario.openTask.prompt);
      expect(sheet.openTask.criteria).toHaveLength(5);
      expect(sheet.minimumElements).toHaveLength(5);
      expect(sheet.openTask.criteria.every((criterion) => criterion.sources.length > 0)).toBe(true);
      expect(sheet.decisions).toHaveLength(5);
    }

    for (const id of missingIds) {
      const scenario = scenarios.find((candidate) => candidate.id === id);
      const sheet = buildSheet(scenario);
      expect(sheet.missingEvidence.map(({ text }) => text)).toEqual(scenario.ausentes);
      expect(sheet.gaps[0].id).toBe('ausentes');
    }
  });

  it('deriva cada decisão da resposta, das evidências e das fontes já mapeadas', () => {
    for (const scenario of scenarios) {
      const sheet = buildSheet(scenario);

      sheet.decisions.forEach((decision, index) => {
        expect(decision.prompt).toBe(scenario.questions[index][0]);
        expect(decision.expectedKey).toBe(scenario.questions[index][1]);
        expect(['Sim', 'Não']).toContain(decision.expectedAnswer);
        expect(decision.justification.length).toBeGreaterThan(20);
        expect(decision.sources.length).toBeGreaterThan(0);
        expect(decision.answerReason).toBe(answerReasons[scenario.id][index]);
        expect(decision.justification).toBe(decision.answerReason);
        expect(decision.justification).not.toBe(decision.supportCaveat);
        expect(decision.sources.some((source) => (
          source.quote === decision.justification
        ))).toBe(false);
        for (const evidence of decision.evidence) {
          expect(scenario.evidence).toContain(evidence.text);
        }
      });
    }
  });

  it('mantém dados cadastrais ausentes como lacuna explícita, sem criar valores', () => {
    const sheet = buildSheet(
      scenarios.find((scenario) => scenario.id === 'lp'),
    );
    const gapText = sheet.gaps.map((gap) => gap.text).join(' ');

    expect(gapText).toContain('a confirmar');
    expect(gapText).toContain('não deduza nem crie valores');
    expect(sheet).not.toHaveProperty('entrepreneur');
    expect(sheet).not.toHaveProperty('municipality');
    expect(sheet).not.toHaveProperty('protocol');
  });

  it('exporta uma folha legível com decisões, mínimo, lacunas e rastreabilidade', () => {
    const sheet = buildSheet(
      scenarios.find((scenario) => scenario.id === 'condicionantes'),
    );
    const text = serializeCaseAnswerSheet(sheet);

    expect(text).toContain('FOLHA-RESPOSTA — CONTEÚDO MÍNIMO ESPERADO');
    expect(text).toContain('3. DECISÕES ESPERADAS');
    expect(text).toContain('3.1 TAREFA ABERTA DE FUNDAMENTAÇÃO');
    expect(text).toContain('Critérios e fontes:');
    expect(text).toContain('4. CONTEÚDO MÍNIMO DA FUNDAMENTAÇÃO');
    expect(text).toContain('7. LACUNAS E DADOS A CONFIRMAR');
    expect(text).toContain('GLOSSÁRIO DO CASO');
    expect(text).toContain('Fontes de apoio e trechos literais:');
    expect(text).toContain('Tipo de apoio:');
    expect(text).toContain('Natureza da fonte: Minuta técnica');
    expect(text).toContain('Arquivo de origem:');
    expect(text).toContain('SHA-256:');
    expect(text).not.toMatch(/intelig[eê]ncia artificial|\bIA\b/i);
  });

  it('inclui no arquivo de consulta as fontes de cada classificação de evidência', () => {
    const sheet = buildSheet(
      scenarios.find((scenario) => scenario.id === 'triagem'),
    );
    const text = serializeCaseAnswerSheet(sheet);

    expect(text).toContain('Uso esperado:');
    expect(text).toContain('Fonte:');
    expect(text).toContain(
      'Estudo antigo pode ser aproveitado apenas se compatível com o projeto atual',
    );
  });

  it('explica os cálculos e as decisões críticas com os dados do próprio caso', () => {
    const expectedReasons = {
      'lab-prog-semestral-q1': ['71 + 68 + 76 = 215', '47 registros'],
      'lab-prog-residuos-q3': ['16 + 19 = 35', 'não 46'],
      'lab-prog-app-q1': ['2,27 ha', '0,35 ha'],
      'lab-pacuera-q2': ['Unidades Territoriais Homogêneas', 'diretrizes de uso'],
      'lab-integrador-q3': ['Plano de Manejo', 'não pode ser adiada'],
      'lab-lo-q2': ['evidência suficiente', 'status declarado'],
    };

    const decisions = new Map(
      scenarios.flatMap((scenario) => (
        buildSheet(scenario).decisions
      )).map((decision) => [decision.id, decision]),
    );

    for (const [id, snippets] of Object.entries(expectedReasons)) {
      for (const snippet of snippets) {
        expect(decisions.get(id)?.justification, id).toContain(snippet);
      }
    }
  });

  it('mantém a ressalva separada da resposta e não força evidência do caso em regra pura', () => {
    const cp = buildSheet(
      scenarios.find((scenario) => scenario.id === 'cp'),
    );
    const priority = cp.decisions[2];

    expect(priority.justification).toMatch(/^Não\./);
    expect(priority.supportCaveat).toContain('regime vigente');
    expect(priority.justification).not.toBe(priority.supportCaveat);
    expect(priority.evidence).toEqual([]);
  });
});
