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
    ready: (page) => page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }),
  },
  {
    hash: '#/hidreletricas',
    ready: (page) => page.getByRole('heading', { name: /Como funciona uma hidrelétrica/i }),
  },
  {
    hash: '#/formacao',
    ready: (page) => page.getByRole('heading', { name: /Formação guiada pelo POP/i }),
  },
  {
    hash: '#/avaliacoes',
    ready: (page) => page.getByRole('heading', { name: /Autoavaliações e revisão/i }),
  },
  {
    hash: '#/fluxos',
    ready: (page) => page.getByRole('heading', { name: /Fluxos: proposta e atividade/i }),
  },
  {
    hash: '#/biblioteca',
    ready: (page) => page.getByRole('heading', { name: /Biblioteca/i }),
  },
  {
    hash: '#/perfil',
    ready: (page) => page.locator('.profile-page h1'),
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
    ready: (page) => page.getByRole('heading', { name: /Redator de Informação Técnica/i }),
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

test('artefato final mantém build, rotas principais e console íntegros', async ({
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

test('guia de hidrelétricas leva cada atalho ao título visível e focado', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL, '#/hidreletricas'), {
    waitUntil: 'domcontentloaded',
  });

  const nav = page.getByRole('navigation', { name: 'Seções deste guia' });
  const links = nav.locator('.hydro-guide-nav__links');
  const trigger = nav.getByRole('button', { name: 'Licenciamento' });
  const target = page.locator('#hydro-licenciamento');
  const targetHeading = target.getByRole('heading', {
    name: 'Como solicitar a autorização para construir',
  });

  await expect(nav).toBeVisible();
  await expect(target).toHaveCSS('content-visibility', 'auto');
  await trigger.click();
  await expect(target).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-current', 'location');

  await expect.poll(async () => {
    const [navBox, headingBox] = await Promise.all([
      nav.boundingBox(),
      targetHeading.boundingBox(),
    ]);
    if (!navBox || !headingBox) return false;
    const distanceFromNav = headingBox.y - (navBox.y + navBox.height);
    const viewportHeight = page.viewportSize()?.height || 0;
    return distanceFromNav >= 4
      && distanceFromNav <= 180
      && headingBox.y >= navBox.y + navBox.height
      && headingBox.y + headingBox.height <= viewportHeight;
  }, {
    message: 'o heading final precisa ficar inteiro abaixo da navegação, sem espaçador excessivo',
  }).toBe(true);

  await expect(target).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-current', 'location');
  await expect(target).toHaveCSS('content-visibility', 'auto');

  await expect.poll(async () => trigger.evaluate((element) => {
    const container = element.parentElement;
    if (!container) return false;
    const itemBox = element.getBoundingClientRect();
    const containerBox = container.getBoundingClientRect();
    return itemBox.left >= containerBox.left - 1 && itemBox.right <= containerBox.right + 1;
  }), {
    message: 'o item ativo precisa permanecer visível na faixa horizontal',
  }).toBe(true);

  await expect(links).toBeVisible();
  await expectHealthyPage(page, runtimeIssues);
});

test('corte hidrelétrico interativo carrega o ativo original e responde em qualquer tela', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL, '#/hidreletricas'), {
    waitUntil: 'domcontentloaded',
  });

  const cutaway = page.locator('.hec-shell');
  await expect(cutaway).toBeVisible();
  await expect(cutaway.getByRole('heading', {
    name: 'Funcionamento e anatomia de uma usina hidrelétrica',
  })).toBeVisible();

  const image = cutaway.locator('.hec-scene img');
  await expect(image).toHaveJSProperty('complete', true);
  await expect.poll(() => image.evaluate((node) => node.naturalWidth)).toBe(1600);
  await expect(cutaway.getByRole('tab')).toHaveCount(8);
  await expect(cutaway.locator('.hec-callout')).toHaveCount(17);
  await expect(cutaway.locator('.hec-leader')).toHaveCount(17);
  await expect(cutaway.locator('.hec-equipment-key button')).toHaveCount(17);

  await cutaway.getByRole('tab', { name: /Transformação/ }).click();
  await expect(cutaway.locator('.hec-stage-panel > div > strong')).toHaveText('Transformador');
  await expect(cutaway).toHaveAttribute('data-playing', 'false');
  await expect(cutaway.getByRole('button', { name: /Reproduzir/ })).toBeVisible();

  const viewport = page.viewportSize();
  if (viewport.width <= 900) {
    await expect(cutaway.locator('.hec-equipment-key')).toBeVisible();
    await expect(cutaway.locator('.hec-callouts')).toBeHidden();
  }
  if (viewport.width <= 430) {
    await expect.poll(() => cutaway.evaluate((node) => (
      node.scrollWidth <= node.clientWidth + 1
    ))).toBe(true);
    const controls = cutaway.locator('button:visible');
    for (let index = 0; index < await controls.count(); index += 1) {
      const box = await controls.nth(index).boundingBox();
      expect(Math.min(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    }
  }

  await expectHealthyPage(page, runtimeIssues);
});

