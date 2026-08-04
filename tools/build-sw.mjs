// Gera os artefatos PWA a partir do build pronto.
//
// O núcleo é versionado pelo conteúdo do build. A mídia usa um cache estável,
// exclusivo desta aplicação e deste escopo, para sobreviver a novas versões.
// Uma atualização instalada só é ativada depois da confirmação da interface.
//
// Uso: node tools/build-sw.mjs <diretorio-do-build> [nome-do-repositorio]
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const APP_ID = 'academia-iat';
const MEDIA_SCHEMA = 'v1';
const LEARNING_STAGE_CORE = [
  'media/learning-stage/professor-sprite.webp',
  'media/learning-stage/thematic-atlas.webp',
];

export function normalizarBase(repo = '') {
  const limpo = String(repo).trim().replace(/^\/+|\/+$/g, '');
  return limpo ? `/${limpo}/` : '/';
}

function idDoEscopo(base) {
  if (base === '/') return 'root';
  return base
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 80) || 'root';
}

function caminhoPublico(base, relativo = '') {
  return `${base}${relativo.replace(/^\/+/, '')}`;
}

async function listarArquivos(dir, subdiretorio) {
  try {
    const entradas = await readdir(join(dir, subdiretorio), { withFileTypes: true });
    return entradas
      .filter((entrada) => entrada.isFile())
      .map((entrada) => `${subdiretorio}/${entrada.name}`)
      .sort();
  } catch {
    return [];
  }
}

async function listarArquivosRecursivos(dir, subdiretorio) {
  const encontrados = [];
  async function visitar(relativo) {
    let entradas;
    try {
      entradas = await readdir(join(dir, relativo), { withFileTypes: true });
    } catch {
      return;
    }
    for (const entrada of entradas) {
      const filho = `${relativo}/${entrada.name}`;
      if (entrada.isDirectory()) await visitar(filho);
      else if (entrada.isFile()) encontrados.push(filho.replaceAll('\\', '/'));
    }
  }
  await visitar(subdiretorio);
  return encontrados.sort();
}

function inserirOuAtualizarLink(html, rel, href) {
  const link = `<link rel="${rel}" href="${href}"/>`;
  const padrao = new RegExp(`<link\\s+[^>]*rel=["']${rel}["'][^>]*>`, 'i');
  if (padrao.test(html)) return html.replace(padrao, link);
  return html.replace('</head>', `${link}\n</head>`);
}

async function hashDoBuild(dir, arquivos) {
  const hash = createHash('sha256');
  for (const relativo of [...arquivos].sort()) {
    hash.update(relativo);
    hash.update('\0');
    hash.update(await readFile(join(dir, relativo)));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 16);
}

async function revisoesDasMidias(dir, arquivos) {
  const revisoes = {};
  for (const relativo of arquivos) {
    revisoes[relativo] = createHash('sha256')
      .update(await readFile(join(dir, relativo)))
      .digest('hex')
      .slice(0, 16);
  }
  return revisoes;
}

