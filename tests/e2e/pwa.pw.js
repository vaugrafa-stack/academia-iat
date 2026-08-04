import { expect, test } from '@playwright/test';

function originFrom(baseURL) {
  return new URL(baseURL).origin;
}

async function statusFromWorker(page, kind = 'controller') {
  return page.evaluate(async (requestedKind) => {
    const registration = await navigator.serviceWorker.ready;
    const worker = requestedKind === 'waiting'
      ? registration.waiting
      : (navigator.serviceWorker.controller || registration.active);
    if (!worker) return null;
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => {
        channel.port1.close();
        reject(new Error(`Service Worker ${requestedKind} nao respondeu`));
      }, 10_000);
      channel.port1.onmessage = (event) => {
        const message = event.data || {};
        if (message.tipo !== 'IAT_RESPONSE') return;
        clearTimeout(timer);
        channel.port1.close();
        if (message.ok) resolve(message.resultado);
        else reject(new Error(message.erro?.mensagem || 'Falha ao consultar o Service Worker'));
      };
      channel.port1.start();
      worker.postMessage({ tipo: 'IAT_GET_STATUS', requestId: 'playwright-pwa' }, [channel.port2]);
    });
  }, kind);
}

test.beforeEach(async ({ request, baseURL }) => {
  const response = await request.post(`${originFrom(baseURL)}/__pwa-test/reset`);
  expect(response.ok()).toBeTruthy();
});

test('registra o Service Worker, abre o Suporte offline e atualiza com consentimento', async ({
  context,
  page,
  request,
  baseURL,
}) => {
  const origin = originFrom(baseURL);
  const basePath = new URL(baseURL).pathname;
  const runtimeIssues = [];
  page.on('pageerror', (error) => runtimeIssues.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeIssues.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400) {
      runtimeIssues.push(`http ${response.status()}: ${url.pathname}`);
    }
  });
  const stateResponse = await request.get(`${origin}/__pwa-test/state`);
  expect(stateResponse.ok()).toBeTruthy();
  const serverState = await stateResponse.json();

  await page.goto(`${baseURL}#/suporte`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Central de Suporte' })).toBeVisible();
  await expect(page.locator('meta[name="pwa-test-version"]')).toHaveCount(0);

  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link) throw new Error('Manifesto nao referenciado pela pagina');
    const response = await fetch(link.href, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Manifesto respondeu HTTP ${response.status}`);
    return response.json();
  });
  expect(manifest.id).toBe(basePath);
  expect(manifest.start_url).toBe(basePath);
  expect(manifest.scope).toBe(basePath);
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192', type: 'image/png' }),
    expect.objectContaining({ sizes: '512x512', type: 'image/png' }),
  ]));
  const iconChecks = await page.evaluate(async ({ icons, expectedBase }) => {
    return Promise.all(icons.map(async (icon) => {
      const url = new URL(icon.src, location.origin);
      const response = await fetch(url, { cache: 'no-store' });
      const bytes = (await response.clone().arrayBuffer()).byteLength;
      const image = new Image();
      image.src = url.href;
      await image.decode();
      return {
        pathname: url.pathname,
        insideBase: url.pathname.startsWith(expectedBase),
        status: response.status,
        type: response.headers.get('content-type'),
        bytes,
        width: image.naturalWidth,
        height: image.naturalHeight,
        expectedSize: Number.parseInt(icon.sizes, 10),
      };
    }));
  }, { icons: manifest.icons, expectedBase: basePath });
  for (const icon of iconChecks) {
    expect(icon.insideBase, `${icon.pathname} deve permanecer no escopo`).toBe(true);
    expect(icon.status).toBe(200);
    expect(icon.type).toMatch(/^image\/png(?:;|$)/);
    expect(icon.bytes).toBeGreaterThan(0);
    expect(icon.width).toBe(icon.expectedSize);
    expect(icon.height).toBe(icon.expectedSize);
  }

  await expect.poll(async () => page.evaluate(async (expectedScope) => {
    const registration = await navigator.serviceWorker.ready;
    return {
      scope: registration.scope,
      controller: navigator.serviceWorker.controller?.scriptURL || null,
      expectedScope,
    };
  }, `${origin}${basePath}`)).toEqual({
    scope: `${origin}${basePath}`,
    controller: `${origin}${basePath}sw.js`,
    expectedScope: `${origin}${basePath}`,
  });

  const v1Status = await statusFromWorker(page);
  expect(v1Status.versao).toBe(serverState.versionV1);
  expect(v1Status.base).toBe(basePath);
  expect(v1Status.nucleoPronto).toBe(true);

  await context.setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
  const offlineResponse = await page.reload({ waitUntil: 'domcontentloaded' });
  expect(offlineResponse).not.toBeNull();
  expect(offlineResponse.fromServiceWorker()).toBe(true);
  const offlineWorkerStatus = await statusFromWorker(page);
  expect(offlineWorkerStatus.conexaoDaUltimaNavegacao).toBe('offline');
  expect(Number.isFinite(offlineWorkerStatus.conexaoDaUltimaNavegacaoEm)).toBe(true);
  await expect(page.getByRole('heading', { name: 'Central de Suporte' })).toBeVisible();
  await expect(page.locator('#boot-splash')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: /Diagn.stico t.cnico/i }))
    .toHaveValue(/Conectividade: offline/);
  await expect(page.getByRole('link', { name: 'Enviar e-mail para o suporte' }))
    .toHaveAttribute('href', /^mailto:bol\.rafaelaugusto@iat\.pr\.gov\.br\?/);

  await page.getByRole('button', { name: /Forma..o/ }).click();
  await expect(page.getByRole('heading', { name: /Forma..o guiada pelo POP/i })).toBeVisible();
  await page.getByRole('button', { name: 'Suporte' }).click();
  await expect(page.getByRole('heading', { name: 'Central de Suporte' })).toBeVisible();

  const switchResponse = await request.post(`${origin}/__pwa-test/version/2`);
  expect(switchResponse.ok()).toBeTruthy();
  await context.setOffline(false);

  await expect.poll(async () => (await statusFromWorker(page, 'waiting'))?.versao || null)
    .toBe(serverState.versionV2);
  await expect(page.getByText(/H. uma vers.o nova da Academia\./i)).toBeVisible();
  expect((await statusFromWorker(page)).versao).toBe(serverState.versionV1);

  const pageReloaded = page.waitForEvent('load');
  await page.getByRole('button', { name: 'Atualizar agora' }).click();
  await pageReloaded;
  await expect(page.getByRole('heading', { name: 'Central de Suporte' })).toBeVisible();
  await expect(page.locator('meta[name="pwa-test-version"]')).toHaveAttribute('content', '2');

  await expect.poll(async () => (await statusFromWorker(page))?.versao || null)
    .toBe(serverState.versionV2);
  const v2Status = await statusFromWorker(page);
  expect(v2Status.nucleoPronto).toBe(true);
  expect(v2Status.cacheDaAplicacao.some((name) => name.endsWith(`core:${serverState.versionV1}`)))
    .toBe(false);
  expect(v2Status.cacheDaAplicacao.some((name) => name.endsWith(`core:${serverState.versionV2}`)))
    .toBe(true);
  expect(runtimeIssues).toEqual([]);
});
