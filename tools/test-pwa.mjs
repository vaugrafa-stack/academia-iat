import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import {
  gerarArtefatosPwa,
  gerarCodigoServiceWorker,
  normalizarBase,
} from './build-sw.mjs';

const ORIGIN = 'https://exemplo.test';

function chaveDoPedido(pedido) {
  return new URL(typeof pedido === 'string' ? pedido : pedido.url, ORIGIN).href;
}

class CacheMemoria {
  constructor() {
    this.itens = new Map();
    this.falharPorQuota = false;
  }

  async match(pedido) {
    const resposta = this.itens.get(chaveDoPedido(pedido));
    return resposta ? resposta.clone() : undefined;
  }

  async put(pedido, resposta) {
    if (this.falharPorQuota) {
      throw new DOMException('Quota de armazenamento excedida.', 'QuotaExceededError');
    }
    this.itens.set(chaveDoPedido(pedido), resposta.clone());
  }

  async keys() {
    return [...this.itens.keys()].map((url) => new Request(url));
  }

  async delete(pedido) {
    return this.itens.delete(chaveDoPedido(pedido));
  }
}

class CachesMemoria {
  constructor() {
    this.caches = new Map();
  }

  async open(nome) {
    if (!this.caches.has(nome)) this.caches.set(nome, new CacheMemoria());
    return this.caches.get(nome);
  }

  async keys() {
    return [...this.caches.keys()];
  }

  async delete(nome) {
    return this.caches.delete(nome);
  }

  async match(pedido) {
    for (const cache of this.caches.values()) {
      const resposta = await cache.match(pedido);
      if (resposta) return resposta;
    }
    return undefined;
  }
}

function criarRuntime(codigo, manipuladorFetch) {
  const listeners = new Map();
  const caches = new CachesMemoria();
  const mensagens = [];
  const rede = { manipulador: manipuladorFetch };
  let skipWaiting = 0;
  let claims = 0;

  const self = {
    location: { origin: ORIGIN },
    clients: {
      async claim() { claims += 1; },
      async matchAll() {
        return [{ postMessage: (mensagem) => mensagens.push(mensagem) }];
      },
    },
    addEventListener(tipo, listener) {
      listeners.set(tipo, listener);
    },
    async skipWaiting() {
      skipWaiting += 1;
    },
  };

  vm.runInNewContext(codigo, {
    self,
    caches,
    fetch: (pedido) => rede.manipulador(pedido),
    Request,
    Response,
    Headers,
    URL,
    DOMException,
    console,
    Set,
    Promise,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Math,
  }, { filename: 'sw-gerado.js' });

  async function disparar(tipo, propriedades = {}) {
    const esperas = [];
    let resposta;
    let eventoAtivo = true;
    const evento = {
      ...propriedades,
      waitUntil(promessa) {
        if (!eventoAtivo) throw new DOMException('Evento já encerrado.', 'InvalidStateError');
        esperas.push(Promise.resolve(promessa));
      },
      respondWith(promessa) {
        resposta = Promise.resolve(promessa);
      },
    };
    const listener = listeners.get(tipo);
    assert.ok(listener, `listener ${tipo} deveria existir`);
    listener(evento);
    eventoAtivo = false;
    const valor = resposta ? await resposta : undefined;
    await Promise.all(esperas);
    return valor;
  }

  return {
    caches,
    mensagens,
    rede,
    disparar,
    get skipWaiting() { return skipWaiting; },
    get claims() { return claims; },
  };
}

function codigoDeTeste(versao = 'build-a', revisoesMidia = {
  'media/aula/preservada.mp4': 'hash-preservado',
}) {
  const base = '/academia-iat/';
  const prefixo = 'academia-iat:academia-iat:';
  return gerarCodigoServiceWorker({
    base,
    versao,
    precache: [
      base,
      `${base}index.html`,
      `${base}assets/app.js`,
      `${base}manifest.webmanifest`,
      `${base}icone-192.png`,
      `${base}icone-512.png`,
      `${base}media/learning-stage/professor-sprite.webp`,
      `${base}media/learning-stage/thematic-atlas.webp`,
    ],
    cachePrefix: prefixo,
    cacheMidia: `${prefixo}media:v1`,
    revisoesMidia,
  });
}

