import { describe, expect, it } from "vitest";
import { createDefaultProgressState } from "./storedState.js";
import { hasStartedJourney } from "./learningJourney.js";

describe("estado inicial da jornada", () => {
  it("não apresenta um primeiro acesso como retomada", () => {
    expect(hasStartedJourney(createDefaultProgressState())).toBe(false);
  });

  it.each([
    ["aula aberta", { lastLesson: "pop-section-001" }],
    ["aula concluída", { completed: ["pop-section-001"] }],
    ["anotação", { notes: { "pop-section-001": "Minha síntese" } }],
    ["avaliação", { quizScores: { m00: { score: 1, total: 1 } } }],
    ["prática", { labs: { caso: { status: "em_andamento" } } }],
  ])("reconhece atividade real: %s", (_label, patch) => {
    expect(hasStartedJourney({ ...createDefaultProgressState(), ...patch })).toBe(true);
  });
});
