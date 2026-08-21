// Portão: nenhum travessão em texto autoral de tela.
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
const EXTENSOES = /\.(?:jsx?|css)$/;
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

if (falhas.length) {
  console.error("REPROVADO: travessão em texto autoral de tela.\n");
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    "\nSeparador entre rótulo e título usa ponto medio (·), que ja e o separador"
    + " desta interface. Dentro de frase, use dois-pontos ou virgula.",
  );
  process.exit(1);
}

console.log("OK: nenhum travessão em texto autoral de tela; 2 armadilhas do autoteste conferidas.");
