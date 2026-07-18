const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.talentRoleButton = page.getByTestId('role-talent');
    this.employerRoleButton = page.getByTestId('role-employer');
    this.submitButton = page.getByTestId('login-submit');
    this.toggleAuthLink = page.getByTestId('auth-toggle-link');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password, role, isSignUp = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (role === 'employer') {
      await this.employerRoleButton.click();
    } else {
      await this.talentRoleButton.click();
    }

    await this.submitButton.click({ force: true });

    // Check if error is displayed
    const errorEl = this.page.getByTestId('login-error');
    if (await errorEl.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await errorEl.innerText();
      console.log('LOGIN ERROR:', text);
    }
  }

  async createAccount(email, password, role) {
    // Force navigation to signup page to avoid client-side routing flakiness
    await this.page.goto(`/login?tab=signup&role=${role}`);
    await expect(this.page.getByTestId('login-heading')).toHaveText('Create an account');
    
    // Proceed with registration
    await this.login(email, password, role, true);
  }

  async loginAsTalent() {
    const uniqueEmail = `talent.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.com`;
    await this.createAccount(uniqueEmail, 'password', 'talent');
    await expect(this.page).toHaveURL(/\/talent\/dashboard/);
  }

  async loginAsEmployer() {
    const uniqueEmail = `employer.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.com`;
    await this.createAccount(uniqueEmail, 'password', 'employer');
    await expect(this.page).toHaveURL(/\/employer\/dashboard/);
  }
}

module.exports = { LoginPage };
