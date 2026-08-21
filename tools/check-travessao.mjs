// Portão: caractere que não devia estar no fonte.
//
// Guarda duas coisas, que parecem distantes e são o mesmo problema: um símbolo
// escrito onde não podia. Uma é regra de estilo institucional, a outra é
// correção pura.
//
// 1. Travessão em texto autoral de tela.
//
// A restrição é permanente e está no manual de operação do projeto: sem
// travessão em texto autoral, inclusive legenda de vídeo. É estilo
// institucional do IAT, e vale para tudo que a plataforma mostra.
//
// Ela existia sem NENHUMA régua. Medido em 20/08/2026: 17 trechos de texto de
// tela usavam U+2014, em oito arquivos, e o portão editorial passava limpo em
// 487 arquivos porque a regra simplesmente não estava na lista dele. Havia
// travessão no título da folha-resposta, na marca d'água do documento de
// exemplo, no cabeçalho do diagnóstico e na instrução do corte hidrelétrico.
//
// Regra que ninguém verifica não é regra, é intenção.
//
// O que este portão NÃO cobre, dito por escrito para não dar a impressão de
// cobrir: comentário de código em linha própria. São 18 ocorrências hoje, em
// tools e em questionsCoverage.js, e nenhuma chega à tela. Travessão em
// comentário de fim de linha, esse sim, reprova, porque a fronteira entre
// comentário e string ali é frágil demais para eu confiar nela.

import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const PASTAS = ["src"];
const EXTENSOES = /\.(?:jsx?|mjs|css)$/;
const TRAVESSAO = /—/;

async function arquivosDe(pasta) {
  const entradas = await readdir(pasta, { withFileTypes: true });
  const listas = await Promise.all(entradas.map(async (e) => {
    const caminho = join(pasta, e.name);
    if (e.isDirectory()) return arquivosDe(caminho);
    return EXTENSOES.test(e.name) && !/\.(?:test|spec)\./.test(e.name) ? [caminho] : [];
  }));
  return listas.flat();
}

/** Linha inteiramente de comentário não chega à tela. */
export function ehComentarioDeLinhaInteira(linha) {
  const t = linha.trim();
  return t.startsWith("//") || t.startsWith("*") || t.startsWith("/*");
}

/** Ocorrências de travessão que a pessoa usuária pode ler. */
export function travessoesVisiveis(fonte) {
  const achados = [];
  fonte.split(/\r?\n/).forEach((linha, i) => {
    if (ehComentarioDeLinhaInteira(linha)) return;
    if (TRAVESSAO.test(linha)) achados.push({ linha: i + 1, texto: linha.trim().slice(0, 90) });
  });
  return achados;
}

const falhas = [];
for (const pasta of PASTAS) {
  for (const arquivo of await arquivosDe(join(RAIZ, pasta))) {
    const fonte = await readFile(arquivo, "utf8");
    for (const a of travessoesVisiveis(fonte)) {
      falhas.push(`${relative(RAIZ, arquivo).replaceAll("\\", "/")}:${a.linha} ${a.texto}`);
    }
  }
}

// Autoteste em toda execução. Portão que nunca reprovou é indistinguível de
// portão quebrado, e este nasce com a árvore já limpa: sem armadilha, passaria
// para sempre sem provar nada.
const DEVE_ACUSAR = 'const t = "Caso A — título";';
const NAO_PODE_ACUSAR = "// M00 — orientação e controle documental";
if (travessoesVisiveis(DEVE_ACUSAR).length !== 1) {
  falhas.push("autoteste: deveria acusar travessão em string e não acusou");
}
if (travessoesVisiveis(NAO_PODE_ACUSAR).length !== 0) {
  falhas.push("autoteste: acusou travessão em comentário de linha inteira");
}

// 2. Caractere de controle no fonte.
//
// Entrou nesta base em 21/08/2026 e quase passou. Um \\b escrito em string
// Python não bruta vira o caractere backspace, 0x08, e o que foi gravado em
// tools/sanitize-public-data.mjs foram quatro padrões exigindo backspaces
// literais no meio do CNPJ. Padrão que nunca casa, portão que nunca acusa, e
// grep mostrando a regra como se estivesse certa: o byte 0x08 é invisível na
// saída do terminal.
//
// É a pior forma de defeito de portão, porque produz garantia falsa. Só
// apareceu porque testei a função com um CNPJ plantado em vez de confiar na
// leitura do código.
//
// A varredura cobre fonte, ferramentas e testes, que é onde regra escrita vira
// regra executada. Tabulação, quebra de linha e retorno de carro ficam de fora,
// porque são texto normal.
const CONTROLE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const NOME_DO_BYTE = (c) => "0x" + c.codePointAt(0).toString(16).padStart(2, "0");
for (const pasta of ["src", "tools", "tests"]) {
  let lista = [];
  try {
    lista = await arquivosDe(join(RAIZ, pasta));
  } catch {
    continue;
  }
  for (const arquivo of lista) {
    const fonte = await readFile(arquivo, "utf8");
    fonte.split(/\r?\n/).forEach((linha, i) => {
      const m = linha.match(CONTROLE);
      if (!m) return;
      falhas.push(
        `${relative(RAIZ, arquivo).replaceAll("\\", "/")}:${i + 1} caractere de `
        + `controle ${NOME_DO_BYTE(m[0])}, invisivel no terminal e capaz de tornar `
        + "um padrao inerte",
      );
    });
  }
}

if (!CONTROLE.test("padrao \u0008 com backspace")) {
  falhas.push("autoteste: nao reconheceu caractere de controle");
}
if (CONTROLE.test("linha\tcom\ttabulacao")) {
  falhas.push("autoteste: acusou tabulacao como caractere de controle");
}

if (falhas.length) {
  console.error("REPROVADO: caractere que nao devia estar no fonte.\n");
  for (const f of falhas) console.error(`  ${f}`);
  // A orientação segue o tipo de falha. Mandar trocar por ponto medio quem
  // gravou um byte de controle manda consertar a coisa errada.
  if (falhas.some((f) => f.includes("travessão") || f.includes("—"))) {
    console.error(
      "\nSeparador entre rótulo e título usa ponto medio (·), que ja e o separador"
      + " desta interface. Dentro de frase, use dois-pontos ou virgula.",
    );
  }
  if (falhas.some((f) => f.includes("controle"))) {
    console.error(
      "\nCaractere de controle costuma vir de escape resolvido cedo demais: um \\b"
      + " em string Python nao bruta vira backspace, e um \\0 vira nulo. Escreva o"
      + " arquivo com string bruta, ou monte o padrao no proprio JavaScript.",
    );
  }
  process.exit(1);
}

console.log(
  "OK: nenhum travessão em texto autoral de tela e nenhum caractere de controle"
  + " em src, tools e tests; 4 armadilhas do autoteste conferidas.",
);
