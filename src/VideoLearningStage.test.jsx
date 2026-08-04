// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import VideoLearningStage, {
  computeNarrationLevel,
  fallbackNarrationLevel,
  learningStageTheme,
  mouthFrameForLevel,
  mouthVisibilityForLevel,
  naturalVisemeAtTime,
  naturalVisemePoseAtTime,
  presenterActiveAtTime,
  visemeAtTime,
} from "./VideoLearningStage.jsx";

let root;

afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("lógica do palco das videoaulas", () => {
  it("mede energia do áudio e converte intensidade em quatro quadros de boca", () => {
    expect(computeNarrationLevel(new Uint8Array([128, 128, 128]))).toBe(0);
    expect(computeNarrationLevel(new Uint8Array([20, 235, 20, 235]))).toBeGreaterThan(0.9);
    expect(mouthFrameForLevel(0)).toBe(0);
    expect(mouthFrameForLevel(0.2)).toBe(1);
    expect(mouthFrameForLevel(0.5)).toBe(2);
    expect(mouthFrameForLevel(0.9)).toBe(3);
  });

  it("mantém o fallback determinístico e dentro do intervalo permitido", () => {
    const samples = [0, 0.1, 1.7, 12.4].map(fallbackNarrationLevel);
    expect(samples.every((value) => value >= 0 && value <= 1)).toBe(true);
    expect(fallbackNarrationLevel(1.7)).toBe(fallbackNarrationLevel(1.7));
  });

  it("seleciona visemas e janelas editoriais pelo relógio do vídeo", () => {
    const entries = [
      { start: 0, end: 0.2, viseme: 1 },
      { start: 0.2, end: 0.6, viseme: 4 },
    ];
    expect(visemeAtTime(entries, 0.1)).toBe(1);
    expect(visemeAtTime(entries, 0.4)).toBe(4);
    expect(visemeAtTime(entries, 0.8)).toBe(0);
    expect(presenterActiveAtTime([[0, 0.3], [0.7, 1]], 0.2)).toBe(true);
    expect(presenterActiveAtTime([[0, 0.3], [0.7, 1]], 0.5)).toBe(false);
    expect(presenterActiveAtTime(undefined, 0.5)).toBe(true);
  });

  it("reduz a cadência visual, preserva pausas reais e evita formas exageradas", () => {
    const entries = [
      { start: 0, end: 0.083, viseme: 3, phonemes: "a" },
      { start: 0.083, end: 0.166, viseme: 0, phonemes: " " },
      { start: 0.166, end: 0.25, viseme: 8, phonemes: "ʃ" },
      { start: 0.25, end: 0.5, viseme: 0, phonemes: "." },
    ];

    expect(naturalVisemeAtTime(entries, 0.1)).toBe(3);
    expect(naturalVisemeAtTime(entries, 0.19)).toBe(10);
    expect(naturalVisemeAtTime(entries, 0.3)).toBe(0);

    const rapid = Array.from({ length: 30 }, (_, index) => ({
      start: index * 0.02,
      end: (index + 1) * 0.02,
      viseme: index % 2 ? 3 : 4,
      phonemes: index % 2 ? "a" : "o",
    }));
    const poses = Array.from({ length: 51 }, (_, index) =>
      naturalVisemePoseAtTime(rapid, index / 100).current);
    const changes = poses.reduce(
      (total, viseme, index) => total + (index > 0 && viseme !== poses[index - 1] ? 1 : 0),
      0,
    );
    expect(changes).toBeLessThanOrEqual(6);
  });

  it("mistura quadros por uma janela curta e usa o volume sem deslocar a cabeça", () => {
    const entries = [
      { start: 0, end: 0.083, viseme: 1, phonemes: "m" },
      { start: 0.083, end: 0.3, viseme: 4, phonemes: "o" },
    ];
    const beginning = naturalVisemePoseAtTime(entries, 0.084);
    const settled = naturalVisemePoseAtTime(entries, 0.16);
    expect(beginning).toMatchObject({ previous: 1, current: 4 });
    expect(beginning.blend).toBeLessThan(0.1);
    expect(settled.blend).toBe(1);
    expect(mouthVisibilityForLevel(0)).toBe(0);
    expect(mouthVisibilityForLevel(0.5)).toBeGreaterThan(0.8);
    expect(mouthVisibilityForLevel(1)).toBeLessThanOrEqual(0.92);
  });

  it("seleciona contexto visual pelo módulo e permite ajuste pelo tema da aula", () => {
    expect(learningStageTheme({ id: "m05" }, { title: "Licença Prévia" })).toBe("dam");
    expect(learningStageTheme({ id: "m13" }, { title: "Cartografia da ADA" })).toBe("map");
    expect(learningStageTheme({ id: "m00" }, { title: "Controle documental" })).toBe("office");
  });
});

