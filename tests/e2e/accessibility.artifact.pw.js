import { expect, test } from '@playwright/test';
import {
  appUrl,
  expectHealthyPage,
  monitorRuntime,
} from './helpers.js';

const ROUTES = [
  { hash: '', heading: /Comece por aqui|Onde você parou/i, minimumControls: 5 },
  { hash: '#/hidreletricas', heading: /Como funciona uma hidrelétrica/i, minimumControls: 10 },
  { hash: '#/formacao', heading: /Formação guiada pelo POP/i, minimumControls: 10 },
  { hash: '#/laboratorio', heading: /Pratique antes de assinar/i, minimumControls: 5 },
  { hash: '#/redator', heading: /Redator de Informação Técnica/i, minimumControls: 5 },
  { hash: '#/avaliacoes', heading: /Autoavaliações e revisão/i, minimumControls: 5 },
  { hash: '#/fluxos', heading: /Fluxos: proposta e atividade/i, minimumControls: 5 },
  { hash: '#/mapa', heading: /Mapa das hidrelétricas do Paraná/i, minimumControls: 10 },
  { hash: '#/biblioteca', heading: /Biblioteca operacional/i, minimumControls: 5 },
  { hash: '#/perfil', heading: /Criar perfil local|Meu progresso/i, minimumControls: 3 },
  { hash: '#/suporte', heading: /Central de Suporte/i, minimumControls: 3 },
  { hash: '#/aula/pop-section-001', heading: /Controle documental/i, minimumControls: 8 },
  { hash: '#/aula/pop-section-059', heading: /Distinção entre os documentos/i, minimumControls: 8 },
];

function parseCssColor(value) {
  const source = String(value || '').trim().toLowerCase();
  const alphaValue = (token = '1') => token.endsWith('%')
    ? Number.parseFloat(token) / 100
    : Number.parseFloat(token);
  const rgbValue = (token) => token.endsWith('%')
    ? Number.parseFloat(token) * 2.55
    : Number.parseFloat(token);
  const srgbValue = (token) => token.endsWith('%')
    ? Number.parseFloat(token) * 2.55
    : Number.parseFloat(token) * 255;

  const hex = source.match(/^#([0-9a-f]{3,8})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 || hex.length === 4
      ? [...hex].map((character) => character + character).join('')
      : hex;
    return {
      rgb: [0, 2, 4].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16)),
      alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = source.match(/^rgba?\((.*)\)$/i)?.[1];
  if (rgb) {
    const [channels, alpha = '1'] = rgb.replaceAll(',', ' ').split('/').map((part) => part.trim());
    const values = channels.split(/\s+/).filter(Boolean);
    if (values.length >= 3) {
      const legacyAlpha = values.length >= 4 ? values[3] : alpha;
      return { rgb: values.slice(0, 3).map(rgbValue), alpha: alphaValue(legacyAlpha) };
    }
  }

  const srgb = source.match(
    /^color\(srgb\s+([^\s/]+)\s+([^\s/]+)\s+([^\s/]+)(?:\s*\/\s*([^\s)]+))?\)$/i,
  );
  if (srgb) {
    return {
      rgb: srgb.slice(1, 4).map(srgbValue),
      alpha: alphaValue(srgb[4] || '1'),
    };
  }
  return null;
}

function compositeColor(foreground, background) {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  if (alpha === 0) return { rgb: [0, 0, 0], alpha: 0 };
  return {
    rgb: foreground.rgb.map((channel, index) => (
      channel * foreground.alpha
      + background.rgb[index] * background.alpha * (1 - foreground.alpha)
    ) / alpha),
    alpha,
  };
}

function backgroundFromChain(backgrounds) {
  return [...backgrounds].reverse().reduce((result, value) => {
    const layer = parseCssColor(value);
    return layer ? compositeColor(layer, result) : result;
  }, { rgb: [255, 255, 255], alpha: 1 });
}

