// @vitest-environment jsdom
import React, { act } from "react";
import { readFileSync } from "node:fs";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LearningPaths, {
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

function mount({
  completed = [],
  openLesson = vi.fn(),
  onOpenFoundations,
} = {}) {
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
      onOpenFoundations={onOpenFoundations}
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
  it("cobre necessidades diferentes sem criar currículos paralelos", () => {
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
    expect(html).toContain("mesma formação de M00 a M16");
    expect(html).toContain("não são currículos alternativos");
    expect(html).toContain("não é certificação de competência profissional");
    expect(html).toContain("Novo em hidrelétricas?");
    expect(html).not.toContain("Como a água se transforma em eletricidade");
    expect(html).not.toContain("Caminho da água até a rede elétrica");
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

  it("abre os fundamentos fora da formação quando uma ação é fornecida", async () => {
    const onOpenFoundations = vi.fn();
    const { host } = mount({ onOpenFoundations });

    await act(async () => buttonByText(host, "Ver fundamentos").click());

    expect(onOpenFoundations).toHaveBeenCalledTimes(1);
    expect(host.querySelector(".foundation-primer")).toBeNull();
  });

  it("não deixa um controle sem destino quando a ação de fundamentos não é fornecida", () => {
    const { host } = mount();
    expect(buttonByText(host, "Ver fundamentos")).toBeUndefined();
  });

  it("mantém a primeira rota funcional sem inserir outra etapa antes do POP", async () => {
    const openLesson = vi.fn();
    const { host } = mount({ openLesson });

    await act(async () => buttonByText(host, "Começar rota").click());

    expect(openLesson).toHaveBeenCalledWith("m00-1");
  });

  it("mantém os controles principais com alvo mínimo de 44 px", () => {
    const css = readFileSync("src/LearningPaths.css", "utf8");
    expect(css).toMatch(/\.foundation-gateway-action,[\s\S]*?min-height:\s*44px/);
    expect(css).not.toContain(".foundation-primer");
  });
});
