import { describe, expect, it } from "vitest";
import scripts from "./data/audiovisual-pilot-scripts.json";
import pop from "./data/pop-public-content.json";
import {
  EXPECTED_PILOT_LESSON_IDS,
  pilotAssetForLesson,
  resolveAudiovisualPilot,
  validateLessonScriptCollection,
  validateMediaAssetCollection,
} from "./audiovisualPilot.js";

describe("piloto audiovisual", () => {
  it("seleciona exatamente os seis tópicos aprovados e rastreia toda fala", () => {
    expect(scripts.pilots.map((pilot) => pilot.lessonId).sort()).toEqual(
      [...EXPECTED_PILOT_LESSON_IDS].sort(),
    );
    expect(validateLessonScriptCollection(scripts, pop)).toEqual([]);
    for (const pilot of scripts.pilots) {
      for (const scene of pilot.scenes) {
        expect(scene.citations.length).toBeGreaterThan(0);
      }
    }
  });

  it("rejeita item que não pertença à seção citada", () => {
    const altered = structuredClone(scripts);
    altered.pilots[0].sourceRefs[0].tableIds = ["pop-table-040"];
    expect(validateLessonScriptCollection(altered, pop)).toContain(
      "pilot-pop-section-059/pop-18.2: pop-section-059 não contém pop-table-040",
    );
  });

  it("mantém a mídia atual enquanto não houver piloto para a aula", () => {
    const current = { src: "/media/aula/pop-section-001.mp4" };
    expect(resolveAudiovisualPilot({ id: "pop-section-001" }, current, "/academia-iat/")).toBe(current);
    expect(pilotAssetForLesson("pop-section-001")).toBeNull();
  });

  it("valida o manifesto vazio antes da geração sem fingir ativos", () => {
    expect(validateMediaAssetCollection()).toEqual([]);
  });

  it("resolve caminhos publicados, visemas e janelas do professor", () => {
    const collection = {
      kind: "MediaAssetCollection",
      items: [{
        id: "pilot-pop-section-059",
        lessonId: "pop-section-059",
        title: "18.2 Distinção entre documentos",
        assets: {
          video: { path: "/media/piloto/pop-section-059.mp4" },
          poster: { path: "/media/piloto/pop-section-059.jpg" },
          captions: { path: "/media/piloto/pop-section-059.vtt" },
          transcript: { path: "/media/piloto/pop-section-059.txt" },
          visemes: { path: "/media/piloto/pop-section-059.visemes.json" },
        },
        presenterWindows: [[0, 20], [80, 100]],
        durationSeconds: 120,
      }],
    };
    const resolved = resolveAudiovisualPilot(
      { id: "pop-section-059" },
      { src: "/media/aula/pop-section-059.mp4" },
      "/academia-iat/",
      collection,
    );
    expect(resolved.src).toBe("/academia-iat/media/piloto/pop-section-059.mp4");
    expect(resolved.visemes).toBe("/academia-iat/media/piloto/pop-section-059.visemes.json");
    expect(resolved.classification).toBe("microaula-piloto");
  });
});
