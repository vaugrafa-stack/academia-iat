import { expect, test } from '@playwright/test';
import { appUrl, expectHealthyPage, monitorRuntime } from './helpers.js';

test('guia mantém cartões dentro da seção e identifica o destino durante a leitura', async ({ page, baseURL }) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL, '#/empreendedor'), { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Guia de quem desenvolve o empreendimento' })).toBeVisible();

  // Um cartão pode sair da própria seção sem ultrapassar a janela. Conferir
  // somente document.scrollWidth não detectava esse defeito em 320 pixels.
  const excessos = await page.locator('.emp-trilhos, .emp-papeis, .emp-modalidades, .emp-fontes, .emp-dominios, .emp-ciclo, .emp-erros')
    .evaluateAll((grids) => grids.flatMap((grid) => {
      const area = grid.getBoundingClientRect();
      return [...grid.children].filter((cartao) => {
        const rect = cartao.getBoundingClientRect();
        return rect.left < area.left - 1 || rect.right > area.right + 1;
      }).map((cartao) => `${grid.className}: ${cartao.textContent.slice(0, 50)}`);
    }));
  expect(excessos).toEqual([]);

  const nav = page.getByRole('navigation', { name: 'Seções deste guia' });
  for (const [rotulo, id] of [['Documentos', 'emp-documentos'], ['Renovar e regularizar', 'emp-renovacao']]) {
    const botao = nav.getByRole('button', { name: rotulo, exact: true });
    await botao.click();
    await expect(page.locator(`#${id}`)).toBeFocused();
    await expect(botao).toHaveAttribute('aria-current', 'location');
    await expect.poll(() => page.locator(`#${id}`).evaluate((secao) => {
      const navBox = document.querySelector('.emp-nav').getBoundingClientRect();
      const topo = secao.getBoundingClientRect().top;
      return topo >= navBox.bottom && topo <= navBox.bottom + 16;
    })).toBe(true);
    // Confere após o navegador processar a rolagem; o observador antigo
    // sobrescrevia o clique com a seção anterior no quadro seguinte.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(botao).toHaveAttribute('aria-current', 'location');
    expect(await botao.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
  }

  // Rolagem independente dos atalhos também deve atualizar a indicação.
  await page.locator('#emp-agua').evaluate((secao) => {
    const nav = document.querySelector('.emp-nav');
    const linha = parseFloat(getComputedStyle(nav).top) + nav.getBoundingClientRect().height + 12;
    window.scrollTo({ top: scrollY + secao.getBoundingClientRect().top - linha + 40, behavior: 'instant' });
  });
  const agua = nav.getByRole('button', { name: 'Água', exact: true });
  await expect(agua).toHaveAttribute('aria-current', 'location');
  expect(await agua.evaluate((el) => {
    const faixa = el.parentElement.getBoundingClientRect();
    const botao = el.getBoundingClientRect();
    return botao.left >= faixa.left - 1 && botao.right <= faixa.right + 1;
  })).toBe(true);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const ultimo = nav.getByRole('button', { name: 'O que custa prazo', exact: true });
  await ultimo.click();
  await expect.poll(() => page.locator('#emp-erros').evaluate((secao) => {
    const nav = document.querySelector('.emp-nav').getBoundingClientRect();
    return Math.abs(secao.getBoundingClientRect().top - nav.bottom - 12) < 2;
  })).toBe(true);
  await expect(ultimo).toHaveAttribute('aria-current', 'location');

  // No desktop alto, o rodapé limita a rolagem antes da linha ideal do título.
  // Mesmo nesse limite o último destino precisa continuar identificado.
  if (page.viewportSize().width > 980) {
    await page.setViewportSize({ width: 1440, height: 1600 });
    await ultimo.click();
    await expect.poll(() => page.evaluate(() => (
      document.documentElement.scrollHeight - innerHeight - scrollY
    ))).toBeLessThanOrEqual(2);
    await expect(ultimo).toHaveAttribute('aria-current', 'location');
  }
  await expectHealthyPage(page, runtimeIssues);
});