async function testarGeracao() {
  assert.equal(normalizarBase('academia-iat'), '/academia-iat/');
  assert.equal(normalizarBase('/academia-iat/'), '/academia-iat/');
  assert.equal(normalizarBase(''), '/');

  const temporario = await mkdtemp(join(tmpdir(), 'academia-iat-pwa-'));
  try {
    await mkdir(join(temporario, 'assets'));
    await writeFile(join(temporario, 'index.html'), '<html><head></head><body>Academia</body></html>');
    await writeFile(join(temporario, 'assets', 'app-abc.js'), 'console.log("ok")');
    await writeFile(join(temporario, 'icone-192.png'), 'icone-192');
    await writeFile(join(temporario, 'icone-512.png'), 'icone-512');
    await mkdir(join(temporario, 'media', 'learning-stage'), { recursive: true });
    await writeFile(
      join(temporario, 'media', 'learning-stage', 'professor-sprite.webp'),
      'professor',
    );
    await writeFile(
      join(temporario, 'media', 'learning-stage', 'thematic-atlas.webp'),
      'cenarios',
    );

    const primeira = await gerarArtefatosPwa({
      diretorio: temporario,
      repositorio: 'academia-iat',
    });
    const segunda = await gerarArtefatosPwa({
      diretorio: temporario,
      repositorio: 'academia-iat',
    });
    assert.equal(primeira.versao, segunda.versao, 'build idêntico deve gerar versão idêntica');
    assert.equal(primeira.cacheMidia, 'academia-iat:academia-iat:media:v1');

    const manifest = JSON.parse(await readFile(join(temporario, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.start_url, '/academia-iat/');
    assert.equal(manifest.scope, '/academia-iat/');
    assert.equal(manifest.name, 'Academia IAT · Licenciamento Hidrelétrico');

    const sw = await readFile(join(temporario, 'sw.js'), 'utf8');
    assert.match(sw, /const BASE = "\/academia-iat\/"/);
    assert.doesNotMatch(sw, /self\.skipWaiting\(\);\s*\}\)\(\);\s*\}\);/);

    await writeFile(join(temporario, 'assets', 'app-abc.js'), 'console.log("mudou")');
    const terceira = await gerarArtefatosPwa({
      diretorio: temporario,
      repositorio: 'academia-iat',
    });
    assert.notEqual(terceira.versao, primeira.versao, 'conteúdo alterado deve mudar a versão');
  } finally {
    await rm(temporario, { recursive: true, force: true });
  }
}

