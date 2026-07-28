import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'dist-pages', 'coverage']);
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.html', '.css',
  '.scss', '.txt', '.yml', '.yaml', '.toml', '.xml', '.svg', '.vtt', '.py', '.ps1',
  '.cmd', '.bat', '.sh', '.env', '.example',
]);

const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else inspect(full);
  }
}

function inspect(file) {
  const ext = path.extname(file).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext) && !['Dockerfile', 'LICENSE'].includes(path.basename(file))) return;

  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }

  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNo = index + 1;

    // Caminhos de perfil pessoal não devem aparecer em documentação ou código público.
    if (/\b[A-Za-z]:\\Users\\[^\\\s"']+/i.test(line) || /\/Users\/[^/\s"']+/i.test(line) || /\/home\/[^/\s"']+/i.test(line)) {
      findings.push({ severity: 'error', rel, lineNo, rule: 'personal-home-path', excerpt: line.trim() });
    }

    // Segredos comuns. Valores de exemplo claramente marcados são tolerados.
    if (!/(example|exemplo|placeholder|changeme|dummy|fake|test)/i.test(line)) {
      if (/(api[_-]?key|secret|token|password|passwd)\s*[:=]\s*["'][^"']{8,}["']/i.test(line)) {
        findings.push({ severity: 'error', rel, lineNo, rule: 'possible-secret', excerpt: line.trim() });
      }
      if (/-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(line)) {
        findings.push({ severity: 'error', rel, lineNo, rule: 'private-key', excerpt: line.trim() });
      }
    }
  });
}

for (const required of ['AGENTS.md', 'PLANO_EVOLUCAO.md', 'README.md', 'LEARNING_DESIGN.md']) {
  if (!fs.existsSync(path.join(ROOT, required))) {
    findings.push({ severity: 'error', rel: required, lineNo: 0, rule: 'required-governance-file', excerpt: 'arquivo ausente' });
  }
}

walk(ROOT);

if (findings.length) {
  console.error('\nAuditoria premium encontrou problemas:\n');
  for (const finding of findings) {
    console.error(`[${finding.severity.toUpperCase()}] ${finding.rule} · ${finding.rel}:${finding.lineNo}`);
    console.error(`  ${finding.excerpt}`);
  }
  console.error(`\nTotal: ${findings.length} problema(s).`);
  process.exitCode = 1;
} else {
  console.log('Auditoria premium aprovada: governança presente, sem caminhos pessoais ou segredos evidentes.');
}
