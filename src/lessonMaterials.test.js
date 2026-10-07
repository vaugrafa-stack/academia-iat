import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { montarMateriaisDaSecao } from "./lessonMaterials.js";

const pop = JSON.parse(readFileSync(new URL("./data/pop-public-content.json", import.meta.url), "utf8"));
const blocos = new Map(pop.blocks.map((block) => [block.id, block]));
const tabelas = new Map(pop.tables.map((table) => [table.id, table]));
const figuras = new Map(pop.figures.map((figure) => [figure.blockId, figure]));

function materiaisDaSecao(numero) {
  const secao = pop.sections.find((item) => item.number === numero);
  expect(secao).toBeTruthy();
  return montarMateriaisDaSecao(secao.blockIds.map((id) => blocos.get(id)), tabelas, figuras);
}

describe("figuras e tabelas junto da leitura do POP", () => {
  it("associa todas as 14 figuras e 69 tabelas, sem duplicar as 83 legendas", () => {
    const secoes = pop.sections.map((secao) =>
      montarMateriaisDaSecao(secao.blockIds.map((id) => blocos.get(id)), tabelas, figuras),
    );
    const reunidas = secoes.flatMap((secao) => secao.itens);
    const imagens = reunidas.filter((item) => item.tipo === "figura");
    expect(imagens).toHaveLength(14);
    expect(reunidas.filter((item) => item.tipo === "tabela")).toHaveLength(69);
    expect(secoes.reduce((total, secao) => total + secao.legendasConsumidas.size, 0)).toBe(83);
    expect(new Set(imagens.map((item) => item.figure.id)).size).toBe(14);
    expect(imagens.every((item) => item.legenda.startsWith(`Figura ${item.figure.number} - `))).toBe(true);
  });

  it("mantém o texto do capítulo 14 e integra a legenda da Figura 5", () => {
    const secao = pop.sections.find((item) => item.number === "14");
    const materiais = materiaisDaSecao("14");
    expect(materiais.itens.map((item) => item.figure?.number)).toEqual([5]);
    expect(materiais.itens[0].legenda).toContain("transferência de titularidade");
    expect(materiais.legendasConsumidas.size).toBe(1);
    expect(secao.blockIds.map((id) => blocos.get(id)?.paragraph?.text)
      .filter((texto) => texto && !/^Figura\s+5\b/.test(texto))).toHaveLength(3);
  });

  it("mostra o Quadro 17 no tópico 13.2 sem repetir o parágrafo de legenda", () => {
    const materiais = materiaisDaSecao("13.2");
    expect(materiais.itens).toHaveLength(1);
    expect(materiais.itens[0].table.labelNumber).toBe(17);
    expect(materiais.legendasConsumidas.size).toBe(1);
  });
});