async function testarInstalacaoEUpgrade() {
  const runtime = criarRuntime(codigoDeTeste(), async (pedido) => {
    const url = chaveDoPedido(pedido);
    return new Response(`núcleo:${url}`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  await runtime.disparar('install');
  assert.equal(runtime.skipWaiting, 0, 'instalação não pode ativar atualização sem consentimento');

  const nomesAposInstall = await runtime.caches.keys();
  const nucleoAtual = nomesAposInstall.find((nome) => nome.endsWith('core:build-a'));
  assert.ok(nucleoAtual, 'núcleo atual deve estar em cache');
  const respostaProfessor = await runtime.disparar('fetch', {
    request: new Request(
      `${ORIGIN}/academia-iat/media/learning-stage/professor-sprite.webp`,
    ),
  });
  assert.equal(respostaProfessor.status, 200);
  assert.match(
    await respostaProfessor.text(),
    /núcleo:/,
    'palco compartilhado deve abrir a partir do núcleo offline',
  );

  await runtime.caches.open('outro-app:core:123');
  await runtime.caches.open('academia-iat:academia-iat:core:build-antigo');
  const midia = await runtime.caches.open('academia-iat:academia-iat:media:v1');
  await midia.put(
    new Request(`${ORIGIN}/academia-iat/media/aula/preservada.mp4`),
    new Response('preservada', { status: 200 }),
  );
  await midia.put(
    new Request(`${ORIGIN}/academia-iat/media/aula/alterada.mp4`),
    new Response('antiga', { status: 200 }),
  );
  await midia.put(
    new Request(`${ORIGIN}/academia-iat/__pwa/revisoes-midia.json`),
    new Response(JSON.stringify({
      'media/aula/preservada.mp4': 'hash-preservado',
      'media/aula/alterada.mp4': 'hash-antigo',
    }), { status: 200 }),
  );

  const runtimeComRevisao = criarRuntime(codigoDeTeste('build-a', {
    'media/aula/preservada.mp4': 'hash-preservado',
    'media/aula/alterada.mp4': 'hash-novo',
  }), runtime.rede.manipulador);
  runtimeComRevisao.caches.caches = runtime.caches.caches;
  await runtimeComRevisao.disparar('activate');
  const nomesAtivos = await runtimeComRevisao.caches.keys();
  assert.ok(nomesAtivos.includes('outro-app:core:123'), 'cache de outro app deve ser preservado');
  assert.ok(!nomesAtivos.includes('academia-iat:academia-iat:core:build-antigo'));
  assert.ok(nomesAtivos.includes('academia-iat:academia-iat:media:v1'));
  assert.ok(await midia.match(`${ORIGIN}/academia-iat/media/aula/preservada.mp4`));
  assert.equal(
    await midia.match(`${ORIGIN}/academia-iat/media/aula/alterada.mp4`),
    undefined,
    'mídia alterada sob o mesmo nome deve ser invalidada',
  );
  assert.equal(runtimeComRevisao.claims, 1);

  const respostas = [];
  await runtimeComRevisao.disparar('message', {
    data: { tipo: 'IAT_ACTIVATE_UPDATE' },
    ports: [{ postMessage: (mensagem) => respostas.push(mensagem) }],
  });
  assert.equal(runtimeComRevisao.skipWaiting, 1, 'skipWaiting só ocorre após mensagem explícita');
  assert.equal(respostas[0].tipo, 'IAT_UPDATE_ACCEPTED');
}

async function testarRangeEDownloadVerificavel() {
  const bytes = Uint8Array.from({ length: 10 }, (_, indice) => indice);
  let requisicoesParciais = 0;
  let requisicoesCompletas = 0;
  const runtime = criarRuntime(codigoDeTeste(), async (pedido) => {
    const url = chaveDoPedido(pedido);
    if (url.includes('/media/aula/')) {
      const range = pedido.headers.get('range');
      if (range) {
        requisicoesParciais += 1;
        assert.equal(range, 'bytes=2-5', 'reprodução on-line deve preservar Range');
        return new Response(bytes.slice(2, 6), {
          status: 206,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': '4',
            'Content-Range': 'bytes 2-5/10',
          },
        });
      }
      requisicoesCompletas += 1;
      assert.equal(pedido.headers.get('range'), null, 'download persistente deve remover Range');
      return new Response(bytes, {
        status: 200,
        headers: { 'Content-Type': 'video/mp4', 'Content-Length': '10' },
      });
    }
    return new Response('core', { status: 200 });
  });
  await runtime.disparar('install');
  await runtime.disparar('activate');

  const urlVideo = `${ORIGIN}/academia-iat/media/aula/teste.mp4`;
  const primeira = await runtime.disparar('fetch', {
    request: new Request(urlVideo, { headers: { Range: 'bytes=2-5' } }),
  });
  assert.equal(primeira.status, 206);
  assert.equal(primeira.headers.get('content-range'), 'bytes 2-5/10');
  assert.deepEqual([...new Uint8Array(await primeira.arrayBuffer())], [2, 3, 4, 5]);

  const cacheMidia = await runtime.caches.open('academia-iat:academia-iat:media:v1');
  const completo = await cacheMidia.match(urlVideo);
  assert.equal(completo, undefined, 'reprodução on-line não deve ocupar o cache offline');
  assert.equal(requisicoesParciais, 1);
  assert.equal(requisicoesCompletas, 0);

  runtime.rede.manipulador = async () => {
    throw new TypeError('offline');
  };
  const segunda = await runtime.disparar('fetch', {
    request: new Request(urlVideo, { headers: { Range: 'bytes=6-9' } }),
  });
  assert.equal(segunda.status, 504);
  assert.equal(segunda.headers.get('x-academia-iat-offline'), 'media-miss');

  const downloadUrl = `${ORIGIN}/academia-iat/media/aula/download.mp4`;
  runtime.rede.manipulador = async () => new Response(Uint8Array.from([8, 9, 10]), {
    status: 200,
    headers: { 'Content-Type': 'video/mp4', 'Content-Length': '3' },
  });
  const mensagens = [];
  await runtime.disparar('message', {
    data: { tipo: 'IAT_CACHE_MEDIA', urls: [downloadUrl] },
    ports: [{ postMessage: (mensagem) => mensagens.push(mensagem) }],
  });
  const final = mensagens.find((mensagem) => mensagem.tipo === 'IAT_RESPONSE');
  assert.equal(final.ok, true);
  assert.equal(final.resultado.ok, true);
  assert.equal(final.resultado.baixados, 1);
  assert.ok(await cacheMidia.match(downloadUrl), 'download deve ser verificável no cache');

  runtime.rede.manipulador = async () => {
    throw new TypeError('offline');
  };
  const faixaGuardada = await runtime.disparar('fetch', {
    request: new Request(downloadUrl, { headers: { Range: 'bytes=1-2' } }),
  });
  assert.equal(faixaGuardada.status, 206);
  assert.deepEqual([...new Uint8Array(await faixaGuardada.arrayBuffer())], [9, 10]);

  const statusResponses = [];
  await runtime.disparar('message', {
    data: {
      tipo: 'IAT_GET_STATUS',
      urls: [downloadUrl, `${ORIGIN}/academia-iat/media/aula/ausente.mp4`],
    },
    ports: [{ postMessage: (mensagem) => statusResponses.push(mensagem) }],
  });
  const status = statusResponses.find((mensagem) => mensagem.tipo === 'IAT_RESPONSE');
  assert.equal(status.resultado.midia.urlsGuardadas[downloadUrl], true);
  assert.equal(
    status.resultado.midia.urlsGuardadas[`${ORIGIN}/academia-iat/media/aula/ausente.mp4`],
    false,
  );
}

async function testarFalhasClaras() {
  const runtimePrecache = criarRuntime(codigoDeTeste('falha'), async (pedido) => {
    const url = chaveDoPedido(pedido);
    return new Response(url.endsWith('/assets/app.js') ? 'ausente' : 'ok', {
      status: url.endsWith('/assets/app.js') ? 404 : 200,
    });
  });
  await assert.rejects(() => runtimePrecache.disparar('install'), /Precache incompleto/);
  assert.ok(
    runtimePrecache.mensagens.some((mensagem) =>
      mensagem.tipo === 'IAT_PWA_ERROR' && mensagem.codigo === 'PRECACHE_FAILED'),
    'falha de precache deve ser publicada com código',
  );
  assert.ok(
    !(await runtimePrecache.caches.keys()).some((nome) => nome.endsWith('core:falha')),
    'precache parcial deve ser removido',
  );

  const runtimeQuota = criarRuntime(codigoDeTeste('quota'), async (pedido) => {
    const url = chaveDoPedido(pedido);
    if (url.includes('/media/')) {
      return new Response(Uint8Array.from([1, 2]), {
        status: 200,
        headers: { 'Content-Length': '2' },
      });
    }
    return new Response('core', { status: 200 });
  });
  await runtimeQuota.disparar('install');
  const cacheMidia = await runtimeQuota.caches.open('academia-iat:academia-iat:media:v1');
  cacheMidia.falharPorQuota = true;
  const respostas = [];
  await runtimeQuota.disparar('message', {
    data: {
      tipo: 'IAT_CACHE_MEDIA',
      urls: [`${ORIGIN}/academia-iat/media/aula/quota.mp4`],
    },
    ports: [{ postMessage: (mensagem) => respostas.push(mensagem) }],
  });
  const final = respostas.find((mensagem) => mensagem.tipo === 'IAT_RESPONSE');
  assert.equal(final.ok, true, 'protocolo respondeu mesmo com falha do item');
  assert.equal(final.resultado.ok, false);
  assert.equal(final.resultado.falhas[0].codigo, 'QUOTA_EXCEEDED');
}

async function testarNavegacaoSemEnvenenarShell() {
  const runtime = criarRuntime(codigoDeTeste('navegacao'), async (pedido) => (
    new Response(`precache:${chaveDoPedido(pedido)}`, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  ));
  await runtime.disparar('install');
  const cache = await runtime.caches.open('academia-iat:academia-iat:core:navegacao');
  const indexUrl = `${ORIGIN}/academia-iat/index.html`;
  const shellAntes = await (await cache.match(indexUrl)).text();

  runtime.rede.manipulador = async () => new Response('{"ok":true}', {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const jsonResponse = await runtime.disparar('fetch', {
    request: {
      method: 'GET',
      mode: 'navigate',
      url: `${ORIGIN}/academia-iat/data.json`,
      headers: new Headers(),
    },
  });
  assert.equal(await jsonResponse.text(), '{"ok":true}');
  assert.equal(
    await (await cache.match(indexUrl)).text(),
    shellAntes,
    'navegar para JSON não pode substituir o shell offline',
  );

  runtime.rede.manipulador = async () => new Response('<html>shell novo</html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  const htmlResponse = await runtime.disparar('fetch', {
    request: {
      method: 'GET',
      mode: 'navigate',
      url: `${ORIGIN}/academia-iat/`,
      headers: new Headers(),
    },
  });
  assert.equal(await htmlResponse.text(), '<html>shell novo</html>');
  assert.equal(await (await cache.match(indexUrl)).text(), '<html>shell novo</html>');

  cache.falharPorQuota = true;
  runtime.rede.manipulador = async () => new Response('<html>rede válida</html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  const quotaResponse = await runtime.disparar('fetch', {
    request: {
      method: 'GET',
      mode: 'navigate',
      url: `${ORIGIN}/academia-iat/`,
      headers: new Headers(),
    },
  });
  assert.equal(
    await quotaResponse.text(),
    '<html>rede válida</html>',
    'falha ao gravar o cache não pode esconder a resposta válida da rede',
  );
  assert.ok(
    runtime.mensagens.some((mensagem) =>
      mensagem.tipo === 'IAT_PWA_ERROR' && mensagem.codigo === 'QUOTA_EXCEEDED'),
  );

  const consultarConexao = async () => {
    const respostas = [];
    await runtime.disparar('message', {
      data: { tipo: 'IAT_GET_STATUS' },
      ports: [{ postMessage: (mensagem) => respostas.push(mensagem) }],
    });
    return respostas.find((mensagem) => mensagem.tipo === 'IAT_RESPONSE')?.resultado;
  };
  assert.equal(
    (await consultarConexao()).conexaoDaUltimaNavegacao,
    'online',
    'a ultima navegacao atendida pela rede deve ser observavel',
  );
  assert.ok(Number.isFinite((await consultarConexao()).conexaoDaUltimaNavegacaoEm));

  runtime.rede.manipulador = async () => {
    throw new TypeError('offline');
  };
  const offlineResponse = await runtime.disparar('fetch', {
    request: {
      method: 'GET',
      mode: 'navigate',
      url: `${ORIGIN}/academia-iat/`,
      headers: new Headers(),
    },
  });
  assert.match(await offlineResponse.text(), /shell novo/);
  assert.equal(
    (await consultarConexao()).conexaoDaUltimaNavegacao,
    'offline',
    'fallback do shell deve informar o estado offline a pagina recarregada',
  );
}

const testes = [
  ['geração determinística e base do GitHub Pages', testarGeracao],
  ['instalação controlada e upgrade isolado', testarInstalacaoEUpgrade],
  ['Range via rede, cache explícito e download verificável', testarRangeEDownloadVerificavel],
  ['erros de precache e quota observáveis', testarFalhasClaras],
  ['navegação não envenena nem mascara o shell', testarNavegacaoSemEnvenenarShell],
];

let falhas = 0;
for (const [nome, teste] of testes) {
  try {
    await teste();
    console.log(`✓ ${nome}`);
  } catch (erro) {
    falhas += 1;
    console.error(`✗ ${nome}`);
    console.error(erro);
  }
}

if (falhas) {
  console.error(`\n${falhas} teste(s) PWA falharam.`);
  process.exitCode = 1;
} else {
  console.log(`\n${testes.length} grupos PWA aprovados.`);
}
