import { describe, expect, it } from 'vitest';
import answerReasons from './data/lab-answer-reasons.json';
import { GRUPOS_LAB, scenarios } from './scenarios.js';
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

    const sheets = scenarios.map((scenario) => (
      buildSheet(scenario)
    ));

    for (const sheet of sheets) {
      expect(sheet.title).toBe(CASE_ANSWER_SHEET_TITLE);
      expect(sheet.facts).toHaveLength(4);
      expect(sheet.evidence).toHaveLength(4);
      expect(sheet.decisions).toHaveLength(5);
      expect(sheet.minimumElements).toHaveLength(4);
      expect(sheet.expectedOutcome.length).toBeGreaterThan(40);
      expect(sheet.commentedModel.length).toBeGreaterThan(80);
      expect(sheet.glossary.length).toBeGreaterThan(0);
      expect(sheet.gaps.length).toBeGreaterThanOrEqual(3);
      expect(sheet.source.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(sheet.source.title).toBe('POP de Licenciamento Ambiental de Empreendimentos Hidrelétricos');
      expect(sheet.source.institutionalStatusLabel).toBe('Minuta técnica');
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
