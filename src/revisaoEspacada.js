// Revisão espaçada: o que a pessoa errou volta, e volta cada vez mais tarde.
//
// Por que existe. Conteúdo estudado uma vez e nunca revisto se perde. Sem
// retomada, a autoavaliação final mede memória recente, não domínio: quem fez
// o módulo ontem acerta, quem fez há um mês erra, e os dois receberam a mesma
// leitura.
//
// O que faltava era o dado. O quiz gravava `score`, `total` e `date`, e só no
// diagnóstico geral guardava um retrato de `porQuestao`. Nada acompanhava a
// mesma questão ao longo do tempo, então não havia como saber o que reapresentar.
//
// O intervalo cresce a cada acerto e volta ao início a cada erro. Os degraus em
// dias são os de uso corrente em repetição espaçada, e o motivo de crescerem é
// simples: item já dominado não precisa voltar toda semana, e item que escapou
// precisa voltar antes de escapar de novo.
//
// O que este módulo NÃO faz: prometer que a pessoa aprendeu. Ele reapresenta o
// que ela errou, no momento em que o esquecimento é provável. Continua sendo
// autoestudo, e a interface diz isso.

export const DEGRAUS_EM_DIAS = [1, 3, 7, 16, 35];
const DIA = 24 * 60 * 60 * 1000;

/** Índice do próximo degrau: sobe no acerto, volta ao começo no erro. */
export function proximoDegrau(degrauAtual, acertou) {
  if (!acertou) return 0;
  const atual = Number.isInteger(degrauAtual) ? degrauAtual : -1;
  return Math.min(atual + 1, DEGRAUS_EM_DIAS.length - 1);
}

/**
 * Atualiza o histórico de revisão com o resultado de uma rodada.
 *
 * `resultados` é `{ [questionId]: boolean }`. Devolve um registro novo, sem
 * mutar o anterior, porque ele vem do estado salvo do React.
 */
export function registrarRodada(revisaoAnterior = {}, resultados = {}, agoraIso) {
  const agora = agoraIso || new Date().toISOString();
  const saida = { ...revisaoAnterior };
  for (const [id, acertou] of Object.entries(resultados)) {
    if (typeof acertou !== "boolean") continue;
    const antes = saida[id] || {};
    const degrau = proximoDegrau(antes.degrau, acertou);
    saida[id] = {
      degrau,
      erros: (antes.erros || 0) + (acertou ? 0 : 1),
      acertos: (antes.acertos || 0) + (acertou ? 1 : 0),
      ultimoEm: agora,
      // A data fica gravada, e não recalculada na leitura, para o histórico
      // continuar legível se os degraus mudarem depois.
      proximaEm: new Date(Date.parse(agora) + DEGRAUS_EM_DIAS[degrau] * DIA).toISOString(),
    };
  }
  return saida;
}

/**
 * Questões vencidas, mais atrasadas primeiro, e entre iguais as mais erradas.
 *
 * Devolve no máximo `limite`. Questão nunca respondida NÃO entra: revisão é
 * retomada, não descoberta, e misturar as duas esconde as duas.
 */
export function questoesParaRevisar(revisao = {}, banco = [], agoraIso, limite = 8) {
  const agora = Date.parse(agoraIso || new Date().toISOString());
  const porId = new Map(banco.map((q) => [q.id, q]));
  return Object.entries(revisao)
    .filter(([id, r]) => porId.has(id) && r?.proximaEm && Date.parse(r.proximaEm) <= agora)
    .map(([id, r]) => ({
      questao: porId.get(id),
      registro: r,
      atrasoEmDias: Math.floor((agora - Date.parse(r.proximaEm)) / DIA),
    }))
    .sort((a, b) =>
      b.atrasoEmDias - a.atrasoEmDias
      || (b.registro.erros || 0) - (a.registro.erros || 0))
    .slice(0, limite);
}

/** Resumo para a interface: quantas vencidas e quantas em dia. */
export function resumoDaRevisao(revisao = {}, banco = [], agoraIso) {
  const agora = Date.parse(agoraIso || new Date().toISOString());
  const ids = new Set(banco.map((q) => q.id));
  let vencidas = 0;
  let emDia = 0;
  let comErro = 0;
  for (const [id, r] of Object.entries(revisao)) {
    if (!ids.has(id) || !r?.proximaEm) continue;
    if (Date.parse(r.proximaEm) <= agora) vencidas += 1;
    else emDia += 1;
    if ((r.erros || 0) > 0) comErro += 1;
  }
  return { vencidas, emDia, comErro, acompanhadas: vencidas + emDia };
}
