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

// Norma de numero curto, sempre com o ano colado.
//
// O corte de tres digitos acima existe porque `art. 36` e `inciso II` viram
// numero solto e enchiam o portao de falso positivo. So que ele abria um buraco
// do tamanho do problema que este arquivo existe para impedir: `Portaria IAT
// no 12/2024`, `Instrucao Normativa IAT no 09/2025` e `Instrucao Normativa
// Ibama no 08/2019` passavam sem nenhuma verificacao. As tres sustentam as
// afirmacoes mais pesadas do guia do empreendedor, incluindo onde a exigencia
// documental por fase mora.
//
// O ano e o que desfaz a ambiguidade: artigo e inciso nao vem com `/2024`.
// Comparar numero e ano juntos tambem evita casar a Portaria 12/2024 com uma
// Resolucao 12/1998 qualquer.
//
// O `(?<![\d.])` nao e detalhe: sem ele a primeira execucao acusou
// `Decreto no 6.848/2009` e `Lei Federal no 12.187/2009`, capturando so os tres
// digitos finais antes da barra e inventando as normas 848/2009 e 187/2009.
// Numero curto de verdade nao vem precedido de digito nem de milhar.
const CITACAO_CURTA = new RegExp(
  `\\b(${TIPOS})\\b[^.;:\\n]{0,48}?\\bn?[ºo°]?\\.?\\s*(?<![\\d.])(\\d{1,3})\\s*/\\s*((?:19|20)\\d{2})\\b`,
  "gi",
);

/** Numero sem zero a esquerda: o POP escreve `012/2024` e a tela, `12/2024`. */
const semZeros = (n) => String(Number.parseInt(n, 10));

/** Normas de numero curto citadas, como `numero/ano`. */
export function normasCurtasCitadas(texto) {
  const achadas = new Map();
  for (const m of texto.matchAll(CITACAO_CURTA)) {
    achadas.set(`${semZeros(m[2])}/${m[3]}`, m[1].toLowerCase());
  }
  return achadas;
}

/** Pares `numero/ano` que um texto apresenta, para servir de lastro. */
export function normasCurtasDaFonte(texto) {
  const pares = new Set();
  for (const m of texto.matchAll(/\b(\d{1,3})\s*\/\s*((?:19|20)\d{2})\b/g)) {
    pares.add(`${semZeros(m[1])}/${m[2]}`);
  }
  return pares;
}

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

// Lastro das normas de numero curto. O POP e o registro inteiro servem de
// fonte: aqui o par numero e ano ja e especifico o bastante para nao casar por
// acaso, entao nao ha ganho em restringir a janela em torno da URL.
const curtasDaFonte = normasCurtasDaFonte(fonte);
const curtasDoRegistro = normasCurtasDaFonte(registro);

const falhas = [];
const conferidas = new Set();
const curtasConferidas = new Set();
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
  for (const [par, tipo] of normasCurtasCitadas(texto)) {
    curtasConferidas.add(par);
    if (!curtasDaFonte.has(par) && !curtasDoRegistro.has(par)) {
      falhas.push(
        `${nome}: ${tipo} ${par} citada sem lastro: nao esta no POP nem no `
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
if (!normasCurtasCitadas("conforme a Portaria IAT nº 77/2031").has("77/2031")) {
  falhas.push("autoteste: nao reconheceu norma de numero curto com ano");
}
if (normasCurtasCitadas("o art. 36 e o inciso II").size > 0) {
  falhas.push("autoteste: confundiu artigo com norma de numero curto");
}
// O POP escreve `Portaria IAT no 012/2024`; a tela escreve `12/2024`. Sem
// normalizar o zero a esquerda, o portao reprovaria quem cita corretamente.
if (!normasCurtasDaFonte("Portaria IAT nº 012/2024").has("12/2024")) {
  falhas.push("autoteste: nao normalizou o zero a esquerda do numero da norma");
}
// A armadilha que a primeira execucao deste portao caiu: o milhar antes da
// barra virava uma norma curta inexistente.
if (normasCurtasCitadas("o Decreto nº 6.848/2009 e a Lei Federal nº 12.187/2009").size > 0) {
  falhas.push("autoteste: partiu um numero com milhar em norma curta inexistente");
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
  + `verificavel com URL oficial; mais ${curtasConferidas.size} norma(s) de numero `
  + "curto conferidas pelo par numero e ano; 7 armadilhas do autoteste conferidas.",
);
