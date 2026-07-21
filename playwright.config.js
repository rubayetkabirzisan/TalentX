// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  // This previously also had 'setup', 'chromium', and 'mobile-safari' projects
  // covering a separate, earlier-generation UI suite (browser-driven specs
  // under e2e/specs, plus e2e/pages, e2e/setup, e2e/fixtures). That suite had
  // drifted from the current app (stale selectors, a setup step assuming
  // pre-seeded accounts that were never actually seeded anywhere) and had
  // never been run in CI. Retired rather than repaired, since
  // TalentX-Frontend/tests/ already covers the same core flows with a suite
  // that's actually maintained and passing. See QA-STRATEGY.md.
  projects: [
    // ── API-only tests (no browser needed) ───────────────────────────
    {
      name: 'api',
      testMatch: ['**/specs/ai.spec.js', '**/specs/security.spec.js'],
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: './TalentX-Frontend',
      url: 'http://localhost:3001',
      // true (not !process.env.CI): our GitHub Actions workflow already starts
      // both servers itself before invoking Playwright, so this should attach
      // to those instead of trying to bind the same ports again. Locally, with
      // nothing running yet, Playwright still starts a fresh server as normal —
      // reuseExistingServer only skips the start step if something already
      // responds at the given URL.
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm start',
      cwd: './TalentX-Backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})