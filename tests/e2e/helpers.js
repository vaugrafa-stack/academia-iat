import { expect } from '@playwright/test';

export function appUrl(baseURL, hash = '') {
  const url = new URL(baseURL);
  url.hash = hash.replace(/^#/, '');
  return url.toString();
}

export function monitorRuntime(page, baseURL) {
  const issues = [];
  const origin = new URL(baseURL).origin;

  page.on('pageerror', (error) => {
    issues.push(`pageerror: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      issues.push(`console.error: ${message.text()}`);
    }
  });
  page.on('response', (response) => {
    const url = response.url();
    if (new URL(url).origin === origin && response.status() >= 400) {
      issues.push(`HTTP ${response.status()}: ${url}`);
    }
  });

  return issues;
}

export async function expectHealthyPage(page, runtimeIssues) {
  await expect(page.locator('#conteudo')).toBeVisible();
  await expect(page.locator('#boot-splash')).toHaveCount(0);
  await expect(page.locator('vite-error-overlay, nextjs-portal')).toHaveCount(0);

  const metrics = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }));
  expect(
    Math.max(metrics.documentWidth, metrics.bodyWidth),
    `Overflow horizontal detectado: ${JSON.stringify(metrics)}`,
  ).toBeLessThanOrEqual(metrics.viewport + 1);
  expect(
    runtimeIssues,
    runtimeIssues.length
      ? `Erros de runtime:\n${runtimeIssues.join('\n')}`
      : undefined,
  ).toEqual([]);
}

export async function expectBuildIdentity(page) {
  const marker = page.locator('[data-build-sha]').first();
  await expect(marker).toHaveCount(1);
  const actual = String(await marker.getAttribute('data-build-sha') || '');
  const expected = String(process.env.EXPECTED_BUILD_SHA || '').trim();

  if (expected) {
    expect(expected, 'EXPECTED_BUILD_SHA deve ser um SHA completo.').toMatch(
      /^[a-f0-9]{40}$/,
    );
    expect(actual).toBe(expected);
    return;
  }

  expect(actual).toMatch(/^(?:[a-f0-9]{40}(?:-local)?|local)$/);
}
