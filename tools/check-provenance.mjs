// Gate de proveniência e integridade da minuta POP v1.7.
//
// Diferentemente do extrator, este teste não exige que o DOCX exista na
// máquina de CI. Ele confere o fingerprint publicado, a coerência entre todos
// os artefatos e os hashes dos ativos versionados.
//
// Uso: node tools/check-provenance.mjs
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { tracks } from '../src/courseData.js';
import { derivarAulas } from '../src/lessons.js';

const root = resolve(import.meta.dirname, '..');
const EXPECTED = {
  fileName: 'POP ou Manual Hidreletricas IAT Julho de 2026 (Com APA, UCs, RTTA).docx',
  bytes: 4_418_481,
  sha256: '67cdac12cb092c2e6e06a009256351f110bb8d1f4717fbf4cd2f0df0d2f36b5c',
  version: '1.7',
  sections: 167,
  learningSections: 161,
  navigationSections: 6,
  tables: 66,
  quadros: 46,
  tabelas: 20,
  figures: 14,
  popAssets: 14,
  flowAssets: 21,
  totalAssets: 35,
  searchableParagraphNodes: 3_345,
  sourceParagraphNodes: 3_371,
};

let failures = 0;
const fail = (message) => {
  failures += 1;
  console.error(`FALHA ${message}`);
};
const check = (condition, message) => {
  if (!condition) fail(message);
};
const same = (actual, expected, label) => {
  if (actual !== expected) fail(`${label}: esperado ${JSON.stringify(expected)}, recebido ${JSON.stringify(actual)}`);
};
const json = async (relativePath) => JSON.parse(await readFile(resolve(root, relativePath), 'utf8'));
const hash = (payload) => createHash('sha256').update(payload).digest('hex');

let pop;
let flows;
let catalog;
let validation;
let manifest;
try {
  [pop, flows, catalog, validation, manifest] = await Promise.all([
    json('src/data/pop-content.json'),
    json('src/data/flowcharts-content.json'),
    json('src/data/content-catalog.json'),
    json('src/data/extraction-validation.json'),
    json('public/source-assets/asset-manifest.json'),
  ]);
} catch (error) {
  console.error(`FALHA artefato ausente ou JSON inválido: ${error.message}`);
  process.exit(1);
}

same(pop.source?.fileName, EXPECTED.fileName, 'nome da fonte');
same(pop.source?.bytes, EXPECTED.bytes, 'tamanho da fonte');
same(pop.source?.sha256, EXPECTED.sha256, 'SHA-256 da fonte');
check(Boolean(pop.source?.lastModifiedUtc), 'data de modificação da fonte ausente');
same(pop.metadata?.operational?.version, EXPECTED.version, 'versão operacional');
check(/minuta técnica.*validação.*institucional/i.test(pop.metadata?.operational?.validationStatus || ''),
  'status de minuta/validação institucional ausente');
check(/minuta técnica.*validação.*institucional/i.test(pop.metadata?.provenance?.contentStatus || ''),
  'proveniência não declara a pendência de validação institucional');
same(pop.metadata?.provenance?.pipeline, 'tools/extract_pop.py', 'pipeline canônico');
same(pop.metadata?.provenance?.operationalVersionAuthority,
  'texto visível da capa do documento', 'autoridade da versão operacional');
same(pop.metadata?.provenance?.corePropertiesVersion, '1.2', 'versão nas propriedades internas do Word');
check(/desatualizado.*não usado como versão operacional/i.test(pop.metadata?.provenance?.corePropertiesStatus || ''),
  'divergência das propriedades internas do Word não está explicitamente governada');

const substantive = pop.sections.filter((section) => !section.navigationOnly);
const navigation = pop.sections.filter((section) => section.navigationOnly);
same(pop.sections.length, EXPECTED.sections, 'seções totais');
same(substantive.length, EXPECTED.learningSections, 'seções substantivas');
same(navigation.length, EXPECTED.navigationSections, 'seções navegacionais');
same(pop.stats?.learningSectionCount, EXPECTED.learningSections, 'stats.learningSectionCount');
same(pop.stats?.navigationSectionCount, EXPECTED.navigationSections, 'stats.navigationSectionCount');

const section263 = pop.sections.find((section) => section.number === '26.3');
check(Boolean(section263), 'seção 26.3 não localizada');
if (section263) {
  same(section263.id, 'pop-section-102', 'ID preservado da seção 26.3');
  same(section263.navigationOnly, false, 'seção 26.3 marcada como substantiva');
  check((section263.blockIds || []).length >= 4, 'seção 26.3 perdeu seus blocos substantivos');
  check(pop.learningContent?.substantiveSectionIds?.includes(section263.id),
    'seção 26.3 ausente de learningContent.substantiveSectionIds');
  const blockById = new Map(pop.blocks.map((block) => [block.id, block]));
  check((section263.blockIds || []).every((id) => blockById.has(id) && !blockById.get(id).navigationOnly),
    'seção 26.3 contém bloco ausente ou marcado como navegação');
}

const { lessons } = derivarAulas(pop, tracks);
same(lessons.length, EXPECTED.learningSections, 'aulas derivadas');
check(Boolean(section263 && lessons.some((lesson) => lesson.id === section263.id)),
  'seção 26.3 não virou aula');

