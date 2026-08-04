import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT || 4174);
const repository = String(process.env.PAGES_REPO || '').trim();
const basePath = repository ? `/${repository}/` : '/';
const localBaseURL = `http://127.0.0.1:${port}${basePath}`;
const configuredBaseURL = String(process.env.PLAYWRIGHT_BASE_URL || '').trim();
const baseURL = configuredBaseURL
  ? `${configuredBaseURL.replace(/\/+$/, '')}/`
  : localBaseURL;

const artifactProject = (name, width, height) => ({
  name,
  testMatch: /artifact\.pw\.js/,
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width, height },
  },
});

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results/playwright',
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 25_000,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },
  webServer: configuredBaseURL
    ? undefined
    : {
        command: `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
  projects: [
    artifactProject('artifact-desktop', 1440, 900),
    artifactProject('artifact-320', 320, 720),
    artifactProject('artifact-360', 360, 800),
    artifactProject('artifact-390', 390, 844),
    artifactProject('artifact-430', 430, 932),
  ],
});
