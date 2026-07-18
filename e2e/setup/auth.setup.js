// e2e/setup/auth.setup.js
import { chromium } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

/**
 * Logs in as the given email/role and saves storageState to `authFile`.
 */
async function loginAs(email, role, authFile) {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page    = await context.newPage()

  await page.goto(`${BASE_URL}/login`)
  await page.waitForLoadState('domcontentloaded')

  await page.locator('[data-testid="login-email"]').fill(email)
  await page.locator('[data-testid="login-password"]').fill('playwright-test-password')

  if (role === 'employer') {
    await page.locator('[data-testid="role-employer"]').click()
  } else {
    await page.locator('[data-testid="role-talent"]').click()
  }

  await page.locator('[data-testid="login-submit"]').click()

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 15_000 })

  // Persist auth state (cookies + localStorage)
  await context.storageState({ path: authFile })
  await browser.close()

  console.log(`✓ Auth saved → ${authFile} (${email} / ${role})`)
}

async function globalSetup() {
  await loginAs(
    'playwright-employer@talentx.dev',
    'employer',
    'e2e/.auth/employer.json',
  )
  await loginAs(
    'playwright-talent@talentx.dev',
    'talent',
    'e2e/.auth/talent.json',
  )
}

export default globalSetup
