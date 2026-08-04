import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PWA_TEST_PORT || 4191);
const distDirectory = resolve(process.env.PWA_DIST_DIR || 'dist');
const manifest = JSON.parse(readFileSync(resolve(distDirectory, 'manifest.webmanifest'), 'utf8'));
const basePath = String(manifest.scope || '/');
const expectedBasePath = String(process.env.PWA_EXPECTED_BASE || '/academia-iat/');
if (basePath !== expectedBasePath) {
  throw new Error(
    `O teste PWA exige artefato em ${expectedBasePath}; recebido ${basePath}. ` +
    'Compile com PAGES_REPO=academia-iat antes de executar.',
  );
}
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /pwa\.pw\.js/,
  outputDir: 'test-results/playwright-pwa',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `${origin}${basePath}`,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    serviceWorkers: 'allow',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'node tools/pwa-artifact-server.mjs',
    url: `${origin}/__pwa-test/health`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
