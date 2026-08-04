import { expect, test } from '@playwright/test';
import {
  appUrl,
  expectBuildIdentity,
  expectHealthyPage,
  monitorRuntime,
} from './helpers.js';

const ROUTES = [
  {
    hash: '',
    ready: (page) => page.getByRole('heading', { name: /Aprenda o procedimento/i }),
  },
  {
    hash: '#/aula/pop-section-001',
    ready: (page) => page.locator('.lesson-header h1'),
  },
  {
    hash: '#/laboratorio',
    ready: (page) => page.getByRole('heading', { name: 'Pratique antes de assinar' }),
  },
  {
    hash: '#/redator',
    ready: (page) => page.getByRole('heading', { name: /Escrever uma Informação Técnica/i }),
  },
  {
    hash: '#/mapa',
    ready: (page) => page.getByRole('heading', { name: /Mapa das hidrelétricas do Paraná/i }),
  },
  {
    hash: '#/suporte',
    ready: (page) => page.getByRole('heading', { name: /Suporte/i }),
  },
];

test('artefato final mantém build, rotas críticas e console íntegros', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);

  for (const route of ROUTES) {
    await page.goto(appUrl(baseURL, route.hash), {
      waitUntil: 'domcontentloaded',
    });
    await expect(route.ready(page)).toBeVisible();
    await expectHealthyPage(page, runtimeIssues);
  }

  await expectBuildIdentity(page);
});