same(pop.tables.length, EXPECTED.tables, 'tabelas do POP');
same(pop.tables.filter((table) => table.labelType === 'Quadro').length, EXPECTED.quadros, 'quadros');
same(pop.tables.filter((table) => table.labelType === 'Tabela').length, EXPECTED.tabelas, 'tabelas rotuladas');
same(pop.figures.length, EXPECTED.figures, 'figuras do POP');
same(pop.assets.length, EXPECTED.popAssets, 'ativos do POP');
same(pop.stats?.allDocumentParagraphNodes, EXPECTED.searchableParagraphNodes, 'parágrafos pesquisáveis');
same(pop.stats?.sourceParagraphNodeCount, EXPECTED.sourceParagraphNodes, 'parágrafos na fonte');

const catalogPop = catalog.documents?.find((document) => document.id === 'pop');
same(catalog.generatedAt, pop.generatedAt, 'data da cadeia: catálogo');
same(validation.generatedAt, pop.generatedAt, 'data da cadeia: validação');
same(manifest.generatedAt, pop.generatedAt, 'data da cadeia: manifesto');
check(Boolean(catalogPop), 'POP ausente do catálogo');
if (catalogPop) {
  same(catalogPop.sections, EXPECTED.sections, 'catálogo: seções totais');
  same(catalogPop.learningSections, EXPECTED.learningSections, 'catálogo: seções substantivas');
  same(catalogPop.navigationSections, EXPECTED.navigationSections, 'catálogo: seções navegacionais');
  same(catalogPop.tables, EXPECTED.tables, 'catálogo: tabelas');
  same(catalogPop.figures, EXPECTED.figures, 'catálogo: figuras');
  same(catalogPop.source?.sha256, EXPECTED.sha256, 'catálogo: SHA-256 da fonte');
}

same(validation.passed, true, 'resultado da validação de extração');
check(Array.isArray(validation.checks) && validation.checks.length >= 20,
  'validação de extração incompleta');
for (const item of validation.checks || []) {
  if (!item.pass) fail(`validação ${item.id} está reprovada`);
}
for (const requiredId of [
  'pop-source-sha256',
  'pop-operational-version',
  'pop-learning-section-count',
  'pop-section-26.3-substantive',
  'pop-text-fidelity',
  'asset-manifest-count',
]) {
  check(validation.checks?.some((item) => item.id === requiredId && item.pass),
    `gate obrigatório ausente ou reprovado: ${requiredId}`);
}

same(manifest.assetCount, EXPECTED.totalAssets, 'ativos totais no manifesto');
same(manifest.assets?.filter((asset) => asset.documentId === 'pop').length,
  EXPECTED.popAssets, 'manifesto: ativos do POP');
same(manifest.assets?.filter((asset) => asset.documentId === 'fluxogramas').length,
  EXPECTED.flowAssets, 'manifesto: ativos dos fluxogramas');
const manifestPop = manifest.documents?.find((document) => document.id === 'pop');
same(manifestPop?.source?.fileName, pop.source?.fileName, 'manifesto: nome da fonte do POP');
same(manifestPop?.source?.bytes, pop.source?.bytes, 'manifesto: tamanho da fonte do POP');
same(manifestPop?.source?.lastModifiedUtc, pop.source?.lastModifiedUtc,
  'manifesto: data da fonte do POP');
same(manifestPop?.source?.sha256, EXPECTED.sha256, 'manifesto: SHA-256 do POP');
same(flows.assets?.length, EXPECTED.flowAssets, 'fluxogramas: ativos');
same(flows.flowcharts?.length, EXPECTED.flowAssets, 'fluxogramas: variantes');

const popAssetById = new Map(pop.assets.map((asset) => [asset.id, asset]));
const flowAssetById = new Map(flows.assets.map((asset) => [asset.id, asset]));
const manifestIds = new Set();
for (const asset of manifest.assets || []) {
  check(!manifestIds.has(asset.id), `ID de ativo duplicado: ${asset.id}`);
  manifestIds.add(asset.id);
  const sourceAsset = asset.documentId === 'pop'
    ? popAssetById.get(asset.id)
    : flowAssetById.get(asset.id);
  check(Boolean(sourceAsset), `ativo ${asset.id} existe no manifesto, mas não no JSON de origem`);
  if (sourceAsset) {
    same(asset.sha256, sourceAsset.sha256, `${asset.id}: hash coerente com o documento`);
    same(asset.fileName, sourceAsset.fileName, `${asset.id}: nome coerente com o documento`);
  }
  try {
    const path = resolve(root, 'public/source-assets', asset.fileName);
    const [payload, info] = await Promise.all([readFile(path), stat(path)]);
    same(info.size, asset.bytes, `${asset.id}: tamanho do arquivo`);
    same(hash(payload), asset.sha256, `${asset.id}: SHA-256 do arquivo`);
    check(Boolean(asset.widthPx && asset.heightPx), `${asset.id}: dimensões ausentes`);
  } catch (error) {
    fail(`${asset.id}: arquivo ausente ou ilegível (${error.message})`);
  }
}

if (failures) {
  console.error(`\n${failures} problema(s) de proveniência/integridade.`);
  process.exit(1);
}
console.log(
  `OK: POP v${EXPECTED.version} · SHA-256 ${EXPECTED.sha256} · `
  + `${EXPECTED.learningSections}/${EXPECTED.learningSections} seções substantivas · `
  + `${EXPECTED.tables} tabelas · ${EXPECTED.figures} figuras · ${EXPECTED.totalAssets} ativos verificados.`,
);