export function gerarCodigoServiceWorker({
  base,
  versao,
  precache,
  cachePrefix,
  cacheMidia,
  revisoesMidia = {},
}) {
  return `// Gerado por tools/build-sw.mjs. Não editar manualmente.
'use strict';

const APP_ID = ${JSON.stringify(APP_ID)};
const VERSAO = ${JSON.stringify(versao)};
const BASE = ${JSON.stringify(base)};
const CACHE_PREFIX = ${JSON.stringify(cachePrefix)};
const CACHE_NUCLEO_PREFIX = CACHE_PREFIX + 'core:';
const CACHE_NUCLEO = CACHE_NUCLEO_PREFIX + VERSAO;
const CACHE_MIDIA = ${JSON.stringify(cacheMidia)};
const PRECACHE = ${JSON.stringify(precache)};
const REVISOES_MIDIA = ${JSON.stringify(revisoesMidia)};
const INDEX_URL = new URL(BASE + 'index.html', self.location.origin).href;
const META_MIDIA_URL = new URL(BASE + '__pwa/revisoes-midia.json', self.location.origin).href;
// navigator.onLine pode voltar a true numa pagina que acabou de nascer de
// um fallback do Service Worker (isso ocorre inclusive no Chromium). O estado
// observado pela navegacao network-first e mais fiel e pode ser consultado
// pela interface logo depois do carregamento.
let ULTIMA_CONEXAO_DA_NAVEGACAO = null;
let ULTIMA_CONEXAO_DA_NAVEGACAO_EM = null;

function serializarErro(erro, codigoPadrao) {
  const nome = erro && erro.name ? String(erro.name) : '';
  const mensagem = erro && erro.message ? String(erro.message) : String(erro || 'Erro desconhecido');
  const quota = nome === 'QuotaExceededError' || /quota|storage|armazenamento/i.test(mensagem);
  return {
    codigo: quota ? 'QUOTA_EXCEEDED' : codigoPadrao,
    mensagem,
  };
}

async function publicar(tipo, dados = {}) {
  try {
    const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const cliente of janelas) {
      cliente.postMessage({ origem: APP_ID, tipo, versao: VERSAO, ...dados });
    }
  } catch {
    // Uma falha de telemetria local nunca deve impedir o funcionamento offline.
  }
}

function responderMensagem(evento, mensagem) {
  const destino = evento.ports && evento.ports[0] ? evento.ports[0] : evento.source;
  if (destino && typeof destino.postMessage === 'function') destino.postMessage(mensagem);
}

function estaNoEscopo(url) {
  return url.origin === self.location.origin &&
    (BASE === '/' || url.pathname.startsWith(BASE));
}

function ehEntradaDaAplicacao(url) {
  const entrada = new URL(INDEX_URL);
  const raiz = new URL(BASE, self.location.origin);
  return url.origin === entrada.origin &&
    (url.pathname === entrada.pathname || url.pathname === raiz.pathname);
}

function caminhoNoEscopo(url) {
  return BASE === '/' ? url.pathname.replace(/^\\/+/, '') : url.pathname.slice(BASE.length);
}

function ehMidia(url) {
  return estaNoEscopo(url) && /^(media|hidro|source-assets)\\//.test(caminhoNoEscopo(url));
}

function pedidoCompleto(request) {
  const headers = new Headers(request.headers);
  headers.delete('range');
  headers.delete('if-range');
  return new Request(request, { headers, cache: 'no-store' });
}

function pedidoCompletoDaUrl(url) {
  return new Request(url.href, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}

function validarUrlDeMidia(valor) {
  const url = new URL(String(valor), self.location.origin);
  if (!ehMidia(url)) throw new Error('URL fora das pastas de mídia da Academia IAT.');
  return url;
}

async function guardarRespostaCompleta(cache, request, response) {
  if (!response.ok || response.status !== 200) {
    throw new Error('A origem não forneceu o arquivo completo (HTTP ' + response.status + ').');
  }
  try {
    await cache.put(request, response.clone());
  } catch (erro) {
    const detalhe = serializarErro(erro, 'MEDIA_CACHE_WRITE_FAILED');
    await publicar('IAT_PWA_ERROR', {
      etapa: 'cache-midia',
      url: request.url,
      ...detalhe,
    });
    throw Object.assign(new Error(detalhe.mensagem), { code: detalhe.codigo });
  }
  const verificacao = await cache.match(request, { ignoreVary: true });
  if (!verificacao || verificacao.status !== 200) {
    throw Object.assign(new Error('O arquivo não pôde ser confirmado no armazenamento offline.'), {
      code: 'MEDIA_CACHE_VERIFY_FAILED',
    });
  }
}

async function respostaParcial(request, respostaCompleta) {
  const cabecalho = request.headers.get('range');
  const corpo = await respostaCompleta.arrayBuffer();
  const tamanho = corpo.byteLength;
  const correspondencia = /^bytes=(\\d*)-(\\d*)$/i.exec((cabecalho || '').trim());
  if (!correspondencia || (!correspondencia[1] && !correspondencia[2])) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }

  let inicio;
  let fim;
  if (!correspondencia[1]) {
    const sufixo = Number(correspondencia[2]);
    if (!Number.isFinite(sufixo) || sufixo <= 0) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
      });
    }
    inicio = Math.max(0, tamanho - sufixo);
    fim = tamanho - 1;
  } else {
    inicio = Number(correspondencia[1]);
    fim = correspondencia[2] ? Number(correspondencia[2]) : tamanho - 1;
  }

  if (!Number.isFinite(inicio) || !Number.isFinite(fim) ||
      inicio < 0 || inicio >= tamanho || fim < inicio) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': 'bytes */' + tamanho, 'Accept-Ranges': 'bytes' },
    });
  }
  fim = Math.min(fim, tamanho - 1);

  const headers = new Headers(respostaCompleta.headers);
  headers.delete('content-encoding');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', 'bytes ' + inicio + '-' + fim + '/' + tamanho);
  headers.set('Content-Length', String(fim - inicio + 1));
  return new Response(corpo.slice(inicio, fim + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
}

async function reconciliarRevisoesDeMidia() {
  const cache = await caches.open(CACHE_MIDIA);
  let anteriores = {};
  try {
    const respostaAnterior = await cache.match(META_MIDIA_URL, { ignoreVary: true });
    if (respostaAnterior) anteriores = await respostaAnterior.json();
  } catch {
    anteriores = {};
  }

  const chaves = await cache.keys();
  for (const chave of chaves) {
    if (chave.url === META_MIDIA_URL) continue;
    const url = new URL(chave.url);
    const relativo = caminhoNoEscopo(url);
    const revisaoAtual = REVISOES_MIDIA[relativo];
    const revisaoAnterior = anteriores[relativo];
    // Mídia removida do build não deve sobreviver para sempre. Uma mídia sem
    // metadado anterior é preservada por segurança; pode ter sido baixada por
    // uma versão que antecede este mecanismo.
    if (!revisaoAtual || (revisaoAnterior && revisaoAnterior !== revisaoAtual)) {
      await cache.delete(chave, { ignoreVary: true });
    }
  }

  try {
    await cache.put(META_MIDIA_URL, new Response(JSON.stringify(REVISOES_MIDIA), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (erro) {
    await publicar('IAT_PWA_ERROR', {
      etapa: 'revisoes-midia',
      ...serializarErro(erro, 'MEDIA_REVISION_WRITE_FAILED'),
    });
  }
}

async function estadoDosCaches(urlConsultada, urlsConsultadas) {
  const nomes = await caches.keys();
  const cacheNucleo = await caches.open(CACHE_NUCLEO);
  const cacheMidia = await caches.open(CACHE_MIDIA);
  const chaves = (await cacheMidia.keys()).filter((chave) => chave.url !== META_MIDIA_URL);
  let bytesConhecidos = 0;
  let itensSemTamanho = 0;

  for (const chave of chaves) {
    const resposta = await cacheMidia.match(chave, { ignoreVary: true });
    const tamanho = Number(resposta && resposta.headers.get('content-length'));
    if (Number.isFinite(tamanho) && tamanho >= 0) bytesConhecidos += tamanho;
    else itensSemTamanho += 1;
  }

  let urlGuardada;
  if (urlConsultada) {
    const url = validarUrlDeMidia(urlConsultada);
    urlGuardada = Boolean(await cacheMidia.match(pedidoCompletoDaUrl(url), { ignoreVary: true }));
  }
  const urlsGuardadas = {};
  const consultas = [...new Set(
    (Array.isArray(urlsConsultadas) ? urlsConsultadas : []).map(String),
  )].slice(0, 700);
  for (const item of consultas) {
    const url = validarUrlDeMidia(item);
    urlsGuardadas[item] = Boolean(
      await cacheMidia.match(pedidoCompletoDaUrl(url), { ignoreVary: true }),
    );
  }

  return {
    versao: VERSAO,
    base: BASE,
    conexaoDaUltimaNavegacao: ULTIMA_CONEXAO_DA_NAVEGACAO,
    conexaoDaUltimaNavegacaoEm: ULTIMA_CONEXAO_DA_NAVEGACAO_EM,
    nucleoPronto: Boolean(await cacheNucleo.match(INDEX_URL, { ignoreVary: true })),
    cacheDaAplicacao: nomes.filter((nome) => nome.startsWith(CACHE_PREFIX)),
    midia: {
      itens: chaves.length,
      bytesConhecidos,
      itensSemTamanho,
      urlGuardada,
      urlsGuardadas,
    },
  };
}

async function baixarMidias(evento, urls, forcarRede) {
  const lista = [...new Set((Array.isArray(urls) ? urls : []).map(String))].slice(0, 700);
  const cache = await caches.open(CACHE_MIDIA);
  const resultados = [];

  for (let indice = 0; indice < lista.length; indice += 1) {
    const valor = lista[indice];
    try {
      const url = validarUrlDeMidia(valor);
      const request = pedidoCompletoDaUrl(url);
      const existente = await cache.match(request, { ignoreVary: true });
      let origem = 'cache';
      if (!existente || forcarRede) {
        const resposta = await fetch(request);
        await guardarRespostaCompleta(cache, request, resposta);
        origem = 'rede';
      }
      const confirmado = await cache.match(request, { ignoreVary: true });
      if (!confirmado) throw Object.assign(new Error('Verificação do download falhou.'), {
        code: 'MEDIA_CACHE_VERIFY_FAILED',
      });
      resultados.push({ url: url.href, ok: true, origem });
    } catch (erro) {
      const detalhe = serializarErro(erro, erro && erro.code ? erro.code : 'MEDIA_DOWNLOAD_FAILED');
      resultados.push({ url: valor, ok: false, ...detalhe });
    }
    responderMensagem(evento, {
      tipo: 'IAT_MEDIA_PROGRESS',
      atual: indice + 1,
      total: lista.length,
      resultado: resultados[resultados.length - 1],
    });
  }

  const falhas = resultados.filter((item) => !item.ok);
  responderMensagem(evento, {
    tipo: 'IAT_RESPONSE',
    ok: true,
    resultado: {
      ok: falhas.length === 0,
      solicitados: lista.length,
      baixados: resultados.length - falhas.length,
      falhas,
      resultados,
      verificacao: await estadoDosCaches(),
    },
  });
}

async function removerMidias(urls, removerTodas = false) {
  if (removerTodas) {
    await caches.delete(CACHE_MIDIA);
    await caches.open(CACHE_MIDIA);
    return { removidos: 'todos' };
  }
  if (!Array.isArray(urls) || urls.length === 0) {
    throw Object.assign(new Error('Informe as mídias a remover ou confirme a limpeza total.'), {
      code: 'MEDIA_REMOVE_LIST_EMPTY',
    });
  }
  const cache = await caches.open(CACHE_MIDIA);
  let removidos = 0;
  for (const valor of [...new Set(urls.map(String))]) {
    const url = validarUrlDeMidia(valor);
    if (await cache.delete(pedidoCompletoDaUrl(url), { ignoreVary: true })) removidos += 1;
  }
  return { removidos };
}

self.addEventListener('install', (evento) => {
  evento.waitUntil((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const falhas = [];
    for (const caminho of PRECACHE) {
      const url = new URL(caminho, self.location.origin).href;
      try {
        const resposta = await fetch(new Request(url, { cache: 'reload' }));
        if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
        await cache.put(url, resposta);
      } catch (erro) {
        falhas.push({ url, ...serializarErro(erro, 'PRECACHE_ITEM_FAILED') });
      }
    }
    if (falhas.length) {
      await caches.delete(CACHE_NUCLEO);
      await publicar('IAT_PWA_ERROR', {
        etapa: 'precache',
        codigo: 'PRECACHE_FAILED',
        mensagem: falhas.length + ' arquivo(s) essencial(is) não puderam ser armazenados.',
        falhas,
      });
      throw new Error('Precache incompleto: ' + falhas.map((item) => item.url).join(', '));
    }
    // Não chama skipWaiting: uma versão nova permanece esperando a confirmação.
  })());
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil((async () => {
    const nomes = await caches.keys();
    await Promise.all(nomes
      .filter((nome) => nome.startsWith(CACHE_NUCLEO_PREFIX) && nome !== CACHE_NUCLEO)
      .map((nome) => caches.delete(nome)));
    // CACHE_MIDIA é deliberadamente estável e caches de outros apps não são tocados.
    await reconciliarRevisoesDeMidia();
    await self.clients.claim();
    await publicar('IAT_PWA_ACTIVATED', { cacheNucleo: CACHE_NUCLEO });
  })());
});

self.addEventListener('fetch', (evento) => {
  const request = evento.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!estaNoEscopo(url)) return;

  if (request.mode === 'navigate') {
    evento.respondWith((async () => {
      try {
        const resposta = await fetch(request);
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'online';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const tipo = resposta.headers.get('content-type') || '';
        if (resposta.ok && ehEntradaDaAplicacao(url) && tipo.includes('text/html')) {
          try {
            const cache = await caches.open(CACHE_NUCLEO);
            await cache.put(INDEX_URL, resposta.clone());
          } catch (erro) {
            const detalhe = serializarErro(erro, 'CORE_SHELL_WRITE_FAILED');
            await publicar('IAT_PWA_ERROR', {
              etapa: 'cache-shell',
              ...detalhe,
              mensagem: 'A página abriu pela rede, mas a atualização do shell offline falhou.',
              url: request.url,
            });
          }
        }
        return resposta;
      } catch {
        ULTIMA_CONEXAO_DA_NAVEGACAO = 'offline';
        ULTIMA_CONEXAO_DA_NAVEGACAO_EM = Date.now();
        const cache = await caches.open(CACHE_NUCLEO);
        return (await cache.match(INDEX_URL, { ignoreVary: true })) ||
          new Response('<!doctype html><html lang="pt-BR"><title>Academia IAT indisponível</title><p>O núcleo offline ainda não foi concluído. Reconecte-se e tente novamente.</p>', {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
      }
    })());
    return;
  }

  if (ehMidia(url)) {
    const processo = (async () => {
      const cache = await caches.open(CACHE_MIDIA);
      const completo = pedidoCompleto(request);
      const guardado = await cache.match(completo, { ignoreVary: true });

      if (guardado) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardado)
            : guardado,
        };
      }

      const cacheNucleo = await caches.open(CACHE_NUCLEO);
      const guardadoNoNucleo = await cacheNucleo.match(request, { ignoreVary: true });
      if (guardadoNoNucleo) {
        return {
          resposta: request.headers.has('range')
            ? await respostaParcial(request, guardadoNoNucleo)
            : guardadoNoNucleo,
        };
      }

      try {
        // Reprodução normal preserva Range e não transforma uma visualização
        // on-line em download persistente. O cache de mídia só é preenchido
        // pelo comando explícito IAT_CACHE_MEDIA.
        return { resposta: await fetch(request) };
      } catch (erroRede) {
        const detalhe = serializarErro(erroRede, 'MEDIA_OFFLINE_MISS');
        await publicar('IAT_PWA_ERROR', {
          etapa: 'buscar-midia',
          url: request.url,
          ...detalhe,
        });
        return {
          resposta: new Response('', {
            status: 504,
            statusText: 'Mídia não disponível offline',
            headers: { 'X-Academia-IAT-Offline': 'media-miss' },
          }),
        };
      }
    })();
    evento.respondWith(processo.then(({ resposta }) => resposta));
    evento.waitUntil(processo.then(() => undefined));
    return;
  }

  evento.respondWith((async () => {
    const cache = await caches.open(CACHE_NUCLEO);
    const guardado = await cache.match(request, { ignoreVary: true });
    if (guardado) return guardado;
    try {
      const resposta = await fetch(request);
      if (resposta.ok && caminhoNoEscopo(url).startsWith('assets/')) {
        try {
          await cache.put(request, resposta.clone());
        } catch (erro) {
          await publicar('IAT_PWA_ERROR', {
            etapa: 'cache-nucleo-runtime',
            url: request.url,
            ...serializarErro(erro, 'CORE_CACHE_WRITE_FAILED'),
          });
        }
      }
      return resposta;
    } catch {
      return new Response('', { status: 504, statusText: 'Recurso indisponível offline' });
    }
  })());
});

self.addEventListener('message', (evento) => {
  const dados = evento.data || {};
  if (dados.tipo === 'IAT_ACTIVATE_UPDATE') {
    evento.waitUntil(Promise.resolve(self.skipWaiting())
      .then(() => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED', ok: true, versao: VERSAO,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_UPDATE_ACCEPTED',
        ok: false,
        erro: serializarErro(erro, 'UPDATE_ACTIVATION_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_GET_STATUS') {
    evento.waitUntil(estadoDosCaches(dados.url, dados.urls)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'STATUS_FAILED'),
      })));
    return;
  }
  if (dados.tipo === 'IAT_CACHE_MEDIA') {
    evento.waitUntil(baixarMidias(evento, dados.urls, Boolean(dados.forcarRede)));
    return;
  }
  if (dados.tipo === 'IAT_REMOVE_MEDIA') {
    evento.waitUntil(removerMidias(dados.urls, dados.removerTodas === true)
      .then((resultado) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: true, resultado,
      }))
      .catch((erro) => responderMensagem(evento, {
        tipo: 'IAT_RESPONSE', ok: false,
        erro: serializarErro(erro, 'MEDIA_REMOVE_FAILED'),
      })));
  }
});
`;
}

