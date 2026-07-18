const { test, expect } = require('./fixtures/test');

test.describe('Employer Workflow', () => {
  test('Employer can create a job, view applicants, and export CSV', async ({ loginPage, employerDashboard, page }) => {
    await loginPage.goto();
    await loginPage.loginAsEmployer();

    const jobTitle = 'E2E Test Engineer ' + Date.now();
    await employerDashboard.createJob(jobTitle, '100000', '150000');

    await employerDashboard.selectJobToViewApplicants(jobTitle);
    
    const download = await employerDashboard.exportCSV();
    expect(download).toBeTruthy();
  });
});
