import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVIEW_STATES = new Set(['approved', 'not-applicable']);
const PRIVACY_STATES = new Set([
  'approved-anonymized',
  'approved-no-personal-data',
  'not-applicable',
  'synthetic-no-personal-data',
]);
const SOURCE_TYPES = new Set([
  'licensed-third-party',
  'open-license',
  'project-generated',
  'public-official',
  'source-document-extraction',
  'synthetic',
]);

export function normalizePath(path) {
  return path.split(sep).join('/');
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function sha256(payload) {
  return createHash('sha256').update(payload).digest('hex');
}

export function assetExtension(path) {
  if (path.endsWith('.visemes.json')) return '.visemes.json';
  return extname(path).toLowerCase();
}

export function isManagedAsset(path, policy) {
  const extension = assetExtension(path);
  if (policy.managedExtensions.includes(extension)) return true;
  if (policy.managedSuffixes.some((suffix) => path.endsWith(suffix))) return true;
  return policy.managedTextRules.some(
    (rule) => path.startsWith(rule.prefix) && extension === rule.extension,
  );
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name, 'en'))) {
    const path = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`link simbolico nao permitido no acervo: ${path}`);
    }
    if (entry.isDirectory()) files.push(...await walk(path));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

/**
 * Arquivos sob o acervo que o portao nao vigia E que ninguem declarou ignorar.
 *
 * O portao vigia por lista fechada de extensao. Isso deixava uma TERCEIRA
 * categoria silenciosa: nem vigiada, nem declarada como irrelevante. Um `.webm`
 * ao lado dos `.mp4`, um `.jpeg` ao lado dos `.jpg`, um `.mp3` de narracao,
 * entravam na arvore sem proveniencia, sem base de direitos, sem teto de
 * tamanho e sem checagem de duplicata. E entravam CALADOS, que e o pior modo.
 *
 * Agora existem duas listas explicitas, e nada fora delas: o que e vigiado, e o
 * que foi declarado como nao-midia. Extensao desconhecida vira falha com
 * instrucao, e nao ausencia.
 */
export async function unclassifiedAssets(root, policy) {
  const scanRoot = resolve(root, policy.scanRoot);
  const ignoradas = new Set(policy.ignoredExtensions || []);
  const fora = [];
  for (const absolutePath of await walk(scanRoot)) {
    const path = normalizePath(relative(root, absolutePath));
    if (isManagedAsset(path, policy)) continue;
    if (ignoradas.has(assetExtension(path))) continue;
    fora.push(path);
  }
  return fora.toSorted((left, right) => left.localeCompare(right, 'en'));
}

export async function buildInventory(root, policy) {
  const scanRoot = resolve(root, policy.scanRoot);
  const files = await walk(scanRoot);
  const rows = [];
  for (const absolutePath of files) {
    const path = normalizePath(relative(root, absolutePath));
    if (!isManagedAsset(path, policy)) continue;
    const payload = await readFile(absolutePath);
    rows.push({
      path,
      bytes: payload.byteLength,
      sha256: sha256(payload),
    });
  }
  return rows.toSorted((left, right) => left.path.localeCompare(right.path, 'en'));
}

export function inventoryDigest(entries) {
  return sha256(JSON.stringify(entries));
}

export function summarizeInventory(entries, policy) {
  const collections = Object.fromEntries(policy.collections.map((collection) => [
    collection.id,
    { files: 0, bytes: 0 },
  ]));
  const extensions = {};
  for (const entry of entries) {
    const collection = collectionFor(entry.path, policy);
    if (collection) {
      collections[collection.id].files += 1;
      collections[collection.id].bytes += entry.bytes;
    }
    const extension = assetExtension(entry.path);
    extensions[extension] ??= { files: 0, bytes: 0 };
    extensions[extension].files += 1;
    extensions[extension].bytes += entry.bytes;
  }
  return {
    files: entries.length,
    bytes: entries.reduce((total, entry) => total + entry.bytes, 0),
    sha256: inventoryDigest(entries),
    collections,
    extensions: Object.fromEntries(Object.entries(extensions).toSorted(([left], [right]) => left.localeCompare(right, 'en'))),
  };
}

export function createBaseline(entries, policy, generatedAt) {
  return {
    schemaVersion: 1,
    generatedAt,
    immutableLegacySnapshot: true,
    summary: summarizeInventory(entries, policy),
    entries,
  };
}

export function collectionFor(path, policy) {
  return policy.collections.find((collection) => (
    collection.paths?.includes(path) || path.startsWith(collection.prefix || '\0')
  ));
}

