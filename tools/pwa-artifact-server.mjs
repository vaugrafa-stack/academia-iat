// Servidor autocontido para testar o artefato PWA final em um navegador real.
//
// Ele nunca altera `dist`: a segunda versao do Service Worker existe somente
// em memoria, o que permite provar o fluxo de atualizacao sem copiar os quase
// 250 MB do artefato nem deixar residuos no build aprovado.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve, sep } from 'node:path';

const HOST = '127.0.0.1';
const PORT = Number(process.env.PWA_TEST_PORT || 4191);
const DIST = resolve(process.env.PWA_DIST_DIR || 'dist');
const DIST_PREFIX = `${DIST}${sep}`;

const MIME = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.vtt', 'text/vtt; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function fail(message) {
  throw new Error(`[PWA artifact server] ${message}`);
}

const [indexV1, manifestText, serviceWorkerV1] = await Promise.all([
  readFile(resolve(DIST, 'index.html'), 'utf8'),
  readFile(resolve(DIST, 'manifest.webmanifest'), 'utf8'),
  readFile(resolve(DIST, 'sw.js'), 'utf8'),
]);
const manifest = JSON.parse(manifestText);
const base = String(manifest.scope || '');
const expectedBase = String(process.env.PWA_EXPECTED_BASE || '/academia-iat/');
if (!(base === '/' || /^\/[A-Za-z0-9._/-]+\/$/.test(base)) || base.includes('..')) {
  fail(`escopo invalido no manifesto: ${JSON.stringify(base)}`);
}
if (base !== expectedBase) {
  fail(`o ensaio exige a base ${expectedBase}; recebido ${base}`);
}
if (manifest.id !== base || manifest.start_url !== base) {
  fail(`id, start_url e scope precisam coincidir: ${manifest.id} / ${manifest.start_url} / ${base}`);
}
const expectedRepository = String(process.env.PAGES_REPO || '').trim();
if (expectedRepository && base !== `/${expectedRepository.replace(/^\/+|\/+$/g, '')}/`) {
  fail(`artefato fora da base do Pages: recebido ${base}`);
}
if (!serviceWorkerV1.includes(`const BASE = ${JSON.stringify(base)};`)) {
  fail(`Service Worker fora da base ${base}`);
}

const versionMatch = serviceWorkerV1.match(/const VERSAO = "([^"]+)";/);
if (!versionMatch) fail('constante VERSAO nao encontrada no Service Worker');
const versionV1 = versionMatch[1];
const versionV2 = `${versionV1}-pwa-test-v2`;
const serviceWorkerV2 = serviceWorkerV1.replace(
  `const VERSAO = ${JSON.stringify(versionV1)};`,
  `const VERSAO = ${JSON.stringify(versionV2)};`,
);
if (serviceWorkerV2 === serviceWorkerV1) fail('nao foi possivel preparar a segunda versao');
const indexV2 = indexV1.replace(
  '</head>',
  '  <meta name="pwa-test-version" content="2"/>\n</head>',
);

let activeVersion = 1;

function json(response, statusCode, value) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Length': body.length,
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(body);
}

function noContent(response) {
  response.writeHead(204, { 'Cache-Control': 'no-store' });
  response.end();
}

function safeArtifactPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (!decoded.startsWith(base) || decoded.includes('\0') || decoded.includes('\\')) return null;
  const relativePath = decoded.slice(base.length).replace(/^\/+/, '');
  if (!relativePath || relativePath === 'index.html') return resolve(DIST, 'index.html');
  const absolute = resolve(DIST, relativePath);
  if (absolute !== DIST && !absolute.startsWith(DIST_PREFIX)) return null;
  return absolute;
}

async function serveArtifact(request, response, pathname) {
  const filePath = safeArtifactPath(pathname);
  if (!filePath) {
    json(response, 404, { error: 'not-found' });
    return;
  }

  const relativePath = relative(DIST, filePath).replaceAll('\\', '/');
  let body;
  if (relativePath === 'index.html') {
    body = Buffer.from(activeVersion === 2 ? indexV2 : indexV1);
  } else if (relativePath === 'sw.js') {
    body = Buffer.from(activeVersion === 2 ? serviceWorkerV2 : serviceWorkerV1);
  } else {
    try {
      const info = await stat(filePath);
      if (!info.isFile()) throw new Error('not a file');
      body = await readFile(filePath);
    } catch {
      json(response, 404, { error: 'not-found' });
      return;
    }
  }

  const noStore = relativePath === 'index.html' || relativePath === 'sw.js';
  response.writeHead(200, {
    'Cache-Control': noStore ? 'no-store' : 'public, max-age=31536000, immutable',
    'Content-Length': body.length,
    'Content-Type': MIME.get(extname(relativePath).toLowerCase()) || 'application/octet-stream',
    ...(relativePath === 'sw.js' ? { 'Service-Worker-Allowed': base } : {}),
  });
  if (request.method === 'HEAD') response.end();
  else response.end(body);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${HOST}:${PORT}`);
    if (request.method === 'GET' && url.pathname === '/__pwa-test/health') {
      json(response, 200, { ok: true, base, activeVersion, versionV1, versionV2 });
      return;
    }
    if (request.method === 'GET' && url.pathname === '/__pwa-test/state') {
      json(response, 200, { base, activeVersion, versionV1, versionV2 });
      return;
    }
    if (request.method === 'POST' && url.pathname === '/__pwa-test/reset') {
      activeVersion = 1;
      noContent(response);
      return;
    }
    if (request.method === 'POST' && url.pathname === '/__pwa-test/version/2') {
      activeVersion = 2;
      noContent(response);
      return;
    }
    if ((request.method === 'GET' || request.method === 'HEAD') && url.pathname.startsWith(base)) {
      await serveArtifact(request, response, url.pathname);
      return;
    }
    json(response, request.method === 'GET' ? 404 : 405, { error: 'unsupported-request' });
  } catch (error) {
    json(response, 500, { error: error?.message || String(error) });
  }
});

server.on('clientError', (_error, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

await new Promise((resolvePromise, rejectPromise) => {
  server.once('error', rejectPromise);
  server.listen(PORT, HOST, () => {
    server.off('error', rejectPromise);
    resolvePromise();
  });
});
console.log(`PWA artifact server: http://${HOST}:${PORT}${base} (V1 ${versionV1})`);

function shutdown() {
  server.close(() => process.exit(0));
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