test('demais animações hidrelétricas mantêm identificação, controles e leitura móvel', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  const viewport = page.viewportSize();
  await page.goto(appUrl(baseURL, '#/hidreletricas'), {
    waitUntil: 'domcontentloaded',
  });

  const cutaway = page.locator('#hydro-principio .hec-shell');
  await cutaway.scrollIntoViewIfNeeded();
  await expect(page.locator('#hydro-anatomia')).toHaveCount(0);
  await expect(cutaway.locator('.hec-callout')).toHaveCount(17);
  await expect(cutaway.locator('.hec-equipment-key button')).toHaveCount(17);
  await cutaway.locator('button:visible').filter({ hasText: 'Vertedouro' }).click();
  await expect(cutaway.locator('.hec-stage-panel')).toContainText('Vertedouro');
  await expect(cutaway).toHaveAttribute('data-playing', 'false');

  const dams = page.locator('#hydro-barramentos');
  await dams.scrollIntoViewIfNeeded();
  await expect(dams.locator('.dam-selector [role="tab"]')).toHaveCount(6);
  await expect(dams.locator('.dam-stage .dam-mini')).toHaveCount(1);
  await dams.getByRole('tab', { name: /Enrocamento/ }).click();
  await expect(dams.locator('.dam-selected-panel')).toContainText('Face de concreto e enrocamento');

  const turbines = page.locator('#hydro-turbinas');
  await turbines.scrollIntoViewIfNeeded();
  await turbines.locator('.tp-band').filter({ hasText: 'Kaplan' }).click();
  await expect(turbines.locator('.tg-tabs').getByRole('tab', { name: 'Kaplan' }))
    .toHaveAttribute('aria-selected', 'true');
  await expect(turbines.locator('.tg-body .turb-svg')).toHaveCount(1);
  await expect(turbines.locator('.hcm-equipment-key li')).toHaveCount(4);

  const reversible = page.locator('.hcm-reversible-motion');
  await reversible.scrollIntoViewIfNeeded();
  await expect(reversible.locator('.hcm-phase-selector button')).toHaveCount(2);
  await reversible.getByRole('button', { name: 'Bombeamento' }).click();
  await expect(reversible).toHaveAttribute('data-reversible-mode', 'pump');
  await expect(reversible.locator('.hcm-current-state')).toContainText('consome energia');

  const arrangements = page.locator('#hydro-arranjos');
  await arrangements.scrollIntoViewIfNeeded();
  await expect(arrangements.locator('.hcm-arrangement-tabs [role="tab"]')).toHaveCount(3);
  await arrangements.getByRole('tab', { name: 'Fio d’água × acumulação' }).click();
  await expect(arrangements.locator('.hcm-arrangement-stage svg')).toHaveCount(1);
  await expect(arrangements.locator('.hcm-equipment-key li')).toHaveCount(4);

  if (viewport.width <= 720) await expect(cutaway.locator('.hec-equipment-key')).toBeVisible();
  if (viewport.width <= 430) {
    await expect.poll(() => page.locator('html').evaluate((node) => (
      node.scrollWidth <= node.clientWidth + 1
    )), {
      message: 'as animações técnicas não podem alargar a página no celular',
    }).toBe(true);
    for (const selector of [
      '.dam-explorer .hydro-motion-toggle',
      '.hcm-turbine-motion .hcm-play',
      '.hcm-arrangements .hcm-play',
    ]) {
      const box = await page.locator(selector).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  }

  await expectHealthyPage(page, runtimeIssues);
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
    page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }),
  ).toBeVisible();

  const bottomNav = page.getByRole('navigation', {
    name: 'Navegação principal no celular',
  });
  if (mobile) {
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.getByRole('button')).toHaveCount(4);
    for (const label of ['Início', 'Formação', 'Prática', 'Consulta']) {
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
    name: 'Abrir GeoPR · portal completo em nova aba (site externo)',
  });
  await expect(geopr).toHaveAttribute(
    'href',
    'https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc',
  );
  await expect(geopr).toHaveAttribute('target', '_blank');
  await expect(geopr).toHaveAttribute('rel', 'noopener noreferrer');
  await geopr.scrollIntoViewIfNeeded();
  await expect(geopr).toBeVisible();
  const suporte = sidebar.getByRole('button', { name: 'Ajuda' });
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
    // As tres relacoes sao medidas DENTRO de um poll, e nao uma vez so.
    //
    // `boundingBox()` e um retrato instantaneo: medido logo apos o
    // `domcontentloaded`, ele pega o layout no meio do assentamento. Em
    // 09/08/2026 isso reprovou por 1,55px numa tolerancia de 1px, e tres
    // reexecucoes seguidas passaram. Afrouxar a tolerancia esconderia um
    // desalinhamento de verdade; remedir ate assentar remove a corrida sem
    // mexer em limite nenhum.
    await expect
      .poll(
        async () => {
          const [screenBox, railBox, professorBox] = await Promise.all([
            stage.locator('.vls-screen').boundingBox(),
            stage.locator('.vls-professor-rail').boundingBox(),
            stage.locator('.vls-professor').boundingBox(),
          ]);
          return {
            trilhoAbaixoDaTela:
              (railBox?.y ?? 0) >= (screenBox?.y ?? 0) + (screenBox?.height ?? 0) - 1,
            professorNoTopoDoTrilho: (professorBox?.y ?? Infinity) <= (railBox?.y ?? 0) + 8,
            professorCabeNoTrilho:
              (professorBox?.y ?? 0) + (professorBox?.height ?? 0) * 0.55 <=
              (railBox?.y ?? 0) + (railBox?.height ?? 0),
          };
        },
        { message: 'palco da videoaula em coluna: trilho abaixo da tela, professor dentro dele' },
      )
      .toEqual({
        trilhoAbaixoDaTela: true,
        professorNoTopoDoTrilho: true,
        professorCabeNoTrilho: true,
      });
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

