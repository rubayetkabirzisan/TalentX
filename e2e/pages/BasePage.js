// e2e/pages/BasePage.js
/**
 * BasePage — shared helpers used by all Page Object classes.
 * All POMs extend this class.
 */
export class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page
  }

  /** Navigate to a URL relative to baseURL */
  async goto(path = '/') {
    await this.page.goto(path)
    await this.page.waitForLoadState('domcontentloaded')
  }

  /** Wait for a data-testid to be visible */
  async waitForTestId(testId, options = {}) {
    return this.page.waitForSelector(`[data-testid="${testId}"]`, {
      state: 'visible',
      timeout: 10_000,
      ...options,
    })
  }

  /** Get a locator by data-testid */
  locator(testId) {
    return this.page.locator(`[data-testid="${testId}"]`)
  }

  /** Clear localStorage and reload (simulate logout) */
  async clearAuth() {
    await this.page.evaluate(() => localStorage.clear())
    await this.page.reload()
  }
}
