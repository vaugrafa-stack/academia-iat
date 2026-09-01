import { expect, test } from '@playwright/test';
import {
  appUrl,
  expectHealthyPage,
  monitorRuntime,
} from './helpers.js';

// Os projetos de artefato usam Desktop Chrome mesmo nas larguras estreitas.
// Habilitar toque permite provar o gesto real com `tap()` sem criar outra
// matriz de navegadores; o mouse continua disponível para o ramo desktop.
test.use({ hasTouch: true });

const IMAGEM_TRANSPARENTE = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />';

async function simularGeoPr(page) {
  const estado = { identificacoes: 0 };

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
      estado.identificacoes += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [{
            layerName: 'Usinas de Geração de Energia Hidrelétrica - IAT',
            attributes: {
              OBJECTID: '318',
              PROTOCOLO: '18.945.221-4',
              NOME: 'Usina determinística do teste',
              TIPO: 'CGH',
              'SITUAÇÃO': 'Em análise',
              MUNICIPIO: 'Município de teste',
              RIO: 'Rio de teste',
              BACIA: 'Iguaçu',
              POT_SOLIC: '3,40',
            },
          }],
        }),
      });
      return;
    }

    // A camada curada não precisa de outro recurso no fluxo testado. Uma
    // resposta neutra mantém o teste determinístico caso o painel passe a ler
    // metadados adicionais sem transformar isso em acesso involuntário à rede.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    });
  });

  return estado;
}

test('camadas GeoPR identificam, fixam e permanecem acessíveis em cada largura', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  const geoPr = await simularGeoPr(page);
  const viewport = page.viewportSize();
  const mobile = (viewport?.width || Infinity) <= 430;

  await page.goto(appUrl(baseURL, '#/mapa'), { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', {
    name: 'Mapa das hidrelétricas do Paraná',
  })).toBeVisible();

  const camada = page.locator('.gp-grupo button').filter({
    hasText: 'Usinas de geração hidrelétrica',
  }).first();
  await camada.scrollIntoViewIfNeeded();
  await camada.click();
  await expect(camada).toHaveAttribute('aria-pressed', 'true');

  const palco = page.locator('.mp-map-stage');
  const mapa = palco.locator(':scope > svg');
  await mapa.scrollIntoViewIfNeeded();
  await expect(mapa).toBeVisible();
  const caixaMapa = await mapa.boundingBox();
  expect(caixaMapa).not.toBeNull();
  const ponto = {
    x: Math.round(caixaMapa.width * 0.5),
    y: Math.round(caixaMapa.height * 0.5),
  };

  if (!mobile) {
    await mapa.hover({ position: ponto });
    const tooltip = palco.locator('.gp-tooltip:not(.fixada)');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Usina determinística do teste');
    await expect(tooltip).toContainText('CGH');
    await expect(tooltip).toContainText('Clique para fixar os detalhes');
    await expect(tooltip).not.toContainText('18.945.221-4');

    await mapa.click({ position: ponto });
    const painel = page.locator('.gp-atributos');
    await expect(painel).toBeVisible();
    // A leitura do ponto fica abaixo do desenho, na mesma coluna, e nao na
    // lista de camadas da direita: a pergunta nasce olhando para o simbolo.
    await expect(page.locator('.mp-coluna-mapa > .gp-atributos')).toBeVisible();
    await expect(page.locator('.mp-painel .gp-atributos')).toHaveCount(0);
    const ordem = await page.evaluate(() => {
      const caixa = (seletor) => {
        const caixa = document.querySelector(seletor)?.getBoundingClientRect();
        return caixa ? {
          topo: caixa.top + window.scrollY,
          fim: caixa.bottom + window.scrollY,
        } : null;
      };
      return { mapa: caixa('.mp-quadro'), detalhes: caixa('.gp-atributos') };
    });
    expect(ordem.detalhes.topo).toBeGreaterThanOrEqual(ordem.mapa.fim);
    await expect(painel).toContainText('Detalhes do ponto');
    await expect(painel).toContainText('Usina determinística do teste');
    await expect(painel).toContainText('Fonte declarada pelo serviço: IAT, 2021');
    await expect(painel).toContainText('1 campo não exibido');
    await expect(painel).not.toContainText('18.945.221-4');

    await mapa.focus();
    await mapa.press('Escape');
    await expect(painel).toHaveCount(0);

    const antesDoEnter = geoPr.identificacoes;
    await mapa.press('Enter');
    await expect(page.locator('.gp-atributos')).toBeVisible();
    await expect.poll(() => geoPr.identificacoes).toBeGreaterThan(antesDoEnter);
    await mapa.press('Escape');
    await expect(page.locator('.gp-atributos')).toHaveCount(0);
  } else {
    await mapa.tap({ position: ponto });
    const painel = page.locator('.gp-atributos');
    const tooltip = palco.locator('.gp-tooltip.fixada');
    await expect(painel).toBeVisible();
    await expect(painel).toContainText('Usina determinística do teste');
    await expect(painel).not.toContainText('18.945.221-4');
    const ordem = await page.evaluate(() => {
      const mapa = document.querySelector('.mp-quadro')?.getBoundingClientRect();
      const detalhes = document.querySelector('.gp-atributos')?.getBoundingClientRect();
      return {
        fimDoMapa: mapa ? mapa.bottom + window.scrollY : null,
        topoDosDetalhes: detalhes ? detalhes.top + window.scrollY : null,
      };
    });
    expect(ordem.topoDosDetalhes).toBeGreaterThanOrEqual(ordem.fimDoMapa);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Usina determinística do teste');

    const [caixaPalco, caixaTooltip, caixaPainel] = await Promise.all([
      palco.boundingBox(),
      tooltip.boundingBox(),
      painel.boundingBox(),
    ]);
    expect(caixaPalco).not.toBeNull();
    expect(caixaTooltip).not.toBeNull();
    expect(caixaPainel).not.toBeNull();
    expect(caixaTooltip.x).toBeGreaterThanOrEqual(caixaPalco.x - 1);
    expect(caixaTooltip.y).toBeGreaterThanOrEqual(caixaPalco.y - 1);
    expect(caixaTooltip.x + caixaTooltip.width)
      .toBeLessThanOrEqual(caixaPalco.x + caixaPalco.width + 1);
    expect(caixaTooltip.y + caixaTooltip.height)
      .toBeLessThanOrEqual(caixaPalco.y + caixaPalco.height + 1);
    expect(caixaPainel.x).toBeGreaterThanOrEqual(-1);
    expect(caixaPainel.x + caixaPainel.width).toBeLessThanOrEqual(viewport.width + 1);
  }

  await expectHealthyPage(page, runtimeIssues);
});

