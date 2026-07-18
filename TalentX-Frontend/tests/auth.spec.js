const { test, expect } = require('./fixtures/test');

test.describe('Authentication Flow', () => {
  test('User can create a new Talent account', async ({ loginPage, page }) => {
    await loginPage.goto();
    
    // Generate unique email to prevent collision on backend
    const uniqueEmail = `new.talent.${Date.now()}@test.com`;
    await loginPage.createAccount(uniqueEmail, 'securepassword123', 'talent');
    
    await expect(page).toHaveURL(/\/talent\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Talent Dashboard' })).toBeVisible();
  });

  test('User can log in as a Talent', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAsTalent();
    
    await expect(page).toHaveURL(/\/talent\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Talent Dashboard' })).toBeVisible();
  });

  test('User can create a new Employer account', async ({ loginPage, page }) => {
    await loginPage.goto();
    
    const uniqueEmail = `new.employer.${Date.now()}@test.com`;
    await loginPage.createAccount(uniqueEmail, 'securepassword123', 'employer');
    
    await expect(page).toHaveURL(/\/employer\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
  });

  test('User can log in as an Employer', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.loginAsEmployer();
    
    await expect(page).toHaveURL(/\/employer\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Employer Dashboard' })).toBeVisible();
  });
});
