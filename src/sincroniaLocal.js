// Onde fica o número da revisão já sincronizada.
//
// FORA do estado de progresso, de propósito. Guardar o número dentro do
// documento que é enviado faria cada envio mudar o próprio documento, e a
// comparação entre local e remoto passaria a comparar o carimbo em vez do
// estudo.
//
// A chave leva o identificador da conta porque duas contas no mesmo navegador
// têm revisões diferentes. Na máquina de repartição isso acontece: a pessoa
// entra, sai, e outra entra depois. Uma revisão sobrescrevendo a outra é o
// mesmo defeito que a sincronização existe para evitar.

const PREFIXO = "academia-iat-sincronia-rev:";

function armazemPadrao() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // Navegador com armazenamento bloqueado lança só de LER a propriedade.
    return null;
  }
}

function chave(conta) {
  return `${PREFIXO}${String(conta ?? "")}`;
}

/**
 * A revisão que este navegador já sincronizou para esta conta.
 *
 * Devolve 0 quando não sabe, e 0 é a resposta segura: significa "nunca
 * sincronizei", que leva `combinar` a subir o local ou a perguntar, e nunca a
 * apagar em silêncio.
 */
export function lerRevisao(conta, armazem = armazemPadrao()) {
  if (!conta || !armazem) return 0;
  try {
    const lido = Number.parseInt(armazem.getItem(chave(conta)), 10);
    return Number.isInteger(lido) && lido > 0 ? lido : 0;
  } catch {
    return 0;
  }
}

/** Guarda a revisão. Falha em silêncio: perder o carimbo custa uma pergunta a mais, e não o estudo. */
export function gravarRevisao(conta, revisao, armazem = armazemPadrao()) {
  if (!conta || !armazem) return false;
  const numero = Number(revisao);
  if (!Number.isInteger(numero) || numero < 0) return false;
  try {
    armazem.setItem(chave(conta), String(numero));
    return true;
  } catch {
    return false;
  }
}

/**
 * Esquece o carimbo desta conta.
 *
 * Chamado ao SAIR. Sem isso, quem sai e entra de novo depois de estudar em
 * outro computador carregaria uma revisão que não corresponde mais ao que este
 * navegador tem, e a sincronização seguinte acharia que está em dia.
 */
export function esquecerRevisao(conta, armazem = armazemPadrao()) {
  if (!conta || !armazem) return false;
  try {
    armazem.removeItem(chave(conta));
    return true;
  } catch {
    return false;
  }
}