test('desktop largo e baixo mantém mapa e detalhes no fluxo da página', async ({
  page,
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'artifact-desktop', 'um projeto basta para a altura reduzida');
  await page.setViewportSize({ width: 1366, height: 700 });

  const runtimeIssues = monitorRuntime(page, baseURL);
  await simularGeoPr(page);
  await page.goto(appUrl(baseURL, '#/mapa'), { waitUntil: 'domcontentloaded' });

  const camada = page.locator('.gp-grupo button').filter({
    hasText: 'Usinas de geração hidrelétrica',
  }).first();
  await camada.scrollIntoViewIfNeeded();
  await camada.click();

  const mapa = page.locator('.mp-map-stage > svg');
  await mapa.scrollIntoViewIfNeeded();
  const caixaMapa = await mapa.boundingBox();
  expect(caixaMapa).not.toBeNull();
  await mapa.click({
    position: {
      x: Math.round(caixaMapa.width * 0.5),
      y: Math.round(caixaMapa.height * 0.5),
    },
  });

  const painel = page.locator('.mp-coluna-mapa > .gp-atributos');
  await expect(painel).toContainText('Usina determinística do teste');
  const layout = await page.evaluate(() => {
    const coluna = document.querySelector('.mp-coluna-mapa');
    const mapa = document.querySelector('.mp-quadro')?.getBoundingClientRect();
    const detalhes = document.querySelector('.gp-atributos')?.getBoundingClientRect();
    return {
      posicaoDaColuna: coluna ? getComputedStyle(coluna).position : null,
      fimDoMapa: mapa ? mapa.bottom + window.scrollY : null,
      topoDosDetalhes: detalhes ? detalhes.top + window.scrollY : null,
    };
  });
  expect(layout.posicaoDaColuna).not.toBe('sticky');
  expect(layout.topoDosDetalhes).toBeGreaterThanOrEqual(layout.fimDoMapa);

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expectHealthyPage(page, runtimeIssues);
});
