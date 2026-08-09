// Conta opcional: sincroniza o progresso entre computadores.
//
// A Academia funciona sem servidor nenhum, e continua funcionando. Este arquivo
// só entra em ação quando a pessoa escolhe criar conta, e o resto da plataforma
// não sabe que ele existe.
//
// Isso não é gentileza. A plataforma é usada em máquina de repartição, às vezes
// sem rede confiável, e quem já estudou não pode descobrir num dia qualquer que
// agora precisa de conta para acessar o que já fez. Por isso:
//
//   - nenhuma tela de conteúdo depende daqui;
//   - toda falha de rede devolve um resultado, e nunca estoura;
//   - o progresso local continua sendo a verdade que a tela lê.
//
// ## A decisão que este arquivo existe para acertar
//
// Quem já estudou sem conta tem progresso no navegador. Ao entrar pela primeira
// vez, o servidor está vazio. Sincronizar ingenuamente sobrescreveria o local
// com esse vazio, e a pessoa perderia tudo no momento exato em que decidiu
// confiar na conta.
//
// Por isso existe a REVISÃO, e por isso `combinar` nunca decide sozinha quando
// os dois lados têm conteúdo: um deles é uma tarde de estudo de alguém.

/** O servidor devolve isto quando a conta é nova. */
export const SEM_PROGRESSO = { revisao: 0, documento: "", atualizado_em: 0 };

export const SOBE_O_LOCAL = "sobe-o-local";
export const DESCE_O_REMOTO = "desce-o-remoto";
export const PERGUNTAR = "perguntar";
export const NADA_A_FAZER = "nada-a-fazer";

/**
 * O estado local tem algo que valha a pena preservar?
 *
 * Estado recém-criado não é vazio: ele vem com `streak: 1` e uma porção de
 * objetos e listas vazios. Comparar com `{}` diria que toda conta nova tem
 * conteúdo, e aí a pergunta ao usuário apareceria para quem nunca estudou.
 */
export function temConteudo(estado) {
  if (!estado || typeof estado !== "object") return false;
  const listas = ["completed", "bookmarks", "videoSeen"];
  // `enquadra` fica de fora desta lista: ele nasce `{acertos: 0, total: 0}`, com
  // chaves, e contar chaves diria que todo estado novo tem conteúdo. Ele é
  // conferido pelo valor, logo abaixo.
  const mapas = [
    "notes", "quizScores", "labs", "flows", "checks", "doneAt", "its",
    "revisao", "autoaval", "diagnostico", "lessonEvidence",
  ];
  return (
    listas.some((c) => Array.isArray(estado[c]) && estado[c].length > 0) ||
    mapas.some((c) => estado[c] && Object.keys(estado[c]).length > 0) ||
    Number(estado.enquadra?.total) > 0
  );
}

/**
 * Esta versão foi construída para rodar junto de um serviço de conta?
 *
 * Decisão de BUILD, e não de execução. Perguntar ao servidor seria mais
 * elegante, mas na versão publicada em página estática a pergunta é um 404 por
 * carga, ou seja, erro de console em toda visita, num site que tem portão
 * justamente para não ter erro de console.
 *
 * Quem sobe o serviço constrói com `IAT_CONTA_REMOTA=1`. Sem isso a conta não
 * aparece, o que é o comportamento certo: sem serviço, não há onde criar conta.
 */
export function contaHabilitada() {
  try {
    return typeof __CONTA_REMOTA__ !== "undefined" && __CONTA_REMOTA__ === true;
  } catch {
    return false;
  }
}

/**
 * Existe serviço de conta nesta origem?
 *
 * A Academia publicada em página estática NÃO tem backend, e `/api/saude` ali
 * devolve a página de erro do próprio hospedeiro, com 404 e corpo em HTML. Sem
 * esta pergunta, a tela ofereceria criar conta onde não há onde criar.
 *
 * A resposta precisa ser JSON: hospedeiro que devolve 200 com a página inicial
 * para caminho desconhecido passaria pelo `ok` e enganaria a checagem.
 */
export async function servicoDisponivel(buscar) {
  const r = await chamar("/api/saude", {}, buscar);
  return r.ok === true && r.corpo?.ok === true;
}

/**
 * O que fazer com os dois lados. Não executa nada: só decide.
 *
 * Separado da rede de propósito. A decisão é a parte que precisa de teste, e
 * misturá-la com `fetch` obrigaria a subir um servidor para exercitar uma
 * comparação de números.
 */
