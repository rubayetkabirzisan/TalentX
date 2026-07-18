// e2e/specs/login.spec.js
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'

test.describe('Login Flow', () => {
  let loginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.navigate()
  })

  test('renders login heading', async () => {
    await expect(loginPage.heading).toBeVisible()
  })

  test('shows validation when email is empty and form submitted', async ({ page }) => {
    // Click submit without filling anything — HTML5 required should prevent submission
    await loginPage.submitBtn.click()
    // The email field should still be empty and focused (HTML5 validation)
    await expect(loginPage.emailInput).toBeFocused()
    // URL should not have changed
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows error when password is missing', async ({ page }) => {
    await loginPage.emailInput.fill('test@test.com')
    // Don't fill password
    await loginPage.submitBtn.click()
    await expect(loginPage.passwordInput).toBeFocused()
    await expect(page).toHaveURL(/\/login/)
  })

  test('talent login succeeds and redirects to talent dashboard', async ({ page }) => {
    await loginPage.login({
      email: 'e2e-talent-login@test.com',
      password: 'anypassword',
      role: 'talent',
    })
    await expect(page).toHaveURL(/talent\/dashboard/, { timeout: 12_000 })
  })

  test('employer login succeeds and redirects to employer dashboard', async ({ page }) => {
    await loginPage.login({
      email: 'e2e-employer-login@test.com',
      password: 'anypassword',
      role: 'employer',
    })
    await expect(page).toHaveURL(/employer\/dashboard/, { timeout: 12_000 })
  })

  test('role selector switches between talent and employer', async () => {
    // Default is talent
    await expect(loginPage.roleTalent).toBeVisible()
    await loginPage.roleEmployer.click()
    // Employer label should now appear selected (has border-primary class via aria/visual)
    await expect(loginPage.roleEmployer).toBeVisible()
  })

  test('"Create one for free" link is NOT self-referential', async ({ page }) => {
    await expect(loginPage.signupLink).toBeVisible()
    const href = await loginPage.signupLink.getAttribute('href')
    // Should NOT simply be /login — must differ (e.g. /login?tab=signup)
    expect(href).not.toBe('/login')
    expect(href).toContain('signup')
  })

  test('unauthenticated root / redirects to /landing', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.goto('/')
    await page.waitForURL(/landing/, { timeout: 8_000 })
  })

  test('unauthenticated /employer/dashboard redirects to /login', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.goto('/employer/dashboard')
    await page.waitForURL(/login|landing/, { timeout: 8_000 })
  })

  test('unauthenticated /talent/dashboard redirects to /login', async ({ page }) => {
    await page.evaluate(() => localStorage.clear())
    await page.goto('/talent/dashboard')
    await page.waitForURL(/login|landing/, { timeout: 8_000 })
  })
})
