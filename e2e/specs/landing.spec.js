// e2e/specs/landing.spec.js
import { test, expect } from '@playwright/test'
import { LandingPage } from '../pages/LandingPage.js'

test.describe('Landing Page', () => {
  let landing

  test.beforeEach(async ({ page }) => {
    landing = new LandingPage(page)
    await landing.navigate()
  })

  test('renders without crashing', async ({ page }) => {
    await expect(page).toHaveTitle(/TalentX/)
  })

  test('hero heading is visible and contains key copy', async () => {
    await expect(landing.heroHeading).toBeVisible()
    const text = await landing.heroHeading.textContent()
    expect(text).toMatch(/find your.*tech job/i)
  })

  test('shows hero stat values (500+, 10k+, 95%)', async () => {
    await expect(landing.heroStats).toBeVisible()
    const stats = await landing.heroStats.locator('[class*="font-bold"]').allTextContents()
    expect(stats.join(' ')).toContain('500+')
    expect(stats.join(' ')).toContain('10k+')
    expect(stats.join(' ')).toContain('95%')
  })

  test('"Explore Jobs" CTA navigates to /jobs', async ({ page }) => {
    await landing.exploreJobsBtn.click()
    await expect(page).toHaveURL(/\/jobs/)
  })

  test('"Post a Job" CTA navigates to login with employer role', async ({ page }) => {
    await landing.postJobBtn.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('navbar logo is visible and links back to /landing', async ({ page }) => {
    await expect(landing.navLogo).toBeVisible()
    await landing.navLogo.click()
    await expect(page).toHaveURL(/\/landing/)
  })

  test('features section renders 3 feature cards', async ({ page }) => {
    await expect(landing.featuresSection).toBeVisible()
    const cards = page.locator('[data-testid^="feature-card-"]')
    await expect(cards).toHaveCount(3)
  })

  test('CTA section is visible with correct call-to-action', async () => {
    await expect(landing.ctaSection).toBeVisible()
    await expect(landing.ctaExploreBtn).toBeVisible()
  })

  test('footer is present', async () => {
    await expect(landing.footer).toBeVisible()
  })

  test('dark mode toggle changes theme attribute', async ({ page }) => {
    await expect(landing.themeToggle).toBeVisible()
    const htmlBefore = await page.locator('html').getAttribute('class')
    await landing.toggleTheme()
    const htmlAfter = await page.locator('html').getAttribute('class')
    expect(htmlAfter).not.toBe(htmlBefore)
  })
})