export function combinar(local, remoto, revisaoLocal = 0) {
  const guardado = remoto || SEM_PROGRESSO;
  const localTemAlgo = temConteudo(local);
  const remotoTemAlgo = Boolean(guardado.documento);

  if (!localTemAlgo && !remotoTemAlgo) return { acao: NADA_A_FAZER };

  // Conta nova, e a pessoa já estudou neste navegador. Este é o caso que o
  // arquivo existe para não estragar.
  if (localTemAlgo && !remotoTemAlgo) {
    // O CAS parte da revisão REMOTA observada, que aqui é zero. Um carimbo
    // local antigo pode sobreviver a uma restauração do serviço e não pode ser
    // usado como base de um registro que o servidor acabou de dizer que não tem.
    return { acao: SOBE_O_LOCAL, revisao: 1 };
  }

  // Computador novo, com a conta já usada em outro.
  //
  // O documento vai junto na decisão, e não numa segunda leitura: entre uma
  // chamada e outra o servidor pode mudar, e quem executa aplicaria algo
  // diferente do que foi decidido aqui.
  if (!localTemAlgo && remotoTemAlgo) {
    return { acao: DESCE_O_REMOTO, revisao: guardado.revisao, remoto: guardado };
  }

  // Os dois têm conteúdo. Se a revisão local é a mesma que o servidor
  // devolveu, este navegador está em dia e só falta mandar o que mudou.
  if (revisaoLocal === guardado.revisao) {
    return { acao: SOBE_O_LOCAL, revisao: guardado.revisao + 1 };
  }

  // Divergiram. Não há como saber qual lado a pessoa quer, e chutar aqui
  // custaria o trabalho de um dos dois.
  return { acao: PERGUNTAR, local, remoto: guardado };
}

// ---------------------------------------------------------------------------
// A conversa com o serviço
// ---------------------------------------------------------------------------

const PADROES = {
  credentials: "same-origin",
  headers: { "Content-Type": "application/json" },
};

/**
 * Chamada que NUNCA estoura.
 *
 * Devolve `{ ok, status, corpo, erro }`. Rede caída, serviço fora do ar e
 * resposta que não é JSON viram resultado, e não exceção: quem chama está no
 * meio de uma tela de estudo, e uma promessa rejeitada ali derruba a interface
 * por causa de uma sincronização que nem era o que a pessoa estava fazendo.
 */
async function chamar(caminho, opcoes = {}, buscar = globalThis.fetch) {
  try {
    const resposta = await buscar(caminho, { ...PADROES, ...opcoes });
    let corpo = null;
    try {
      corpo = await resposta.json();
    } catch {
      corpo = null;
    }
    return { ok: resposta.ok, status: resposta.status, corpo, erro: null };
  } catch (erro) {
    return { ok: false, status: 0, corpo: null, erro: String(erro?.message || erro) };
  }
}

export async function quemSou(buscar) {
  const r = await chamar("/api/eu", {}, buscar);
  return r.ok ? r.corpo : null;
}

export async function entrar(email, senha, buscar) {
  return chamar(
    "/api/sessao",
    { method: "POST", body: JSON.stringify({ email, senha }) },
    buscar,
  );
}

export async function criarConta(email, senha, nome, buscar) {
  return chamar(
    "/api/contas",
    { method: "POST", body: JSON.stringify({ email, senha, nome }) },
    buscar,
  );
}

export async function sair(buscar) {
  return chamar("/api/sair", { method: "POST" }, buscar);
}

export async function pedirRecuperacao(email, buscar) {
  return chamar(
    "/api/recuperacao",
    { method: "POST", body: JSON.stringify({ email }) },
    buscar,
  );
}

export async function lerProgresso(buscar) {
  const r = await chamar("/api/progresso", {}, buscar);
  return r.ok ? r.corpo : null;
}

export async function gravarProgresso(revisao, estado, buscar, contaEsperada) {
  const documento = JSON.stringify(estado);
  const identificador = String(contaEsperada || "").trim();
  if (!identificador) {
    // Sem vinculo explicito, uma troca de cookie entre a leitura e este PUT
    // poderia gravar o documento na conta seguinte. Falhar fechado custa uma
    // sincronizacao; adivinhar a identidade pode expor progresso entre contas.
    return {
      ok: false,
      status: 0,
      corpo: null,
      erro: "conta_esperada_ausente",
    };
  }
  const resposta = await chamar(
    "/api/progresso",
    {
      method: "PUT",
      body: JSON.stringify({
        conta_esperada: identificador,
        revisao_base: revisao - 1,
        revisao,
        documento,
      }),
    },
    buscar,
  );
  // Compatibilidade de implantação: o serviço anterior não tinha `aceita`,
  // mas devolvia o documento efetivamente guardado. Igualdade de revisão E de
  // documento prova o mesmo efeito idempotente; só a revisão seria ambígua e
  // foi justamente a causa da perda silenciosa corrigida por este contrato.
  if (
    resposta.ok &&
    resposta.corpo?.aceita === undefined &&
    Number(resposta.corpo?.revisao) === revisao &&
    resposta.corpo?.documento === documento
  ) {
    return {
      ...resposta,
      corpo: { ...resposta.corpo, aceita: true, compatibilidade_legada: true },
    };
  }
  return resposta;
}

