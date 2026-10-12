import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for Lançamento de Pitágoras (RALECAB GAMES)
 * Slice 007: 10 projetos customizados, relatórios isolados, política anti-flaky
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1, // Política anti-flaky: retries 1 com trace on
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['json', { outputFile: 'e2e-results/results.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  outputDir: 'test-results',
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4173/pythagoras-pass/',
    trace: 'on', // Captura tentativa inicial e retry
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'pt-BR',
    timezoneId: 'UTC',
  },
  webServer: {
    command: "BASE_PATH=/pythagoras-pass/ npm run preview -- --port 4173 --strictPort",
    url: 'http://localhost:4173/pythagoras-pass/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    // --- 4 CORE PROJECTS ---
    {
      name: 'chromium-desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 412, height: 915 },
        deviceScaleFactor: 2.625,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        browserName: 'webkit',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
    {
      name: 'webkit-mobile',
      use: {
        browserName: 'webkit',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      },
    },

    // --- 6 ADICIONAIS OBRIGATÓRIOS (COMPACT, LANDSCAPE, WIDE) ---
    {
      name: 'chromium-compact',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'webkit-compact',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'webkit',
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'chromium-landscape',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 844, height: 390 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'webkit-landscape',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'webkit',
        viewport: { width: 844, height: 390 },
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'chromium-wide',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
    {
      name: 'webkit-wide',
      testMatch: /.*(layout-scene|visual-regression)\.spec\.ts/,
      use: {
        browserName: 'webkit',
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false,
      },
    },
  ],
});
