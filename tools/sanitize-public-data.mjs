import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const PUBLIC_FILES = [
  'src/data/pop-content.json',
  'src/data/pop-public-content.json',
  'src/data/flowcharts-content.json',
];

const BLOCKED_KEYS = new Set([
  'creator',
  'lastmodifiedby',
  'fullpath',
  'manager',
  'company',
  'hyperlinkbase',
]);

const CORE_ALLOWLIST = new Set([
  'title',
  'subject',
  'keywords',
  'description',
  'revision',
  'created',
  'modified',
  'category',
  'contentStatus',
  'contentType',
  'identifier',
  'language',
  'version',
]);

const APPLICATION_ALLOWLIST = new Set([
  'Template',
  'TotalTime',
  'Pages',
  'Words',
  'Characters',
  'Application',
  'DocSecurity',
  'Lines',
  'Paragraphs',
  'ScaleCrop',
  'HeadingPairs',
  'TitlesOfParts',
  'LinksUpToDate',
  'CharactersWithSpaces',
  'SharedDoc',
  'HyperlinksChanged',
  'AppVersion',
]);

const UNSAFE_PATTERNS = [
  {
    rule: 'personal-home-path',
    pattern: /\b[A-Za-z]:\\+(?:Users|Documents and Settings)\\+/i,
  },
  {
    rule: 'unix-home-path',
    pattern: /\/(?:Users|home)\/[^/"\s]+/i,
  },
  {
    rule: 'email-in-source-artifact',
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  },
  // A restricao permanente nomeia estes identificadores um a um: nenhum
  // empreendimento nomeado, pessoa, CNPJ, protocolo, numero de licenca ou
  // municipio identificavel. A lista acima cobria caminho de usuario e e-mail,
  // e nenhum dos identificadores brasileiros que a regra cita por nome.
  //
  // O vetor de vazamento aqui e a FONTE: estes tres arquivos saem da extracao
  // de um documento institucional real, e nao de texto escrito por nos. E
  // exatamente onde um numero de processo entra sem ninguem reparar.
  //
  // Medidos contra a base atual antes de entrar: zero ocorrencia dos cinco.
  // Padrao que ja nasce reprovando por falso positivo nao vira portao, vira
  // exclusao.
  {
    rule: 'cnpj-em-conteudo-publico',
    pattern: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/,
  },
  {
    rule: 'cpf-em-conteudo-publico',
    pattern: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/,
  },
  {
    rule: 'protocolo-em-conteudo-publico',
    pattern: /\b\d{2}\.\d{3}\.\d{3}-\d\b/,
  },
  {
    rule: 'telefone-em-conteudo-publico',
    pattern: /\(\d{2}\)\s?9?\d{4}-\d{4}/,
  },
  {
    rule: 'cep-em-conteudo-publico',
    pattern: /\b\d{5}-\d{3}\b/,
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function personalMetadataValues(document) {
  const candidates = [
    document?.metadata?.core?.creator,
    document?.metadata?.core?.lastModifiedBy,
    document?.metadata?.application?.Manager,
  ];
  return candidates
    .filter((value) => typeof value === 'string' && value.trim().length >= 3)
    .map((value) => value.trim());
}

function sanitizeString(value, personalValues) {
  let result = value;
  for (const personalValue of [...personalValues].sort((a, b) => b.length - a.length)) {
    result = result.replace(
      new RegExp(escapeRegExp(personalValue), 'gi'),
      '[nome removido por privacidade]',
    );
  }
  result = result.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    '[e-mail removido por privacidade]',
  );
  return result;
}

function sanitizeValue(value, personalValues) {
  if (typeof value === 'string') return sanitizeString(value, personalValues);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, personalValues));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !BLOCKED_KEYS.has(key.toLowerCase()))
      .map(([key, child]) => [key, sanitizeValue(child, personalValues)]),
  );
}

function keepAllowedProperties(properties, allowlist) {
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return {};
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => allowlist.has(key)),
  );
}

export function sanitizePublicDocument(document) {
  const personalValues = personalMetadataValues(document);
  const sanitized = sanitizeValue(document, personalValues);
  if (sanitized.metadata && typeof sanitized.metadata === 'object') {
    sanitized.metadata.core = keepAllowedProperties(sanitized.metadata.core, CORE_ALLOWLIST);
    sanitized.metadata.application = keepAllowedProperties(
      sanitized.metadata.application,
      APPLICATION_ALLOWLIST,
    );
    sanitized.metadata.custom = {};
  }
  return sanitized;
}

export function findUnsafePublicData(serialized) {
  const findings = [];
  for (const { rule, pattern } of UNSAFE_PATTERNS) {
    if (pattern.test(serialized)) findings.push(rule);
  }
  if (/"(?:creator|lastModifiedBy|fullPath|manager|company|hyperlinkBase)"\s*:/i.test(serialized)) {
    findings.push('blocked-metadata-key');
  }
  return [...new Set(findings)];
}

export function isSanitizedPublicDocument(document) {
  return JSON.stringify(document) === JSON.stringify(sanitizePublicDocument(document));
}

async function processFile(relativePath, checkOnly) {
  const absolutePath = path.join(ROOT, relativePath);
  const raw = await readFile(absolutePath, 'utf8');
  const parsed = JSON.parse(raw);
  const sanitized = sanitizePublicDocument(parsed);
  const output = `${JSON.stringify(sanitized)}\n`;
  const findings = findUnsafePublicData(output);

  if (findings.length) {
    throw new Error(`${relativePath}: conteúdo público inseguro (${findings.join(', ')})`);
  }

  // O gate verifica o conteúdo, não a representação textual do JSON.
  // Git pode materializar LF como CRLF em um clone Windows; exigir igualdade
  // byte a byte fazia um artefato semanticamente sanitizado reprovar apenas
  // pelo sistema operacional.
  if (isSanitizedPublicDocument(parsed)) {
    console.log(`OK: ${relativePath} já está sanitizado.`);
    return;
  }

  if (checkOnly) {
    throw new Error(`${relativePath}: artefato público precisa ser sanitizado.`);
  }

  await writeFile(absolutePath, output, 'utf8');
  console.log(`ATUALIZADO: ${relativePath} sem caminhos ou metadados pessoais.`);
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const errors = [];
  for (const relativePath of PUBLIC_FILES) {
    try {
      await processFile(relativePath, checkOnly);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length) {
    for (const error of errors) console.error(`FALHA: ${error}`);
    process.exitCode = 1;
  }
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) await main();