/**
 * O que fazer ao entrar, já resolvido, sem tocar em nada.
 *
 * Devolve a decisão de `combinar` para quem chama executar. Não grava e não
 * apaga: a tela precisa poder perguntar antes, e uma função que sincroniza
 * sozinha não deixa espaço para a pergunta.
 */
export async function planejarSincronia(local, revisaoLocal, buscar) {
  const remoto = await lerProgresso(buscar);
  if (remoto === null) {
    // Sem resposta do servidor. Não é erro para o usuário: o progresso local
    // está salvo e nada se perdeu. O que não aconteceu foi a sincronização.
    return { acao: NADA_A_FAZER, offline: true };
  }
  return combinar(local, remoto, revisaoLocal);
}

/**
 * O que fazer com a resposta do serviço a uma gravação.
 *
 * O serviço confirma uma gravação com `aceita: true`. Uma disputa pela mesma
 * revisão-base devolve `409 conflito_revisao`, com o progresso vencedor. Uma
 * resposta antiga ou incompleta fica em modo seguro e não é tratada como êxito.
 *
 * ## O defeito que esta função existe para não ter
 *
 * Carimbar a revisão do servidor quando ele RECUSOU faz este navegador passar a
 * se declarar em dia com uma revisão que ele nunca baixou. Na sincronização
 * seguinte, `combinar` vê as duas revisões iguais, conclui "este navegador está
 * em dia" e SOBE o local por cima, apagando em silêncio o estudo do outro
 * computador. É exatamente o que o módulo inteiro existe para impedir, entrando
 * pela porta dos fundos.
 *
 * Recusado, o carimbo fica onde estava. Aí as revisões seguem divergentes, e a
 * próxima sincronização cai no ramo que PERGUNTA.
 */
export function interpretarGravacao(pedida, resposta) {
  if (
    resposta?.status === 409 &&
    resposta?.corpo?.aceita === false &&
    resposta?.corpo?.codigo === "conta_alterada"
  ) {
    return {
      aceita: false,
      carimbar: null,
      algoMaisNovo: false,
      contaAlterada: true,
    };
  }
  if (
    resposta?.status === 409 &&
    resposta?.corpo?.aceita === false &&
    resposta?.corpo?.codigo === "conflito_revisao"
  ) {
    return { aceita: false, carimbar: null, algoMaisNovo: true };
  }
  if (!resposta?.ok || resposta?.corpo?.aceita !== true) {
    return { aceita: false, carimbar: null, algoMaisNovo: false };
  }
  const guardada = Number(resposta.corpo?.revisao);
  if (!Number.isInteger(guardada)) {
    // Resposta sem revisão utilizável. Não dá para afirmar que gravou, e
    // carimbar um palpite é o defeito descrito acima.
    return { aceita: false, carimbar: null, algoMaisNovo: false };
  }
  if (guardada === pedida) return { aceita: true, carimbar: guardada, algoMaisNovo: false };
  return { aceita: false, carimbar: null, algoMaisNovo: false };
}

/**
 * Assinatura do que conta como "fechei um bloco de estudo".
 *
 * A integração pede para gravar ao fechar um bloco, e não a cada tecla. Marco
 * é aula concluída, quiz respondido, caso do laboratório encerrado, checklist
 * fechado e IT redigida. Anotação sendo digitada NÃO entra: gravar a cada
 * letra encheria o log do serviço e gastaria rede da repartição para nada.
 *
 * Devolve texto para poder ser comparado com o anterior por igualdade simples.
 */
export function marcoDeEstudo(estado) {
  if (!estado || typeof estado !== "object") return "";
  const tamanho = (v) =>
    Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : 0;
  return [
    tamanho(estado.completed),
    tamanho(estado.quizScores),
    tamanho(estado.labs),
    tamanho(estado.checks),
    tamanho(estado.flows),
    tamanho(estado.its),
    tamanho(estado.doneAt),
    tamanho(estado.bookmarks),
    Number(estado.enquadra?.total) || 0,
  ].join(".");
}

/** Decodifica o documento guardado, sem estourar com texto estragado. */
export function documentoParaEstado(documento) {
  if (!documento) return null;
  try {
    const lido = JSON.parse(documento);
    // `typeof [] === "object"`, entao um array passaria por aqui e viraria
    // "estado" com zero campos, o que a tela leria como progresso apagado.
    // Array, numero e texto nao sao estado: sao documento estragado.
    const valido = lido && typeof lido === "object" && !Array.isArray(lido);
    return valido ? lido : null;
  } catch {
    // Documento corrompido não pode derrubar a entrada. O local continua
    // valendo, e a pessoa perde a sincronização daquele dia, não o estudo.
    return null;
  }
}
