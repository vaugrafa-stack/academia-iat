import { readFile, stat, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { tracks } from '../src/courseData.js';
import { derivarAulas } from '../src/lessons.js';

const root = resolve(import.meta.dirname, '..');
const publicDir = resolve(root, 'public');
const outputPath = resolve(root, 'src/data/offline-packages.json');

function normalizePublicPath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/').replace(/^\/+/, '');
  const absolutePath = resolve(publicDir, normalized);
  const publicPrefix = publicDir.endsWith(sep) ? publicDir : `${publicDir}${sep}`;
  if (!absolutePath.startsWith(publicPrefix)) {
    throw new Error(`Caminho de mídia fora de public/: ${relativePath}`);
  }
  return { normalized, absolutePath };
}

async function mediaItem(relativePath) {
  const { normalized, absolutePath } = normalizePublicPath(relativePath);
  try {
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      throw new Error(`Mídia esperada não é arquivo: ${normalized}`);
    }
    return { path: normalized, bytes: info.size };
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return null;
    throw error;
  }
}

export async function buildOfflinePayload() {
  const pop = JSON.parse(
    await readFile(resolve(root, 'src/data/pop-public-content.json'), 'utf8'),
  );
  const { trackLessons } = derivarAulas(pop, tracks);
  const packages = [];

  for (const track of tracks) {
    const lessonList = trackLessons.get(track.id) || [];
    const candidates = [
      `media/${track.id}.mp4`,
      `media/${track.id}-poster.png`,
      `media/${track.id}.vtt`,
      ...lessonList.flatMap((lesson) => [
        `media/aula/${lesson.id}.mp4`,
        `media/aula/${lesson.id}.jpg`,
        `media/aula/${lesson.id}.vtt`,
      ]),
    ];
    const uniqueCandidates = [...new Set(candidates)];
    const resolvedItems = await Promise.all(uniqueCandidates.map(mediaItem));
    const missingItems = uniqueCandidates.filter((_, index) => !resolvedItems[index]);
    if (missingItems.length > 0) {
      throw new Error(
        `${track.code}: ${missingItems.length} mídia(s) esperada(s) não localizada(s): `
        + missingItems.join(', '),
      );
    }
    const items = resolvedItems;

    packages.push({
      id: track.id,
      code: track.code,
      title: track.title,
      lessonCount: lessonList.length,
      itemCount: items.length,
      bytes: items.reduce((total, item) => total + item.bytes, 0),
      items,
    });
  }

  return {
    schemaVersion: '1.1.0',
    source: {
      popVersion: pop.metadata?.operational?.version || null,
      popSha256: pop.source?.sha256 || null,
    },
    packageCount: packages.length,
    lessonCount: packages.reduce((total, item) => total + item.lessonCount, 0),
    itemCount: packages.reduce((total, item) => total + item.itemCount, 0),
    totalBytes: packages.reduce((total, item) => total + item.bytes, 0),
    packages,
  };
}

export function serializeOfflinePayload(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function firstPayloadDifference(actual, expected, path = '$') {
  if (Object.is(actual, expected)) return null;
  if (
    actual === null
    || expected === null
    || typeof actual !== 'object'
    || typeof expected !== 'object'
  ) {
    return { path, actual, expected };
  }

  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  const keys = [...new Set([...actualKeys, ...expectedKeys])];
  for (const key of keys) {
    if (!Object.hasOwn(actual, key) || !Object.hasOwn(expected, key)) {
      return {
        path: `${path}.${key}`,
        actual: actual[key],
        expected: expected[key],
      };
    }
    const difference = firstPayloadDifference(
      actual[key],
      expected[key],
      Array.isArray(actual) ? `${path}[${key}]` : `${path}.${key}`,
    );
    if (difference) return difference;
  }
  return null;
}

async function main(argv = process.argv.slice(2)) {
  const unknown = argv.filter((argument) => argument !== '--check');
  if (unknown.length > 0) {
    console.error(`FALHA: argumento(s) desconhecido(s): ${unknown.join(', ')}`);
    return 2;
  }

  const payload = await buildOfflinePayload();
  const serialized = serializeOfflinePayload(payload);

  if (argv.includes('--check')) {
    let published = '';
    try {
      published = await readFile(outputPath, 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    let publishedPayload = null;
    try {
      publishedPayload = JSON.parse(published);
    } catch {
      // A mensagem única abaixo cobre tanto ausência quanto JSON inválido.
    }
    if (JSON.stringify(publishedPayload) !== JSON.stringify(payload)) {
      console.error('FALHA: src/data/offline-packages.json está ausente ou desatualizado.');
      const difference = firstPayloadDifference(publishedPayload, payload);
      if (difference) {
        console.error(
          `Primeira divergência em ${difference.path}: `
          + `versionado=${JSON.stringify(difference.actual)} · `
          + `gerado=${JSON.stringify(difference.expected)}`,
        );
      }
      console.error('Execute: node tools/build-offline-packages.mjs');
      return 1;
    }
    console.log(
      `OK: ${payload.packageCount} pacotes offline · `
      + `${payload.lessonCount} tópicos reais · `
      + `${payload.itemCount} mídias disponíveis · `
      + `${(payload.totalBytes / 1024 / 1024).toFixed(1)} MB.`,
    );
    return 0;
  }

  await writeFile(outputPath, serialized, 'utf8');
  console.log(
    `Atualizado: src/data/offline-packages.json · ${payload.packageCount} pacotes · `
    + `${payload.lessonCount} tópicos reais · `
    + `${payload.itemCount} mídias disponíveis · `
    + `${(payload.totalBytes / 1024 / 1024).toFixed(1)} MB.`,
  );
  return 0;
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    process.exitCode = await main();
  } catch (error) {
    console.error(`FALHA: não foi possível gerar os pacotes offline (${error.message}).`);
    process.exitCode = 1;
  }
}
