// playwright.config.js
import { defineConfig, devices } from '@playwright/test'

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

  projects: [
    // ── Setup project: creates auth state files ─────────────────────
    {
      name: 'setup',
      testMatch: '**/setup/auth.setup.js',
    },

    // ── Desktop Chrome ───────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    // ── Mobile Safari ────────────────────────────────────────────────
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
      dependencies: ['setup'],
    },

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