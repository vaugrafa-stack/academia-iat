// Erros recorrentes que o POP já escreveu, ligados à aula que trata do termo.
//
// Por que existe. O checklist editorial de uma aula pede nove elementos, e o
// que mais falta e mais rende é o ERRO FREQUENTE: saber o engano que costuma
// acontecer vale mais que mais um exemplo certo. Escrever 159 erros do zero
// seria autoria em escala, com risco de inventar exigência.
//
// Não precisa. O POP já traz os erros, em duas colunas:
//
//   Quadro 8   "Erro recorrente a evitar"   25 termos operacionais
//   Quadro 22  "Limite e erro a evitar"     10 documentos técnicos
//
// São 35 erros escritos pela fonte, e estavam presos dentro de duas tabelas
// que a pessoa só vê se abrir aquele quadro específico. Aqui eles passam a
// aparecer na aula que trata do termo.
//
// O vínculo é por MENÇÃO EXPLÍCITA do termo no texto da própria seção, não por
// semelhança de assunto. Termo curto exige limite de palavra, senão "AA" casa
// dentro de "AAAA" e "LO" dentro de "LOCAL". Isso é o mesmo cuidado que a
// rubrica do laboratório já tomava.

const ACENTO = /[̀-ͯ]/g;

function norm(v = "") {
  return v.normalize("NFD").replace(ACENTO, "").toLowerCase();
}

/** A tabela declara coluna de erro? Devolve os índices, ou null. */
function colunasDeErro(table) {
  const cabecalho = table?.rows?.[0];
  if (!cabecalho?.isHeader) return null;
  const nomes = cabecalho.cells.map((c) => norm(c.text || ""));
  const erro = nomes.findIndex((n) => /erro|evitar|armadilha/.test(n));
  if (erro < 0) return null;
  // O termo é a primeira coluna; a definição, quando existe, é a do meio.
  const definicao = nomes.findIndex((n, i) => i !== 0 && i !== erro && /defini|limite|descri/.test(n));
  return { termo: 0, definicao: definicao >= 0 ? definicao : -1, erro };
}

/**
 * Lista de `{ termo, definicao, erro, quadro }` colhida de todas as tabelas do
 * POP que declaram uma coluna de erro.
 */
export function colherErros(popData) {
  const fora = [];
  for (const table of popData?.tables || []) {
    if (table.navigationOnly) continue;
    const col = colunasDeErro(table);
    if (!col) continue;
    for (const linha of table.rows.slice(1)) {
      const termo = (linha.cells[col.termo]?.text || "").trim();
      const erro = (linha.cells[col.erro]?.text || "").trim();
      if (!termo || erro.length < 12) continue;
      fora.push({
        termo,
        definicao: col.definicao >= 0 ? (linha.cells[col.definicao]?.text || "").trim() : "",
        erro,
        quadro: `${table.labelType} ${table.labelNumber}`,
        tabelaId: table.id,
      });
    }
  }
  return fora;
}

/** O termo aparece no texto? Termo curto exige limite de palavra. */
function mencionado(textoNorm, termo) {
  const t = norm(termo).trim();
  if (t.length < 2) return false;
  if (t.length <= 4) {
    const seguro = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${seguro}([^a-z0-9]|$)`).test(textoNorm);
  }
  return textoNorm.includes(t);
}

/**
 * Erros recorrentes pertinentes a uma aula, no máximo `limite`.
 *
 * `textoDaAula` deve incluir título e corpo. A ordem privilegia o termo mais
 * longo, porque termo longo é mais específico: numa aula que fala de PACUERA e
 * de AA, o erro sobre PACUERA ensina mais.
 */
export function errosDaAula(erros, textoDaAula, limite = 3) {
  const alvo = norm(textoDaAula || "");
  if (!alvo) return [];
  return erros
    .filter((e) => mencionado(alvo, e.termo))
    .sort((a, b) => b.termo.length - a.termo.length)
    .slice(0, limite);
}
