// e2e/pages/LoginPage.js
import { BasePage } from './BasePage.js'

/**
 * POM for /login
 */
export class LoginPage extends BasePage {
  constructor(page) {
    super(page)
    this.emailInput    = page.locator('[data-testid="login-email"]')
    this.passwordInput = page.locator('[data-testid="login-password"]')
    this.roleTalent    = page.locator('[data-testid="role-talent"]')
    this.roleEmployer  = page.locator('[data-testid="role-employer"]')
    this.submitBtn     = page.locator('[data-testid="login-submit"]')
    this.errorMsg      = page.locator('[data-testid="login-error"]')
    this.signupLink    = page.locator('[data-testid="signup-link"]')
    this.heading       = page.locator('[data-testid="login-heading"]')
  }

  async navigate() {
    await this.goto('/login')
  }

  /**
   * Fill and submit the login form.
   * @param {{ email: string, password: string, role?: 'talent'|'employer' }} creds
   */
  async login({ email, password, role = 'talent' }) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    if (role === 'employer') {
      await this.roleEmployer.click()
    } else {
      await this.roleTalent.click()
    }
    await this.submitBtn.click()
  }

  async getErrorText() {
    return this.errorMsg.textContent()
  }

  /** Returns true when the URL matches the expected dashboard */
  async waitForDashboard(role) {
    const path = role === 'employer' ? '/employer/dashboard' : '/talent/dashboard'
    await this.page.waitForURL(`**${path}**`, { timeout: 10_000 })
  }
}
