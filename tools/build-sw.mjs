// Gera o service worker e o manifesto do app a partir do build ja pronto.
//
// Por que gerar em vez de escrever a mao: os nomes dos arquivos de assets
// carregam hash, e a lista de precache precisa bater exatamente com o build
// que acabou de sair. Um sw.js escrito a mao envelhece no primeiro deploy.
//
// Estrategia de cache, pensada para vistoria em campo:
//   - PRECACHE do nucleo (HTML, JS, CSS e os JSON do POP): 1,3 MB. Isso deixa
//     todo o texto do procedimento, os quadros, as avaliacoes, o laboratorio e
//     os fluxogramas funcionando sem rede.
//   - RUNTIME para midia (/media, /hidro, /source-assets): 127 MB nao cabem em
//     precache, entao cada video ou imagem fica guardado quando e aberto, com
//     teto de entradas para nao crescer sem limite.
//   - HTML sempre tenta a rede primeiro, senao um deploy novo nunca chegaria.
//
// Uso:  node tools/build-sw.mjs <dir-do-build> [nome-do-repo]
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const dir = resolve(process.argv[2] || 'dist');
const repo = process.argv[3] || process.env.PAGES_REPO || '';
const BASE = repo ? `/${repo}/` : '/';

const TETO_MIDIA = 80; // entradas de midia guardadas (video de aula ~ 480 kB)

async function listar(sub) {
  try {
    const entradas = await readdir(join(dir, sub), { withFileTypes: true });
    return entradas.filter((e) => e.isFile()).map((e) => `${BASE}${sub}/${e.name}`);
  } catch {
    return [];
  }
}

const assets = await listar('assets');
const extras = ['manifest.webmanifest', 'icone-192.png', 'icone-512.png']
  .map((f) => `${BASE}${f}`);
const precache = [BASE, `${BASE}index.html`, ...assets, ...extras];

let bytes = 0;
for (const a of assets) {
  try { bytes += (await stat(join(dir, a.slice(BASE.length)))).size; } catch { /* ignora */ }
}

// A versao muda a cada build; o activate apaga os caches de versoes anteriores.
const versao = `iat-${Date.now().toString(36)}`;

const sw = `// Gerado por tools/build-sw.mjs. Nao editar a mao.
const VERSAO = '${versao}';
const NUCLEO = VERSAO + '-nucleo';
const MIDIA = VERSAO + '-midia';
const BASE = '${BASE}';
const TETO_MIDIA = ${TETO_MIDIA};
const PRECACHE = ${JSON.stringify(precache)};
const EH_MIDIA = /\\/(media|hidro|source-assets)\\//;

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(NUCLEO);
    // addAll falha inteiro se um item falhar; aqui um item ausente nao pode
    // impedir a instalacao do resto.
    await Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const nome of await caches.keys()) {
      if (!nome.startsWith(VERSAO)) await caches.delete(nome);
    }
    await self.clients.claim();
  })());
});

// Mantem o cache de midia sob teto, descartando as entradas mais antigas.
async function podar(cache) {
  const chaves = await cache.keys();
  if (chaves.length <= TETO_MIDIA) return;
  for (const k of chaves.slice(0, chaves.length - TETO_MIDIA)) await cache.delete(k);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegacao: rede primeiro, cache como rede de seguranca offline.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        const c = await caches.open(NUCLEO);
        c.put(BASE + 'index.html', r.clone());
        return r;
      } catch {
        return (await caches.match(BASE + 'index.html', { ignoreVary: true })) || Response.error();
      }
    })());
    return;
  }

  // Midia: cache primeiro, porque o arquivo nunca muda de conteudo sob o mesmo
  // nome e baixar de novo em campo custa caro.
  if (EH_MIDIA.test(url.pathname)) {
    e.respondWith((async () => {
      const c = await caches.open(MIDIA);
      const guardado = await c.match(req, { ignoreVary: true });
      if (guardado) return guardado;
      try {
        const r = await fetch(req);
        if (r.ok && r.status === 200) { await c.put(req, r.clone()); podar(c); }
        return r;
      } catch {
        return guardado || Response.error();
      }
    })());
    return;
  }

  // Assets com hash no nome: cache primeiro e pronto.
  e.respondWith((async () => {
    const guardado = await caches.match(req, { ignoreVary: true });
    if (guardado) return guardado;
    try {
      const r = await fetch(req);
      if (r.ok && url.pathname.startsWith(BASE + 'assets/')) {
        const c = await caches.open(NUCLEO);
        c.put(req, r.clone());
      }
      return r;
    } catch {
      return Response.error();
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'atualizar-agora') self.skipWaiting();
});
`;

const manifest = {
  name: 'Academia IAT · Licenciamento Hidrelétrico',
  short_name: 'Academia IAT',
  description: 'O POP de licenciamento ambiental de hidrelétricas do IAT em aulas, fluxos e prática.',
  start_url: BASE,
  scope: BASE,
  display: 'standalone',
  background_color: '#151f1b',
  theme_color: '#151f1b',
  lang: 'pt-BR',
  icons: [
    { src: `${BASE}icone-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `${BASE}icone-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: `${BASE}icone-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

await writeFile(join(dir, 'sw.js'), sw, 'utf8');
await writeFile(join(dir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

// O index.html do build precisa apontar para o manifesto e para o tema.
const idx = join(dir, 'index.html');
let html = await readFile(idx, 'utf8');
if (!html.includes('manifest.webmanifest')) {
  html = html.replace('</head>',
    `<link rel="manifest" href="${BASE}manifest.webmanifest"/>\n` +
    `<link rel="apple-touch-icon" href="${BASE}icone-192.png"/>\n</head>`);
  await writeFile(idx, html, 'utf8');
}

console.log(`sw.js: ${precache.length} arquivos no precache (${(bytes / 1e6).toFixed(2)} MB), base ${BASE}`);
console.log(`midia em runtime, teto de ${TETO_MIDIA} entradas`);
