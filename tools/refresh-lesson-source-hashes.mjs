import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const POP_PATH = 'src/data/pop-public-content.json';
const MANIFEST_PATHS = [
  'src/data/aula-media.json',
  'public/media/aula/manifest.json',
];

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
};

const sourceHashes = (pop) => {
  const blocks = new Map(pop.blocks.map((block) => [block.id, block]));
  const tables = new Map(pop.tables.map((table) => [table.id, table]));
  return new Map(pop.sections.map((section) => {
    const sourceBlocks = (section.blockIds || []).flatMap((blockId) => {
      const block = blocks.get(blockId) || {};
      if (block.type === 'paragraph') {
        return [{ type: 'paragraph', text: block.paragraph?.text || '' }];
      }
      if (block.type === 'table') {
        const table = tables.get(block.tableId) || {};
        return [{
          type: 'table',
          title: table.title || table.caption || '',
          rows: (table.rows || []).map((row) =>
            (row.cells || []).map((cell) => cell.text || ''),
          ),
        }];
      }
      return [];
    });
    const payload = JSON.stringify(stableValue({
      id: section.id || '',
      number: section.number || '',
      title: section.title || '',
      blocks: sourceBlocks,
    }));
    return [section.id, createHash('sha256').update(payload, 'utf8').digest('hex')];
  }));
};

if (process.argv.slice(2).join(' ') !== '--confirm-unchanged-sections-only') {
  console.error('FALHA: use --confirm-unchanged-sections-only para atualizar apenas seções inalteradas.');
  process.exit(2);
}

const currentPop = JSON.parse(await readFile(path.join(ROOT, POP_PATH), 'utf8'));
let previousPop;
try {
  previousPop = JSON.parse(execFileSync(
    'git',
    ['show', `HEAD:${POP_PATH}`],
    { cwd: ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 },
  ));
} catch {
  console.error('FALHA: não foi possível ler a versão anterior do conteúdo no HEAD.');
  process.exit(1);
}

const currentHashes = sourceHashes(currentPop);
const previousHashes = sourceHashes(previousPop);
const manifests = await Promise.all(MANIFEST_PATHS.map(async (name) => ({
  name,
  value: JSON.parse(await readFile(path.join(ROOT, name), 'utf8')),
})));

const failures = [];
let unchanged = 0;
let regenerated = 0;
for (const [id, metadata] of Object.entries(manifests[0].value)) {
  const current = currentHashes.get(id);
  const previous = previousHashes.get(id);
  if (!current) {
    failures.push(`${id}: seção atual ausente`);
    continue;
  }
  if (current === previous) {
    metadata.sourceSha256 = current;
    unchanged += 1;
  } else if (metadata.sourceSha256 === current) {
    regenerated += 1;
  } else {
    failures.push(`${id}: fonte mudou e a mídia ainda não foi regenerada`);
  }
}
if (failures.length) {
  console.error('FALHA: a atualização segura dos hashes foi recusada:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

manifests[1].value = structuredClone(manifests[0].value);
for (const { name, value } of manifests) {
  const destination = path.join(ROOT, name);
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, JSON.stringify(value), 'utf8');
  await rename(temporary, destination);
}

console.log(
  `OK: ${unchanged} seções inalteradas receberam hash; `
  + `${regenerated} mídias alteradas já estavam vinculadas à fonte atual.`,
);
