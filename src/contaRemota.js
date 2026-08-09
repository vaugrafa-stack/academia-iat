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
  const mapas = ["notes", "quizScores", "labs", "flows", "checks", "doneAt", "its", "revisao"];
  return (
    listas.some((c) => Array.isArray(estado[c]) && estado[c].length > 0) ||
    mapas.some((c) => estado[c] && Object.keys(estado[c]).length > 0)
  );
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
    return { acao: SOBE_O_LOCAL, revisao: Math.max(1, revisaoLocal + 1) };
  }

  // Computador novo, com a conta já usada em outro.
  if (!localTemAlgo && remotoTemAlgo) {
    return { acao: DESCE_O_REMOTO, revisao: guardado.revisao };
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

export async function gravarProgresso(revisao, estado, buscar) {
  return chamar(
    "/api/progresso",
    {
      method: "PUT",
      body: JSON.stringify({ revisao, documento: JSON.stringify(estado) }),
    },
    buscar,
  );
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
