const { test, expect } = require('./fixtures/test');

test.describe('Security & RBAC (Negative Testing)', () => {
  test('Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/talent/dashboard');
    // Middleware should instantly kick them to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('Talent cannot access Employer dashboard', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAsTalent();
    
    // Attempt forced navigation
    await page.goto('/employer/dashboard');
    
    // Middleware should redirect back to their own dashboard or login
    await expect(page).not.toHaveURL(/.*employer\/dashboard/);
    await expect(page).toHaveURL(/.*talent\/dashboard/); // Assuming fallback to their dash
  });
});
