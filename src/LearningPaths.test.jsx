// @vitest-environment jsdom
import React, { act } from "react";
import { readFileSync } from "node:fs";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LearningPaths, {
  FOUNDATION_ACRONYMS,
  FOUNDATION_COMPONENTS,
  FOUNDATION_FLOW,
  FOUNDATION_TYPOLOGIES,
  LEARNING_PATHS,
  learningPathMetrics,
} from "./LearningPaths.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const tracks = [
  { id: "m00", code: "M00" },
  { id: "m01", code: "M01" },
  { id: "m02", code: "M02" },
  { id: "m03", code: "M03" },
  { id: "m04", code: "M04" },
  { id: "m05", code: "M05" },
  { id: "m06", code: "M06" },
  { id: "m07", code: "M07" },
  { id: "m08", code: "M08" },
  { id: "m09", code: "M09" },
  { id: "m10", code: "M10" },
  { id: "m11", code: "M11" },
  { id: "m12", code: "M14" },
  { id: "m13", code: "M15" },
  { id: "m14", code: "M16" },
  { id: "m15", code: "M12" },
];
const trackLessons = new Map(tracks.map((track) => [track.id, [
  { id: `${track.id}-1`, minutes: 10 },
  { id: `${track.id}-2`, minutes: 15 },
]]));

const roots = [];

function mount({ completed = [], openLesson = vi.fn() } = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  act(() => root.render(
    <LearningPaths
      tracks={tracks}
      trackLessons={trackLessons}
      state={{ completed }}
      openLesson={openLesson}
    />,
  ));
  return { host, openLesson };
}

function buttonByText(host, text) {
  return [...host.querySelectorAll("button")]
    .find((button) => button.textContent.includes(text));
}

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("rotas de entrada da formação", () => {
  it("cobre necessidades diferentes sem fingir que substitui o percurso", () => {
    expect(LEARNING_PATHS).toHaveLength(4);
    const html = renderToStaticMarkup(
      <LearningPaths
        tracks={tracks}
        trackLessons={trackLessons}
        state={{ completed: [] }}
        openLesson={() => {}}
      />,
    );
    expect(html).toContain("Primeira semana");
    expect(html).toContain("Analisar um processo");
    expect(html).toContain("não dispensam os módulos críticos");
    expect(html).toContain("não é certificação de competência profissional");
    expect(html).toContain("Nunca estudou uma hidrelétrica?");
    expect(html).toContain("Já domino estes fundamentos");
  });

  it("abre a primeira aula ainda não registrada e calcula tempo e progresso", () => {
    const metrics = learningPathMetrics(
      LEARNING_PATHS[0],
      trackLessons,
      ["m00-1"],
    );
    expect(metrics.done).toBe(1);
    expect(metrics.minutes).toBe(100);
    expect(metrics.next?.id).toBe("m00-2");
    expect(metrics.percent).toBe(13);
  });

  it("cobre a cadeia física, os componentes, as tipologias e as siglas antes do POP", () => {
    expect(FOUNDATION_FLOW.map((step) => step.title)).toEqual([
      "Água disponível",
      "Vazão e queda",
      "Turbina",
      "Gerador",
      "Transformação e rede",
    ]);
    expect(FOUNDATION_COMPONENTS.map(([term]) => term)).toEqual(
      expect.arrayContaining(["Barragem", "Tomada d'água", "Casa de força", "Canal de fuga"]),
    );
    expect(FOUNDATION_TYPOLOGIES.map(([term]) => term)).toEqual(
      expect.arrayContaining(["Fio d'água", "Acumulação", "Derivação", "Reversível"]),
    );
    expect(FOUNDATION_ACRONYMS.flat().join(" ")).toContain("CGH, MGH, PCH e UHE");
  });

  it("faz o iniciante passar pelos fundamentos antes de continuar ao POP", async () => {
    const { host, openLesson } = mount();
    const start = buttonByText(host, "Começar pelos fundamentos");

    expect(start.getAttribute("aria-expanded")).toBe("false");
    expect(host.querySelector("#foundation-primer")).toBeNull();

    await act(async () => start.click());

    const primer = host.querySelector("#foundation-primer");
    expect(start.getAttribute("aria-expanded")).toBe("true");
    expect(primer?.textContent).toContain("Como a água se transforma em eletricidade");
    expect(primer?.textContent).toContain("não substitui cálculo de engenharia");
    expect(primer?.textContent).toContain("Não define enquadramento, exigência, competência ou validação normativa");
    expect(document.activeElement?.id).toBe("foundation-primer-title");
    expect(openLesson).not.toHaveBeenCalled();

    await act(async () => buttonByText(host, "Continuar para o curso POP").click());
    expect(openLesson).toHaveBeenCalledWith("m00-1");
  });

  it("preserva a entrada direta ao POP para quem já domina a base", async () => {
    const openLesson = vi.fn();
    const { host } = mount({ completed: ["m00-1"], openLesson });

    await act(async () => buttonByText(host, "Já domino estes fundamentos").click());

    expect(openLesson).toHaveBeenCalledWith("m00-2");
    expect(host.querySelector("#foundation-primer")).toBeNull();
  });

  it("mantém os controles principais com alvo mínimo de 44 px", () => {
    const css = readFileSync("src/LearningPaths.css", "utf8");
    expect(css).toMatch(/\.foundation-gateway-actions button,[\s\S]*?min-height:\s*44px/);
    expect(css).toContain(".foundation-primer footer button");
  });
});