function duplicateGroups(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const paths = groups.get(entry.sha256) || [];
    paths.push(entry.path);
    groups.set(entry.sha256, paths);
  }
  return [...groups.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([hash, paths]) => ({ sha256: hash, paths: paths.toSorted() }));
}

function validateBaseline(baseline, policy, failures) {
  if (baseline.schemaVersion !== 1 || baseline.immutableLegacySnapshot !== true) {
    failures.push('baseline legado sem contrato imutavel valido');
    return;
  }
  const paths = new Set();
  let previousPath = '';
  for (const entry of baseline.entries || []) {
    if (!entry.path || !Number.isInteger(entry.bytes) || entry.bytes <= 0 || !SHA256_PATTERN.test(entry.sha256 || '')) {
      failures.push(`entrada invalida no baseline: ${entry.path || '(sem caminho)'}`);
    }
    if (paths.has(entry.path)) failures.push(`caminho duplicado no baseline: ${entry.path}`);
    if (previousPath && previousPath.localeCompare(entry.path, 'en') >= 0) {
      failures.push(`baseline fora da ordem deterministica: ${previousPath} / ${entry.path}`);
    }
    paths.add(entry.path);
    previousPath = entry.path;
  }
  const expected = summarizeInventory(baseline.entries || [], policy);
  if (JSON.stringify(expected) !== JSON.stringify(baseline.summary)) {
    failures.push('resumo ou hash do baseline diverge das entradas deterministicas');
  }
}

function validateCollections(entries, policy, failures) {
  for (const collection of policy.collections) {
    for (const field of ['id', 'provenanceStatus', 'sourceType', 'sourceLocator', 'rightsBasis', 'privacyStatus', 'contract']) {
      if (typeof collection[field] !== 'string' || !collection[field].trim()) {
        failures.push(`colecao ${collection.id || '(sem id)'} sem ${field}`);
      }
    }
  }
  for (const entry of entries) {
    const collection = collectionFor(entry.path, policy);
    if (!collection) {
      failures.push(`${entry.path}: ativo sem contrato de colecao`);
    }
  }
}

function validateChange(change, actualByPath, baselineByPath, failures) {
  if (!['add', 'replace', 'remove'].includes(change.action)) {
    failures.push(`${change.path || '(sem caminho)'}: acao de mudanca invalida`);
    return;
  }
  if (!change.path?.startsWith('public/') || change.path.includes('..') || change.path.includes('\\')) {
    failures.push(`${change.path || '(sem caminho)'}: caminho de mudanca inseguro`);
  }
  const actual = actualByPath.get(change.path);
  const baseline = baselineByPath.get(change.path);
  if (change.action === 'add' && (baseline || !actual)) failures.push(`${change.path}: adicao nao corresponde ao inventario`);
  if (change.action === 'replace' && (!baseline || !actual)) failures.push(`${change.path}: substituicao nao corresponde ao inventario`);
  if (change.action === 'remove' && (!baseline || actual)) failures.push(`${change.path}: remocao nao corresponde ao inventario`);
  if (change.action !== 'remove') {
    if (change.bytes !== actual?.bytes || change.sha256 !== actual?.sha256) {
      failures.push(`${change.path}: tamanho/hash aprovados divergem do arquivo`);
    }
    if (!SOURCE_TYPES.has(change.sourceType)) failures.push(`${change.path}: sourceType nao aprovado`);
    if (!PRIVACY_STATES.has(change.privacyReview)) failures.push(`${change.path}: privacyReview nao aprovado`);
    if (!REVIEW_STATES.has(change.technicalReview)) failures.push(`${change.path}: technicalReview nao aprovado`);
    for (const field of ['sourceLocator', 'rightsBasis', 'reviewedBy']) {
      if (typeof change[field] !== 'string' || change[field].trim().length < 3) {
        failures.push(`${change.path}: ${field} ausente ou insuficiente`);
      }
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(change.reviewedAt || '')) {
      failures.push(`${change.path}: reviewedAt deve usar AAAA-MM-DD`);
    }
  }
  // `change.reason?.trim().length < 8` parecia exigir justificativa e nao exigia:
  // sem o campo, a expressao vira `undefined < 8`, que em JavaScript e FALSE. A
  // regra so pegava quem se deu ao trabalho de escrever uma justificativa curta,
  // e liberava quem nao escreveu nenhuma.
  const justificativa = typeof change.reason === 'string' ? change.reason.trim() : '';
  if (justificativa.length < 8) {
    failures.push(`${change.path}: justificativa insuficiente`);
  }
  // O ciclo e obrigatorio e explicito. Sem ele, o teto de crescimento nao teria
  // como distinguir o que entrou agora do que ja estava aprovado ha meses, e
  // voltaria a ser vitalicio. Exigido como string nao vazia, e nao com `?.`,
  // pela mesma razao da justificativa logo acima.
  const ciclo = typeof change.cycle === 'string' ? change.cycle.trim() : '';
  if (!ciclo) failures.push(`${change.path}: cycle ausente`);
}

