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
    ready: (page) => page.getByRole('heading', { name: /Onde você parou/i }),
  },
  {
    hash: '#/aula/pop-section-001',
    ready: (page) => page.locator('.lesson-header h1'),
  },
  {
    hash: '#/aula/pop-section-059',
    ready: (page) => page.locator('.lesson-header h1'),
    pilot: true,
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
    if (route.pilot) {
      await expect(route.ready(page)).toContainText('Distinção entre os documentos');
      const basePath = new URL(baseURL).pathname.replace(/\/?$/, '/');
      await expect(page.locator('video.vls-video')).toHaveAttribute(
        'src',
        `${basePath}media/piloto/pop-section-059.mp4`,
      );
      await page.locator('.transcript-panel > summary').click();
      await expect(
        page.getByRole('link', { name: 'Baixar TXT com fontes' }),
      ).toHaveAttribute(
        'href',
        `${basePath}media/piloto/pop-section-059.txt`,
      );
      await page
        .getByRole('button', { name: 'Ver roteiro e fontes por cena' })
        .click();
      await expect(page.locator('.transcript-source-scenes pre')).toBeVisible();
      await expect(page.locator('.transcript-source-scenes pre')).toContainText(
        'Fonte: POP, item 18.2',
      );
    }
    await expectHealthyPage(page, runtimeIssues);
  }

  await expectBuildIdentity(page);
});

test('experiência responsiva prioriza aprender e praticar sem overflow', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  const viewport = page.viewportSize();
  const mobile = viewport.width <= 980;

  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', { name: /Onde você parou/i }),
  ).toBeVisible();

  const bottomNav = page.getByRole('navigation', {
    name: 'Navegação principal no celular',
  });
  if (mobile) {
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('button')).toHaveCount(4);
    for (const label of ['Início', 'Aprender', 'Praticar', 'Consultar']) {
      await expect(bottomNav.getByRole('button', { name: label })).toBeVisible();
    }
  } else {
    await expect(bottomNav).toBeHidden();
  }
  await expectHealthyPage(page, runtimeIssues);

  const menuButton = page.getByRole('button', { name: 'Abrir menu' });
  if (mobile) await menuButton.click();
  const sidebar = page.locator('#navegacao-lateral');
  const geopr = sidebar.getByRole('link', {
    name: 'Abrir GeoPR em nova aba (site externo)',
  });
  await expect(geopr).toHaveAttribute(
    'href',
    'https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc',
  );
  await expect(geopr).toHaveAttribute('target', '_blank');
  await expect(geopr).toHaveAttribute('rel', 'noopener noreferrer');
  await geopr.scrollIntoViewIfNeeded();
  await expect(geopr).toBeVisible();
  const suporte = sidebar.getByRole('button', { name: 'Suporte' });
  await suporte.scrollIntoViewIfNeeded();
  await expect(suporte).toBeVisible();
  await suporte.click();
  await expect(page.getByRole('heading', { name: 'Central de Suporte' })).toBeVisible();
  await expectHealthyPage(page, runtimeIssues);

  await page.goto(appUrl(baseURL, '#/aula/pop-section-001'), {
    waitUntil: 'domcontentloaded',
  });
  const video = page.locator('.video-lesson').first();
  await expect(video).toBeVisible();
  if (mobile) {
    const videoBox = await video.boundingBox();
    expect(videoBox?.y ?? Infinity).toBeLessThanOrEqual(viewport.height * 1.5);
  }
  await expectHealthyPage(page, runtimeIssues);

  await page.goto(appUrl(baseURL, '#/aula/pop-section-059'), {
    waitUntil: 'domcontentloaded',
  });
  const stage = page.locator('.vls-stage');
  const stageBox = await stage.boundingBox();
  if ((stageBox?.width ?? Infinity) <= 640) {
    const [screenBox, railBox, professorBox] = await Promise.all([
      stage.locator('.vls-screen').boundingBox(),
      stage.locator('.vls-professor-rail').boundingBox(),
      stage.locator('.vls-professor').boundingBox(),
    ]);
    expect(railBox?.y ?? 0).toBeGreaterThanOrEqual(
      (screenBox?.y ?? 0) + (screenBox?.height ?? 0) - 1,
    );
    expect(professorBox?.y ?? Infinity).toBeLessThanOrEqual(
      (railBox?.y ?? 0) + 8,
    );
    expect((professorBox?.y ?? 0) + (professorBox?.height ?? 0) * 0.55)
      .toBeLessThanOrEqual((railBox?.y ?? 0) + (railBox?.height ?? 0));
  }
  await expectHealthyPage(page, runtimeIssues);

  await page.goto(appUrl(baseURL, '#/laboratorio'), {
    waitUntil: 'domcontentloaded',
  });
  const catalogTrigger = page.locator('.lab-catalog-open');
  const catalog = page.locator('#lab-case-catalog-drawer');
  if (mobile) {
    await expect(catalogTrigger).toBeVisible();
    const workspaceBox = await page.locator('.lab-workspace').boundingBox();
    expect(workspaceBox?.y ?? Infinity).toBeLessThanOrEqual(viewport.height * 1.5);
    await catalogTrigger.click();
    await expect(catalog).toHaveAttribute('role', 'dialog');
    await expect(catalog).toBeVisible();
    await expect(catalog.locator('#lab-case-search')).toBeFocused();
    await catalog.locator('.lab-catalog-close').click();
    await expect(catalogTrigger).toBeFocused();
  } else {
    await expect(catalogTrigger).toBeHidden();
    await expect(catalog).toBeVisible();
    await expect(catalog).not.toHaveAttribute('role', 'dialog');
  }
  await expectHealthyPage(page, runtimeIssues);

  await page.goto(appUrl(baseURL, '#/redator'), {
    waitUntil: 'domcontentloaded',
  });
  if (mobile) {
    await expect(page.locator('.rd-step-mobile')).toBeVisible();
    await expect(page.locator('.rd-step-mobile')).toContainText('Etapa 1 de 12');
    await expect(page.locator('.rd-trilha')).toBeHidden();
  } else {
    await expect(page.locator('.rd-step-mobile')).toBeHidden();
    await expect(page.locator('.rd-trilha')).toBeVisible();
  }
  await expectHealthyPage(page, runtimeIssues);
});
