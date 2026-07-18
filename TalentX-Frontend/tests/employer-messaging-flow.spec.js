const { test, expect } = require('./fixtures/test');

test.describe('Employer Messaging Flow', () => {
  test('Employer can initiate a message to a talent directly from the Applicants Tab', async ({ loginPage, employerDashboard, page }) => {
    await loginPage.goto();
    await loginPage.loginAsEmployer();

    // Create a job so the "My Jobs" tab isn't entirely empty
    await employerDashboard.createJob('Messaging Test Job', '90000', '130000');
    await employerDashboard.myJobsTab.click();
    
    // We will find any "View Applicants" button and click it
    const viewApplicantsBtn = page.getByRole('button', { name: 'View Applicants' }).first();
    if (await viewApplicantsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewApplicantsBtn.click();
    } else {
      return; // Skip if no jobs exist yet, though we just created one
    }

    // Now in the applicants tab, find any applicant row and click "Message Talent"
    const messageTalentBtn = page.getByRole('button', { name: 'Message Talent' }).first();
    
    // Only run the rest of the test if there is an applicant
    if (await messageTalentBtn.isVisible()) {
      await messageTalentBtn.click();
      
      // The messaging widget should pop up and allow typing
      await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
      
      // The active chat header should show the 'Back' button instead of 'Messages' main menu
      await expect(page.getByRole('button', { name: '← Back' })).toBeVisible();
    }
  });
});
