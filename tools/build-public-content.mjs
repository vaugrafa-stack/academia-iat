import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'src', 'data', 'pop-content.json');
const OUTPUT = path.join(ROOT, 'src', 'data', 'pop-public-content.json');
const CHECK_ONLY = process.argv.includes('--check');

const FORBIDDEN_PUBLIC_TERMS = [
  /\bIA\b/iu,
  /intelig[êe]ncia artificial/iu,
  /artificial intelligence/iu,
  /\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b/iu,
  /\b(?:modelos? de linguagem|large language models?|machine learning|aprendizado de máquina)\b/iu,
  /\b(?:revisão|validação|autoria|aprovação|conferência|avaliação)(?:\s+técnica)?\s+humana\b/iu,
];

// Linhas de política interna sobre uso de IA. Existiam na minuta v1.7 e não
// existem mais na v1.9. O filtro continua porque a fonte pode voltar a trazê-las.
const OMITIR_LINHA_IA = /^(Declaração sobre|Limites de)\s+IA$/iu;

function hasForbiddenTerm(value) {
  return typeof value === 'string'
    && FORBIDDEN_PUBLIC_TERMS.some((pattern) => pattern.test(value));
}

function publicText(value) {
  if (typeof value !== 'string') return value;
  const transformed = value
    .replace(/,\s*complementaç(?:ão|ões)\s+e\s+uso\s+de\s+IA/giu, ', complementações')
    .replace(/\s+e\s+uso\s+de\s+IA\b/giu, '')
    .replace(
      /\bIA pode ser apoio nos limites do TR e não substitui julgamento, autoria, dado de campo ou responsabilidade profissional\./giu,
      'Julgamento, autoria, dados de campo e responsabilidade profissional permanecem atribuídos à equipe responsável.',
    )
    .replace(
      /(?:,\s*|\s+e\s+)declaração(?:\s+obrigatória)?\s+sobre(?:\s+uso\s+de)?\s+IA(?:\s+quando\s+exigida)?/giu,
      '',
    )
    .replace(/,\s*IA(?=\s*[,?])/giu, '')
    .replace(/\bIA,\s*/giu, '')
    .replace(/\bvalidação humana\b/giu, 'validação técnica')
    .replace(/\brevisão humana\b/giu, 'conferência técnica')
    .replace(/\bautoria humana\b/giu, 'autoria e responsabilidade técnica');
  if (transformed === value) return value;
  return transformed
    .replace(/\s+,/gu, ',')
    .replace(/,\s*,/gu, ',')
    .replace(/\s{2,}/gu, ' ')
    .trim();
}

function transformStrings(value) {
  if (typeof value === 'string') return publicText(value);
  if (Array.isArray(value)) return value.map(transformStrings);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, transformStrings(child)]),
  );
}

function buildPublicContent(source) {
  const result = structuredClone(source);
  let omittedSourceRows = 0;
  const section = result.sections.find((item) => item.id === 'pop-section-072');
  if (!section) throw new Error('Seção de apresentação pública não localizada.');

  section.title = publicText(section.title);
  section.fullTitle = [section.number, section.title].filter(Boolean).join(' ');

  const heading = result.blocks.find((block) => block.id === section.headingBlockId);
  if (heading?.paragraph) heading.paragraph.text = section.fullTitle;

  for (const block of result.blocks) {
    if (block?.paragraph?.text) {
      block.paragraph.text = publicText(block.paragraph.text);
    }
  }

  for (const table of result.tables) {
    table.title = publicText(table.title);
    table.caption = publicText(table.caption);
    table.rows = table.rows
      .filter((row) => {
        const omit = OMITIR_LINHA_IA.test(row.cells[0]?.text || '');
        if (omit) omittedSourceRows += 1;
        return !omit;
      })
      .map((row, rowIndex) => ({
        ...row,
        index: rowIndex + 1,
      }));
  }
  // O que este portão protege é que nenhuma linha de política interna sobre IA
  // chegue ao build público. Ele fixava o número exato, 2, que era quantas a
  // minuta v1.7 tinha. Isso o fazia reprovar quando a fonte mudasse, o que de
  // fato aconteceu: a v1.9 removeu as duas linhas do próprio POP. Fixar o
  // número testava a fonte; testar a saída testa a regra.
  const vazouParaOPublico = result.tables.some((table) =>
    table.rows.some((row) => OMITIR_LINHA_IA.test(row.cells[0]?.text || '')),
  );
  if (vazouParaOPublico) {
    throw new Error(
      'Linha de política interna sobre IA sobreviveu ao build público.',
    );
  }
  console.log(
    `Política editorial: ${omittedSourceRows} linha(s) de política interna sobre IA omitida(s) da fonte.`,
  );

  const publicResult = transformStrings(result);
  const tableParagraphCount = publicResult.tables.reduce(
    (total, table) => total + table.rows.reduce(
      (rowTotal, row) => rowTotal + row.cells.reduce(
        (cellTotal, cell) => cellTotal + (cell.paragraphs?.length || 0),
        0,
      ),
      0,
    ),
    0,
  );
  const omittedSourceParagraphNodes =
    (source.stats?.tableParagraphCount || 0) - tableParagraphCount;
  publicResult.stats = {
    ...publicResult.stats,
    tableParagraphCount,
    allDocumentParagraphNodes:
      (publicResult.stats?.bodyParagraphCount || 0) + tableParagraphCount,
    searchableParagraphNodes:
      (publicResult.stats?.bodyParagraphCount || 0) + tableParagraphCount,
    sourceParagraphNodeCount:
      (publicResult.stats?.sourceBodyParagraphCount || 0) + tableParagraphCount,
  };
  publicResult.publicPresentation = {
    policyVersion: 1,
    sourceContentPreservedSeparately: true,
    omittedSourceRows,
    omittedSourceParagraphNodes,
    renamedSectionIds: ['pop-section-072'],
  };

  const serialized = JSON.stringify(publicResult);
  if (hasForbiddenTerm(serialized)) {
    throw new Error('A apresentação pública ainda contém termo removido por preferência editorial.');
  }
  return `${serialized}\n`;
}

const source = JSON.parse(await readFile(SOURCE, 'utf8'));
const expected = buildPublicContent(source);
let current = null;
try {
  current = await readFile(OUTPUT, 'utf8');
} catch {
  // O modo de escrita cria o artefato; o modo de verificação falha abaixo.
}

if (CHECK_ONLY) {
  if (current !== expected) {
    console.error('FALHA: pop-public-content.json está ausente ou desatualizado.');
    process.exit(1);
  }
  console.log('OK: apresentação pública do POP está atualizada e sem termos removidos.');
} else if (current === expected) {
  console.log('OK: apresentação pública do POP já estava atualizada.');
} else {
  await writeFile(OUTPUT, expected, 'utf8');
  console.log('OK: apresentação pública do POP foi atualizada.');
}
