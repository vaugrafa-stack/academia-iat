import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resumoDaNorma } from "./leiResumos.js";

const pop = JSON.parse(
  readFileSync(new URL("./data/pop-public-content.json", import.meta.url), "utf8"),
);
const porId = new Map(pop.blocks.map((b) => [b.id, b]));

const referencias = (() => {
  const secao = pop.sections.find((s) => /Referências normativas/i.test(s.title || ""));
  return (secao?.blockIds || [])
    .map((id) => porId.get(id))
    .filter((b) => b?.paragraph?.text)
    .map((b) => b.paragraph.text.replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 25);
})();

describe("qual ato o resumo descreve", () => {
  it("descreve o decreto, e não a lei que ele regulamenta", () => {
    // A referência costuma citar a norma regulamentada na ementa. Casando só
    // pelo número, o decreto era descrito como a lei.
    const decreto = resumoDaNorma(
      "BRASIL. Decreto Federal nº 4.340, de 22 de agosto de 2002, com alterações "
      + "do Decreto Federal nº 6.848, de 14 de maio de 2009. Regulamenta dispositivos "
      + "da Lei Federal nº 9.985/2000 relativos à compensação ambiental.",
    );
    expect(decreto).toContain("Regulamenta a Lei do SNUC");
    expect(decreto).not.toContain("Institui o SNUC");

    const lei = resumoDaNorma("BRASIL. Lei Federal nº 9.985, de 18 de julho de 2000.");
    expect(lei).toContain("Institui o SNUC");
  });

  it("distingue resoluções CONAMA de mesmo número por data", () => {
    const a = resumoDaNorma("CONAMA. Resolução nº 06, de 24 de janeiro de 1986.");
    const b = resumoDaNorma("CONAMA. Resolução nº 06, de 16 de setembro de 1987.");
    expect(a).not.toBe(b);
    expect(a).toContain("publicação");
    expect(b).toContain("setor elétrico");
  });

  it("devolve null para referência que não conhece", () => {
    expect(resumoDaNorma("ÓRGÃO. Ato inexistente nº 1, de 1900.")).toBeNull();
    expect(resumoDaNorma("")).toBeNull();
    expect(resumoDaNorma(null)).toBeNull();
  });
});

describe("contrato sobre o POP real", () => {
  it("encontra a lista de referências do POP", () => {
    expect(referencias.length).toBeGreaterThanOrEqual(50);
  });

  it("resume TODA referência que chega à tela", () => {
    // Referência sem resumo aparece só com o título oficial, que é o que a
    // aba Legislações existe para traduzir.
    const sem = referencias.filter((r) => !resumoDaNorma(r)).map((r) => r.slice(0, 90));
    expect(sem).toEqual([]);
  });

  it("não afirma número de artigo que o POP não registra", () => {
    // Regra vinda de um erro real: seis afirmações de artigo já foram
    // derrubadas por releitura da fonte primária. Aqui o lastro mínimo é o
    // próprio POP, e a conferência olha o par (norma, artigo) junto, porque
    // "art. 36" solto existe em qualquer texto normativo.
    const corpus = [
      ...pop.blocks.map((b) => b.paragraph?.text || ""),
      ...pop.tables.flatMap((t) =>
        (t.rows || []).flatMap((r) => (r.cells || []).map((c) => c.text || "")),
      ),
    ]
      .join("\n")
      .replace(/\s+/g, " ");

    // Proximidade de verdade: uma janela do POP tem de conter o número da
    // norma E o artigo. Só procurar "art. N" solto passaria sempre, porque
    // "art. 36" existe em qualquer texto normativo; foi assim que a primeira
    // versão deste teste nasceu inútil.
    const janelas = (numero, artigo) => {
      const alvo = numero.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(alvo, "gi");
      for (const achado of corpus.matchAll(re)) {
        const de = Math.max(0, achado.index - 300);
        const trecho = corpus.slice(de, achado.index + 300);
        if (new RegExp(`art\\.\\s*${artigo}\\b`, "i").test(trecho)) return true;
      }
      return false;
    };

    const semLastro = [];
    for (const ref of referencias) {
      const resumo = resumoDaNorma(ref);
      const artigos = [...resumo.matchAll(/\bart\.\s*(\d+)/gi)].map((m) => m[1]);
      if (!artigos.length) continue;
      // Número identificador da norma citada no PRÓPRIO resumo, que é onde a
      // afirmação mora. Ex.: "art. 36 do SNUC" perto de "9.985".
      const numeros = [...resumo.matchAll(/n[ºo°]\s*([\d.]+\/?\d*)/gi)].map((m) => m[1]);
      for (const artigo of artigos) {
        const ok = numeros.some((n) => janelas(n, artigo))
          || janelas("SNUC", artigo)
          || janelas("IN IAT", artigo);
        if (!ok) semLastro.push(`${ref.slice(0, 55)} -> art. ${artigo}`);
      }
    }
    expect(semLastro).toEqual([]);

    // A medida só vale se acusa: um artigo que o POP não liga àquela norma.
    expect(janelas("9.985", "36")).toBe(true);
    expect(janelas("9.985", "999")).toBe(false);
  });

  it("não usa travessão", () => {
    const comTravessao = referencias
      .map((r) => resumoDaNorma(r))
      .filter((r) => /[—–]/.test(r || ""));
    expect(comTravessao).toEqual([]);
  });
});
