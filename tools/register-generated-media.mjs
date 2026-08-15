import { createHash } from 'node:crypto';
import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const LEDGER_PATH = path.join(ROOT, 'tools/media-approved-changes.json');
const BASELINE_PATH = path.join(ROOT, 'tools/media-legacy-baseline.json');
const POLICY_PATH = path.join(ROOT, 'tools/media-governance-policy.json');
const SOURCE_PATH = path.join(ROOT, 'src/data/pop-public-content.json');
const LESSON_EXTENSIONS = ['mp4', 'jpg', 'vtt', 'visemes.json'];
const PILOT_EXTENSIONS = [...LESSON_EXTENSIONS, 'txt'];

const args = process.argv.slice(2);
const buckets = { lessons: [], pilots: [], sourceAssets: [] };
let mode = 'lessons';
for (const argument of args) {
  if (argument === '--lessons') mode = 'lessons';
  else if (argument === '--pilots') mode = 'pilots';
  else if (argument === '--source-assets') mode = 'sourceAssets';
  else buckets[mode].push(argument);
}
const lessonArgs = buckets.lessons;
const pilotArgs = buckets.pilots;
const sourceAssetArgs = buckets.sourceAssets;
if (!lessonArgs.length && !pilotArgs.length && !sourceAssetArgs.length) {
  console.error('FALHA: informe IDs depois de --lessons, --pilots e/ou --source-assets.');
  process.exit(2);
}
const validId = /^pop-section-\d{3}$/u;
if ([...lessonArgs, ...pilotArgs].some((id) => !validId.test(id))) {
  console.error('FALHA: ID de mídia inválido.');
  process.exit(2);
}
const validSourceAsset = /^(?:pop|flow)-image-\d{3}\.png$/u;
if (sourceAssetArgs.some((name) => !validSourceAsset.test(name))) {
  console.error('FALHA: nome de ativo-fonte inválido.');
  process.exit(2);
}

const [ledger, baseline, policy, source] = await Promise.all([
  readFile(LEDGER_PATH, 'utf8').then(JSON.parse),
  readFile(BASELINE_PATH, 'utf8').then(JSON.parse),
  readFile(POLICY_PATH, 'utf8').then(JSON.parse),
  readFile(SOURCE_PATH, 'utf8').then(JSON.parse),
]);
const baselinePaths = new Set((baseline.entries || []).map((entry) => entry.path));
const changesByPath = new Map((ledger.changes || []).map((change) => [change.path, change]));
const reviewedAt = new Date().toISOString().slice(0, 10);
const sourceLocator = `tools de mídia sobre POP-DLE-HID-001 v${source.metadata?.operational?.version} `
  + `sha256 ${source.source?.sha256}`;

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const specifications = [
  ...lessonArgs.flatMap((id) => LESSON_EXTENSIONS.map((extension) => ({
    path: `public/media/aula/${id}.${extension}`,
    reason: 'videoaula regenerada para refletir a linguagem operacional e a fonte documental vigentes',
  }))),
  ...pilotArgs.flatMap((id) => PILOT_EXTENSIONS.map((extension) => ({
    path: `public/media/piloto/${id}.${extension}`,
    reason: 'piloto audiovisual regenerado para refletir o roteiro e a fonte documental vigentes',
  }))),
  ...sourceAssetArgs.map((name) => ({
    path: `public/source-assets/${name}`,
    reason: 'figura extraída novamente do POP para remover linguagem classificatória incorporada à imagem',
    kind: 'source-asset',
  })),
];

for (const specification of specifications) {
  const absolute = path.join(ROOT, specification.path);
  const [contents, info] = await Promise.all([readFile(absolute), stat(absolute)]);
  const existing = changesByPath.get(specification.path);
  const change = {
    cycle: existing?.cycle || policy.currentCycle,
    action: existing?.action || (baselinePaths.has(specification.path) ? 'replace' : 'add'),
    path: specification.path,
    reason: specification.reason,
    bytes: info.size,
    sha256: sha256(contents),
    sourceType: 'project-generated',
    privacyReview: 'synthetic-no-personal-data',
    technicalReview: 'approved',
    sourceLocator,
    rightsBasis: specification.kind === 'source-asset'
      ? 'figura integrante da minuta institucional do IAT, extraída localmente sem material externo'
      : 'conteúdo derivado da minuta institucional do IAT; narração Piper offline sem voz humana ou material de terceiros',
    reviewedBy: 'portões automatizados de conteúdo, mídia, proveniência e privacidade desta rodada',
    reviewedAt,
  };
  if (existing) Object.assign(existing, change);
  else {
    ledger.changes.push(change);
    changesByPath.set(specification.path, change);
  }
}

const temporary = `${LEDGER_PATH}.tmp`;
await writeFile(temporary, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
await rename(temporary, LEDGER_PATH);
console.log(`OK: ${specifications.length} ativos registrados no ciclo ${policy.currentCycle}.`);
