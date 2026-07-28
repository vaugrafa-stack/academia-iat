import { readFile, stat } from 'node:fs/promises';
import { posix, resolve, sep } from 'node:path';

import {
  buildOfflinePayload,
} from './build-offline-packages.mjs';

const root = resolve(import.meta.dirname, '..');
const publicDir = resolve(root, 'public');
const catalogPath = resolve(root, 'src/data/offline-packages.json');
const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function resolveMediaPath(publicPath) {
  const validRelativePath = typeof publicPath === 'string'
    && publicPath.startsWith('media/')
    && !publicPath.includes('\\')
    && posix.normalize(publicPath) === publicPath
    && !publicPath.split('/').includes('..');
  check(validRelativePath, `caminho de mídia inválido: ${JSON.stringify(publicPath)}`);
  if (!validRelativePath) return null;

  const absolutePath = resolve(publicDir, String(publicPath || ''));
  const prefix = publicDir.endsWith(sep) ? publicDir : `${publicDir}${sep}`;
  const insidePublic = absolutePath.startsWith(prefix);
  check(insidePublic, `caminho de mídia escapa de public/: ${JSON.stringify(publicPath)}`);
  if (!insidePublic) return null;
  return absolutePath;
}

let raw;
let catalog;
try {
  raw = await readFile(catalogPath, 'utf8');
  catalog = JSON.parse(raw);
} catch (error) {
  console.error(`FALHA: catálogo offline ausente ou inválido (${error.message}).`);
  process.exit(1);
}

check(catalog.schemaVersion === '1.1.0', 'schemaVersion deve ser 1.1.0');
check(
  /^[0-9a-f]{64}$/.test(catalog.source?.popSha256 || ''),
  'source.popSha256 deve conter SHA-256 válido',
);
check(Array.isArray(catalog.packages), 'packages deve ser uma lista');
check(
  isNonNegativeInteger(catalog.packageCount)
    && catalog.packageCount === catalog.packages?.length,
  'packageCount diverge da quantidade de pacotes',
);

const packageIds = new Set();
const mediaPaths = new Set();
let itemCount = 0;
let lessonCount = 0;
let totalBytes = 0;

for (const item of catalog.packages || []) {
  check(
    typeof item.id === 'string' && item.id.length > 0 && !packageIds.has(item.id),
    `id de pacote ausente ou duplicado: ${JSON.stringify(item.id)}`,
  );
  packageIds.add(item.id);
  check(Array.isArray(item.items), `${item.id}: items deve ser uma lista`);
  check(
    isNonNegativeInteger(item.itemCount) && item.itemCount === item.items?.length,
    `${item.id}: itemCount divergente`,
  );
  check(
    isNonNegativeInteger(item.lessonCount)
      && item.itemCount === (item.lessonCount + 1) * 3,
    `${item.id}: deve haver três mídias por tópico e três para o resumo do módulo`,
  );

  let packageBytes = 0;
  for (const media of item.items || []) {
    check(
      !mediaPaths.has(media.path),
      `${item.id}: caminho de mídia duplicado entre pacotes: ${media.path}`,
    );
    mediaPaths.add(media.path);
    check(
      isNonNegativeInteger(media.bytes) && media.bytes > 0,
      `${item.id}: tamanho inválido para ${media.path}`,
    );
    const absolutePath = resolveMediaPath(media.path);
    const info = absolutePath
      ? await stat(absolutePath).catch(() => null)
      : null;
    check(
      info?.isFile() && info.size === media.bytes,
      `${item.id}: arquivo ausente ou tamanho divergente: ${media.path}`,
    );
    packageBytes += media.bytes || 0;
  }
  check(item.bytes === packageBytes, `${item.id}: bytes diverge da soma dos itens`);
  const requiredModuleMedia = [
    `media/${item.id}.mp4`,
    `media/${item.id}-poster.png`,
    `media/${item.id}.vtt`,
  ];
  for (const requiredPath of requiredModuleMedia) {
    check(
      item.items?.some((media) => media.path === requiredPath),
      `${item.id}: resumo obrigatório do módulo ausente: ${requiredPath}`,
    );
  }

  itemCount += item.itemCount || 0;
  lessonCount += item.lessonCount || 0;
  totalBytes += item.bytes || 0;
}

check(catalog.itemCount === itemCount, 'itemCount global divergente');
check(catalog.lessonCount === lessonCount, 'lessonCount global divergente');
check(catalog.totalBytes === totalBytes, 'totalBytes diverge da soma dos pacotes');

const expected = await buildOfflinePayload();
check(
  JSON.stringify(catalog) === JSON.stringify(expected),
  'catálogo versionado diverge das trilhas, do POP ou das mídias locais',
);

if (errors.length > 0) {
  console.error(`FALHA: ${errors.length} problema(s) no catálogo offline:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `OK: ${catalog.packageCount} pacotes · ${catalog.lessonCount} tópicos reais · `
  + `${catalog.itemCount} mídias disponíveis · `
  + `${(catalog.totalBytes / 1024 / 1024).toFixed(1)} MB.`,
);
