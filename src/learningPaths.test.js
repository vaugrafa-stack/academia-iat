import { describe, expect, it } from "vitest";
import {
  LEARNING_PATHS,
  learningPathStats,
  resolveLearningPath,
} from "./learningPaths.js";

describe("learningPaths", () => {
  it("mantém quatro percursos distintos e usa Analista como fallback seguro", () => {
    expect(LEARNING_PATHS.map((path) => path.id)).toEqual([
      "essencial",
      "analista",
      "pacuera",
      "revisor",
    ]);
    expect(resolveLearningPath("desconhecida").id).toBe("analista");
    expect(resolveLearningPath("pacuera").trackIds).toContain("m09");
  });

  it("calcula progresso apenas sobre os módulos recomendados", () => {
    const map = new Map([
      ["m00", [{ id: "a" }, { id: "b" }]],
      ["m01", [{ id: "c" }]],
      ["m06", [{ id: "fora" }]],
    ]);
    expect(learningPathStats("essencial", map, ["a", "c", "fora"])).toMatchObject(
      {
        lessons: 3,
        completed: 2,
        percent: 67,
      },
    );
  });

  it("mede uma trilha cadastrada sem contar aulas externas", () => {
    const map = new Map([
      ["m00", [{ id: "a" }, { id: "b" }]],
      ["m01", [{ id: "c" }]],
      ["m03", []],
      ["m08", []],
      ["m09", []],
      ["m10", []],
      ["m15", []],
      ["m12", []],
      ["m13", []],
      ["m14", [{ id: "fora" }]],
    ]);
    expect(learningPathStats("pacuera", map, ["a", "fora"])).toMatchObject({
      lessons: 3,
      completed: 1,
      percent: 33,
    });
  });
});
