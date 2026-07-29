import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

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
const SOURCE_EXCLUSIONS = new Set([
  'src/data/content-catalog.json',
  'src/data/extraction-validation.json',
  'src/data/pop-content.json',
]);
const FORBIDDEN = [
  { label: 'sigla removida da apresentação pública', pattern: /\bIA\b/iu },
  { label: 'expressão removida da apresentação pública', pattern: /intelig[êe]ncia artificial/iu },
  { label: 'expressão removida da apresentação pública', pattern: /artificial intelligence/iu },
  { label: 'produto ou sigla do mesmo tema removido', pattern: /\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b/iu },
  {
    label: 'expressão correlata removida da apresentação pública',
    pattern: /\b(?:modelos? de linguagem|large language models?|machine learning|aprendizado de máquina)\b/iu,
  },
  {
    label: 'formulação editorial substituída',
    pattern: /\b(?:revisão|validação|autoria|aprovação|conferência|avaliação)(?:\s+técnica)?\s+humana\b/iu,
  },
];
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
const publicCandidates = (await filesBelow(path.join(ROOT, 'public'))).filter(isText);
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
  for (const rule of FORBIDDEN) {
    const isBuiltArtifact = distArgument
      && path.resolve(file).startsWith(path.resolve(ROOT, distArgument.slice('--dist='.length)));
    const pattern = isBuiltArtifact
      && (
        rule.label === 'sigla removida da apresentação pública'
        || rule.label === 'produto ou sigla do mesmo tema removido'
      )
      ? (
          rule.label === 'sigla removida da apresentação pública'
            ? /\bIA\b/u
            : /\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b/u
        )
      : rule.pattern;
    const match = pattern.exec(text);
    if (!match) continue;
    const line = text.slice(0, match.index).split(/\r?\n/u).length;
    failures.push(`${relative(file)}:${line} — ${rule.label}`);
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

console.log(`OK: política editorial verificada em ${candidates.length} arquivos públicos de texto.`);
