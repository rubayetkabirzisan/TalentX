const { test, expect } = require('./fixtures/test');

test.describe('Employer Edge Cases & Validation', () => {
  test('Prevents submitting job creation form with missing fields', async ({ loginPage, employerDashboard, page }) => {
    await loginPage.goto();
    await loginPage.loginAsEmployer();

    // Trigger validation
    await employerDashboard.createJobExpectingError();

    // The form should still be visible because submission was blocked
    await expect(employerDashboard.createJobButton).toBeVisible();
  });

  test('Shows empty state when viewing applicants for a new job', async ({ loginPage, employerDashboard, page }) => {
    await loginPage.goto();
    await loginPage.loginAsEmployer();

    // Create a unique job
    const jobTitle = 'Edge Case Tester ' + Date.now();
    await employerDashboard.createJob(jobTitle, '50', '100');

    // View applicants
    await employerDashboard.selectJobToViewApplicants(jobTitle);

    // Should show empty state UI instead of a crashed table
    await expect(page.getByText('No applicants yet')).toBeVisible();
  });
});
