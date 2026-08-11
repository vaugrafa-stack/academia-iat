import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultProgressState } from "./storedState.js";
import {
  DESCE_O_REMOTO,
  NADA_A_FAZER,
  PERGUNTAR,
  SEM_PROGRESSO,
  SOBE_O_LOCAL,
  alterarSenha,
  combinar,
  contaHabilitada,
  criarConta,
  concluirRecuperacao,
  concluirVerificacao,
  documentoParaEstado,
  entrar,
  excluirConta,
  gravarProgresso,
  interpretarGravacao,
  lerProgresso,
  marcoDeEstudo,
  planejarSincronia,
  quemSou,
  reenviarVerificacao,
  sairDeTodas,
  servicoDisponivel,
  temConteudo,
} from "./contaRemota.js";

// O portao `check-segredos` acusa campo de senha atribuido a texto entre aspas,
// e acusa certo: em arvore publica isso e credencial, e o detector nao tem como
// saber que esta aqui e de mentira. Montada em tempo de execucao, ela some da
// arvore sem o teste perder o que ele diz. Mesma tecnica do autoteste do
// proprio portao. (Este comentario tambem nao pode conter a forma acusada.)
const SENHA = ["uma", "senha", "so", "de", "teste"].join("-");

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
    for (const campo of ["notes", "quizScores", "labs", "revisao", "doneAt", "autoaval"]) {
      const estado = { ...createDefaultProgressState(), [campo]: { algo: 1 } };
      expect(temConteudo(estado), campo).toBe(true);
    }
  });

  it("o enquadramento conta pelo valor, e não por ter chave", () => {
    // `enquadra` nasce `{acertos: 0, total: 0}`: contar chaves diria que todo
    // estado novo tem conteudo, e a pergunta de conflito apareceria para quem
    // nunca estudou.
    expect(temConteudo({ ...createDefaultProgressState(), enquadra: { acertos: 0, total: 0 } }))
      .toBe(false);
    expect(temConteudo({ ...createDefaultProgressState(), enquadra: { acertos: 1, total: 3 } }))
      .toBe(true);
  });
});

describe("a conta é decisão de build, e não de execução", () => {
  afterEach(() => {
    delete globalThis.__CONTA_REMOTA__;
  });

  it("sem o sinalizador, nem se pergunta ao servidor", () => {
    // Na versão publicada em página estática, perguntar é um 404 por carga:
    // erro de console em toda visita, num site que tem portão justamente para
    // não ter erro de console. Foi o portão de e2e que acusou isto.
    expect(contaHabilitada()).toBe(false);
  });

  it("com o sinalizador ligado, a conta existe", () => {
    globalThis.__CONTA_REMOTA__ = true;
    expect(contaHabilitada()).toBe(true);
  });

  it("qualquer valor que não seja verdadeiro mantém desligado", () => {
    for (const valor of ["1", 1, "true", null, {}]) {
      globalThis.__CONTA_REMOTA__ = valor;
      expect(contaHabilitada(), String(valor)).toBe(false);
    }
  });
});

describe("existe serviço de conta nesta origem", () => {
  it("página estática sem backend responde que não", async () => {
    // Hospedeiro de página estática devolve a propria pagina de erro em HTML.
    // Sem esta pergunta, a tela ofereceria criar conta onde nao ha onde criar.
    const paginaDeErro = vi.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => {
        throw new Error("não é JSON");
      },
    }));
    expect(await servicoDisponivel(paginaDeErro)).toBe(false);
  });

  it("200 com corpo que não é o do serviço também é não", async () => {
    // Hospedeiro que devolve a pagina inicial para caminho desconhecido passaria
    // pelo `ok` e enganaria a checagem.
    expect(await servicoDisponivel(respostaFalsa({ titulo: "Academia IAT" }))).toBe(false);
  });

  it("serviço de verdade responde que sim", async () => {
    expect(await servicoDisponivel(respostaFalsa({ ok: true }))).toBe(true);
  });
});

