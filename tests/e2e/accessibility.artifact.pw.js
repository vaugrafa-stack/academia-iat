import { expect, test } from '@playwright/test';
import {
  appUrl,
  expectHealthyPage,
  monitorRuntime,
} from './helpers.js';

const ROUTES = [
  '',
  '#/hidreletricas',
  '#/formacao',
  '#/laboratorio',
  '#/redator',
  '#/avaliacoes',
  '#/fluxos',
  '#/mapa',
  '#/biblioteca',
  '#/perfil',
  '#/suporte',
  '#/aula/pop-section-001',
  '#/aula/pop-section-059',
];

test('rotas principais preservam semantica, leitura e operacao por toque', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  const mobile = (page.viewportSize()?.width || Infinity) <= 430;

  for (const hash of ROUTES) {
    await page.goto(appUrl(baseURL, hash), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#conteudo')).toBeVisible();
    await expect(page.locator('#conteudo h1')).toHaveCount(1);

    const audit = await page.evaluate(({ isMobile }) => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          element.getAttribute('aria-hidden') !== 'true' &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      const labelFor = (element) => {
        const labelledBy = element.getAttribute('aria-labelledby');
        const fromLabelledBy = labelledBy
          ? labelledBy
              .split(/\s+/)
              .map((id) => document.getElementById(id)?.textContent || '')
              .join(' ')
              .trim()
          : '';
        const explicitLabel = element.id
          ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)?.textContent || ''
          : '';
        const wrappingLabel = element.closest('label')?.textContent || '';
        const imageAlt = Array.from(element.querySelectorAll?.('img') || [])
          .map((image) => image.getAttribute('alt') || '')
          .join(' ');
        return [
          element.getAttribute('aria-label'),
          fromLabelledBy,
          explicitLabel,
          wrappingLabel,
          element.getAttribute('title'),
          element.getAttribute('alt'),
          element.getAttribute('value'),
          element.textContent,
          imageAlt,
        ]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const controls = Array.from(
        document.querySelectorAll('button, input, select, textarea, a[href]'),
      ).filter(visible);
      const unnamed = controls
        .filter((element) => !labelFor(element))
        .map((element) => `${element.tagName.toLowerCase()}.${element.className || ''}`);

      const touchTargets = Array.from(
        document.querySelectorAll('button, input, select, textarea'),
      )
        .filter(visible)
        .map((element) => {
          const label = ['checkbox', 'radio'].includes(element.getAttribute('type'))
            ? element.closest('label') || (
                element.id
                  ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
                  : null
              )
            : null;
          const rect = (label || element).getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            type: element.getAttribute('type') || '',
            className: String(element.className || ''),
            label: labelFor(element).slice(0, 80),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
          };
        })
        .filter(({ width, height }) => width < 43.5 || height < 43.5);

      const smallMobileFields = isMobile
        ? Array.from(document.querySelectorAll([
            'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="button"]):not([type="submit"])',
            'select',
            'textarea',
          ].join(',')))
            .filter(visible)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              type: element.getAttribute('type') || '',
              className: String(element.className || ''),
              label: labelFor(element).slice(0, 80),
              fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
            }))
            .filter(({ fontSize }) => fontSize < 16)
        : [];

      const duplicateIds = Array.from(document.querySelectorAll('[id]'))
        .map((element) => element.id)
        .filter((id, index, ids) => id && ids.indexOf(id) !== index);
      const imagesWithoutAlt = Array.from(document.querySelectorAll('img'))
        .filter(visible)
        .filter((image) => !image.hasAttribute('alt'))
        .map((image) => image.currentSrc || image.src);

      const headingLevels = Array.from(
        document.querySelectorAll('#conteudo h1, #conteudo h2, #conteudo h3, #conteudo h4'),
      )
        .filter(visible)
        .map((heading) => Number(heading.tagName.slice(1)));
      const headingJumps = headingLevels.filter(
        (level, index) => index > 0 && level > headingLevels[index - 1] + 1,
      );

      return {
        lang: document.documentElement.lang,
        title: document.title,
        unnamed,
        touchTargets,
        smallMobileFields,
        duplicateIds: [...new Set(duplicateIds)],
        imagesWithoutAlt,
        headingJumps,
      };
    }, { isMobile: mobile });

    expect(audit.lang.toLowerCase()).toMatch(/^pt(?:-|$)/);
    expect(audit.title.trim().length).toBeGreaterThan(0);
    expect(audit.unnamed, `${hash || '#/'}: controles sem nome`).toEqual([]);
    expect(audit.touchTargets, `${hash || '#/'}: alvos menores que 44 x 44`).toEqual([]);
    expect(
      audit.smallMobileFields,
      `${hash || '#/'}: campos abaixo de 16 px no celular`,
    ).toEqual([]);
    expect(audit.duplicateIds, `${hash || '#/'}: IDs duplicados`).toEqual([]);
    expect(audit.imagesWithoutAlt, `${hash || '#/'}: imagens sem alt`).toEqual([]);
    expect(audit.headingJumps, `${hash || '#/'}: salto na hierarquia de titulos`).toEqual([]);
    await expectHealthyPage(page, runtimeIssues);
  }
});

test('primeiro acesso orienta o iniciante e a busca curricular explica o vazio', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: 'Comece por aqui.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Iniciar orienta..o/i })).toBeVisible();
  await expect(page.getByText(/Onde voc. parou/i)).toHaveCount(0);

  await page
    .getByRole('button', { name: /Novo em hidrel.tricas\? Veja os fundamentos/i })
    .click();
  await expect(page).toHaveURL(/#\/hidreletricas$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Como funciona uma hidrel.trica/i }),
  ).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/#\/hidreletricas$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /Como funciona uma hidrel.trica/i }),
  ).toBeVisible();

  await page.goto(appUrl(baseURL, '#/formacao'), { waitUntil: 'domcontentloaded' });
  const filter = page.getByRole('textbox', { name: /Filtrar m.dulos ou aulas/i });
  await filter.fill('zzzinexistente');
  const empty = page.locator('.formation-empty[role="status"]');
  await expect(empty.getByRole('heading', { name: /Nenhum t.pico encontrado/i })).toBeVisible();
  await expect(empty).toContainText('zzzinexistente');
  await empty.getByRole('button', { name: /Limpar filtro/i }).click();
  await expect(filter).toHaveValue('');
  await expect(empty).toHaveCount(0);
  await expectHealthyPage(page, runtimeIssues);
});
