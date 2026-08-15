import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const sourceRoot = join(root, 'src');
const failures = [];

function fail(message) {
  failures.push(message);
}

try {
  const trackedDocuments = execFileSync(
    'git',
    ['ls-files', '--', '*.docx'],
    { cwd: root, encoding: 'utf8', windowsHide: true },
  ).trim();
  if (trackedDocuments) {
    fail(`documento institucional DOCX versionado: ${trackedDocuments.split(/\r?\n/u).join(', ')}`);
  }
} catch {
  fail('não foi possível confirmar a ausência de DOCX institucional no Git.');
}

async function sourceFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await sourceFiles(full));
    else if (['.js', '.jsx', '.mjs'].includes(extname(entry.name)) &&
             !/\.test\.(?:js|jsx|mjs)$/.test(entry.name)) found.push(full);
  }
  return found;
}

const dangerousPatterns = [
  ['dangerouslySetInnerHTML', /\bdangerouslySetInnerHTML\b/],
  ['HTML direto', /\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/],
  ['escrita direta no documento', /document\.(?:write|writeln)\s*\(/],
  ['execução dinâmica', /\beval\s*\(|new\s+Function\s*\(/],
  ['script criado em tempo de execução', /createElement\s*\(\s*['"]script['"]\s*\)/],
  ['URL javascript', /javascript\s*:/i],
];

const files = await sourceFiles(sourceRoot);
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const label = relative(root, file).replaceAll('\\', '/');
  for (const [kind, pattern] of dangerousPatterns) {
    if (pattern.test(text)) fail(`${label}: padrão proibido (${kind}).`);
  }

  for (const match of text.matchAll(/window\.open\s*\(/g)) {
    const call = text.slice(match.index, match.index + 320);
    if (!/noopener/.test(call)) {
      fail(`${label}: window.open sem noopener explícito.`);
    }
  }

  for (const match of text.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gs)) {
    if (!/\brel=["'][^"']*(?:noopener|noreferrer)[^"']*["']/.test(match[0])) {
      fail(`${label}: link target="_blank" sem noopener/noreferrer.`);
    }
  }
}

const html = await readFile(join(root, 'index.html'), 'utf8');
const cspMatch = html.match(
  /<meta\s+http-equiv=["']Content-Security-Policy["']\s+content=(?:"([^"]+)"|'([^']+)')/i,
);
const csp = cspMatch?.[1] || cspMatch?.[2];
if (!csp) {
  fail('index.html: CSP em meta não encontrada.');
} else {
  const scriptPolicy = csp.match(/(?:^|;\s*)script-src\s+([^;]+)/)?.[1] || '';
  if (!scriptPolicy.includes("'self'")) fail("index.html: script-src não limita a 'self'.");
  if (/unsafe-inline|unsafe-eval|\*/.test(scriptPolicy)) {
    fail('index.html: script-src contém permissão ampla ou insegura.');
  }
  if (!/object-src\s+'none'/.test(csp)) fail("index.html: object-src 'none' ausente.");
  if (!/base-uri\s+'self'/.test(csp)) fail("index.html: base-uri 'self' ausente.");
  if (!/form-action\s+'self'/.test(csp)) fail("index.html: form-action 'self' ausente.");
  if (/connect-src[^;]*(?:ws:\/\/|wss:\/\/)/.test(csp)) {
    fail('index.html: WebSocket foi liberado no CSP de produção.');
  }
}
if (/<script\b[^>]+src=["']https?:\/\//i.test(html)) {
  fail('index.html: script remoto encontrado; prefira artefato próprio e revisado.');
}

const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
for (const [group, dependencies] of Object.entries({
  dependencies: pkg.dependencies || {},
  devDependencies: pkg.devDependencies || {},
})) {
  for (const [name, specifier] of Object.entries(dependencies)) {
    if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(specifier)) {
      fail(`package.json: ${group}.${name} não está fixada em versão exata (${specifier}).`);
    }
  }
}
if (!pkg.private) fail('package.json: projeto publicável por engano; "private" deve ser true.');
if (!pkg.packageManager || !pkg.engines?.node) {
  fail('package.json: runtime/package manager não estão declarados.');
}

const profile = await readFile(join(sourceRoot, 'profile.js'), 'utf8');
if (!/MAX_BACKUP_BYTES\s*=\s*4\s*\*\s*1024\s*\*\s*1024/.test(profile)) {
  fail('src/profile.js: importação de backup sem limite explícito de 4 MB.');
}
if (!/BLOCKED_JSON_KEYS[\s\S]*__proto__[\s\S]*constructor[\s\S]*prototype/.test(profile)) {
  fail('src/profile.js: chaves de poluição de protótipo não são bloqueadas.');
}

if (failures.length) {
  console.error(`FALHA: ${failures.length} controle(s) de segurança não atendido(s):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(
  `OK: ${files.length} arquivos-fonte sem sinks críticos; CSP, links, backup e ` +
  'dependências seguem os controles locais.',
);
