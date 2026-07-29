// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import VideoLearningStage, {
  computeNarrationLevel,
  fallbackNarrationLevel,
  learningStageTheme,
  mouthFrameForLevel,
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
      "Exibir professor no palco da videoaula",
    );

    await act(async () => toggle.click());
    expect(toggle.textContent).toContain("Mostrar professor");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(localStorage.getItem("academia-iat-video-professor")).toBe("hidden");
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
