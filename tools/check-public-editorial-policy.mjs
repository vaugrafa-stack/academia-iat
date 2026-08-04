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
const LOCKED_PUBLIC_MEDIA = new Map([
  [
    'public/media/aula/pop-section-072.mp4',
    '1e1c7710cb272b4763af713e67a55316a23b84316497f5cae3597abe6bd21592',
  ],
  [
    'public/media/aula/pop-section-072.jpg',
    'e1b8e8902b992bb123461751bba3fb3647f0c39ded7652baefc4e97b72c0cad3',
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
if (distArgument) {
  const distDirectory = path.resolve(ROOT, distArgument.slice('--dist='.length));
  candidates.push(...(await filesBelow(distDirectory)).filter(isText));
}

const failures = [];
for (const file of candidates) {
  const text = await readFile(file, 'utf8');
  const name = relative(file);
  if (
    name.startsWith('src/')
    && !name.startsWith('src/data/')
    && /(?:^|[/\\])pop-content\.json(?:\?url)?/u.test(text)
  ) {
    failures.push(`${name} — referência de runtime ao conteúdo-fonte bruto`);
  }
  for (const rule of PUBLIC_EDITORIAL_RULES) {
    const isBuiltArtifact = distArgument
      && path.resolve(file).startsWith(path.resolve(ROOT, distArgument.slice('--dist='.length)));
    const pattern = editorialPatternFor(rule, { builtArtifact: isBuiltArtifact });
    const match = pattern.exec(text);
    if (!match) continue;
    const line = text.slice(0, match.index).split(/\r?\n/u).length;
    failures.push(`${relative(file)}:${line} — ${rule.label}`);
  }
}
for (const file of publicBinaryCandidates) {
  const searchable = (await readFile(file)).toString('latin1').toLocaleLowerCase('pt-BR');
  const marker = PUBLIC_BINARY_MARKERS.find((value) => searchable.includes(value));
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
