import { expect, test } from '@playwright/test';
import {
  appUrl,
  expectHealthyPage,
  monitorRuntime,
} from './helpers.js';

// Contrato TDD da busca unica do mapa. Este arquivo deve ficar vermelho ate a
// superficie substituir as entradas hoje separadas (coordenada, filtro local e
// acervo do GeoPR) por um unico combobox acessivel.
//
// O contrato nao escolhe uma API de geocodificacao: municipio, empreendimento,
// coordenada e as camadas curadas ja existem no artefato e devem ser buscados
// localmente. Assim, alem de funcionar offline, o texto digitado nao sai do
// navegador.
test.use({ hasTouch: true });

const IMAGEM_TRANSPARENTE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />';

async function neutralizarGeoPr(page) {
  await page.route('https://geopr.iat.pr.gov.br/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/WMSServer')) {
      await route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: IMAGEM_TRANSPARENTE,
      });
      return;
    }

    if (url.pathname.endsWith('/legend')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ layers: [] }),
      });
      return;
    }

    if (url.pathname.endsWith('/identify')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results: [] }),
      });
      return;
    }

    if (decodeURIComponent(url.pathname).includes('municipios_pr_Oficial/MapServer/0/query')) {
      if (url.searchParams.get('returnExtentOnly') === 'true') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            extent: {
              xmin: -5530000,
              ymin: -2910000,
              xmax: -5480000,
              ymax: -2860000,
              spatialReference: { wkid: 102100, latestWkid: 3857 },
            },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [{ attributes: { nome: 'Ponta Grossa', area_km2: 2054.7 } }],
        }),
      });
      return;
    }

    // A busca do contrato usa o catalogo curado local. Uma resposta vazia
    // impede que uma mudanca no acervo vivo torne o teste nao deterministico.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ services: [] }),
    });
  });
}

async function abrirMapa(page, baseURL) {
  await neutralizarGeoPr(page);
  await page.goto(appUrl(baseURL, '#/mapa'), { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', {
    name: 'Mapa das hidrelétricas do Paraná',
  })).toBeVisible();
}

function buscaUnica(page) {
  const regiao = page.getByRole('search', { name: 'Busca no mapa' });
  return {
    regiao,
    campo: regiao.getByRole('combobox', { name: 'Buscar no mapa' }),
    resultados: regiao.getByRole('listbox', { name: 'Resultados da busca no mapa' }),
  };
}

function somenteDesktop(page) {
  test.skip((page.viewportSize()?.width || 0) <= 430, 'Cenario coberto no contrato movel dedicado.');
}

test('aceita no mesmo campo os tres formatos de coordenada ja suportados', async ({
  page,
  baseURL,
}) => {
  somenteDesktop(page);
  const runtimeIssues = monitorRuntime(page, baseURL);
  await abrirMapa(page, baseURL);

  const { campo } = buscaUnica(page);
  await expect(campo).toHaveAttribute('aria-describedby', /\S+/);

  const formatos = [
    '-25.4284 -49.2733',
    `25° 25' 42,24" S, 49° 16' 23,88" O`,
    '22 673648.49 7186491.01',
  ];

  for (const valor of formatos) {
    await campo.fill(valor);
    await campo.press('Enter');
    await expect(page.locator('.co-marca')).toHaveCount(1);
    await expect(page.locator('.co-leitura')).toContainText('SIRGAS 2000');
    await expect(page.locator('.co-leitura')).toContainText('UTM fuso 22S');
  }

  await expect.poll(async () => {
    const viewBox = await page.locator('.mp-map-stage > svg').getAttribute('viewBox');
    return Number(String(viewBox).split(/\s+/)[2]);
  }, {
    message: 'A coordenada localizada precisa aproximar e centralizar o mapa.',
  }).toBeLessThan(1000);
  await expectHealthyPage(page, runtimeIssues);
});

