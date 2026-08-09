import { describe, expect, it, vi } from "vitest";
import { criarFilaDeSincronia, decidirEnvio } from "./sincroniaAutomatica.js";

const MARCO_A = "1.0.0.0.0.0.0.1.0";
const MARCO_B = "2.0.0.0.0.0.0.1.0";

describe("quando o navegador manda o progresso para o serviço", () => {
  it("sem conta, nunca manda", () => {
    // Conta é opcional, e quem não criou nenhuma não pode ter o estudo saindo
    // do navegador por causa de um efeito solto.
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta: false });
    expect(d.enviar).toBe(false);
  });

  it("a primeira observação só vira referência", () => {
    // `null` quer dizer "absorva o que vier como base". É o estado logo depois
    // de entrar: o cartão ainda vai sincronizar, e mandar aqui atropelaria a
    // decisão dele.
    const d = decidirEnvio({ marcoAnterior: null, marcoAtual: MARCO_A, temConta: true });
    expect(d.enviar).toBe(false);
    expect(d.marco).toBe(MARCO_A);
  });

  it("estudo parado não gera tráfego", () => {
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_A, temConta: true });
    expect(d.enviar).toBe(false);
  });

  it("bloco de estudo fechado manda", () => {
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta: true });
    expect(d.enviar).toBe(true);
    expect(d.marco).toBe(MARCO_B);
  });

  it("o que veio do servidor NÃO volta para ele", () => {
    // Este é o defeito que o arquivo existe para não ter. Ao entrar num
    // computador novo, o cartão baixa o progresso e o estado muda. Sem o aviso
    // que zera a referência, o gancho leria isso como estudo novo e devolveria
    // ao servidor o que acabou de vir dele: gravação inútil e uma revisão a
    // mais a cada login.
    //
    // A sequência real: aplicou o remoto -> referência volta a `null` -> a
    // próxima observação é absorvida como base, sem enviar.
    const aplicou = decidirEnvio({ marcoAnterior: null, marcoAtual: MARCO_B, temConta: true });
    expect(aplicou.enviar).toBe(false);
    expect(aplicou.marco).toBe(MARCO_B);

    // E o estudo seguinte, esse sim, sobe.
    const depois = decidirEnvio({
      marcoAnterior: aplicou.marco,
      marcoAtual: "3.0.0.0.0.0.0.1.0",
      temConta: true,
    });
    expect(depois.enviar).toBe(true);
  });

  it("a referência acompanha o estado mesmo quando não manda", () => {
    // Se ela ficasse para trás, a comparação seguinte usaria um marco velho e
    // mandaria de novo o que já foi.
    for (const temConta of [true, false]) {
      const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta });
      expect(d.marco, String(temConta)).toBe(MARCO_B);
    }
  });
});

