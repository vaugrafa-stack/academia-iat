import { describe, expect, it } from "vitest";
import { esquecerRevisao, gravarRevisao, lerRevisao } from "./sincroniaLocal.js";

function armazemFalso(inicial = {}) {
  const dados = { ...inicial };
  return {
    dados,
    getItem: (k) => (k in dados ? dados[k] : null),
    setItem: (k, v) => {
      dados[k] = String(v);
    },
    removeItem: (k) => {
      delete dados[k];
    },
  };
}

const quebrado = {
  getItem() {
    throw new Error("armazenamento bloqueado");
  },
  setItem() {
    throw new Error("armazenamento bloqueado");
  },
  removeItem() {
    throw new Error("armazenamento bloqueado");
  },
};

describe("o carimbo da revisão sincronizada", () => {
  it("vai e volta", () => {
    const a = armazemFalso();
    gravarRevisao("conta-1", 7, a);
    expect(lerRevisao("conta-1", a)).toBe(7);
  });

  it("cada conta tem o seu", () => {
    // Máquina de repartição: a pessoa entra, sai, e outra entra depois. Um
    // carimbo sobrescrevendo o outro é o mesmo defeito que a sincronização
    // existe para evitar.
    const a = armazemFalso();
    gravarRevisao("conta-1", 3, a);
    gravarRevisao("conta-2", 9, a);
    expect(lerRevisao("conta-1", a)).toBe(3);
    expect(lerRevisao("conta-2", a)).toBe(9);
  });

  it("sem carimbo responde 0, que é a resposta segura", () => {
    // 0 significa "nunca sincronizei", e leva `combinar` a subir o local ou a
    // perguntar. Qualquer outro chute levaria a apagar em silêncio.
    const a = armazemFalso({ "academia-iat-sincronia-rev:x": "isso não é número" });
    expect(lerRevisao("x", a)).toBe(0);
    expect(lerRevisao("nunca-vista", a)).toBe(0);
    expect(lerRevisao(null, a)).toBe(0);
    expect(lerRevisao("x", armazemFalso({ "academia-iat-sincronia-rev:x": "-4" }))).toBe(0);
  });

  it("sair esquece o carimbo", () => {
    // Sem isto, quem sai e entra de novo depois de estudar noutra máquina
    // carregaria uma revisão que já não corresponde a este navegador, e a
    // sincronização seguinte acharia que está em dia.
    const a = armazemFalso();
    gravarRevisao("conta-1", 5, a);
    esquecerRevisao("conta-1", a);
    expect(lerRevisao("conta-1", a)).toBe(0);
  });

  it("armazenamento bloqueado não derruba nada", () => {
    // Navegador em janela privativa lança em qualquer operação. Perder o
    // carimbo custa uma pergunta a mais, e não o estudo.
    expect(lerRevisao("conta-1", quebrado)).toBe(0);
    expect(gravarRevisao("conta-1", 2, quebrado)).toBe(false);
    expect(esquecerRevisao("conta-1", quebrado)).toBe(false);
  });
});
