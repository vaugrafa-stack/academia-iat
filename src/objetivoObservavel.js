// Objetivo observável de cada seção, derivado do próprio POP.
//
// O problema que este arquivo resolve: `learningDesign.js` escolhe o objetivo
// por perfil de palavra-chave no título. São 11 perfis para 167 seções, então
// um mesmo texto aparece em 41 aulas diferentes. Quem percorre o curso lê a
// mesma promessa repetidas vezes, e promessa repetida deixa de orientar.
//
// A saída tem duas partes, e a segunda é a que faltava:
//
//   objetivo  o que a pessoa consegue fazer ao final
//   comoSeVe  como ela sabe que consegue, em vez de achar que sabe
//
// Nada é inventado. Cada objetivo vem de material que já está no POP, em três
// origens, nesta ordem de preferência:
//
//   quadro     a seção tem quadro próprio; as colunas são o que se reconstrói
//   acao       o POP nomeia uma ação de análise; ela vira o objetivo
//   exigencia  o POP fixa uma exigência; ela é citada e localizada nos autos
//
// Sem nenhuma delas, devolve null, e quem chama continua com o perfil antigo.
// Devolver null é resposta legítima: índice não tem objetivo de aprendizagem,
// e forçar um seria exatamente o texto genérico que este arquivo elimina.
//
// Onde há risco de redação, o texto do POP entra entre aspas. Isso não é
// preguiça: citar resolve concordância de gênero e número sem reescrever, e
// reescrever norma é onde se inventa sem perceber.

/**
 * Verbos que descrevem o que quem analisa faz.
 *
 * Lista fechada de propósito. Extrair qualquer infinitivo depois de "deve"
 * produz objetivo com sujeito errado: "A leitura deve ser feita de forma
 * cronológica" viraria "você consegue ser feita de forma cronológica". Voz
 * passiva e verbo de estado descrevem o documento, não a pessoa.
 */
const ACOES_DE_ANALISE = [
  "verificar", "identificar", "registrar", "analisar", "distinguir",
  "comparar", "confrontar", "conferir", "avaliar", "examinar", "classificar",
  "indicar", "apontar", "justificar", "motivar", "descrever", "delimitar",
  "apresentar", "solicitar", "consultar", "aplicar", "observar",
  "compatibilizar", "evitar", "separar", "demonstrar", "comprovar",
  "fundamentar", "concluir", "orientar", "instruir", "reconstituir", "adotar",
  "exigir", "informar", "anexar", "juntar", "calcular", "medir", "localizar",
  "relacionar",
];

const VERBOS = ACOES_DE_ANALISE.join("|");

/**
 * Corpo da ação: até o fim da frase, sem teto.
 *
 * O ponto é liberado entre dígitos, e só aí. Sem essa exceção, a ação
 * "atender aos critérios do Decreto Estadual nº 9.541/2025" é cortada em
 * "nº 9", e citação truncada faz a norma parecer dizer outra coisa.
 *
 * O teto saiu daqui de propósito. Quando ele era `{5,150}`, a expressão parava
 * no caractere 150, onde quer que ele caísse: saíam objetivos terminando em
 * "condicionantes anteri", "análise conjunta ou separad" e "bases ge". Palavra
 * cortada ao meio é pior do que frase longa, porque parece defeito de sistema e
 * derruba a confiança no resto da tela. Encurtar agora é trabalho de `encurtar`,
 * que corta em vírgula ou em espaço, nunca dentro de palavra.
 */
const CORPO = "(?:[^.;:]|(?<=\\d)\\.(?=\\d)){5,}";

/** "o analista deve verificar ..." e variações de pessoa e número. */
const DEVER_MAIS_ACAO = new RegExp(
  `\\b(?:dever[áã]o?|devem|deve)\\s+((?:${VERBOS})\\b${CORPO})`,
  "i",
);

/** Item de procedimento que já começa no infinitivo: "Identificar o documento". */
const COMECA_EM_ACAO = new RegExp(`^((?:${VERBOS})\\b${CORPO})`, "i");

/**
 * Frase que fixa uma exigência, mesmo sem ação atribuível a quem analisa.
 *
 * A fronteira exige cuidado com dois enganos, os dois já cometidos aqui:
 *
 * 1. **"deveria" não é exigência, é hipótese.** O POP usa o condicional para
 *    DESCREVER erro: "condicionante que tenta sanar pendência impeditiva que
 *    deveria ser resolvida antes do deferimento" é item de lista de armadilhas.
 *    Casando com `deve` solto, essa frase virava "Aplicar o que o POP fixa
 *    aqui: condicionante que tenta sanar pendência impeditiva", ou seja, a
 *    plataforma mandava fazer exatamente o que o POP manda evitar. Num domínio
 *    onde a aula orienta decisão administrativa, esse engano não é estético.
 * 2. **`\b` não serve para separar palavra em português.** Em JavaScript,
 *    `\w` é `[A-Za-z0-9_]`, então "á" e "ç" contam como NÃO-palavra e `\bdeve\b`
 *    casa dentro de "deverá". A separação correta é por ausência de letra
 *    Unicode, com `\p{L}`. O mesmo engano já tinha produzido oito acusações
 *    falsas num verificador, porque `/\bo\.$/` casa dentro de "transição.".
 */
