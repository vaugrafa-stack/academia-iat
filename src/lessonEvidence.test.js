import { describe, expect, it } from "vitest";
import {
  MIN_ACTIVE_RECALL_CHARS,
  lessonEvidenceStatus,
  normalizeCriterionIds,
  normalizedResponseLength,
  selectLessonQuestion,
  selectLessonScenario,
} from "./lessonEvidence.js";

describe("lessonEvidence", () => {
  it("conta a resposta normalizada e não premia espaços repetidos", () => {
    expect(normalizedResponseLength("  fato   fundamento  ")).toBe(15);
    expect(normalizedResponseLength(" ".repeat(200))).toBe(0);
  });

  it("exige recuperação ativa, autoauditoria e acerto objetivo", () => {
    const response = "x".repeat(MIN_ACTIVE_RECALL_CHARS);
    expect(
      lessonEvidenceStatus({
        response,
        criteria: [0, 1],
        objectiveCorrect: true,
      }).ready,
    ).toBe(true);
    expect(
      lessonEvidenceStatus({
        response,
        criteria: [0, 1],
        objectiveCorrect: false,
      }).ready,
    ).toBe(false);
    expect(
      lessonEvidenceStatus({
        response: "curta",
        criteria: [0, 1, 2],
        objectiveCorrect: true,
      }).ready,
    ).toBe(false);
  });

  it("não confunde marcações duplicadas ou inválidas com autoauditoria", () => {
    expect(normalizeCriterionIds([1, 1, 99, -1, "0"], 3)).toEqual([1]);
  });

  it("prioriza questão da própria seção e declara fallback do módulo", () => {
    const bank = [
      { id: "m", track: "m01", source: { sec: "outra" } },
      { id: "s", track: "m01", source: { sec: "aula-1" } },
    ];
    expect(
      selectLessonQuestion(bank, { id: "aula-1", trackId: "m01" }, 0),
    ).toEqual({ question: bank[1], scope: "section" });
    expect(
      selectLessonQuestion(bank, { id: "sem-item", trackId: "m01" }, 0),
    ).toEqual({ question: bank[0], scope: "module" });
  });

  it("distribui casos e perguntas de forma determinística entre aulas", () => {
    const cases = [
      { id: "a", track: "m01", questions: [["1"], ["2"]] },
      { id: "b", track: "m01", questions: [["3"]] },
      { id: "c", track: "m02", questions: [["4"]] },
    ];
    expect(selectLessonScenario(cases, "m01", 1)).toEqual({
      scenario: cases[1],
      questionIndex: 0,
      scope: "module",
    });
    expect(selectLessonScenario(cases, "m01", 2)).toEqual({
      scenario: cases[0],
      questionIndex: 0,
      scope: "module",
    });
  });

  it("prioriza um caso e uma decisão fundamentados diretamente na aula", () => {
    const cases = [
      { id: "outro", track: "m15", questions: [["1"]] },
      {
        id: "uc-apa",
        track: "m15",
        questions: [["1"], ["2"], ["3"], ["4"], ["5"]],
      },
      { id: "escopo", track: "m00", questions: [["1"], ["2"], ["3"]] },
    ];

    expect(
      selectLessonScenario(cases, "m00", 0, "pop-section-138"),
    ).toEqual({
      scenario: cases[1],
      questionIndex: 0,
      scope: "section",
    });
    expect(
      selectLessonScenario(cases, "m15", 2, "pop-section-135"),
    ).toEqual({
      scenario: cases[1],
      questionIndex: 3,
      scope: "section",
    });
  });
});
