import { describe, expect, it } from "vitest";
import {
  getLearningDesign,
  learningDesignFingerprint,
} from "./learningDesign.js";

describe("learningDesign", () => {
  it("gera percurso específico para temas de risco diferentes", () => {
    const norma = getLearningDesign({
      number: "3",
      title: "Referências normativas e transição",
    });
    const mapa = getLearningDesign({
      number: "19.1",
      title: "Cartografia e arquivos KMZ",
    });
    const pacuera = getLearningDesign({
      number: "18.10",
      title: "PACUERA e UTHs",
    });

    expect(norma.profileId).toBe("norma");
    expect(mapa.profileId).toBe("cartografia");
    expect(pacuera.profileId).toBe("pacuera");
    expect(new Set([norma.objective, mapa.objective, pacuera.objective]).size).toBe(
      3,
    );
    expect(learningDesignFingerprint(norma)).not.toBe(
      learningDesignFingerprint(mapa),
    );
  });

  it("explicita tarefa observável nos três níveis", () => {
    const design = getLearningDesign({
      number: "25",
      title: "Diligências, condicionantes e pendências",
    });
    expect(design.levels.map((level) => level.label)).toEqual([
      "Reconhecer",
      "Aplicar",
      "Auditar",
    ]);
    expect(design.mastery).toHaveLength(3);
    expect(design.challenge).toContain("fato");
    expect(design.challenge).toContain("evidência");
    expect(design.challenge).toContain("fundamento");
    expect(design.challenge).toContain("encaminhamento");
  });
});