const SEM_LETRA_ANTES = "(?<![\\p{L}\\p{M}])";
const SEM_LETRA_DEPOIS = "(?![\\p{L}\\p{M}])";
const EXIGENCIA = new RegExp(
  SEM_LETRA_ANTES
  + "(?:deve|devem|deverá|deverão|é\\s+obrigatóri[ao]s?|não\\s+pode|não\\s+podem"
  + "|é\\s+vedad[ao]s?|veda|vedam|exige|exigem|exigido|exigida)"
  + SEM_LETRA_DEPOIS,
  "iu",
);

const MIN_FRASE = 45;
const MAX_CABECALHO = 70;
const MAX_CITACAO = 200;
const MAX_ACAO = 160;

/**
 * Abreviação que ficou pendurada no fim da captura.
 *
 * "com atenção ao art." acontece porque o corpo da ação para no ponto de
 * "art. 5", e sobra uma remissão sem destino. Ler "com atenção ao art." é pior
 * do que não ler nada: promete um artigo que a frase não diz qual é.
 */
const ABREVIACAO_PENDURADA =
  /[,;]?\s+(?:com\s+aten[çc][ãa]o\s+ao\s+|conforme\s+o\s+|nos\s+termos\s+do\s+|previsto\s+no\s+)?(?:art|arts|inc|al[íi]nea|par[áa]grafo|cap|item|n|n[ºo]|Lei|Decreto|Resolu[çc][ãa]o|Portaria|IN)\.?$/i;

function semAbreviacaoPendurada(texto) {
  let atual = String(texto || "").trim();
  for (let volta = 0; volta < 3; volta += 1) {
    const cortado = atual.replace(ABREVIACAO_PENDURADA, "");
    if (cortado === atual) break;
    atual = cortado.trim();
  }
  return atual;
}

/**
 * Palavra que não pode terminar um objetivo.
 *
 * A captura tem teto de 150 caracteres e às vezes cai no meio de uma
 * enumeração, deixando "e se a" ou "sem substituir a competência do". O leitor
 * fica esperando o complemento que nunca vem.
 */
const PALAVRA_DE_LIGACAO = new Set([
  "de", "da", "do", "das", "dos", "e", "ou", "a", "o", "as", "os", "com",
  "para", "que", "em", "no", "na", "nos", "nas", "ao", "aos", "à", "às",
  "sem", "sob", "sobre", "entre", "por", "pelo", "pela", "se", "quando",
  "conforme", "ante", "após", "até", "desde", "perante", "um", "uma",
]);

/**
 * Encurta sem quebrar palavra.
 *
 * Corta na última vírgula que sobrou dentro do limite, porque enumeração menor
 * e inteira vale mais que maior e quebrada. Se a vírgula estiver perto demais
 * do começo, o corte perderia o sentido, e aí corta no último espaço.
 */
function encurtar(texto, maximo) {
  if (texto.length <= maximo) return texto;
  const corte = texto.slice(0, maximo);
  const virgula = corte.lastIndexOf(",");
  if (virgula > maximo * 0.45) return corte.slice(0, virgula);
  const espaco = corte.lastIndexOf(" ");
  return espaco > 0 ? corte.slice(0, espaco) : corte;
}

/**
 * Corta a cauda incompleta, de preferência na última vírgula.
 *
 * Voltar até a vírgula preserva uma enumeração menor porém inteira, que é
 * melhor do que uma maior e quebrada. Sem vírgula, tira palavra por palavra.
 */
function semCaudaIncompleta(texto) {
  let atual = String(texto || "").trim();
  for (let volta = 0; volta < 12; volta += 1) {
    const ultima = atual.split(/\s+/).pop()?.toLowerCase().replace(/[,;]$/, "");
    if (!ultima || !PALAVRA_DE_LIGACAO.has(ultima)) break;
    const virgula = atual.lastIndexOf(",");
    atual =
      virgula > 20
        ? atual.slice(0, virgula).trim()
        : atual.split(/\s+/).slice(0, -1).join(" ").trim();
  }
  return atual.replace(/[,;]+$/, "").trim();
}

