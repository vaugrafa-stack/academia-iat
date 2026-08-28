import { expect, test } from '@playwright/test';
import { appUrl, expectHealthyPage, monitorRuntime } from './helpers.js';

test('navegação móvel abre categorias sem escolher uma página pelo usuário', async ({
  page,
  baseURL,
}) => {
  test.skip((page.viewportSize()?.width || Infinity) > 980, 'comportamento exclusivo do celular');
  const runtimeIssues = monitorRuntime(page, baseURL);

  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }),
  ).toBeVisible();

  const nav = page.getByRole('navigation', {
    name: 'Navegação principal no celular',
  });
  const aprender = nav.getByRole('button', { name: 'Formação' });
  const urlInicial = page.url();

  await aprender.click();
  const painelAprender = page.getByRole('region', { name: 'Formação' });
  await expect(painelAprender).toBeVisible();
  await expect(aprender).toHaveAttribute('aria-expanded', 'true');
  await expect(page).toHaveURL(urlInicial);
  await expect(painelAprender.locator('.mobile-nav-panel__item')).toHaveCount(2);
  await expect(painelAprender.locator('.mobile-nav-panel__item').first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(painelAprender).toHaveCount(0);
  await expect(aprender).toBeFocused();
  await expect(aprender).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Enter');
  const painelReaberto = page.getByRole('region', { name: 'Formação' });
  await expect(painelReaberto).toBeVisible();
  const primeiroDestino = painelReaberto.locator('.mobile-nav-panel__item').first();
  const fecharPainel = painelReaberto.getByRole('button', {
    name: /Fechar opções de Formação/i,
  });
  await expect(primeiroDestino).toBeFocused();
  const indicador = await primeiroDestino.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(indicador.style).not.toBe('none');
  expect(indicador.width).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Shift+Tab');
  await expect(fecharPainel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(primeiroDestino).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(aprender).toBeFocused();

  const praticar = nav.getByRole('button', { name: 'Prática' });
  await praticar.click();
  const painelPraticar = page.getByRole('region', { name: 'Prática' });
  await expect(painelPraticar.locator('.mobile-nav-panel__item')).toHaveCount(3);
  await painelPraticar
    .getByRole('button', { name: /Redator de IT/ })
    .click();
  await expect(page).toHaveURL(/#\/redator$/);
  await expect(
    page.getByRole('heading', { name: /Redator de Informação Técnica/i }),
  ).toBeVisible();
  await expect(praticar).toHaveClass(/active/);
  await expect(praticar).not.toHaveAttribute('aria-current');
  await praticar.click();
  const redatorAtual = page
    .getByRole('region', { name: 'Prática' })
    .getByRole('button', { name: /Redator de IT/ });
  await expect(redatorAtual).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');

  const consultar = nav.getByRole('button', { name: 'Consulta' });
  await consultar.click();
  const painelConsultar = page.getByRole('region', { name: 'Consulta' });
  await expect(painelConsultar.locator('.mobile-nav-panel__item')).toHaveCount(4);
  const geopr = painelConsultar.getByRole('link', {
    name: 'Abrir GeoPR · portal completo em nova aba (site externo)',
  });
  await expect(geopr).toBeVisible();
  await expect(geopr).toHaveAttribute(
    'href',
    'https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc',
  );
  await expect(geopr).toHaveAttribute('target', '_blank');
  await expect(geopr).toHaveAttribute('rel', 'noopener noreferrer');

  await painelConsultar.getByRole('button', { name: /Mapa GeoPR/ }).click();
  await expect(page).toHaveURL(/#\/mapa$/);
  await expect(
    page.getByRole('heading', { name: /Mapa das hidrelétricas do Paraná/i }),
  ).toBeVisible();
  await expect(consultar).toHaveClass(/active/);
  await expect(consultar).not.toHaveAttribute('aria-current');

  await nav.getByRole('button', { name: 'Início' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }),
  ).toBeVisible();
  await expect(page.locator('.mobile-nav-panel')).toHaveCount(0);
  await expectHealthyPage(page, runtimeIssues);
});

test('menu lateral móvel é modal, contém o foco e navega por teclado', async ({
  page,
  baseURL,
}) => {
  test.skip((page.viewportSize()?.width || Infinity) > 980, 'comportamento exclusivo do celular');
  const runtimeIssues = monitorRuntime(page, baseURL);

  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });
  const trigger = page.getByRole('button', { name: /Abrir menu/i });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.locator('#navegacao-lateral[role="dialog"]');
  const close = dialog.getByRole('button', { name: /Fechar menu/i });
  const last = dialog.getByRole('button', { name: /Por onde começar/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(close).toBeFocused();
  await expect.poll(() => page.locator('#conteudo').evaluate((node) => node.inert)).toBe(true);
  await expect.poll(() => page.locator('.mobile-bottom-nav').evaluate((node) => node.inert)).toBe(true);

  await close.press('Shift+Tab');
  await expect(last).toBeFocused();
  await last.press('Tab');
  await expect(close).toBeFocused();
  await close.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.press('Enter');
  const reopened = page.locator('#navegacao-lateral[role="dialog"]');
  const formation = reopened.getByRole('button', { name: /Formação pelo POP/i });
  // Sob paralelismo alto, a tecla que abre o painel pode terminar antes de a
  // transicao montar e focar o dialogo. Fixar a pre-condicao conserva o que o
  // teste quer provar (navegacao por teclado) sem pressionar um alvo em montagem.
  await expect(reopened).toBeVisible();
  await formation.focus();
  await expect(formation).toBeFocused();
  await formation.press('Enter');
  await expect(page).toHaveURL(/#\/formacao$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Formação guiada pelo POP/i }),
  ).toBeVisible();
  await expect(page.locator('#conteudo')).toBeFocused();
  await expectHealthyPage(page, runtimeIssues);
});