describe("fila de gravacao automatica", () => {
  it("serializa mudancas rapidas e calcula cada revisao depois da anterior", async () => {
    let revisaoLocal = 0;
    let liberarPrimeira;
    const primeiraPendente = new Promise((resolver) => {
      liberarPrimeira = resolver;
    });
    const gravar = vi.fn(async (revisao) => {
      if (revisao === 1) await primeiraPendente;
      return { ok: true, status: 200, corpo: { aceita: true, revisao } };
    });
    const fila = criarFilaDeSincronia({
      ler: () => revisaoLocal,
      gravar,
      contaAtiva: () => "conta-1",
      identificar: async () => ({ id: "conta-1" }),
      carimbar: (_id, revisao) => {
        revisaoLocal = revisao;
      },
    });

    const primeiro = fila("conta-1", { completed: ["a"] });
    const segundo = fila("conta-1", { completed: ["a", "b"] });
    await vi.waitFor(() => {
      expect(gravar.mock.calls.map(([revisao]) => revisao)).toEqual([1]);
    });

    liberarPrimeira();
    await Promise.all([primeiro, segundo]);
    expect(gravar.mock.calls.map(([revisao]) => revisao)).toEqual([1, 2]);
    expect(revisaoLocal).toBe(2);
  });

  it("continua a fila depois de uma falha inesperada", async () => {
    let revisaoLocal = 0;
    const gravar = vi
      .fn()
      .mockRejectedValueOnce(new Error("falha inesperada"))
      .mockResolvedValueOnce({ ok: true, status: 200, corpo: { aceita: true, revisao: 1 } });
    const fila = criarFilaDeSincronia({
      ler: () => revisaoLocal,
      gravar,
      contaAtiva: () => "conta-1",
      identificar: async () => ({ id: "conta-1" }),
      carimbar: (_id, revisao) => {
        revisaoLocal = revisao;
      },
    });

    await expect(fila("conta-1", { completed: ["a"] })).rejects.toThrow("falha inesperada");
    await expect(fila("conta-1", { completed: ["b"] })).resolves.toMatchObject({ aceita: true });
  });

  it("cancela sem enviar quando o cookie nao pertence a conta capturada", async () => {
    const gravar = vi.fn();
    const fila = criarFilaDeSincronia({
      ler: () => 0,
      gravar,
      carimbar: vi.fn(),
      contaAtiva: () => "conta-a",
      identificar: async () => ({ id: "conta-b" }),
    });

    await expect(fila("conta-a", { completed: ["segredo-a"] })).resolves.toEqual({
      aceita: false,
      carimbar: null,
      algoMaisNovo: false,
      cancelada: true,
    });
    expect(gravar).not.toHaveBeenCalled();
  });

  it("o backend recusa se o cookie muda entre a validacao e o PUT", async () => {
    let contaDoCookie = "conta-a";
    const gravados = [];
    const gravar = vi.fn(async (revisao, estado, contaEsperada) => {
      if (contaDoCookie !== contaEsperada) {
        return {
          ok: false,
          status: 409,
          corpo: { aceita: false, codigo: "conta_alterada" },
        };
      }
      gravados.push({ revisao, estado, contaEsperada });
      return { ok: true, status: 200, corpo: { aceita: true, revisao } };
    });
    const fila = criarFilaDeSincronia({
      ler: () => 0,
      gravar,
      carimbar: vi.fn(),
      // O ref React ainda aponta A, mas o cookie muda logo depois da resposta
      // de /api/eu e antes do PUT.
      contaAtiva: () => "conta-a",
      identificar: async () => {
        contaDoCookie = "conta-b";
        return { id: "conta-a" };
      },
    });

    await expect(fila("conta-a", { completed: ["segredo-a"] })).resolves.toMatchObject({
      cancelada: true,
      aceita: false,
    });
    expect(gravar).toHaveBeenCalledWith(1, { completed: ["segredo-a"] }, "conta-a");
    expect(gravados).toEqual([]);
  });

  it("nunca envia progresso de A com a sessao de B depois da troca de conta", async () => {
    let contaAtiva = "conta-a";
    let liberarPrimeira;
    const primeiraPendente = new Promise((resolver) => {
      liberarPrimeira = resolver;
    });
    const revisoes = new Map([
      ["conta-a", 0],
      ["conta-b", 0],
    ]);
    const envios = [];
    const gravar = vi.fn(async (revisao, estado) => {
      envios.push({ contaDoCookie: contaAtiva, estado });
      if (estado.bloco === "a-1") await primeiraPendente;
      return { ok: true, status: 200, corpo: { aceita: true, revisao } };
    });
    const carimbar = vi.fn((id, revisao) => revisoes.set(id, revisao));
    const fila = criarFilaDeSincronia({
      ler: (id) => revisoes.get(id) || 0,
      gravar,
      carimbar,
      contaAtiva: () => contaAtiva,
      identificar: async () => ({ id: contaAtiva }),
    });

    const primeiroA = fila("conta-a", { bloco: "a-1" });
    await vi.waitFor(() => expect(gravar).toHaveBeenCalledTimes(1));
    const segundoA = fila("conta-a", { bloco: "a-2" });

    contaAtiva = "conta-b";
    const primeiroB = fila("conta-b", { bloco: "b-1" });
    liberarPrimeira();

    await expect(primeiroA).resolves.toMatchObject({ cancelada: true });
    await expect(segundoA).resolves.toMatchObject({ cancelada: true });
    await expect(primeiroB).resolves.toMatchObject({ aceita: true, cancelada: false });

    expect(envios).toEqual([
      { contaDoCookie: "conta-a", estado: { bloco: "a-1" } },
      { contaDoCookie: "conta-b", estado: { bloco: "b-1" } },
    ]);
    expect(carimbar).toHaveBeenCalledTimes(1);
    expect(carimbar).toHaveBeenCalledWith("conta-b", 1);
  });
});