export async function gerarArtefatosPwa({
  diretorio = 'dist',
  repositorio = '',
} = {}) {
  const dir = resolve(diretorio);
  const base = normalizarBase(repositorio);
  const escopo = idDoEscopo(base);
  const cachePrefix = `${APP_ID}:${escopo}:`;
  const cacheMidia = `${cachePrefix}media:${MEDIA_SCHEMA}`;

  const manifest = {
    id: base,
    name: 'Academia IAT · Licenciamento Hidrelétrico',
    short_name: 'Academia IAT',
    description: 'O POP de licenciamento ambiental de hidrelétricas do IAT em aulas, fluxos e prática.',
    start_url: base,
    scope: base,
    display: 'standalone',
    background_color: '#151f1b',
    theme_color: '#151f1b',
    lang: 'pt-BR',
    icons: [
      { src: caminhoPublico(base, 'icone-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: caminhoPublico(base, 'icone-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: caminhoPublico(base, 'icone-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  await writeFile(join(dir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

  const indice = join(dir, 'index.html');
  let html = await readFile(indice, 'utf8');
  html = inserirOuAtualizarLink(html, 'manifest', caminhoPublico(base, 'manifest.webmanifest'));
  html = inserirOuAtualizarLink(html, 'apple-touch-icon', caminhoPublico(base, 'icone-192.png'));
  await writeFile(indice, html, 'utf8');

  const assets = await listarArquivos(dir, 'assets');
  const arquivosMidia = (await Promise.all([
    listarArquivosRecursivos(dir, 'media'),
    listarArquivosRecursivos(dir, 'hidro'),
    listarArquivosRecursivos(dir, 'source-assets'),
  ])).flat().sort();
  const arquivosNucleo = [
    'index.html',
    ...assets,
    'manifest.webmanifest',
    'icone-192.png',
    'icone-512.png',
    ...LEARNING_STAGE_CORE,
  ];
  const ausentes = [];
  let bytes = 0;
  for (const relativo of arquivosNucleo) {
    try {
      bytes += (await stat(join(dir, relativo))).size;
    } catch {
      ausentes.push(relativo);
    }
  }
  if (ausentes.length) {
    throw new Error(`Build PWA incompleto; arquivo(s) ausente(s): ${ausentes.join(', ')}`);
  }

  const versao = await hashDoBuild(dir, arquivosNucleo);
  const revisoesMidia = await revisoesDasMidias(dir, arquivosMidia);
  const precache = [
    base,
    ...arquivosNucleo.map((relativo) => caminhoPublico(base, relativo)),
  ];
  const codigo = gerarCodigoServiceWorker({
    base,
    versao,
    precache,
    cachePrefix,
    cacheMidia,
    revisoesMidia,
  });
  await writeFile(join(dir, 'sw.js'), codigo, 'utf8');

  return {
    base,
    versao,
    cachePrefix,
    cacheMidia,
    precache,
    quantidadeMidias: arquivosMidia.length,
    bytes,
  };
}

async function executarCli() {
  const argumentoRepo = process.argv[3];
  const repositorio = argumentoRepo && !argumentoRepo.startsWith('$')
    ? argumentoRepo
    : (process.env.PAGES_REPO || '');
  const resultado = await gerarArtefatosPwa({
    diretorio: process.argv[2] || 'dist',
    repositorio,
  });
  console.log(
    `sw.js: ${resultado.precache.length} arquivos essenciais ` +
    `(${(resultado.bytes / 1e6).toFixed(2)} MB), base ${resultado.base}, versão ${resultado.versao}`,
  );
  console.log(`mídia persistente entre versões no cache ${resultado.cacheMidia}`);
  console.log(`${resultado.quantidadeMidias} arquivos de mídia com revisão para upgrades seguros`);
}

const executadoDiretamente = process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (executadoDiretamente) {
  executarCli().catch((erro) => {
    console.error(`Falha ao gerar PWA: ${erro.message}`);
    process.exitCode = 1;
  });
}