/**
 * Abreviação seguida de espaço, que NÃO encerra frase.
 *
 * "O art. 13 estabelece regra específica" tem ponto seguido de espaço, igual a
 * um fim de frase. Cortar ali produz a citação "13 estabelece regra
 * específica", que perde o artigo de que fala e vira remissão a lugar nenhum.
 */
const ABREVIACAO_NO_MEIO =
  /(?:^|\s)(?:art|arts|inc|al|par|cap|item|fl|fls|p|pp|n|no|res|dec|lei|sr|sra|dr|dra|etc|ex|obs|aprox)\.$/i;

/**
 * Divide em frases.
 *
 * "Decreto nº 9.541/2025" fica inteiro sem tratamento: ali o ponto é seguido
 * de dígito, e o corte exige espaço. O que precisa de cuidado é a abreviação,
 * tratada remontando os pedaços partidos indevidamente.
 */
export function emFrases(texto) {
  const pedacos = String(texto || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.;])\s+/);
  const frases = [];
  for (const pedaco of pedacos) {
    const anterior = frases[frases.length - 1];
    if (anterior && ABREVIACAO_NO_MEIO.test(anterior)) {
      frases[frases.length - 1] = `${anterior} ${pedaco}`;
    } else {
      frases.push(pedaco);
    }
  }
  return frases
    .map((frase) => frase.trim())
    .filter((frase) => frase.length >= MIN_FRASE);
}

function paragrafos(blocks = []) {
  return blocks
    .filter(
      (block) =>
        block?.type === "paragraph" &&
        !block.navigationOnly &&
        block.paragraph?.text &&
        !block.paragraph?.headingLevel,
    )
    .map((block) => block.paragraph.text);
}

function maiuscula(texto) {
  const limpo = String(texto || "").trim();
  return limpo ? limpo[0].toUpperCase() + limpo.slice(1) : "";
}

function semPontoFinal(texto) {
  return String(texto || "").replace(/[.,;:\s]+$/, "");
}