test('endereço que nomeia rota inexistente é corrigido, e não fica no histórico', async ({
  page,
  baseURL,
}) => {
  const runtime = monitorRuntime(page, baseURL);

  // Link velho, rota renomeada, endereço digitado errado: o efeito era sempre
  // o mesmo, e silencioso. A tela mostrava o Início e a barra de endereço
  // continuava afirmando a rota morta. Quem chegasse assim não descobria que o
  // link quebrou, e ao compartilhar propagava o endereço que não funciona.
  await page.goto(appUrl(baseURL, '#/rota-que-nao-existe'));
  await expect(page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }))
    .toBeVisible();
  expect(new URL(page.url()).hash, 'endereço direto não foi corrigido').toBe('#/');

  // O outro caminho de entrada é a navegação de dentro, por hashchange.
  await page.evaluate(() => { window.location.hash = '#/mapa'; });
  await expect(page.getByRole('heading', { name: /Mapa das hidrelétricas/i })).toBeVisible();
  await page.evaluate(() => { window.location.hash = '#/outra-que-nao-existe'; });
  await expect(page.getByRole('heading', { name: /Comece por aqui|Onde você parou/i }))
    .toBeVisible();
  expect(new URL(page.url()).hash, 'navegação interna não foi corrigida').toBe('#/');

  // A correção usa replaceState de propósito: com pushState, voltar levaria de
  // novo ao endereço quebrado, e a pessoa ficaria presa num laço.
  await page.goBack();
  await expect(page.getByRole('heading', { name: /Mapa das hidrelétricas/i })).toBeVisible();
  expect(new URL(page.url()).hash, 'o link morto ficou no histórico').toBe('#/mapa');

  await expectHealthyPage(page, runtime);
});
