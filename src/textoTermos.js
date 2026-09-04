// Casamento de termo em texto livre.
//
// Estava duplicado entre a rubrica do laboratorio e o portao que a testa. A
// conferencia da minuta e o terceiro consumidor, e tres copias da mesma regra
// e como as tres divergirem em silencio: uma passa a aceitar o que a outra
// recusa, e nenhum teste percebe.
//
// A regra do termo curto existe por um caso concreto. Sigla de tres letras ou
// menos, como TR, UC, ZA ou o numero de um artigo, casaria dentro de outra
// palavra: "tr" aparece em "outro" e em "quatro". Ate tres caracteres o termo
// exige limite de palavra; acima disso a busca por substring e segura e aceita
// flexao, que e o que permite "insuficien" cobrir insuficiente e insuficiencia.

const DIACRITICOS = /\p{Mn}/gu;

export function normalizarTexto(valor = '') {
  return String(valor).normalize('NFD').replace(DIACRITICOS, '').toLowerCase();
}

/** `texto` precisa vir normalizado; `termo` e normalizado aqui. */
export function bateTermo(texto, termo) {
  const normalizado = normalizarTexto(termo).trim();
  if (!normalizado) return false;
  if (normalizado.length <= 3) {
    const seguro = normalizado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${seguro}([^a-z0-9]|$)`).test(texto);
  }
  return texto.includes(normalizado);
}

/** Verdadeiro quando ao menos um termo do grupo aparece no texto normalizado. */
export function bateAlgum(texto, termos = []) {
  return termos.some((termo) => bateTermo(texto, termo));
}
