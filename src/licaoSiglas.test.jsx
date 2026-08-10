// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  encontrarSiglasDaAula,
  SiglasDaAula,
  textoDaAulaParaSiglas,
} from "./licao.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const catalogo = [
  { sig: "PACUERA", nome: "Plano Ambiental de Conservação e Uso do Entorno" },
  { sig: "LP", nome: "Licença Prévia" },
  { sig: "ADA", nome: "Área Diretamente Afetada" },
  { sig: "AID", nome: "Área de Influência Direta" },
];
const roots = [];

function localizarNoCatalogo(texto) {
  return catalogo.filter(({ sig }) =>
    new RegExp(`(^|[^A-Za-zÀ-ÿ])${sig}([^A-Za-zÀ-ÿ]|$)`).test(texto),
  );
}

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});

describe("siglas no conteúdo da aula", () => {
  it("considera título, parágrafo, título de quadro e células da tabela", () => {
    const lesson = { title: "Como elaborar o PACUERA" };
    const blocks = [
      { type: "paragraph", paragraph: { text: "A LP antecede esta etapa." } },
      { type: "table", tableId: "quadro-1" },
    ];
    const tableMap = new Map([
      [
        "quadro-1",
        {
          title: "Delimitação da ADA",
          rows: [{ cells: [{ text: "Verificar também a AID." }] }],
        },
      ],
    ]);

    const texto = textoDaAulaParaSiglas(lesson, blocks, tableMap);
    expect(texto).toContain("PACUERA");
    expect(texto).toContain("LP");
    expect(texto).toContain("ADA");
    expect(texto).toContain("AID");
    expect(
      encontrarSiglasDaAula({
        lesson,
        blocks,
        tableMap,
        siglasDaAula: localizarNoCatalogo,
      }).map(({ sig }) => sig),
    ).toEqual(["PACUERA", "LP", "ADA", "AID"]);
  });

  it("elimina repetições sem alterar a primeira definição encontrada", () => {
    const siglas = encontrarSiglasDaAula({
      lesson: { title: "LP" },
      siglasDaAula: () => [
        { sig: "LP", nome: "Licença Prévia" },
        { sig: "lp", nome: "definição repetida" },
      ],
    });
    expect(siglas).toEqual([{ sig: "LP", nome: "Licença Prévia" }]);
  });

  it("oferece controle nativo de teclado e relações para leitor de tela", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    await act(async () => {
      root.render(<SiglasDaAula siglas={[catalogo[0]]} />);
    });

    const controle = host.querySelector(".siglas-aula-toggle");
    const painel = document.getElementById(controle.getAttribute("aria-controls"));
    expect(controle.tagName).toBe("BUTTON");
    expect(controle.type).toBe("button");
    expect(controle.getAttribute("aria-expanded")).toBe("false");
    expect(painel.hidden).toBe(true);

    controle.focus();
    expect(document.activeElement).toBe(controle);
    await act(async () => controle.click());
    expect(controle.getAttribute("aria-expanded")).toBe("true");
    expect(painel.hidden).toBe(false);
    expect(painel.querySelectorAll("dt")).toHaveLength(1);
    expect(painel.textContent).toContain("Plano Ambiental");
  });

  it("mantém o acesso principal no breakpoint sem rail e alvo de 44 px", () => {
    const css = readFileSync("src/licao.css", "utf8");
    expect(css).toMatch(/\.siglas-aula-toggle\{[^}]*min-height:44px/);
    expect(css).toMatch(
      /@media\(max-width:1250px\)\{\.siglas-aula-principal\{display:block/,
    );
    const globalCss = readFileSync("src/styles.css", "utf8");
    expect(globalCss).toMatch(/\.lesson-context\{display:none\}/);
  });
});
