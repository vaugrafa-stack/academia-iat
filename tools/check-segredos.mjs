// Portão: nem credencial nem documento entram na árvore versionada.
//
// Este repositório é PÚBLICO, e já falhou nas duas coisas:
//
//   caebefb  removeu contatos.csv, com dados de contato de 700 empreendimentos
//   83bb215  removeu senha padrão que estava escrita no código
//
// Remover depois não desfaz: o que foi publicado ficou no histórico e em
// qualquer cópia. A única defesa que funciona é não deixar entrar, e é isso que
// este portão faz, na mesma passada em que os outros dezenove rodam.
//
// O segundo motivo é a Área Técnica Restrita. Ela vai receber documento real de
// processo administrativo, e o desenho decidiu que isso mora em outra origem,
// noutro repositório, nunca aqui. Um `.pdf` ou um `.docx` aparecendo nesta
// árvore é o sintoma de que alguém confundiu os dois lados.
//
// Escopo: o que o Git realmente versiona. Arquivo ignorado não é publicado, e
// vasculhar a pasta inteira acusaria `node_modules` e `dist` sem motivo.

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { extname } from "node:path";

const falhas = [];
const reprovar = (msg) => falhas.push(msg);

/**
 * Extensões que não têm o que fazer aqui.
 *
 * Documento de escritório e arquivo compactado carregam dado que a plataforma
 * pública nunca precisa: processo, planilha de contato, base geoespacial de
 * empreendimento. O conteúdo do POP entra por extração para JSON, já
 * higienizado por outro portão, e não pelo arquivo original.
 */
const EXTENSOES_PROIBIDAS = new Map([
  [".pdf", "documento"],
  [".doc", "documento"],
  [".docx", "documento"],
  [".rtf", "documento"],
  [".odt", "documento"],
  [".xls", "planilha"],
  [".xlsx", "planilha"],
  [".xlsm", "planilha"],
  [".ods", "planilha"],
  [".csv", "planilha"],
  [".ppt", "apresentação"],
  [".pptx", "apresentação"],
  [".kmz", "geoespacial"],
  [".kml", "geoespacial"],
  [".shp", "geoespacial"],
  [".dbf", "geoespacial"],
  [".shx", "geoespacial"],
  [".gpkg", "geoespacial"],
  [".zip", "arquivo compactado"],
  [".rar", "arquivo compactado"],
  [".7z", "arquivo compactado"],
  [".pfx", "chave"],
  [".p12", "chave"],
  [".pem", "chave"],
  [".key", "chave"],
]);

/**
 * Padrões de credencial.
 *
 * Cada um tem de casar com o que já aconteceu ou com o que aconteceria, e não
 * com a palavra solta. `senha` num texto didático é assunto; `senha = "..."` é
 * credencial. A diferença é a atribuição a um literal.
 */
