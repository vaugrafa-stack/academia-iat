import { describe, expect, it } from "vitest";
import {
  ContractValidationError,
  assertStorageAdapter,
  validateContentManifest,
  validateEvidenceRecord,
  validateLessonPackage,
  validateLessonScript,
  validateMediaAsset,
} from "./contentContracts.js";

const reference = {
  id: "pop-23.1",
  classification: "pop",
  locator: "POP, item 23.1",
};

function lessonPackage() {
  return {
    schemaVersion: 1,
    id: "pop-section-001",
    moduleId: "m00",
    title: "Escopo",
    objective: "Distinguir o escopo e seus limites.",
    prerequisites: [],
    references: [reference],
    essentials: ["Objeto", "Fonte", "Limite"],
    boundaries: ["Não substituir a decisão institucional."],
    commonErrors: ["Usar fonte sem registrar a origem."],
    example: { prompt: "Caso sintético", answer: "Registro mínimo" },
    activeRecall: { prompt: "Explique sem consultar o material." },
    practice: { type: "short-answer" },
    transferPractice: { prompt: "Aplique o critério em um caso diferente." },
    assessment: { type: "classification" },
    termsPronunciations: [{ term: "PACUERA", pronunciation: "pa-cu-e-ra", meaning: "Plano Ambiental de Conservação e Uso do Entorno de Reservatório Artificial" }],
    relations: { cases: ["caso-escopo"], flows: ["fluxo-geral"], maps: [], tools: ["redator-it"] },
    reviewStatus: {
      editorial: "approved",
      technical: "pending",
      normative: "pending",
      reviewedAt: "2026-08-04T12:00:00.000Z",
    },
    scriptId: "script-001",
    mediaAssetIds: ["video-001"],
  };
}

function lessonScript() {
  return {
    schemaVersion: 1,
    id: "script-001",
    lessonId: "pop-section-001",
    locale: "pt-BR",
    voiceProfile: "masculina-pt-br",
    scenes: [{
      id: "scene-1",
      kind: "problem",
      narration: "Qual é o limite desta análise?",
      technicalClaim: true,
      sourceRefs: ["pop-23.1"],
      durationMs: 4_000,
    }],
  };
}

function mediaAsset() {
  return {
    schemaVersion: 1,
    id: "video-001",
    kind: "video",
    url: "/media/aula/pop-section-001.mp4",
    mimeType: "video/mp4",
    locale: "pt-BR",
    durationMs: 4_000,
    sha256: "a".repeat(64),
    license: "Uso interno autorizado",
    provenance: "Produzido para a Academia IAT a partir do pacote validado da aula.",
  };
}

describe("contratos editoriais e de mídia", () => {
  it("normaliza os seis contratos públicos da plataforma", () => {
    expect(validateLessonPackage(lessonPackage())).toMatchObject({ id: "pop-section-001", essentials: ["Objeto", "Fonte", "Limite"] });
    expect(validateLessonScript(lessonScript())).toMatchObject({ locale: "pt-BR", scenes: [{ technicalClaim: true }] });
    expect(validateMediaAsset(mediaAsset())).toMatchObject({ kind: "video", mimeType: "video/mp4" });
    expect(validateEvidenceRecord({ response: "Registro", criteria: [0, 1, 1], objectiveCorrect: true }, { lessonId: "pop-section-001" }))
      .toMatchObject({ lessonId: "pop-section-001", criteria: [0, 1] });
    expect(assertStorageAdapter({ getItem() {}, setItem() {}, removeItem() {}, subscribe() {} })).toBeTruthy();
  });

  it("impede fala técnica sem referência", () => {
    const script = lessonScript();
    script.scenes[0].sourceRefs = [];
    expect(() => validateLessonScript(script)).toThrowError(ContractValidationError);
    expect(() => validateLessonScript(script)).toThrow(/obrigatório em fala técnica/);
  });

  it("exige os componentes didáticos e as três revisões do pacote", () => {
    const lesson = lessonPackage();
    delete lesson.transferPractice;
    expect(() => validateLessonPackage(lesson)).toThrow(/transferPractice/);

    const pending = lessonPackage();
    pending.reviewStatus.normative = "estado-inventado";
    expect(() => validateLessonPackage(pending)).toThrow(/estado de revisão desconhecido/);
  });

  it("valida hash, proveniência e licença de mídia externa", () => {
    const invalidHash = mediaAsset();
    invalidHash.sha256 = "xyz";
    expect(() => validateMediaAsset(invalidHash)).toThrow(/64 caracteres hexadecimais/);

    const external = mediaAsset();
    external.url = "https://cdn.example.org/aula.mp4";
    external.sourceUrl = "";
    external.license = "";
    expect(() => validateMediaAsset(external)).toThrow(/licença explícita/);

    external.sourceUrl = "https://example.org/origem";
    external.license = "CC BY 4.0";
    expect(validateMediaAsset(external)).toMatchObject({ sourceUrl: "https://example.org/origem", license: "CC BY 4.0" });
  });

  it("rejeita evidência incompatível antes de chegar ao armazenamento", () => {
    expect(() => validateEvidenceRecord({ criteria: [0, -1] }, { lessonId: "aula" })).toThrow(/inteiros não negativos/);
    expect(() => validateEvidenceRecord({ objectiveSelected: "1" }, { lessonId: "aula" })).toThrow(/inteiro não negativo/);
  });

  it("valida integridade referencial do manifesto", () => {
    const manifest = {
      schemaVersion: 1,
      revision: 1,
      generatedAt: "2026-08-04T12:00:00.000Z",
      sourceId: "pop-v1.7",
      lessonPackages: [lessonPackage()],
      lessonScripts: [lessonScript()],
      mediaAssets: [mediaAsset()],
    };
    expect(validateContentManifest(manifest)).toMatchObject({ revision: 1, sourceId: "pop-v1.7" });
    manifest.mediaAssets = [];
    expect(() => validateContentManifest(manifest)).toThrow(/ativo inexistente/);
  });

  it("bloqueia identificadores repetidos no manifesto", () => {
    const manifest = {
      schemaVersion: 1,
      revision: 1,
      generatedAt: "2026-08-04T12:00:00.000Z",
      sourceId: "pop-v1.7",
      lessonPackages: [lessonPackage(), lessonPackage()],
      lessonScripts: [lessonScript()],
      mediaAssets: [mediaAsset()],
    };
    expect(() => validateContentManifest(manifest)).toThrow(/identificadores repetidos/);
  });

  it("bloqueia roteiro sem pacote e referência de cena inexistente", () => {
    const manifest = {
      schemaVersion: 1,
      revision: 1,
      generatedAt: "2026-08-04T12:00:00.000Z",
      sourceId: "pop-v1.7",
      lessonPackages: [lessonPackage()],
      lessonScripts: [lessonScript()],
      mediaAssets: [mediaAsset()],
    };
    manifest.lessonPackages[0].scriptId = "";
    manifest.lessonScripts[0].lessonId = "aula-inexistente";
    expect(() => validateContentManifest(manifest)).toThrow(/não existe entre os pacotes/);

    manifest.lessonScripts[0].lessonId = "pop-section-001";
    manifest.lessonScripts[0].scenes[0].sourceRefs = ["fonte-inexistente"];
    expect(() => validateContentManifest(manifest)).toThrow(/fonte inexistente/);
  });
});