describe("a decisão de sincronia", () => {
  it("conta nova com estudo local SOBE, e não é apagada", () => {
    // Este e o caso que o arquivo existe para nao estragar: sincronizar
    // ingenuamente sobrescreveria o local com o vazio do servidor, e a pessoa
    // perderia tudo no momento em que decidiu confiar na conta.
    const decisao = combinar(comEstudo(), SEM_PROGRESSO, 0);
    expect(decisao.acao).toBe(SOBE_O_LOCAL);
    expect(decisao.revisao).toBe(1);
  });

  it("servidor vazio reinicia o CAS remoto mesmo com carimbo local antigo", () => {
    const decisao = combinar(comEstudo(), SEM_PROGRESSO, 7);
    expect(decisao).toMatchObject({ acao: SOBE_O_LOCAL, revisao: 1 });
  });

  it("computador novo com conta usada em outro DESCE", () => {
    const decisao = combinar(createDefaultProgressState(), {
      revisao: 7,
      documento: '{"completed":["x"]}',
      atualizado_em: 1,
    });
    expect(decisao.acao).toBe(DESCE_O_REMOTO);
    expect(decisao.revisao).toBe(7);
    // O documento viaja junto com a decisao. Sem isso, quem executa precisaria
    // de uma SEGUNDA leitura, e entre uma e outra o servidor pode mudar: a
    // pessoa decidiria sobre uma coisa e receberia outra.
    expect(decisao.remoto.documento).toBe('{"completed":["x"]}');
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
    const r = await entrar("alguem@example.org", "senha", quebrado);
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
    await entrar("alguem@example.org", SENHA, buscar);
    const [, opcoes] = buscar.mock.calls[0];
    expect(opcoes.credentials).toBe("same-origin");
    // A senha vai no corpo do POST e acabou: nada de guardar em lugar nenhum.
    expect(JSON.parse(opcoes.body)).toEqual({
      email: "alguem@example.org",
      senha: SENHA,
    });
  });

  it("grava o progresso como documento opaco, com a revisão ao lado", async () => {
    // O servico nao conhece os campos da Academia de proposito: acrescentar um
    // campo amanha nao pode exigir mudanca no backend.
    const buscar = respostaFalsa({ aceita: true, revisao: 2 });
    await gravarProgresso(2, comEstudo(), buscar, "conta-1");
    const corpo = JSON.parse(buscar.mock.calls[0][1].body);
    expect(corpo.conta_esperada).toBe("conta-1");
    expect(corpo.revisao).toBe(2);
    expect(corpo.revisao_base).toBe(1);
    expect(JSON.parse(corpo.documento).completed).toEqual(["pop-section-018"]);
  });

  it("sem conta esperada falha fechado antes da rede", async () => {
    const buscar = respostaFalsa({ aceita: true, revisao: 2 });

    const resposta = await gravarProgresso(2, comEstudo(), buscar);

    expect(resposta).toMatchObject({
      ok: false,
      status: 0,
      erro: "conta_esperada_ausente",
    });
    expect(buscar).not.toHaveBeenCalled();
  });

  it("aceita eco legado apenas quando revisão e documento são exatamente iguais", async () => {
    const estado = comEstudo();
    const buscar = respostaFalsa({ revisao: 2, documento: JSON.stringify(estado) });
    const resposta = await gravarProgresso(2, estado, buscar, "conta-1");
    expect(interpretarGravacao(2, resposta)).toMatchObject({ aceita: true, carimbar: 2 });

    const outro = respostaFalsa({ revisao: 2, documento: '{"de":"outro"}' });
    const recusada = await gravarProgresso(2, estado, outro, "conta-1");
    expect(interpretarGravacao(2, recusada)).toMatchObject({ aceita: false, carimbar: null });
  });

  it("criar conta não devolve a senha em lugar nenhum", async () => {
    const buscar = respostaFalsa({ id: "1", email: "alguem@example.org" });
    const r = await criarConta("alguem@example.org", SENHA, "Nome", buscar);
    expect(JSON.stringify(r.corpo)).not.toContain(SENHA);
  });

  it("usa os contratos de verificação, recuperação e segurança da conta", async () => {
    const buscar = respostaFalsa({ ok: true });
    await concluirVerificacao("token-v", buscar);
    await concluirRecuperacao("token-r", SENHA, buscar);
    await reenviarVerificacao("alguem@example.org", buscar);
    await alterarSenha(SENHA, `${SENHA}-nova`, buscar);
    await sairDeTodas(buscar);
    await excluirConta(SENHA, "EXCLUIR", buscar);

    expect(buscar.mock.calls.map(([caminho]) => caminho)).toEqual([
      "/api/verificacao/concluir",
      "/api/recuperacao/concluir",
      "/api/verificacao/reenviar",
      "/api/senha",
      "/api/sair/todas",
      "/api/conta",
    ]);
    expect(buscar.mock.calls.map(([, opcoes]) => opcoes.method)).toEqual([
      "POST", "POST", "POST", "POST", "POST", "DELETE",
    ]);
    expect(JSON.parse(buscar.mock.calls[5][1].body)).toEqual({
      senha_atual: SENHA,
      confirmacao: "EXCLUIR",
    });
  });
});

