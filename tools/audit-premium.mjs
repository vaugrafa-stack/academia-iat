import fs from 'node:fs';
import path from 'node:path';
import { isPermittedPublicEmail } from './audit-premium-email-policy.mjs';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([
  '.git',
  '.video_tools',
  '.playwright-cli',
  'node_modules',
  'dist',
  'dist-pages',
  'coverage',
]);
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.html', '.css',
  '.scss', '.txt', '.yml', '.yaml', '.toml', '.xml', '.svg', '.vtt', '.py', '.ps1',
  '.cmd', '.bat', '.sh', '.example',
]);
const findings = [];

function addFinding(rule, file, lineNo = 0) {
  findings.push({
    rel: path.relative(ROOT, file).replaceAll('\\', '/'),
    lineNo,
    rule,
  });
}

function walk(directory) {
  let entries;
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    addFinding('unreadable-path', directory);
    return;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else inspect(full);
  }
}

function isPlaceholder(value) {
  return /^(?:changeme|dummy|example|exemplo|fake|placeholder|redacted|test)(?:[-_].*)?$/i.test(value);
}

function inspect(file) {
  const base = path.basename(file);
  const ext = path.extname(file).toLowerCase();

  if (base === '.env' || (base.startsWith('.env.') && base !== '.env.example')) {
    addFinding('environment-file-published', file);
  }

  if (!TEXT_EXTENSIONS.has(ext) && !['Dockerfile', 'LICENSE', '.env.example'].includes(base)) return;

  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    addFinding('unreadable-text-file', file);
    return;
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNo = index + 1;

    // Aceita uma ou mais barras para também encontrar caminhos escapados em JSON.
    if (
      /\b[A-Za-z]:\\+(?:Users|Documents and Settings)\\+/i.test(line)
      || /\/(?:Users|home)\/[^/\s"']+/i.test(line)
    ) {
      addFinding('personal-home-path', file, lineNo);
    }

    if (/"(?:creator|lastModifiedBy|fullPath|manager|company|hyperlinkBase)"\s*:/i.test(line)) {
      addFinding('personal-document-metadata', file, lineNo);
    }

    for (const email of line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []) {
      if (!isPermittedPublicEmail(email)) {
        addFinding('non-generic-email', file, lineNo);
      }
    }

    const assignedSecret = line.match(
      /(api[_-]?key|client[_-]?secret|access[_-]?token|password|passwd)\s*[:=]\s*["']([^"']{8,})["']/i,
    );
    if (assignedSecret && !isPlaceholder(assignedSecret[2])) {
      addFinding('possible-secret', file, lineNo);
    }
    if (/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(line)) {
      addFinding('private-key', file, lineNo);
    }
  });
}

for (const required of [
  'AGENTS.md',
  'CLAUDE.md',
  'PLANO_EVOLUCAO.md',
  'README.md',
  'LEARNING_DESIGN.md',
]) {
  const full = path.join(ROOT, required);
  if (!fs.existsSync(full)) addFinding('required-governance-file', full);
}

walk(ROOT);

if (findings.length) {
  console.error('\nAuditoria premium encontrou problemas:\n');
  for (const finding of findings) {
    const location = finding.lineNo ? `:${finding.lineNo}` : '';
    console.error(`[ERRO] ${finding.rule} · ${finding.rel}${location}`);
  }
  console.error(`\nTotal: ${findings.length} problema(s). Conteúdo sensível não é reproduzido no log.`);
  process.exitCode = 1;
} else {
  console.log(
    'Auditoria premium aprovada: governança presente e nenhum caminho pessoal, '
      + 'metadado de autoria, e-mail não genérico ou segredo evidente foi encontrado.',
  );
}
