// Portão: nenhuma norma citada pela plataforma sem existir na fonte.
//
// A restrição é permanente e está no manual de operação: não inventar, e toda
// afirmação normativa sai do POP ou de ato verificável. Quando a fonte não
// sustenta, a resposta é recusar a alegação e não suavizá-la.
//
// Inventar número de lei é o erro mais caro possível neste domínio, porque a
// pessoa que estuda leva o número para dentro de um parecer. E era a restrição
// com menos verificação de todas: `check-provenance` confere o hash e as
// contagens do POP, `check-questoes` confere a fonte de cada questão, e nada
// olhava para as normas citadas no texto autoral das telas.
//
// Medido em 21/08/2026, na primeira execução: 7 normas distintas citadas em
// texto autoral, TODAS presentes no POP. O portão nasce verde, e é isso que se
// espera de uma trava contra regressão.
//
// Por que comparar por NÚMERO e não pelo par número e ano: a primeira versão
// desta medida exigia número e ano adjacentes e acusou o Decreto 6.848/2009
// como ausente. Ele está no POP, escrito "Decreto Federal nº 6.848, de 14 de
// maio de 2009". O ano estava a dez palavras de distância. Uma régua que exige
// a forma curta reprova a fonte por escrever certo.

import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const FONTE = "src/data/pop-content.json";
const EXTENSOES = /\.jsx?$/;
const IGNORAR = /[/\\](data|__fixtures__)[/\\]|\.(?:test|spec)\./;

const TIPOS = "Lei|Decreto|Resolução|Resoluções|Portaria|Instrução Normativa|Deliberação";
// Numero de norma brasileira: milhar com ponto opcional, de 3 a 6 digitos.
const CITACAO = new RegExp(
  `\\b(${TIPOS})\\b[^.;:\\n]{0,42}?\\bn?[ºo°]?\\.?\\s*(\\d{1,3}(?:\\.\\d{3})+|\\d{3,6})\\b`,
  "gi",
);

/** Numero sem pontuacao, para os dois lados compararem a mesma coisa. */
const limpar = (n) => n.replace(/\./g, "");

/** Normas citadas em um texto, como pares de tipo e numero. */
export function normasCitadas(texto) {
  const achadas = new Map();
  for (const m of texto.matchAll(CITACAO)) {
    const numero = limpar(m[2]);
    // Abaixo de tres digitos quase sempre e artigo, inciso ou ano truncado.
    if (numero.length < 3) continue;
    achadas.set(numero, m[1].toLowerCase());
  }
  return achadas;
}

/** Numeros que a FONTE apresenta em contexto normativo. */
export function normasDaFonte(texto) {
  const numeros = new Set();
  const contexto = new RegExp(`\\b(?:${TIPOS})\\b[^\\n]{0,120}`, "gi");
  for (const trecho of texto.match(contexto) || []) {
    for (const n of trecho.match(/\d{1,3}(?:\.\d{3})+|\b\d{3,6}\b/g) || []) {
      numeros.add(limpar(n));
    }
  }
  return numeros;
}

async function arquivosDe(pasta) {
  const entradas = await readdir(pasta, { withFileTypes: true });
  const listas = await Promise.all(entradas.map(async (e) => {
    const caminho = join(pasta, e.name);
    if (e.isDirectory()) return arquivosDe(caminho);
    return EXTENSOES.test(e.name) ? [caminho] : [];
  }));
  return listas.flat();
}

const fonte = await readFile(join(RAIZ, FONTE), "utf8");
const daFonte = normasDaFonte(fonte);

// A regra escrita e "do POP OU de ato verificavel", e a primeira versao deste
// portao codificou so a primeira metade. Ele acusou a REN ANEEL 1.070/2023 e a
// Resolucao ANA 286/2026, que sao atos reais, declarados em officialSources.js
// com URL oficial e data de conferencia. Reprovar quem cumpre a regra e pior do
// que nao verificar: ensina a desligar o portao.
//
// O registro de fontes oficiais e, portanto, o segundo lastro admitido. Uma
// norma citada la so vale como lastro se vier acompanhada de URL oficial: sem
// endereco, a citacao volta a ser afirmacao sem verificacao possivel.
const REGISTRO = "src/officialSources.js";
const registro = await readFile(join(RAIZ, REGISTRO), "utf8");
const comEndereco = new Set();
// `amendingUrl` entra junto de `officialUrl` porque as duas apontam para o
// texto oficial de um ato: uma para a norma, outra para a que a alterou. Sem
// isso a REN ANEEL 1.070/2023 ficava sem lastro por estar declarada no campo da
// norma alteradora. `supportingUrl` fica de fora de proposito: e pagina de
// portal, e nao o texto do ato.
for (const m of registro.matchAll(/(?:official|amending)Url:\s*['"]https?:/g)) {
  // Janela antes do endereco, que e onde o ato aparece no registro. Evita
  // dividir o arquivo por chaves, que quebraria a cada objeto aninhado.
  const janela = registro.slice(Math.max(0, m.index - 420), m.index);
  for (const [, , numero] of janela.matchAll(CITACAO)) comEndereco.add(limpar(numero));
}

const falhas = [];
const conferidas = new Set();
for (const arquivo of await arquivosDe(join(RAIZ, "src"))) {
  const nome = relative(RAIZ, arquivo).replaceAll("\\", "/");
  if (IGNORAR.test(nome)) continue;
  const texto = await readFile(arquivo, "utf8");
  for (const [numero, tipo] of normasCitadas(texto)) {
    conferidas.add(numero);
    if (!daFonte.has(numero) && !comEndereco.has(numero)) {
      falhas.push(
        `${nome}: ${tipo} ${numero} citada sem lastro: nao esta no POP nem no `
        + `registro de fontes oficiais com URL`,
      );
    }
  }
}

// Autoteste em toda execução. Portão que nunca reprovou é indistinguível de
// portão quebrado, e este nasce com a árvore limpa.
const INVENTADA = normasCitadas("conforme a Lei Federal nº 99.999, de 2031");
if (!INVENTADA.has("99999")) {
  falhas.push("autoteste: nao reconheceu uma citacao de norma");
}
if (normasDaFonte("Decreto Federal no 6.848, de 14 de maio de 2009").has("6848") === false) {
  falhas.push("autoteste: nao reconheceu a norma escrita por extenso na fonte");
}
if (normasCitadas("o artigo 36 e o inciso II").size > 0) {
  falhas.push("autoteste: confundiu artigo com numero de norma");
}

if (falhas.length) {
  console.error("REPROVADO: norma citada sem lastro na fonte.\n");
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    "\nToda afirmacao normativa sai do POP ou de ato verificavel. Se a fonte nao"
    + " sustenta, retire a alegacao em vez de suaviza-la.",
  );
  process.exit(1);
}

const soNoRegistro = [...conferidas].filter((n) => !daFonte.has(n) && comEndereco.has(n));
console.log(
  `OK: ${conferidas.size} norma(s) citada(s) em texto autoral, todas com lastro. `
  + `${conferidas.size - soNoRegistro.length} no POP e ${soNoRegistro.length} em ato `
  + "verificavel com URL oficial; 3 armadilhas do autoteste conferidas.",
);
