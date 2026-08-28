// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import KnowledgeLibrary from "./biblioteca.jsx";

const roots = [];
const matchMedia = vi.fn();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const DADOS = {
  popData: {
    figures: [],
    sections: [],
    stats: { allDocumentParagraphNodes: 12 },
    tables: [
      {
        id: "quadro-1",
        labelNumber: "1",
        labelType: "Quadro",
        rows: [],
        title: "Quadro de teste",
      },
      {
        columnCount: 2,
        id: "glossario",
        labelNumber: "E",
        labelType: "Anexo",
        rowCount: 3,
        rows: [
          {
            isHeader: true,
            cells: [{ text: "Sigla" }, { text: "Significado" }],
          },
          {
            cells: [{ text: "PACUERA" }, { text: "Plano ambiental" }],
          },
          {
            cells: [{ text: "ADA" }, { text: "Área diretamente afetada" }],
          },
        ],
        title: "Siglas e abreviações",
      },
    ],
  },
  flowData: { flowcharts: [] },
  blockMap: new Map(),
  tableMap: new Map(),
  lessons: [],
  lessonMap: new Map(),
  INDICE: {
    get: () => [
      {
        id: "aula-1",
        text: "Orientação sobre PACUERA.",
        title: "PACUERA",
        type: "seção",
      },
    ],
  },
};

function mount() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const openLesson = vi.fn();
  roots.push(root);
  act(() =>
    root.render(
      <KnowledgeLibrary
        dados={DADOS}
        openLesson={openLesson}
        state={{ bookmarks: [], notes: {} }}
      />,
    ),
  );
  return { host, openLesson };
}

function mediaQuery(initialMatches) {
  let matches = initialMatches;
  const listeners = new Set();
  return {
    addEventListener: vi.fn((event, listener) => {
      if (event === "change") listeners.add(listener);
    }),
    get matches() {
      return matches;
    },
    removeEventListener: vi.fn((event, listener) => {
      if (event === "change") listeners.delete(listener);
    }),
    setMatches(nextMatches) {
      matches = nextMatches;
      listeners.forEach((listener) => listener({ matches }));
    },
  };
}

function typeInto(input, value) {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  ).set;
  act(() => {
    setValue.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  matchMedia.mockReset();
});

describe("biblioteca operacional em telas estreitas", () => {
  it("troca as sete abas por um seletor rotulado no celular", () => {
    const query = mediaQuery(true);
    matchMedia.mockReturnValue(query);
    vi.stubGlobal("matchMedia", matchMedia);
    const { host } = mount();

    const select = host.querySelector("#library-area-select");
    expect(select?.labels?.[0]?.textContent).toBe("Área da biblioteca");
    expect(select?.options).toHaveLength(7);
    expect(select?.getAttribute("aria-controls")).toBe("library-panel-buscar");
    expect(host.querySelector(".library-tabs")).toBeNull();
    expect(host.querySelector(".page-header p")?.textContent).toBe(
      "Pesquise na edição de treinamento, consulte quadros e tabelas e abra imagens do material-fonte.",
    );
    expect(host.textContent).not.toContain("parágrafos pesquisáveis");
    expect(host.textContent).toContain("Pesquise por tema, documento ou etapa");

    act(() => {
      select.value = "tabelas";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.textContent).toContain("Escolha um quadro ou tabela");
    expect(host.textContent).not.toContain("índices estruturais ocultos");
  });

  it("acompanha a mudança do breakpoint sem deixar controles duplicados", () => {
    const query = mediaQuery(false);
    matchMedia.mockReturnValue(query);
    vi.stubGlobal("matchMedia", matchMedia);
    const { host } = mount();

    expect(host.querySelectorAll(".library-tabs button")).toHaveLength(7);
    act(() => query.setMatches(true));
    expect(host.querySelector(".library-tabs")).toBeNull();
    expect(host.querySelector("#library-area-select")).not.toBeNull();
  });

  it("mantém o status do glossário fora da caixa de filtro", () => {
    matchMedia.mockReturnValue(mediaQuery(true));
    vi.stubGlobal("matchMedia", matchMedia);
    const { host } = mount();
    const select = host.querySelector("#library-area-select");

    act(() => {
      select.value = "glossario";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(host.textContent).toContain("Siglas e abreviações");
    const search = host.querySelector(
      'input[aria-label="Filtrar siglas e abreviações do POP"]',
    );
    const status = host.querySelector("#library-glossary-results-summary");
    expect(status?.textContent).toContain("2 siglas encontradas");
    expect(search.closest(".big-search").contains(status)).toBe(false);

    typeInto(search, "PACUERA");
    expect(status?.textContent).toContain("1 sigla encontrada");
  });

  it("preserva a busca e anuncia a contagem fora da caixa", () => {
    matchMedia.mockReturnValue(mediaQuery(false));
    vi.stubGlobal("matchMedia", matchMedia);
    const { host, openLesson } = mount();

    expect(host.querySelectorAll(".library-tabs button")).toHaveLength(7);
    expect(host.querySelector("#library-area-select")).toBeNull();
    const search = host.querySelector(
      'input[aria-label="Buscar na edição de treinamento do POP"]',
    );

    typeInto(search, "PACUERA");
    expect(host.querySelector(".big-search kbd")).toBeNull();
    const status = host.querySelector("#library-search-results-summary");
    expect(status?.textContent).toContain("1 resultado encontrado");
    expect(search.closest(".big-search").contains(status)).toBe(false);
    expect(search.getAttribute("aria-describedby")).toBe(status.id);

    const result = host.querySelector(".search-results button");
    expect(result?.textContent).toContain("PACUERA");
    act(() => result.click());
    expect(openLesson).toHaveBeenCalledWith("aula-1");
  });
});