function contrastRatio(first, second) {
  const luminance = (rgb) => {
    const channels = rgb.map((channel) => {
      const value = Math.max(0, Math.min(255, channel)) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

function colorsFromGradient(value) {
  return (String(value || '').match(
    /color\(srgb[^)]*\)|rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi,
  ) || []).map(parseCssColor).filter(Boolean);
}

test('rotas principais preservam semantica, leitura e operacao por toque', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  const mobile = (page.viewportSize()?.width || Infinity) <= 430;

  for (const { hash, heading, minimumControls } of ROUTES) {
    await page.goto(appUrl(baseURL, hash), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#conteudo')).toBeVisible();
    await expect(page.locator('#conteudo h1')).toHaveCount(1);
    await expect(page.locator('#conteudo h1')).toHaveText(heading);
    await expect.poll(() => page.locator('#conteudo').evaluate((main) => (
      (main.innerText || '').replace(/\s+/g, ' ').trim().length
    )), {
      message: `${hash || '#/'}: conteudo lazy nao concluiu a montagem`,
    }).toBeGreaterThan(250);

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

      const main = document.querySelector('#conteudo');
      const mainTextLength = (main?.innerText || '').replace(/\s+/g, ' ').trim().length;
      const mainOperableControls = controls.filter((element) => (
        main?.contains(element)
        && !element.matches(':disabled, [aria-disabled="true"]')
      )).length;

      return {
        lang: document.documentElement.lang,
        title: document.title,
        unnamed,
        touchTargets,
        smallMobileFields,
        duplicateIds: [...new Set(duplicateIds)],
        imagesWithoutAlt,
        headingJumps,
        mainTextLength,
        mainOperableControls,
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
    expect(
      audit.mainTextLength,
      `${hash || '#/'}: rota renderizou texto insuficiente`,
    ).toBeGreaterThan(250);
    expect(
      audit.mainOperableControls,
      `${hash || '#/'}: controles principais desapareceram`,
    ).toBeGreaterThanOrEqual(minimumControls);
    await expectHealthyPage(page, runtimeIssues);
  }
});

test('busca global opera por teclado, contem o foco e devolve contexto', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });

  const trigger = page.getByRole('button', {
    name: /Buscar no POP, aulas e checklists/i,
  });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.getByRole('dialog', { name: /Buscar na Academia IAT/i });
  const input = dialog.getByRole('textbox', {
    name: /Buscar aulas, quadros e siglas do POP/i,
  });
  const close = dialog.getByRole('button', { name: /Fechar busca/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(input).toBeFocused();
  await expect.poll(() => page.locator('#conteudo').evaluate((node) => node.inert)).toBe(true);

  const focusIndicator = await input.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      style: style.outlineStyle,
      width: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focusIndicator.style).not.toBe('none');
  expect(focusIndicator.width).toBeGreaterThanOrEqual(2);

  await input.press('Shift+Tab');
  await expect(close).toBeFocused();
  await close.press('Tab');
  await expect(input).toBeFocused();
  await input.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.press('Enter');
  const reopened = page.getByRole('dialog', { name: /Buscar na Academia IAT/i });
  const reopenedInput = reopened.getByRole('textbox', {
    name: /Buscar aulas, quadros e siglas do POP/i,
  });
  await reopenedInput.fill('controle documental');
  await expect(reopened.locator('.modal-results button').first()).toBeVisible();
  await reopenedInput.press('Enter');
  await expect(reopened).toHaveCount(0);
  await expect(page).toHaveURL(/#\/(?:aula|biblioteca)/);
  await expect(page.locator('#conteudo')).toBeFocused();
  await expectHealthyPage(page, runtimeIssues);
});

test('contraste e foco sao medidos no estilo renderizado em ambos os temas', async ({
  page,
  baseURL,
}) => {
  const runtimeIssues = monitorRuntime(page, baseURL);
  await page.goto(appUrl(baseURL), { waitUntil: 'domcontentloaded' });

  // O Chromium resolve `color-mix()` como `color(srgb ... / alfa)`. Este
  // sentinela impede que o auditor volte a aceitar apenas rgb()/hex.
  expect(parseCssColor('color(srgb 0.2 0.4 0.6 / 0.68)')).toEqual({
    rgb: [51, 102, 153],
    alpha: 0.68,
  });

  for (const theme of ['dark', 'light']) {
    // Carregar cada tema desde o bootstrap evita medir o quadro intermediário
    // da transição de cor, que não é a pintura estável percebida pelo usuário.
    await page.evaluate((value) => {
      localStorage.setItem('academia-iat-theme', value);
    }, theme);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

    const primary = page.locator('.dashboard-hero-actions button.primary');
    await expect(primary).toBeVisible();
    const rendered = await primary.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
      };
    });
    const text = parseCssColor(rendered.color);
    const fallback = parseCssColor(rendered.backgroundColor)
      || { rgb: [255, 255, 255], alpha: 1 };
    const stops = colorsFromGradient(rendered.backgroundImage);
    expect(text, `${theme}: cor do botão não interpretável`).toBeTruthy();
    const paintedBackgrounds = stops.length ? stops : [fallback];
    const ratios = paintedBackgrounds.map((stop) => {
      const paintedStop = compositeColor(stop, fallback);
      const paintedText = compositeColor(text, paintedStop);
      return contrastRatio(paintedText.rgb, paintedStop.rgb);
    });
    expect(
      Math.min(...ratios),
      `${theme}: contraste mínimo no gradiente ${Math.min(...ratios).toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(4.5);
  }

  if ((page.viewportSize()?.width || Infinity) <= 980) {
    const aprender = page.getByRole('navigation', {
      name: /Navegação principal no celular/i,
    }).getByRole('button', { name: 'Formação' });
    await aprender.focus();
    await aprender.press('Enter');
    const destination = page.locator('.mobile-nav-panel__item').first();
    await expect(destination).toBeFocused();

    const indicator = await destination.evaluate((element) => {
      const style = getComputedStyle(element);
      const backgrounds = [];
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        backgrounds.push(getComputedStyle(parent).backgroundColor);
      }
      return {
        color: style.outlineColor,
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
        backgrounds,
      };
    });
    const adjacent = backgroundFromChain(indicator.backgrounds);
    const outline = parseCssColor(indicator.color);
    expect(indicator.style).not.toBe('none');
    expect(indicator.width).toBeGreaterThanOrEqual(2);
    expect(outline, `cor de foco não interpretável: ${indicator.color}`).toBeTruthy();
    const paintedOutline = compositeColor(outline, adjacent);
    expect(contrastRatio(paintedOutline.rgb, adjacent.rgb)).toBeGreaterThanOrEqual(3);
  }

  await expectHealthyPage(page, runtimeIssues);
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
  await expect(page.getByRole('button', { name: /Iniciar forma..o/i })).toBeVisible();
  await expect(page.getByText(/Onde voc. parou/i)).toHaveCount(0);

  await page.goto(appUrl(baseURL, '#/hidreletricas'), { waitUntil: 'domcontentloaded' });
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

// A varredura de contraste que existia neste arquivo media dois pontos
// escolhidos a dedo, o gradiente e o contorno de foco. Nenhum portao passava
// por TODO o texto renderizado, e foi assim que .offline-code ficou em 3,34:1
// com 12px em peso 900, exigindo 4,5:1: nada olhava para ele.
//
// A mesma varredura cobre o piso de prosa. O piso de 11px de
// tools/check-tipografia.mjs esta certo, mas a justificativa escrita dele fala
// de "rotulo em caixa alta, lido por reconhecimento". Dezesseis trechos de
// PROSA usavam esse piso, que e o caso que a propria justificativa exclui.
// Portao estatico nao distingue os dois, porque a diferenca esta no texto que
// chega a tela, e nao na folha de estilo.
//
// Roda so no projeto mais largo: multiplicar treze rotas por cinco larguras
// nao acrescentaria achado, porque cor e tamanho de fonte nao mudam com a
// largura, e custaria quatro vezes o tempo de CI.
test('todo texto renderizado alcanca contraste minimo e piso de prosa', async ({
  page,
  baseURL,
}) => {
  test.skip(
    (page.viewportSize()?.width || 0) < 1000,
    'cor e corpo de fonte nao dependem da largura; a varredura roda uma vez',
  );
  const contrasteBaixo = [];
  const prosaMiuda = [];

  for (const { hash } of ROUTES) {
    await page.goto(appUrl(baseURL, hash), { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#conteudo')).toBeVisible();
    const amostras = await page.evaluate(() => {
      const colhidas = [];
      for (const el of document.querySelectorAll('#conteudo *, .sidebar-v2 *, .topbar *')) {
        if (el.children.length) continue;
        if (el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
        const texto = (el.textContent || '').trim();
        if (texto.length < 2) continue;
        const estilo = getComputedStyle(el);
        if (estilo.display === 'none' || estilo.visibility === 'hidden') continue;
        if (Number.parseFloat(estilo.opacity) < 0.5) continue;
        const caixa = el.getBoundingClientRect();
        if (caixa.width < 3 || caixa.height < 3) continue;
        const fundos = [];
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          fundos.push(getComputedStyle(n).backgroundColor);
        }
        const maiusculas = estilo.textTransform === 'uppercase'
          || (texto === texto.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(texto));
        colhidas.push({
          onde: el.tagName.toLowerCase()
            + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
          cor: estilo.color,
          fundos,
          px: Number.parseFloat(estilo.fontSize),
          peso: Number.parseInt(estilo.fontWeight, 10) || 400,
          // Prosa e frase, nao etiqueta: ou passa de 24 caracteres, ou tem
          // pontuacao seguida de espaco.
          prosa: !maiusculas && (texto.length > 24 || /[.,;:] /.test(texto)),
          trecho: texto.slice(0, 40),
        });
      }
      return colhidas;
    });

    for (const a of amostras) {
      const frente = parseCssColor(a.cor);
      if (!frente) continue;
      const fundo = backgroundFromChain(a.fundos);
      // WCAG 1.4.3: 3:1 para texto grande, 4,5:1 para o resto.
      const exigido = a.px >= 24 || (a.px >= 18.66 && a.peso >= 700) ? 3 : 4.5;
      const razao = contrastRatio(frente.rgb, fundo.rgb);
      if (razao + 0.01 < exigido) {
        contrasteBaixo.push(
          `${hash || '#/'} ${a.onde} ${razao.toFixed(2)}:1 exige ${exigido} "${a.trecho}"`,
        );
      }
      // O piso de 11px vale para rotulo. Prosa comeca em 12px.
      if (a.prosa && a.px < 12) {
        prosaMiuda.push(`${hash || '#/'} ${a.onde} ${a.px}px "${a.trecho}"`);
      }
    }
  }

  expect(contrasteBaixo, 'texto abaixo do contraste minimo').toEqual([]);
  expect(prosaMiuda, 'prosa no piso pensado para rotulo').toEqual([]);
});