describe("controles do palco das videoaulas", () => {
  it("preserva vídeo, legenda e uma preferência acessível para o professor", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <VideoLearningStage
          media={{
            src: "/media/aula/teste.mp4",
            poster: "/media/aula/teste.jpg",
            captions: "/media/aula/teste.vtt",
            title: "Aula de teste",
          }}
          track={{ id: "m09" }}
          lesson={{ title: "Zoneamento do PACUERA" }}
        />,
      );
    });

    expect(host.querySelector("video")?.getAttribute("src")).toBe(
      "/media/aula/teste.mp4",
    );
    expect(host.querySelector("video")?.getAttribute("aria-label")).toBe(
      "Videoaula: Aula de teste",
    );
    expect(host.querySelector("track")?.getAttribute("srclang")).toBe("pt-BR");
    expect(host.querySelector("track")?.default).toBe(false);
    expect(
      host.querySelector("[data-learning-stage-theme]")?.getAttribute(
        "data-learning-stage-theme",
      ),
    ).toBe("map");

    await act(async () => {
      root.render(
        <VideoLearningStage
          media={{
            src: "/media/aula/outra-aula.mp4",
            poster: "/media/aula/outra-aula.jpg",
            captions: "/media/aula/outra-aula.vtt",
            title: "Outra aula",
          }}
          track={{ id: "m09" }}
          lesson={{ title: "Zoneamento do PACUERA" }}
        />,
      );
    });
    expect(host.querySelector("video")?.getAttribute("src")).toBe(
      "/media/aula/outra-aula.mp4",
    );

    const toggle = [...host.querySelectorAll("button")].find((button) =>
      button.textContent.includes("Ocultar professor"),
    );
    expect(toggle?.getAttribute("aria-pressed")).toBe("true");
    expect(toggle?.getAttribute("aria-label")).toBe(
      "Ocultar professor do palco da videoaula",
    );

    await act(async () => toggle.click());
    expect(toggle.textContent).toContain("Mostrar professor");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("academia-iat-video-professor")).toBe("hidden");
  });

  it("carrega a linha do tempo e mantém a boca em repouso enquanto o vídeo está pausado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          { start: 0, end: 0.2, viseme: 1 },
          { start: 0.2, end: 0.8, viseme: 5 },
        ],
      }),
    }));
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    await act(async () => {
      root.render(
        <VideoLearningStage
          media={{
            src: "/media/piloto/teste.mp4",
            visemes: "/media/piloto/teste.visemes.json",
            presenterWindows: [[0, 0.8]],
            title: "Piloto",
          }}
          track={{ id: "m00" }}
          lesson={{ title: "Piloto" }}
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });
    const video = host.querySelector("video");
    Object.defineProperty(video, "currentTime", { value: 0.4, configurable: true });
    await act(async () => video.dispatchEvent(new Event("timeupdate")));
    expect(fetch).toHaveBeenCalledWith(
      "/media/piloto/teste.visemes.json",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(host.querySelector(".vls-professor")?.getAttribute("data-viseme")).toBe("0");
    expect(host.querySelectorAll(".vls-professor-mouth")).toHaveLength(2);
    expect(host.querySelector(".vls-professor-mouth-current")?.style.getPropertyValue("--vls-mouth-opacity")).toBe("0.000");
    expect(host.querySelector(".vls-stage")?.classList.contains("vls-presenter-active")).toBe(true);
  });

  it("mantém os lábios em repouso quando a pessoa prefere movimento reduzido", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);

    await act(async () => {
      root.render(
        <VideoLearningStage
          media={{ src: "/media/piloto/reduzido.mp4", title: "Piloto" }}
          track={{ id: "m00" }}
          lesson={{ title: "Piloto" }}
        />,
      );
    });
    await act(async () => host.querySelector("video").dispatchEvent(new Event("play")));

    expect(host.querySelector(".vls-stage")?.classList.contains("vls-reduced-motion")).toBe(true);
    expect(host.querySelector(".vls-professor")?.getAttribute("data-viseme")).toBe("0");
    expect(host.querySelector(".vls-professor")?.getAttribute("data-mouth-active")).toBe("false");
    expect(host.querySelector(".vls-professor-mouth-current")?.style.getPropertyValue("--vls-mouth-opacity")).toBe("0.000");
  });

  it("fecha o contexto de áudio se a desmontagem ocorrer durante a ativação", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    root = createRoot(host);
    let resolveResume;
    const close = vi.fn();
    const createMediaElementSource = vi.fn(() => ({ connect: vi.fn() }));
    const createAnalyser = vi.fn(() => ({
      connect: vi.fn(),
      fftSize: 0,
      smoothingTimeConstant: 0,
      getByteTimeDomainData: vi.fn(),
    }));

    class DeferredAudioContext {
      constructor() {
        this.state = "running";
        this.destination = {};
        this.close = close;
        this.createMediaElementSource = createMediaElementSource;
        this.createAnalyser = createAnalyser;
      }

      resume() {
        return new Promise((resolve) => {
          resolveResume = resolve;
        });
      }
    }
    vi.stubGlobal("AudioContext", DeferredAudioContext);

    await act(async () => {
      root.render(
        <VideoLearningStage
          media={{
            src: "/media/aula/race.mp4",
            captions: "/media/aula/race.vtt",
            title: "Aula em desmontagem",
          }}
          track={{ id: "m00" }}
          lesson={{ title: "Controle documental" }}
        />,
      );
    });

    await act(async () => {
      host.querySelector("video").dispatchEvent(new Event("play"));
      await Promise.resolve();
    });
    expect(resolveResume).toBeTypeOf("function");

    await act(async () => {
      root.unmount();
      root = null;
    });
    await act(async () => {
      resolveResume();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(createMediaElementSource).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });
});
