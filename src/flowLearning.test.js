import { describe, expect, it } from 'vitest';
import { flowSpecs } from './courseData.js';

describe('aprendizagem nos fluxos propostos', () => {
  it('dá evidência, risco e fonte específicos a cada etapa', () => {
    expect(flowSpecs).toHaveLength(7);
    for (const flow of flowSpecs) {
      expect(flow.guidance, flow.id).toHaveLength(flow.nodes.length);
      flow.guidance.forEach((step, index) => {
        expect(step.question, `${flow.id} etapa ${index + 1}`).toBeTruthy();
        expect(step.evidence, `${flow.id} etapa ${index + 1}`).toBeTruthy();
        expect(step.risk, `${flow.id} etapa ${index + 1}`).toBeTruthy();
        expect(step.source, `${flow.id} etapa ${index + 1}`).toMatch(/POP/);
      });
    }
  });

  it('inclui uma decisão ramificada com feedback em cada fluxo', () => {
    for (const flow of flowSpecs) {
      const decision = flow.decision;
      expect(decision.options.length, flow.id).toBeGreaterThanOrEqual(3);
      expect(decision.answer, flow.id).toBeGreaterThanOrEqual(0);
      expect(decision.answer, flow.id).toBeLessThan(decision.options.length);
      expect(decision.feedback, flow.id).toBeTruthy();
      expect(decision.source, flow.id).toMatch(/POP/);
    }
  });
});
