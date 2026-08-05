import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { validateLabAnswerReasons } from "./labAnswerReasons.js";

const razoes = JSON.parse(
  readFileSync(new URL("./data/lab-answer-reasons.json", import.meta.url), "utf8"),
);
const corpos = JSON.parse(
  readFileSync(new URL("./data/lab-corpos.json", import.meta.url), "utf8"),
);
const casos = Array.isArray(corpos) ? corpos : corpos.casos || Object.values(corpos);
const porId = new Map(casos.map((c) => [c.id, c]));

function catalogoValido() {
  return Object.fromEntries(
    Array.from({ length: 26 }, (_, i) => [
      `caso-${i}`,
      Array.from(
        { length: 5 },
        (_, j) => `${j % 2 ? "Sim" : "Não"}. Explicação com tamanho suficiente para o validador.`,
      ),
    ]),
  );
}

describe("validador do catálogo", () => {
  it("aceita o catálogo real", () => {
    expect(() => validateLabAnswerReasons(razoes)).not.toThrow();
  });

  it("recusa o que não é catálogo", () => {
    for (const invalido of [null, undefined, [], "texto", 7]) {
      expect(() => validateLabAnswerReasons(invalido)).toThrow(/inválido/i);
    }
  });

  it("recusa contagem diferente de 26 casos ou 130 explicações", () => {
    const faltando = catalogoValido();
    delete faltando["caso-0"];
    expect(() => validateLabAnswerReasons(faltando)).toThrow(/26 casos e 130/);

    const curto = catalogoValido();
    curto["caso-0"] = curto["caso-0"].slice(0, 4);
    expect(() => validateLabAnswerReasons(curto)).toThrow(/26 casos e 130/);
  });

  it("recusa explicação que não começa por Sim ou Não", () => {
    // O prefixo é o que liga a explicação à decisão binária da folha-resposta.
    // Sem ele, o texto vira comentário solto e a pessoa não sabe o que ele
    // confirma ou nega.
    const semPrefixo = catalogoValido();
    semPrefixo["caso-0"][0] = "Talvez. Depende do caso concreto e da fase processual.";
    expect(() => validateLabAnswerReasons(semPrefixo)).toThrow(/ausente ou incompleta/);
  });

  it("recusa explicação curta demais para ensinar", () => {
    const curta = catalogoValido();
    curta["caso-0"][0] = "Sim. Confere.";
    expect(() => validateLabAnswerReasons(curta)).toThrow(/ausente ou incompleta/);
  });
});

describe("contrato sobre o conteúdo real", () => {
  const todas = Object.entries(razoes).flatMap(([id, lista]) =>
    lista.map((texto, indice) => ({ id, indice, texto })),
  );

  it("cobre os 26 casos com cinco explicações cada", () => {
    expect(Object.keys(razoes)).toHaveLength(26);
    expect(todas).toHaveLength(130);
  });

  it("todo caso do catálogo existe no corpus", () => {
    const orfaos = Object.keys(razoes).filter((id) => !porId.has(id));
    expect(orfaos).toEqual([]);
  });

  it("nenhuma explicação se repete", () => {
    // Explicação repetida entre casos é sinal de texto genérico, que devolve a
    // mesma justificativa para decisões diferentes.
    const vistas = new Map();
    for (const { id, indice, texto } of todas) {
      const antes = vistas.get(texto);
      if (antes) vistas.set(texto, `${antes} + ${id}#${indice}`);
      else vistas.set(texto, `${id}#${indice}`);
    }
    const repetidas = [...vistas.entries()]
      .filter(([, onde]) => onde.includes("+"))
      .map(([texto, onde]) => `${onde}: ${texto.slice(0, 60)}`);
    expect(repetidas).toEqual([]);
  });

  it("a explicação concorda com o gabarito da pergunta", () => {
    // Esta é a invariante que importa. Uma explicação que começa em "Sim."
    // numa pergunta cujo gabarito é "nao" devolve à pessoa a decisão certa e a
    // justificativa da decisão contrária, no mesmo lugar da tela. Nenhum portão
    // conferia isso: o validador de runtime só olha contagem e formato.
    const desalinhadas = [];
    for (const { id, indice, texto } of todas) {
      const pergunta = porId.get(id)?.questions?.[indice];
      const gabarito = String(pergunta?.[1] || "").toLowerCase();
      const dito = /^Sim\./.test(texto) ? "sim" : "nao";
      if (!gabarito) desalinhadas.push(`${id}#${indice}: pergunta sem gabarito`);
      else if (gabarito !== dito) {
        desalinhadas.push(`${id}#${indice}: gabarito ${gabarito}, explicação ${dito}`);
      }
    }
    expect(desalinhadas).toEqual([]);
  });

  it("não usa travessão", () => {
    const comTravessao = todas
      .filter(({ texto }) => /[—–]/.test(texto))
      .map(({ id, indice }) => `${id}#${indice}`);
    expect(comTravessao).toEqual([]);
  });
});
