// Como ler um quadro do POP, derivado das colunas que ele realmente tem.
//
// Por que existe. Trinta e uma aulas tem como conteudo proprio apenas um
// quadro: o texto da secao e a legenda dele repetida. A tabela era renderizada
// crua, e quem estuda via uma grade de celulas sem saber para que serve.
//
// A medicao dos 64 quadros mostrou que a maioria nao e lista de referencia, e
// sim INSTRUMENTO DE DECISAO, com o mesmo esqueleto:
//
//   Status                  17 quadros
//   O que verificar         14
//   Encaminhamento padrao   13
//   Criterio de analise     10
//   Conteudo minimo         10
//
// Ou seja, o metodo do POP inteiro esta dentro das tabelas: o que conferir, o
// que o achado vira e para onde vai. Este modulo torna esse esqueleto visivel.
//
// A coluna Gravidade saiu do POP. O vocabulario dela saiu junto, senao o
// modulo continuaria prometendo explicar uma coluna que nao existe mais.
//
// O que ele NAO faz: acrescentar exigencia. Cada frase descreve o PAPEL da
// coluna dentro do instrumento, que e fato sobre a estrutura do quadro, e nao
// interpretacao do que a norma manda. A leitura sai do quadro em tempo de
// execucao, entao nunca diverge do POP.

// Vocabulario das colunas recorrentes. A chave e comparada sem acento e em
// minusculas, e por prefixo, porque o POP usa "Encaminhamento" e
// "Encaminhamento padrao" para a mesma coisa.
const PAPEL = [
  ['o que verificar', 'o que conferir no documento, item por item'],
  ['como analisar', 'o que conferir no documento, item por item'],
  ['criterio de analise', 'a regra que separa suficiente de insuficiente'],
  ['criterio', 'a regra que separa suficiente de insuficiente'],
  ['conteudo minimo', 'o que precisa constar para o item ser considerado apresentado'],
  ['status', 'o resultado da conferência, que não é a mesma coisa que suficiência'],
  ['situacao', 'o resultado da conferência, que não é a mesma coisa que suficiência'],
  ['consequencia tecnica', 'o efeito do achado sobre a decisão, e não sobre a falta formal'],
  ['consequencia', 'o efeito do achado sobre a decisão, e não sobre a falta formal'],
  ['encaminhamento padrao', 'a providência que decorre do status e da consequência técnica'],
  ['encaminhamento', 'a providência que decorre do status e da consequência técnica'],
  ['erro recorrente a evitar', 'o engano que mais aparece neste ponto'],
  ['erro recorrente', 'o engano que mais aparece neste ponto'],
  ['quando usar', 'a situação em que este item se aplica'],
  ['item', 'o elemento conferido'],
  ['documento', 'o elemento conferido'],
  ['elemento', 'o elemento conferido'],
  // Os quatro abaixo apareciam sem papel em dez colunas de nove quadros. Sao
  // nomes que o POP usa para a mesma funcao estrutural das tres linhas acima,
  // e descrever a funcao nao acrescenta exigencia nenhuma.
  ['componente', 'o elemento conferido'],
  ['bloco', 'a parte do documento em que o item e conferido'],
  ['grupo', 'o agrupamento dos itens conferidos'],
  ['fonte ou evidencia', 'onde esta a prova do que foi conferido'],
];

// Colunas que caracterizam instrumento de decisao. Um quadro precisa de pelo
// menos duas para receber a leitura guiada: com uma so, e lista de referencia
// e explicar seria enfeite.
const DECISORIAS = new Set([
  'o que verificar', 'como analisar', 'criterio de analise', 'criterio',
  'conteudo minimo', 'status', 'situacao', 'consequencia tecnica', 'consequencia',
  'encaminhamento padrao', 'encaminhamento', 'erro recorrente a evitar',
  'erro recorrente',
]);

function chave(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function papelDa(nomeDaColuna) {
  const k = chave(nomeDaColuna);
  if (!k) return null;
  for (const [termo, papel] of PAPEL) {
    if (k === termo || k.startsWith(`${termo} `)) return papel;
  }
  return null;
}

/**
 * Leitura guiada de um quadro, ou null quando ele não é instrumento de decisão.
 *
 * Devolve as colunas na ordem em que aparecem, com o papel de cada uma, e o
 * total de linhas. A ordem importa: ela É o roteiro de uso do quadro.
 */
export function comoLerQuadro(table) {
  const cabecalho = table?.rows?.[0];
  if (!cabecalho?.isHeader) return null;

  const colunas = cabecalho.cells
    .map((c) => (c?.text || '').trim())
    .filter(Boolean)
    .map((nome) => ({ nome, papel: papelDa(nome), decisoria: DECISORIAS.has(chave(nome)) }));

  const decisorias = colunas.filter((c) => c.decisoria).length;
  if (decisorias < 2) return null;

  return {
    colunas,
    linhas: Math.max(0, (table.rowCount || table.rows.length) - 1),
    // Quando o quadro tem status E consequência, vale dizer em voz alta que são
    // coisas diferentes: um documento pode estar apresentado e ainda assim ser
    // insuficiente, e o quadro só funciona se as duas forem lidas separadas.
    separaStatusDeConsequencia:
      colunas.some((c) => ['status', 'situacao'].includes(chave(c.nome)))
      && colunas.some((c) => chave(c.nome).startsWith('consequencia')),
  };
}
