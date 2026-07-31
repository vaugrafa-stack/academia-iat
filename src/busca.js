// Auxiliares de busca textual, sem React e sem estado.
//
// Saíram de main.jsx porque a Biblioteca foi extraída e passou a precisar
// deles. Ficando aqui, as duas telas usam a mesma implementação e o
// comportamento da busca pode ser testado sem montar componente.
import { norm } from './derivados.js';

// Tokens que identificam uma norma dentro do texto corrido de uma aula.
// A referência do POP vem como parágrafo inteiro ("BRASIL. Lei nº 12.334,
// de 20 de setembro de 2010..."), e o que localiza a citação lá adiante é o
// número, não a frase.
export function leiTokens(ref) {
  const toks = [];
  const m = ref.match(/n[ºo°]\s*([\d.]+)/);
  if (m) toks.push(m[1]);
  const iat = ref.match(/IN(?:strução Normativa)?\s+IAT\s+n[ºo°]\s*(\d+)/i);
  if (iat)
    toks.push("IN IAT nº " + iat[1].replace(/^0/, ""), "IN IAT nº " + iat[1]);
  return toks.filter((t) => t.length > 2);
}

// Intercala os tipos de resultado em vez de ordenar tudo por pontuação.
// Sem isso, uma consulta que casa com muitas seções empurra a sigla e o
// quadro para fora das primeiras posições, e quem buscava a sigla não a
// encontra. A cota por rodada é 1 sigla, 1 quadro, 3 seções.
export function ordenaBusca(itens, q) {
  const n = norm(q);
  const pont = (x) => {
    const t = norm(x.title);
    return t.startsWith(n) ? 0 : t.includes(n) ? 1 : 2;
  };
  const por = { sigla: [], quadro: [], seção: [] };
  for (const x of itens) (por[x.type] || por["seção"]).push(x);
  for (const t of Object.keys(por)) por[t].sort((a, b) => pont(a) - pont(b));
  const cota = { sigla: 1, quadro: 1, seção: 3 },
    out = [];
  while (true) {
    let mexeu = false;
    for (const t of ["sigla", "quadro", "seção"])
      for (let i = 0; i < cota[t]; i++) {
        const x = por[t].shift();
        if (x) {
          out.push(x);
          mexeu = true;
        }
      }
    if (!mexeu) return out;
  }
}

// Trecho do resultado centrado no termo procurado, com reticências só onde
// houve corte.
export function snippet(text, q) {
  let clean = (text || "").replace(/\s+/g, " ").trim();
  let pos = norm(clean).indexOf(norm(q));
  if (pos < 0) return clean.slice(0, 180) + (clean.length > 180 ? "…" : "");
  return (
    (pos > 45 ? "…" : "") +
    clean.slice(Math.max(0, pos - 45), pos + 145) +
    (pos + 145 < clean.length ? "…" : "")
  );
}