/** Cabeçalho da tabela, quando ela realmente tem um. */
function colunasDoQuadro(tabela) {
  const cabecalho = (tabela?.rows || []).find((linha) => linha.isHeader);
  if (!cabecalho) return null;
  const colunas = (cabecalho.cells || [])
    .map((celula) => String(celula?.text || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  // Índice navegável tem "cabeçalho" que é conteúdo: uma célula com o título
  // inteiro de uma seção. Cabeçalho de verdade é rótulo curto.
  if (colunas.length < 2 || colunas.length > 6) return null;
  if (colunas.some((coluna) => coluna.length > MAX_CABECALHO)) return null;
  return colunas;
}

// O POP reparte um quadro em partes com letra: "Quadro 33: A", "Quadro 33: B".
// A extração guarda só o número, então quatro seções diferentes recebiam a
// mesma referência, e duas delas, com o mesmo número de linhas, produziam o
// mesmo objetivo palavra por palavra. A letra é o que as distingue.
const SUBLETRA = /^\s*(?:Quadro|Tabela)\s+\d+\s*[:.\-–]\s*([A-Z])\b/i;

function referenciaDoQuadro(tabela) {
  if (tabela?.labelType && tabela?.labelNumber != null) {
    const letra = String(tabela?.caption || "").match(SUBLETRA);
    const sufixo = letra ? ` ${letra[1].toUpperCase()}` : "";
    return `${tabela.labelType} ${tabela.labelNumber}${sufixo}`;
  }
  const legenda = String(tabela?.caption || "").trim();
  const encontrado = legenda.match(/^((?:Quadro|Tabela|Anexo)\s+[\dA-Z]+)/i);
  return encontrado ? encontrado[1] : legenda || null;
}

/**
 * Concordância do rótulo do quadro.
 *
 * "Quadro" é masculino e "Tabela" é feminino, e o POP usa os dois. Sem isto
 * saía "Percorrer as 7 linhas do Tabela 1 sem consultá-lo", em vinte aulas.
 * Erro de concordância na primeira linha da tela custa mais do que parece: a
 * pessoa passa a ler o resto com desconfiança.
 */
function generoDoRotulo(referencia) {
  return /^tabela/i.test(String(referencia || ""))
    ? { de: "da", pronome: "consultá-la" }
    : { de: "do", pronome: "consultá-lo" };
}

/**
 * Acima disto, decorar deixa de ser objetivo honesto.
 *
 * O Quadro 46 tem 102 siglas e o Quadro 9 tem 30. Prometer "percorrer as 102
 * linhas sem consultar" é prometer o que ninguém faz e o que ninguém precisa
 * fazer: tabela de referência existe para ser consultada. O objetivo real ali é
 * saber que ela existe, o que responde e onde procurar.
 */
const LIMITE_MEMORIZAVEL = 30;

/** Lista em português: "A", "A e B", "A, B e C". */
function enumerar(itens) {
  if (itens.length === 1) return itens[0];
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function aspas(texto) {
  return `“${texto}”`;
}

/**
 * O objetivo observável de uma seção.
 *
 * @param {object} secao seção do POP, com `navigationOnly` e `blockIds`
 * @param {Array} blocks blocos da seção, já resolvidos
 * @param {Map} tabelasPorId id da tabela para a tabela
 * @returns {{objetivo: string, comoSeVe: string, origem: string, referencia: string|null}|null}
 */
export function objetivoObservavel(secao, blocks = [], tabelasPorId = new Map()) {
  if (!secao || secao.navigationOnly) return null;

  // 1. Quadro próprio. As colunas dizem o que se reconstrói, e isso é
  //    verificável: ou a pessoa chega às demais colunas a partir da primeira,
  //    ou não chega.
  const blocoDeTabela = blocks.find(
    (block) => block?.type === "table" && !block.navigationOnly,
  );
  if (blocoDeTabela) {
    const tabela = tabelasPorId.get(blocoDeTabela.tableId);
    const colunas =
      tabela && !tabela.navigationOnly ? colunasDoQuadro(tabela) : null;
    if (colunas) {
      const referencia = referenciaDoQuadro(tabela);
      const linhas = Math.max(0, (tabela.rowCount || 0) - 1);
      const { de, pronome } = generoDoRotulo(referencia);
      const [primeira, ...demais] = colunas;

      if (linhas > LIMITE_MEMORIZAVEL) {
        return {
          origem: "quadro",
          referencia,
          objetivo: `Usar ${de.slice(1)} ${referencia}, com ${linhas} linhas, como referência de consulta.`,
          comoSeVe:
            `Diante de ${aspas(primeira)}, você sabe que a resposta está ali e ` +
            `em qual coluna: ${enumerar(demais.map(aspas))}.`,
        };
      }

      return {
        origem: "quadro",
        referencia,
        objetivo: linhas
          ? `Percorrer as ${linhas} linhas ${de} ${referencia} sem ${pronome}.`
          : `Percorrer ${de.slice(1)} ${referencia} sem ${pronome}.`,
        comoSeVe:
          `Dada a coluna ${aspas(primeira)}, você reconstrói ` +
          `${enumerar(demais.map(aspas))}.`,
      };
    }
  }

  const frases = paragrafos(blocks).flatMap(emFrases);
  if (!frases.length) return null;

  // 2. Ação de análise nomeada pelo POP.
  for (const frase of frases) {
    const bruta =
      frase.match(DEVER_MAIS_ACAO)?.[1] || frase.match(COMECA_EM_ACAO)?.[1];
    const acao =
      bruta &&
      semCaudaIncompleta(
        semAbreviacaoPendurada(encurtar(semPontoFinal(bruta), MAX_ACAO)),
      );
    // Piso de tamanho e de palavras. "Registrar, no mínimo" vira "Registrar",
    // que não é objetivo de nada: promete uma ação sem dizer sobre o quê. Cair
    // para a exigência citada é melhor do que exibir uma promessa vazia.
    if (acao && acao.length >= 30 && acao.split(/\s+/).length >= 4) {
      return {
        origem: "acao",
        referencia: null,
        objetivo: `${maiuscula(acao)}.`,
        comoSeVe:
          "Num processo real, você mostra onde isso foi feito, onde não foi " +
          "e qual a consequência técnica da falta.",
      };
    }
  }

  // 3. Exigência citada. Não há ação atribuível a quem analisa, mas há regra,
  //    e reconhecer a regra nos autos já é verificável.
  //
  //    Escolhe a MAIS CURTA entre as que cabem. Regra curta costuma ser a
  //    regra nua ("Toda manifestação técnica deve ser construída de forma
  //    rastreável"); regra longa vem cheia de ressalva e enumeração, que é
  //    conteúdo da aula, não promessa dela. Cortar a citação não é opção:
  //    citação truncada faz a norma dizer o que ela não diz.
  //
  //    Se nem a mais curta couber, devolve null. Objetivo de 290 caracteres no
  //    cabeçalho da aula não orienta ninguém, e o perfil antigo, genérico mas
  //    curto, serve melhor nessas poucas seções do que uma parede de texto.
  const exigencia = frases
    .filter((frase) => EXIGENCIA.test(frase) && frase.length <= MAX_CITACAO)
    .sort((a, b) => a.length - b.length)[0];
  if (exigencia) {
    return {
      origem: "exigencia",
      referencia: null,
      objetivo: `Aplicar o que o POP fixa aqui: ${aspas(semPontoFinal(exigencia))}.`,
      comoSeVe:
        "Num processo real, você localiza onde a exigência foi atendida, " +
        "onde não foi, e diz a consequência técnica da falta.",
    };
  }

  return null;
}