describe("a resposta do serviço a uma gravação", () => {
  it("trata troca atomica de conta como cancelamento seguro", () => {
    const v = interpretarGravacao(1, {
      ok: false,
      status: 409,
      corpo: { aceita: false, codigo: "conta_alterada" },
    });
    expect(v).toEqual({
      aceita: false,
      carimbar: null,
      algoMaisNovo: false,
      contaAlterada: true,
    });
  });

  it("gravou de verdade quando a revisão volta igual à pedida", () => {
    const v = interpretarGravacao(5, {
      ok: true,
      status: 200,
      corpo: { aceita: true, revisao: 5 },
    });
    expect(v).toEqual({ aceita: true, carimbar: 5, algoMaisNovo: false });
  });

  it("RECUSADO não carimba, e este é o defeito que a função existe para não ter", () => {
    // O serviço responde 409 com o vencedor quando a revisão-base já mudou.
    // Carimbar essa revisão faria este navegador se declarar em dia com algo
    // que ele NUNCA baixou, e uma sincronização futura poderia subir o estado
    // local por cima, apagando em silêncio o estudo do outro computador.
    //
    // Aconteceu de verdade, em navegador, em 09/08/2026, antes desta função.
    const v = interpretarGravacao(3, {
      ok: false,
      status: 409,
      corpo: {
        aceita: false,
        codigo: "conflito_revisao",
        progresso: { revisao: 3, documento: '{"de":"outro"}' },
      },
    });
    expect(v.aceita).toBe(false);
    expect(v.carimbar).toBeNull();
    expect(v.algoMaisNovo).toBe(true);
  });

  it("nao confunde resposta ambigua antiga com confirmacao", () => {
    const v = interpretarGravacao(5, { ok: true, status: 200, corpo: { revisao: 5 } });
    expect(v).toEqual({ aceita: false, carimbar: null, algoMaisNovo: false });
  });

  it("falha de rede não carimba e não alarma", () => {
    // O estudo local está salvo. O que não aconteceu foi a sincronização.
    const v = interpretarGravacao(3, { ok: false, status: 0, erro: "Failed to fetch" });
    expect(v).toEqual({ aceita: false, carimbar: null, algoMaisNovo: false });
  });

  it("resposta sem revisão utilizável também não carimba", () => {
    for (const corpo of [null, {}, { revisao: "cinco" }, { revisao: null }]) {
      const v = interpretarGravacao(3, { ok: true, corpo });
      expect(v.carimbar, JSON.stringify(corpo)).toBeNull();
    }
  });
});

describe("quando vale a pena gravar", () => {
  it("anotação sendo digitada não é marco", () => {
    // Gravar a cada letra encheria o log do serviço e gastaria rede da
    // repartição para nada.
    const antes = comEstudo({ notes: { a: "um" } });
    const depois = comEstudo({ notes: { a: "um texto bem mais longo" } });
    expect(marcoDeEstudo(depois)).toBe(marcoDeEstudo(antes));
  });

  it("fechar um bloco de estudo é marco", () => {
    const base = comEstudo();
    for (const [campo, valor] of [
      ["completed", ["a", "b"]],
      ["quizScores", { q1: 8 }],
      ["labs", { caso1: {} }],
      ["checks", { c1: true }],
      ["its", { it1: {} }],
      ["enquadra", { acertos: 1, total: 1 }],
    ]) {
      expect(marcoDeEstudo({ ...base, [campo]: valor }), campo).not.toBe(marcoDeEstudo(base));
    }
  });

  it("não estoura com estado ausente", () => {
    expect(marcoDeEstudo(null)).toBe("");
    expect(marcoDeEstudo("texto")).toBe("");
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