test('distingue municipio, empreendimento e camada tematica antes de agir', async ({
  page,
  baseURL,
}) => {
  somenteDesktop(page);
  const runtimeIssues = monitorRuntime(page, baseURL);
  await abrirMapa(page, baseURL);

  const { campo, resultados } = buscaUnica(page);

  await campo.fill('Ponta Grossa');
  await expect(campo).toHaveAttribute('aria-expanded', 'true');
  const municipio = resultados.getByRole('option').filter({
    hasText: /Município.*Ponta Grossa|Ponta Grossa.*Município/i,
  });
  await expect(municipio).toHaveCount(1);
  await municipio.click();
  await expect(page.locator('.mp-lista-cab')).toContainText('Ponta Grossa');
  await expect(page.locator('.co-marca')).toHaveCount(0);
  await expect(page.locator('.gp-atributos')).toContainText('Detalhes da busca');
  await expect(page.locator('.gp-atributos')).toContainText('Ponta Grossa');
  await expect(buscaUnica(page).regiao).toContainText(/enquadrado pelo limite oficial/i);
  const itensDoMunicipio = page.locator('.mp-lista .mp-item');
  await expect(itensDoMunicipio.first()).toBeVisible();
  expect(await itensDoMunicipio.count()).toBeGreaterThan(1);
  for (let indice = 0; indice < await itensDoMunicipio.count(); indice += 1) {
    await expect(itensDoMunicipio.nth(indice)).toContainText('Ponta Grossa');
  }

  await campo.fill('Itaipu');
  const empreendimento = resultados.getByRole('option').filter({
    hasText: /Empreendimento.*Itaipu|Itaipu.*Empreendimento/i,
  });
  await expect(empreendimento).toHaveCount(1);
  await empreendimento.click();
  await expect(page.locator('.mp-detalhe')).toContainText('Itaipu (Parte Brasileira)');
  await expect(page.locator('.mp-usinas .ativa')).toHaveCount(1);

  await campo.fill('zoneamento');
  const camadaTematica = resultados.getByRole('option').filter({
    hasText: /Camada GeoPR.*Zoneamento de Planos de Manejo|Zoneamento de Planos de Manejo.*Camada GeoPR/i,
  });
  await expect(camadaTematica).toHaveCount(1);
  await camadaTematica.click();
  await expect(page.locator('.gp-grupo button').filter({
    hasText: 'Zoneamento de Planos de Manejo',
  })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.co-marca')).toHaveCount(0);

  await expectHealthyPage(page, runtimeIssues);
});

test('mantem ambiguidade explicita e opera por setas, Enter e Escape', async ({
  page,
  baseURL,
}) => {
  somenteDesktop(page);
  const runtimeIssues = monitorRuntime(page, baseURL);
  await abrirMapa(page, baseURL);

  const { regiao, campo, resultados } = buscaUnica(page);
  await campo.fill('Salto');
  await expect(resultados).toBeVisible();
  expect(await resultados.getByRole('option').count()).toBeGreaterThan(1);
  await expect(page.locator('.mp-detalhe')).toHaveCount(0);

  const caixas = await resultados.getByRole('option').evaluateAll((opcoes) =>
    opcoes.map((opcao) => {
      const caixa = opcao.getBoundingClientRect();
      return { topo: caixa.top, base: caixa.bottom };
    }),
  );
  for (let indice = 1; indice < caixas.length; indice += 1) {
    expect(caixas[indice].topo).toBeGreaterThanOrEqual(caixas[indice - 1].base - 1);
  }

  await campo.press('End');
  const ativa = resultados.locator('[role="option"][aria-selected="true"]');
  await expect(ativa).toHaveCount(1);
  await expect(campo).toBeFocused();
  expect(await ativa.getAttribute('tabindex')).toBe('-1');
  const caixaLista = await resultados.boundingBox();
  const caixaAtiva = await ativa.boundingBox();
  expect(caixaLista).not.toBeNull();
  expect(caixaAtiva).not.toBeNull();
  expect(caixaAtiva.y).toBeGreaterThanOrEqual(caixaLista.y - 1);
  expect(caixaAtiva.y + caixaAtiva.height).toBeLessThanOrEqual(caixaLista.y + caixaLista.height + 1);
  await campo.press('Enter');
  await expect(resultados).toBeHidden();
  await expect(page.locator('.mp-detalhe')).toBeVisible();

  await campo.fill('Cavernoso');
  await expect(resultados).toBeVisible();
  await campo.press('Escape');
  await expect(resultados).toBeHidden();
  await expect(campo).toBeFocused();

  await campo.fill('termo-local-sem-correspondencia-iat');
  const vazio = regiao.getByRole('status').filter({ hasText: /Nenhum resultado local/i });
  await expect(vazio).toBeVisible();
  await expect(vazio).toContainText(/coordenada|município|empreendimento|camada/i);
  await expectHealthyPage(page, runtimeIssues);
});

test('nao envia nem persiste coordenada, protocolo ou identificador digitado', async ({
  page,
  baseURL,
}) => {
  somenteDesktop(page);
  const runtimeIssues = monitorRuntime(page, baseURL);
  await abrirMapa(page, baseURL);

  const trafegoDepoisDaCarga = [];
  page.on('request', (request) => {
    trafegoDepoisDaCarga.push(`${request.method()} ${request.url()} ${request.postData() || ''}`);
  });

  const { regiao, campo } = buscaUnica(page);
  const coordenada = '-25.4284 -49.2733';
  const protocolo = '18.945.221-4';
  const identificador = '529.982.247-25';

  await campo.fill(coordenada);
  await campo.press('Enter');
  await expect(page.locator('.co-marca')).toHaveCount(1);
  await campo.fill(`${protocolo} ${identificador}`);
  await expect(regiao.getByRole('status').filter({
    hasText: /Nenhum resultado local/i,
  })).toBeVisible();

  const textoForaDoInput = await regiao.evaluate((element) => element.textContent || '');
  expect(textoForaDoInput).not.toContain(protocolo);
  expect(textoForaDoInput).not.toContain(identificador);
  expect(page.url()).not.toContain(encodeURIComponent(protocolo));
  expect(page.url()).not.toContain(encodeURIComponent(coordenada));

  const persistencia = await page.evaluate(() => JSON.stringify({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
  }));
  for (const segredo of [coordenada, protocolo, identificador]) {
    expect(persistencia).not.toContain(segredo);
    const trafegoLegivel = trafegoDepoisDaCarga.map((linha) => {
      try { return decodeURIComponent(linha); } catch { return linha; }
    }).join('\n');
    expect(trafegoLegivel).not.toContain(segredo);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(buscaUnica(page).campo).toHaveValue('');
  await expectHealthyPage(page, runtimeIssues);
});

test('em 390 px o resultado e acionavel por toque e permanece dentro da tela', async ({
  page,
  baseURL,
}) => {
  test.skip(page.viewportSize()?.width !== 390, 'Contrato movel de referencia executado em 390 px.');
  const runtimeIssues = monitorRuntime(page, baseURL);
  await abrirMapa(page, baseURL);

  const { regiao, campo, resultados } = buscaUnica(page);
  await regiao.scrollIntoViewIfNeeded();
  const caixaCampo = await campo.boundingBox();
  expect(caixaCampo).not.toBeNull();
  expect(caixaCampo.height).toBeGreaterThanOrEqual(44);

  await campo.fill('Itaipu');
  const empreendimento = resultados.getByRole('option').filter({
    hasText: /Empreendimento.*Itaipu|Itaipu.*Empreendimento/i,
  });
  await expect(empreendimento).toBeVisible();

  const viewport = page.viewportSize();
  const caixaResultados = await resultados.boundingBox();
  expect(caixaResultados).not.toBeNull();
  expect(caixaResultados.x).toBeGreaterThanOrEqual(-1);
  expect(caixaResultados.x + caixaResultados.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(caixaResultados.y).toBeGreaterThanOrEqual(-1);
  expect(caixaResultados.y + caixaResultados.height).toBeLessThanOrEqual(viewport.height + 1);

  await empreendimento.tap();
  const detalhe = page.locator('.mp-detalhe');
  await expect(detalhe).toBeVisible();
  await expect(detalhe).toContainText('Itaipu (Parte Brasileira)');
  const caixaDetalhe = await detalhe.boundingBox();
  expect(caixaDetalhe).not.toBeNull();
  expect(caixaDetalhe.x).toBeGreaterThanOrEqual(-1);
  expect(caixaDetalhe.x + caixaDetalhe.width).toBeLessThanOrEqual(viewport.width + 1);

  await expectHealthyPage(page, runtimeIssues);
});
