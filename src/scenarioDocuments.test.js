import { describe, expect, it } from 'vitest';
import { scenarios } from './courseData.js';
import {
  buildScenarioDocument,
  minimumEvidenceRequired,
} from './scenarioDocuments.js';

describe('pacotes documentais sintéticos', () => {
  it('marca toda peça como exemplo sem validade e distribui os fatos do caso', () => {
    for (const scenario of scenarios) {
      const documents = scenario.evidence.map((title, index) => (
        buildScenarioDocument(scenario, title, index)
      ));
      expect(documents).toHaveLength(scenario.evidence.length);
      expect(new Set(documents.map((document) => document.id)).size).toBe(documents.length);
      for (const [index, document] of documents.entries()) {
        expect(document.watermark).toContain('SEM VALIDADE');
        expect(document.title).toBe(scenario.evidence[index]);
        expect(document.fields.flat().join(' ')).toContain(
          scenario.facts[index % scenario.facts.length],
        );
        expect(document.limitations).toContain('não representam processo real');
      }
    }
  });

  it('exige ao menos duas peças quando o cenário oferece duas ou mais', () => {
    for (const scenario of scenarios) {
      expect(minimumEvidenceRequired(scenario)).toBe(
        Math.min(2, scenario.evidence.length),
      );
    }
  });
});