const PADROES = [
  [
    "credencial atribuída a literal",
    /\b(?:senha|password|passwd|pwd|secret|client_?secret|api_?key|apikey|access_?token|refresh_?token|private_?key|credencial)\b\s*[:=]\s*["'`][^"'`\n]{8,}["'`]/i,
  ],
  ["chave privada em PEM", /-----BEGIN\s+(?:RSA\s+|EC\s+|OPENSSH\s+|PGP\s+)?PRIVATE KEY-----/],
  ["token de acesso do GitHub", /\bgh[pousr]_[A-Za-z0-9]{16,}/],
  ["chave da AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["chave de API do Google", /\bAIza[0-9A-Za-z_-]{20,}/],
  ["cabeçalho Authorization com valor", /\bAuthorization\s*:\s*["'`]?(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{12,}/],
  [
    "resumo de credencial guardado como constante",
    /\b(?:CREDENCIAL|SENHA|PASSWORD|SECRET|HASH_?SENHA)[A-Z_]*\s*=\s*\n?\s*["'`][a-f0-9]{32,}["'`]/i,
  ],
];

/**
 * Onde procurar credencial.
 *
 * Só código e configuração. `src/data/` fica de fora de propósito: é conteúdo
 * extraído do POP, tem `sha256` de proveniência que casaria com o padrão de
 * resumo, e já passa por `sanitize-public-data` e `check-provenance`. Procurar
 * segredo lá dobraria trabalho e produziria acusação falsa, que é o jeito mais
 * rápido de um portão ser ignorado.
 */
const EXTENSOES_DE_CODIGO = new Set([
  ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".py", ".json", ".yml",
  ".yaml", ".html", ".ps1", ".sh", ".md", ".txt",
]);
const FORA_DA_BUSCA = [/^src\/data\//, /^public\/media\//, /^dist\//];

/** Este arquivo declara os padrões; casar consigo mesmo seria falso positivo. */
const ESTE_ARQUIVO = "tools/check-segredos.mjs";

function versionados() {
  return execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
    .split("\0")
    .filter(Boolean)
    .map((caminho) => caminho.replaceAll("\\", "/"));
}

/** Confere um texto qualquer. Separado para poder ser testado sem tocar o disco. */
export function achadosNoTexto(texto) {
  const achados = [];
  const linhas = texto.split(/\r?\n/);
  for (const [rotulo, padrao] of PADROES) {
    // Casamento por arquivo inteiro primeiro, porque alguns padrões cruzam
    // linha (constante quebrada pelo formatador). Depois localiza a linha para
    // a mensagem ser acionável.
    if (!padrao.test(texto)) continue;
    const linha = linhas.findIndex((l) => padrao.test(l));
    achados.push({ rotulo, linha: linha >= 0 ? linha + 1 : null });
  }
  return achados;
}

const arquivos = versionados();

for (const caminho of arquivos) {
  const ext = extname(caminho).toLowerCase();

  const genero = EXTENSOES_PROIBIDAS.get(ext);
  if (genero) {
    reprovar(
      `${caminho}: ${genero} versionado. Este repositório é público; `
      + "documento, planilha, base geoespacial e chave não entram aqui.",
    );
    continue;
  }

  if (caminho === ESTE_ARQUIVO) continue;
  if (!EXTENSOES_DE_CODIGO.has(ext)) continue;
  if (FORA_DA_BUSCA.some((re) => re.test(caminho))) continue;

  let texto;
  try {
    if (statSync(caminho).size > 2_000_000) continue;
    texto = readFileSync(caminho, "utf8");
  } catch {
    continue;
  }

  for (const { rotulo, linha } of achadosNoTexto(texto)) {
    reprovar(`${caminho}${linha ? `:${linha}` : ""}: ${rotulo}.`);
  }
}

// Autoteste: o portão precisa provar que ACUSA, não só que passa. Portão que
// nunca reprovou é indistinguível de portão quebrado, e este roda em toda
// execução, sem plantar arquivo na árvore.
//
// As armadilhas sao MONTADAS EM PEDACOS de proposito. Escritas por extenso,
// elas parecem segredo de verdade para qualquer varredura, e foi o que
// aconteceu: o portao `audit:premium`, que so roda no CI, reprovou este arquivo
// por "possible-secret" e "private-key". Um detector nao tem como distinguir
// isca de vazamento, e nao deveria mesmo. Montar em tempo de execucao mantem o
// autoteste valendo sem deixar literal nenhum na arvore.
const cola = (...partes) => partes.join("");
const DEVE_ACUSAR = [
  cola('const senha = "', "Rafai", 'at2026";'),
  cola("client", "_secret", ': "', "9f2c1ab4", "4de77c01", '"'),
  cola("-----BEGIN ", "PRIVATE KEY", "-----"),
  cola(
    "const CREDENCIAL_AUTORIZADA =\n  \"",
    "5c1d8e9a67836e9876eab8ad",
    "20b5f07117a44f0a9a22ec9a321f5026ff5581bd",
    '";',
  ),
  cola("gh", "p_", "AbCdEfGhIjKlMnOp", "QrStUvWxYz0123456789"),
];
const NAO_PODE_ACUSAR = [
  "A senha combinada entre as pessoas deve ser trocada quando houver backend.",
  cola('expect(fonte).not.toContain("', "Rafai", "at2026", '");'),
  '"sha256": "8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c"',
  "const token = obterTokenDaSessao();",
];

for (const exemplo of DEVE_ACUSAR) {
  if (!achadosNoTexto(exemplo).length) {
    reprovar(`autoteste: deveria acusar e nao acusou: ${exemplo.slice(0, 60)}`);
  }
}
for (const exemplo of NAO_PODE_ACUSAR) {
  const achados = achadosNoTexto(exemplo);
  if (achados.length) {
    reprovar(
      `autoteste: acusou o que nao deveria (${achados[0].rotulo}): ${exemplo.slice(0, 60)}`,
    );
  }
}

if (falhas.length) {
  console.error("REPROVADO: credencial ou documento na arvore versionada.\n");
  for (const f of falhas) console.error(`  ${f}`);
  console.error(
    "\nRemover o arquivo do commit nao basta se ele ja foi publicado: o "
    + "historico guarda. Corrija ANTES de enviar.",
  );
  process.exit(1);
}

console.log(
  `OK: ${arquivos.length} arquivos versionados, nenhuma credencial e nenhum `
  + `documento; ${DEVE_ACUSAR.length} armadilhas do autoteste foram detectadas.`,
);
