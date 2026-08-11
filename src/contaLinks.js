const ACOES = new Set(["verificar", "recuperar"]);

/**
 * Interpreta somente os links de uso unico enviados pelo servico de contas.
 * O token fica no fragmento, e por isso nao viaja no Referer nem chega ao
 * servidor estatico antes de a pessoa confirmar a acao na tela.
 */
export function interpretarLinkConta(hash) {
  const bruto = String(hash || "").replace(/^#\/?/, "");
  const indice = bruto.indexOf("?");
  const caminho = indice < 0 ? bruto : bruto.slice(0, indice);
  if (!ACOES.has(caminho)) return null;
  const parametros = new URLSearchParams(indice < 0 ? "" : bruto.slice(indice + 1));
  return {
    acao: caminho,
    token: parametros.get("token") || "",
  };
}

/** Remove o segredo da barra e da entrada corrente do histórico após o uso. */
export function removerTokenDoEndereco(janela = globalThis.window) {
  if (!janela?.history?.replaceState || !janela.location) return;
  const { pathname = "/", search = "" } = janela.location;
  janela.history.replaceState(null, "", `${pathname}${search}#/conta-concluida`);
}
