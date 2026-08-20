import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  PUBLIC_EDITORIAL_RULES,
  editorialPatternFor,
} from './public-editorial-rules.mjs';

const ROOT = process.cwd();
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.map',
  '.md',
  '.svg',
  '.txt',
  '.vtt',
  '.webmanifest',
  '.xml',
]);
const PUBLIC_BINARY_MARKERS = [
  'openai',
  'gpt-image',
  'trainedalgorithmicmedia',
  'artificial intelligence',
  'inteligência artificial',
];
const SOURCE_EXCLUSIONS = new Set([
  'src/data/content-catalog.json',
  'src/data/extraction-validation.json',
  'src/data/pop-content.json',
]);
const ACTIVE_OPERATIONAL_DOCUMENTS = [
  'AGENTS.md',
  'GOAL_PREMIUM_10.md',
  'LEARNING_DESIGN.md',
  'README.md',
  'STATUS_ATUAL.md',
  'design/nota-10/DESIGN_SYSTEM.md',
];
// A 18.10.5 é a única seção cuja apresentação pública passa por reescrita
// editorial, e por isso a mídia dela fica presa por hash: regerar o vídeo não
// pode reintroduzir o termo removido sem que alguém olhe.
//
// Repinado em 11/08/2026, na migração para o POP v1.9. O que foi conferido
// antes de trocar o hash: a legenda regerada não contém nenhum dos termos
// proibidos, e a cue de título narra "18.10.5 Participação social e
// complementações". A diferença é do próprio POP, que deixou de citar uso de IA
// no título da seção, de modo que a reescrita editorial virou operação nula
// nesta versão. A trava continua porque a fonte pode voltar a citar.
const LOCKED_PUBLIC_MEDIA = new Map([
  [
    'public/media/aula/pop-section-072.mp4',
    'd049ffd6a3eb23279e411596c99993b5c5c64e93a31f1ddb2ceae262cb454919',
  ],
  [
    'public/media/aula/pop-section-072.jpg',
    '3b6c8d9ac32871053a549403d43a016ad21a9867b5e45e2f767be87afdee7503',
  ],
]);

function relative(file) {
  return path.relative(ROOT, file).replaceAll('\\', '/');
}

function isText(file) {
  return TEXT_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function isRuntimeSource(file) {
  const name = relative(file);
  if (!isText(file)) return false;
  if (SOURCE_EXCLUSIONS.has(name)) return false;
  return !/\.(?:test|spec)\.[cm]?[jt]sx?$/u.test(name);
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(file) : [file];
  }));
  return nested.flat();
}

const argumentsList = process.argv.slice(2);
const distArgument = argumentsList.find((argument) => argument.startsWith('--dist='));
const unknownArguments = argumentsList.filter((argument) => !argument.startsWith('--dist='));
if (unknownArguments.length > 0) {
  console.error(`FALHA: argumento(s) desconhecido(s): ${unknownArguments.join(', ')}`);
  process.exit(2);
}

const sourceCandidates = (await filesBelow(path.join(ROOT, 'src'))).filter(isRuntimeSource);
const publicFiles = await filesBelow(path.join(ROOT, 'public'));
const publicCandidates = publicFiles.filter(isText);
const publicBinaryCandidates = publicFiles.filter((file) => !isText(file));
const candidates = [
  path.join(ROOT, 'index.html'),
  ...sourceCandidates,
  ...publicCandidates,
];
const operationalCandidates = [
  ...[...SOURCE_EXCLUSIONS].map((name) => path.join(ROOT, name)),
  ...ACTIVE_OPERATIONAL_DOCUMENTS.map((name) => path.join(ROOT, name)),
];
if (distArgument) {
  const distDirectory = path.resolve(ROOT, distArgument.slice('--dist='.length));
  candidates.push(...(await filesBelow(distDirectory)).filter(isText));
}

const failures = [];
for (const file of [...candidates, ...operationalCandidates]) {
  const text = await readFile(file, 'utf8');
  const name = relative(file);
  if (
    name.startsWith('src/')
    && !name.startsWith('src/data/')
    && /(?:^|[/\\])pop-content\.json(?:\?url)?/u.test(text)
  ) {
    failures.push(`${name} — referência de runtime ao conteúdo-fonte bruto`);
  }
  const rules = operationalCandidates.includes(file)
    ? PUBLIC_EDITORIAL_RULES.filter((rule) => rule.sourceMaterial)
    : PUBLIC_EDITORIAL_RULES;
  for (const rule of rules) {
    const isBuiltArtifact = distArgument
      && path.resolve(file).startsWith(path.resolve(ROOT, distArgument.slice('--dist='.length)));
    const pattern = editorialPatternFor(rule, { builtArtifact: isBuiltArtifact });
    // Exceção declarada uma a uma, com justificativa escrita ao lado, em vez de
    // afrouxar o padrão. Assim a regra continua pegando o caso novo, e cada
    // permissão fica visível para ser revista ou derrubada.
    const excecoes = rule.excecoes || [];
    const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
    let match = null;
    for (const candidato of text.matchAll(global)) {
      if (excecoes.some((permitido) => text.startsWith(permitido, candidato.index))) continue;
      match = candidato;
      break;
    }
    if (!match) continue;
    const line = text.slice(0, match.index).split(/\r?\n/u).length;
    failures.push(`${relative(file)}:${line} — ${rule.label}: ${String(match[0]).slice(0, 60)}`);
  }
}
for (const file of publicBinaryCandidates) {
  // Duas leituras do mesmo buffer, e não uma.
  //
  // A leitura era só em latin1, e um dos marcadores da lista é acentuado.
  // Metadado de MP4, JPEG e XMP é UTF-8 por especificação: o 'ê' são dois bytes
  // que, lidos como latin1, viram outra coisa. O marcador acentuado, portanto,
  // nunca podia casar, e a lista dava a impressão de cobrir o que não cobria.
  // Gravar a expressão acentuada no XMP de qualquer ativo passava batido.
  //
  // latin1 continua porque metadado antigo gravado nessa página de código
  // existe, e uma passada só em UTF-8 perderia esse caso.
  const bruto = await readFile(file);
  const leituras = [
    bruto.toString('latin1').toLocaleLowerCase('pt-BR'),
    bruto.toString('utf8').toLocaleLowerCase('pt-BR'),
  ];
  const marker = PUBLIC_BINARY_MARKERS.find((value) =>
    leituras.some((texto) => texto.includes(value)),
  );
  if (marker) {
    failures.push(`${relative(file)} — metadado binário público proibido (${marker})`);
  }
}
if (distArgument) {
  const rawDataAsset = candidates.find((file) =>
    /^pop-content-[A-Za-z0-9_-]+\.json$/u.test(path.basename(file)),
  );
  if (rawDataAsset) {
    failures.push(`${relative(rawDataAsset)} — conteúdo-fonte bruto incluído no artefato`);
  }
}
for (const [name, expectedHash] of LOCKED_PUBLIC_MEDIA) {
  const contents = await readFile(path.join(ROOT, name));
  const actualHash = createHash('sha256').update(contents).digest('hex');
  if (actualHash !== expectedHash) {
    failures.push(
      `${name} — mídia protegida mudou sem nova validação editorial`,
    );
  }
}

if (failures.length > 0) {
  console.error('FALHA: a superfície pública viola a política editorial:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `OK: política editorial verificada em ${candidates.length} arquivos públicos de texto `
  + `e ${publicBinaryCandidates.length} ativos binários.`,
);
