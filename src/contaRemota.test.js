import { describe, expect, it, vi } from "vitest";
import { createDefaultProgressState } from "./storedState.js";
import {
  DESCE_O_REMOTO,
  NADA_A_FAZER,
  PERGUNTAR,
  SEM_PROGRESSO,
  SOBE_O_LOCAL,
  combinar,
  criarConta,
  documentoParaEstado,
  entrar,
  gravarProgresso,
  lerProgresso,
  planejarSincronia,
  quemSou,
  temConteudo,
} from "./contaRemota.js";

function comEstudo(extra = {}) {
  return { ...createDefaultProgressState(), completed: ["pop-section-018"], ...extra };
}

function respostaFalsa(corpo, { ok = true, status = 200 } = {}) {
  return vi.fn(async () => ({
    ok,
    status,
    json: async () => corpo,
  }));
}

describe("o que conta como progresso", () => {
  it("estado recém-criado não conta como conteúdo", () => {
    // Estado novo nao e vazio: vem com `streak: 1` e uma porcao de objetos
    // vazios. Comparar com `{}` diria que toda conta nova tem conteudo, e a
    // pergunta ao usuario apareceria para quem nunca estudou.
    expect(temConteudo(createDefaultProgressState())).toBe(false);
    expect(temConteudo(null)).toBe(false);
    expect(temConteudo("texto")).toBe(false);
  });

  it("uma aula concluída já conta", () => {
    expect(temConteudo(comEstudo())).toBe(true);
  });

  it("conta também o que não é lista", () => {
    for (const campo of ["notes", "quizScores", "labs", "revisao", "doneAt"]) {
      const estado = { ...createDefaultProgressState(), [campo]: { algo: 1 } };
      expect(temConteudo(estado), campo).toBe(true);
    }
  });
});

describe("a decisão de sincronia", () => {
  it("conta nova com estudo local SOBE, e não é apagada", () => {
    // Este e o caso que o arquivo existe para nao estragar: sincronizar
    // ingenuamente sobrescreveria o local com o vazio do servidor, e a pessoa
    // perderia tudo no momento em que decidiu confiar na conta.
    const decisao = combinar(comEstudo(), SEM_PROGRESSO, 0);
    expect(decisao.acao).toBe(SOBE_O_LOCAL);
    expect(decisao.revisao).toBeGreaterThanOrEqual(1);
  });

  it("computador novo com conta usada em outro DESCE", () => {
    const decisao = combinar(createDefaultProgressState(), {
      revisao: 7,
      documento: '{"completed":["x"]}',
      atualizado_em: 1,
    });
    expect(decisao.acao).toBe(DESCE_O_REMOTO);
    expect(decisao.revisao).toBe(7);
  });

  it("os dois vazios não fazem nada", () => {
    expect(combinar(createDefaultProgressState(), SEM_PROGRESSO).acao).toBe(NADA_A_FAZER);
  });

  it("este navegador em dia apenas sobe o que mudou", () => {
    const decisao = combinar(comEstudo(), { revisao: 4, documento: '{"a":1}' }, 4);
    expect(decisao.acao).toBe(SOBE_O_LOCAL);
    expect(decisao.revisao).toBe(5);
  });

  it("quando os dois divergem, PERGUNTA em vez de escolher", () => {
    // Chutar aqui custaria o trabalho de um dos dois lados.
    const decisao = combinar(comEstudo(), { revisao: 9, documento: '{"b":2}' }, 3);
    expect(decisao.acao).toBe(PERGUNTAR);
    expect(decisao.local).toBeTruthy();
    expect(decisao.remoto.revisao).toBe(9);
  });

  it("nunca devolve uma ação que apague o local em silêncio", () => {
    // Contrato de seguranca do modulo: com estudo local, a unica saida
    // possivel sem passar pela pessoa e subir.
    for (const remoto of [SEM_PROGRESSO, { revisao: 0, documento: "" }]) {
      expect(combinar(comEstudo(), remoto, 0).acao).toBe(SOBE_O_LOCAL);
    }
  });
});

describe("a conversa com o serviço nunca derruba a tela", () => {
  it("rede caída vira resultado, e não exceção", async () => {
    const quebrado = vi.fn(async () => {
      throw new Error("Failed to fetch");
    });
    const r = await entrar("a@b.org", "senha", quebrado);
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("Failed to fetch");
  });

  it("resposta que não é JSON também vira resultado", async () => {
    const html = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("não é JSON");
      },
    }));
    const r = await lerProgresso(html);
    expect(r).toBeNull();
  });

  it("sem sessão, quemSou devolve null em vez de estourar", async () => {
    expect(await quemSou(respostaFalsa({}, { ok: false, status: 401 }))).toBeNull();
  });

  it("manda o cookie da mesma origem, e não credencial no corpo", async () => {
    const buscar = respostaFalsa({ id: "1" });
    await entrar("a@b.org", "minha senha longa", buscar);
    const [, opcoes] = buscar.mock.calls[0];
    expect(opcoes.credentials).toBe("same-origin");
    // A senha vai no corpo do POST e acabou: nada de guardar em lugar nenhum.
    expect(JSON.parse(opcoes.body)).toEqual({
      email: "a@b.org",
      senha: "minha senha longa",
    });
  });

  it("grava o progresso como documento opaco, com a revisão ao lado", async () => {
    // O servico nao conhece os campos da Academia de proposito: acrescentar um
    // campo amanha nao pode exigir mudanca no backend.
    const buscar = respostaFalsa({ revisao: 2 });
    await gravarProgresso(2, comEstudo(), buscar);
    const corpo = JSON.parse(buscar.mock.calls[0][1].body);
    expect(corpo.revisao).toBe(2);
    expect(JSON.parse(corpo.documento).completed).toEqual(["pop-section-018"]);
  });

  it("criar conta não devolve a senha em lugar nenhum", async () => {
    const buscar = respostaFalsa({ id: "1", email: "a@b.org" });
    const r = await criarConta("a@b.org", "uma senha bem longa", "Nome", buscar);
    expect(JSON.stringify(r.corpo)).not.toContain("uma senha bem longa");
  });
});

describe("planejar sem executar", () => {
  it("servidor fora do ar não é erro para quem estuda", async () => {
    // O progresso local esta salvo e nada se perdeu. O que nao aconteceu foi a
    // sincronizacao, e erro alarmante aqui ensina a desconfiar da plataforma.
    const quebrado = vi.fn(async () => {
      throw new Error("offline");
    });
    const plano = await planejarSincronia(comEstudo(), 0, quebrado);
    expect(plano.acao).toBe(NADA_A_FAZER);
    expect(plano.offline).toBe(true);
  });

  it("planejar não grava nada", async () => {
    const buscar = respostaFalsa(SEM_PROGRESSO);
    await planejarSincronia(comEstudo(), 0, buscar);
    const metodos = buscar.mock.calls.map(([, o]) => (o?.method || "GET").toUpperCase());
    expect(metodos).toEqual(["GET"]);
  });
});

describe("documento guardado", () => {
  it("volta a ser estado", () => {
    expect(documentoParaEstado('{"completed":["a"]}').completed).toEqual(["a"]);
  });

  it("documento estragado não derruba a entrada", () => {
    // O local continua valendo, e a pessoa perde a sincronizacao daquele dia,
    // e nao o estudo.
    for (const ruim of ["", null, "{quebrado", "[1,2]", '"texto"', "7"]) {
      expect(documentoParaEstado(ruim)).toBeNull();
    }
  });
});
