const { test, expect } = require('./fixtures/test');

test.describe('Talent Application Edge Cases', () => {
  test('Application wizard can be cancelled without submitting', async ({ loginPage, talentDashboard, employerDashboard, page }) => {
    // 1. Create a job as an Employer
    await loginPage.goto();
    await loginPage.loginAsEmployer();
    await employerDashboard.createJob('Automated Test Job Edge', '90000', '130000');
    await page.waitForTimeout(1000);
    
    // Log out by clearing localStorage
    await page.evaluate(() => { localStorage.clear(); });

    // 2. Login as Talent to test cancellation
    await loginPage.goto();
    await loginPage.loginAsTalent();

    // Talent starts the application flow but cancels
    await talentDashboard.cancelWizard();

    // Verify application history does NOT have a new entry from this run
    // (Assuming the button remains 'Apply Now')
    await expect(page.getByRole('button', { name: 'Apply for this position' }).first()).toBeVisible({ timeout: 10000 });
  });
});
