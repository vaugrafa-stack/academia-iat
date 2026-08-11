import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { comoLerQuadro } from "./comoLerQuadro.js";

function quadro(colunas, linhas = 6) {
  return {
    rowCount: linhas,
    rows: [{ isHeader: true, cells: colunas.map((text) => ({ text })) }],
  };
}

describe("quando há leitura guiada", () => {
  it("exige ao menos duas colunas decisórias", () => {
    // Com uma só, o quadro é lista de referência e explicar seria enfeite.
    expect(comoLerQuadro(quadro(["Item", "Status"]))).toBeNull();
    expect(comoLerQuadro(quadro(["Item", "Status", "Consequência técnica"]))).not.toBeNull();
  });

  it("recusa tabela sem cabeçalho declarado", () => {
    const sem = quadro(["Item", "Status", "Consequência técnica"]);
    sem.rows[0].isHeader = false;
    expect(comoLerQuadro(sem)).toBeNull();
    expect(comoLerQuadro(null)).toBeNull();
    expect(comoLerQuadro({})).toBeNull();
  });

  it("preserva a ordem das colunas, que é o roteiro de uso", () => {
    const g = comoLerQuadro(quadro(["Item", "O que verificar", "Status", "Consequência técnica"]));
    expect(g.colunas.map((c) => c.nome)).toEqual([
      "Item", "O que verificar", "Status", "Consequência técnica",
    ]);
  });

  it("conta linhas sem o cabeçalho", () => {
    expect(comoLerQuadro(quadro(["Item", "Status", "Consequência técnica"], 10)).linhas).toBe(9);
    expect(comoLerQuadro(quadro(["Item", "Status", "Consequência técnica"], 1)).linhas).toBe(0);
  });
});

describe("papel de cada coluna", () => {
  it("casa por prefixo, porque o POP abrevia", () => {
    // "Encaminhamento" e "Encaminhamento padrão" são a mesma coluna.
    const curto = comoLerQuadro(quadro(["Item", "Status", "Encaminhamento"]));
    const longo = comoLerQuadro(quadro(["Item", "Status", "Encaminhamento padrão"]));
    expect(curto.colunas[2].papel).toBe(longo.colunas[2].papel);
  });

  it("ignora acento e caixa", () => {
    const g = comoLerQuadro(quadro(["ITEM", "CRITÉRIO DE ANÁLISE", "CONSEQUÊNCIA TÉCNICA"]));
    expect(g.colunas.every((c) => c.papel)).toBe(true);
  });

  it("não inventa papel para coluna desconhecida", () => {
    // Degradar em silêncio é melhor do que descrever errado: a tela mostra o
    // nome da coluna sem explicação, e não uma explicação chutada.
    const g = comoLerQuadro(quadro(["Assunto qualquer", "Status", "Consequência técnica"]));
    expect(g.colunas[0].papel).toBeNull();
  });
});

describe("status e consequência técnica", () => {
  it("avisa quando as duas convivem", () => {
    // Apresentado não é suficiente, e o quadro só funciona se as duas forem lidas separadas.
    expect(comoLerQuadro(quadro(["Item", "Status", "Consequência técnica"])).separaStatusDeConsequencia).toBe(true);
  });

  it("não avisa quando só uma existe", () => {
    expect(
      comoLerQuadro(quadro(["Item", "O que verificar", "Consequência técnica"])).separaStatusDeConsequencia,
    ).toBe(false);
  });
});

describe("contrato sobre o POP real", () => {
  const pop = JSON.parse(
    readFileSync(new URL("./data/pop-public-content.json", import.meta.url), "utf8"),
  );
  const guias = pop.tables
    .filter((t) => !t.navigationOnly)
    .map((t) => ({ t, guia: comoLerQuadro(t) }))
    .filter(({ guia }) => guia);

  it("reconhece instrumento de decisão em boa parte dos quadros", () => {
    expect(guias.length).toBeGreaterThanOrEqual(20);
  });

  it("descreve o papel de TODA coluna que chega à tela", () => {
    // Coluna sem papel aparece só com o nome. A tela aguenta, mas é lacuna:
    // eram dez, em "Componente", "Bloco", "Grupo" e "Fonte ou evidência".
    const semPapel = guias.flatMap(({ t, guia }) =>
      guia.colunas.filter((c) => !c.papel).map((c) => `${t.caption}: ${c.nome}`),
    );
    expect(semPapel).toEqual([]);
  });

  it("usa o nome literal da coluna, sem reescrever", () => {
    for (const { t, guia } of guias) {
      const cabecalho = t.rows[0].cells.map((c) => (c.text || "").trim()).filter(Boolean);
      expect(guia.colunas.map((c) => c.nome)).toEqual(cabecalho);
    }
  });
});