function validateSizes(entries, policy, failures) {
  for (const entry of entries) {
    const extension = assetExtension(entry.path);
    const maximum = policy.maxBytesByExtension[extension];
    if (!maximum) failures.push(`${entry.path}: extensao sem limite definido (${extension})`);
    if (maximum && entry.bytes > maximum) {
      failures.push(`${entry.path}: ${entry.bytes} bytes excedem o limite de ${maximum}`);
    }
  }
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function validateSourceAssetsContract(root, entries, failures) {
  const manifest = await loadJson(resolve(root, 'public/source-assets/asset-manifest.json'));
  const expected = new Map((manifest.assets || []).map((asset) => [
    `public${asset.publicPath}`,
    { bytes: asset.bytes, sha256: asset.sha256 },
  ]));
  const actual = entries.filter((entry) => entry.path.startsWith('public/source-assets/'));
  for (const entry of actual) {
    const declared = expected.get(entry.path);
    if (!declared || declared.bytes !== entry.bytes || declared.sha256 !== entry.sha256) {
      failures.push(`${entry.path}: ausente ou divergente no asset-manifest`);
    }
  }
  if (expected.size !== actual.length) failures.push('source-assets: manifesto e inventario tem contagens diferentes');
}

async function validateLessonContract(root, entries, failures) {
  const manifest = await loadJson(resolve(root, 'public/media/aula/manifest.json'));
  const expected = new Set();
  for (const [lessonId, metadata] of Object.entries(manifest)) {
    if (!/^pop-section-\d{3}$/.test(lessonId) || metadata.generatorVersion !== 2 || metadata.dur <= 0) {
      failures.push(`aula ${lessonId}: metadados de geracao invalidos`);
    }
    for (const suffix of ['.jpg', '.mp4', '.visemes.json', '.vtt']) {
      expected.add(`public/media/aula/${lessonId}${suffix}`);
    }
  }
  const actual = new Set(entries.filter((entry) => entry.path.startsWith('public/media/aula/')).map((entry) => entry.path));
  for (const path of expected) if (!actual.has(path)) failures.push(`${path}: ativo didatico ausente`);
  for (const path of actual) if (!expected.has(path)) failures.push(`${path}: ativo didatico orfao`);
}

async function validatePilotContract(root, entries, failures) {
  const manifest = await loadJson(resolve(root, 'public/media/piloto/manifest.json'));
  const provenance = await loadJson(resolve(root, 'public/media/piloto/provenance.json'));
  for (const field of ['schemaVersion', 'voice', 'background', 'presenterSprite', 'sourceDocument']) {
    if (JSON.stringify(manifest[field]) !== JSON.stringify(provenance[field])) {
      failures.push(`pilotos: proveniencia diverge do manifesto em ${field}`);
    }
  }
  const byPath = new Map(entries.map((entry) => [`/${entry.path.slice('public/'.length)}`, entry]));
  const declared = [];
  for (const item of manifest.items || []) declared.push(...Object.values(item.assets || {}));
  declared.push(manifest.background, manifest.presenterSprite?.source, manifest.presenterSprite?.optimized);
  for (const asset of declared.filter(Boolean)) {
    const actual = byPath.get(asset.path);
    if (!actual || actual.bytes !== asset.bytes || actual.sha256 !== asset.sha256) {
      failures.push(`${asset.path || '(sem caminho)'}: ativo audiovisual diverge do manifesto`);
    }
  }
}

async function validateFontContract(root, entries, failures) {
  const readme = await readFile(resolve(root, 'public/fonts/README.md'), 'utf8');
  const fonts = entries.filter((entry) => entry.path.startsWith('public/fonts/'));
  for (const font of fonts) {
    if (!readme.toLowerCase().includes(font.sha256.toLowerCase())) {
      failures.push(`${font.path}: hash ausente do README de licenca`);
    }
  }
  const license = await stat(resolve(root, 'public/fonts/OFL.txt'));
  if (!license.isFile() || license.size === 0) failures.push('fonte local sem arquivo OFL.txt valido');
}

async function validateContracts(root, entries, failures) {
  const checks = [
    validateSourceAssetsContract,
    validateLessonContract,
    validatePilotContract,
    validateFontContract,
  ];
  for (const check of checks) {
    try {
      await check(root, entries, failures);
    } catch (error) {
      failures.push(`contrato de midia nao pode ser validado: ${error.message}`);
    }
  }
}

export async function validateMediaGovernance({ root, policy, baseline, ledger, entries }) {
  const failures = [];
  validateBaseline(baseline, policy, failures);
  validateCollections(entries, policy, failures);
  const baselineByPath = new Map((baseline.entries || []).map((entry) => [entry.path, entry]));
  const actualByPath = new Map(entries.map((entry) => [entry.path, entry]));
  const changesByPath = new Map();
  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.changes)) failures.push('ledger de mudancas invalido');
  for (const change of ledger.changes || []) {
    if (changesByPath.has(change.path)) failures.push(`${change.path}: mudanca duplicada no ledger`);
    changesByPath.set(change.path, change);
    validateChange(change, actualByPath, baselineByPath, failures);
  }
  for (const [path, baselineEntry] of baselineByPath) {
    const actual = actualByPath.get(path);
    if (!actual) {
      if (changesByPath.get(path)?.action !== 'remove') failures.push(`${path}: ativo legado removido sem aprovacao`);
    } else if (actual.sha256 !== baselineEntry.sha256 || actual.bytes !== baselineEntry.bytes) {
      if (changesByPath.get(path)?.action !== 'replace') failures.push(`${path}: ativo legado alterado sem aprovacao`);
    }
  }
  for (const entry of entries) {
    if (!baselineByPath.has(entry.path) && changesByPath.get(entry.path)?.action !== 'add') {
      failures.push(`${entry.path}: novo ativo sem registro de proveniencia/aprovacao`);
    }
  }
  validateSizes(entries, policy, failures);
  const duplicates = duplicateGroups(entries);
  if (duplicates.length) {
    for (const duplicate of duplicates) failures.push(`conteudo duplicado ${duplicate.sha256}: ${duplicate.paths.join(', ')}`);
  }
  // O teto e POR CICLO, e agora isso e verdade.
  //
  // Antes, a conta somava todas as adicoes ja aprovadas, de sempre. E o ledger
  // nao pode encolher: o baseline e imutavel, entao tirar uma entrada faria o
  // arquivo correspondente virar "novo ativo sem registro" na proxima execucao.
  // O resultado era um teto vitalico disfarcado de teto por ciclo, que travaria
  // o CI de forma permanente por volta do octogesimo ativo novo, e a unica saida
  // seria afrouxar a politica para todo mundo.
  //
  // As entradas de ciclos anteriores continuam valendo como AUTORIZACAO do
  // ativo, que e o que impede o "sem registro". Elas apenas nao consomem mais o
  // orcamento do ciclo em curso. Encerrar um ciclo e uma edicao explicita de
  // `currentCycle` na politica, visivel no diff, que e onde ela deve ser julgada.
  const cicloCorrente = typeof policy.currentCycle === 'string' ? policy.currentCycle.trim() : '';
  if (!cicloCorrente) failures.push('politica sem currentCycle: o teto de crescimento nao tem periodo');
  const approvedAdds = (ledger.changes || []).filter((change) => change.action === 'add');
  const doCiclo = approvedAdds.filter((change) => (change.cycle || '').trim() === cicloCorrente);
  const growthBytes = doCiclo.reduce((total, change) => total + (change.bytes || 0), 0);
  if (doCiclo.length > policy.maxApprovedGrowthFiles) {
    failures.push(
      `ledger excede o limite de novos arquivos no ciclo ${cicloCorrente}: `
      + `${doCiclo.length} de ${policy.maxApprovedGrowthFiles}`,
    );
  }
  if (growthBytes > policy.maxApprovedGrowthBytes) {
    failures.push(
      `ledger excede o limite de crescimento em bytes no ciclo ${cicloCorrente}: `
      + `${growthBytes} de ${policy.maxApprovedGrowthBytes}`,
    );
  }
  for (const path of await unclassifiedAssets(root, policy)) {
    failures.push(
      `${path}: extensao nao classificada; declare em managedExtensions `
      + '(com proveniencia) ou em ignoredExtensions (declarando que nao e midia)',
    );
  }
  await validateContracts(root, entries, failures);
  return {
    ok: failures.length === 0,
    failures,
    summary: summarizeInventory(entries, policy),
    changes: ledger.changes?.length || 0,
    duplicates: duplicates.length,
  };
}
