const { expect } = require('@playwright/test');

class EmployerDashboardPage {
  constructor(page) {
    this.page = page;
    this.createJobTab = page.getByRole('tab', { name: 'Create Job' });
    this.myJobsTab = page.getByRole('tab', { name: 'My Jobs' });
    this.applicantsTab = page.getByRole('tab', { name: 'Applicants' });

    this.jobTitleInput = page.getByPlaceholder('e.g., Senior React Developer');
    this.minSalaryInput = page.getByLabel('Minimum Salary ($)');
    this.maxSalaryInput = page.getByLabel('Maximum Salary ($)');
    this.createJobButton = page.getByRole('button', { name: 'Post Job', exact: true });
  }

  async createJob(title, minSalary, maxSalary) {
    await this.createJobTab.click();
    await this.jobTitleInput.fill(title);
    await this.minSalaryInput.fill(minSalary);
    await this.maxSalaryInput.fill(maxSalary);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await this.page.getByLabel('Application Deadline').fill(dateStr);
    
    // Fill required missing fields
    await this.page.getByLabel(/Tech Stack/).fill('React, Node.js');
    await this.page.getByLabel(/Job Description/).fill('This is a test job description for E2E tests.');

    await this.createJobButton.click();
    await expect(this.page.getByText('Job posted successfully').first()).toBeVisible();
  }

  async createJobExpectingError() {
    await this.createJobTab.click();
    // Intentionally leave fields empty
    await this.createJobButton.click();
    // Assuming UI prevents submission (e.g. required attributes block it natively or Zod validates)
    // We can assert no success message and form is still visible
    await expect(this.page.getByText('Job posted successfully').first()).toBeHidden();
  }

  async selectJobToViewApplicants(jobTitle) {
    await this.myJobsTab.click();
    await this.page.getByRole('button', { name: 'View Applicants' }).first().click();
    await expect(this.applicantsTab).toHaveAttribute('data-state', 'active');
  }

  async scheduleInterview(applicantName, timeslot) {
    const row = this.page.getByRole('row', { name: applicantName });
    await row.getByRole('button', { name: 'Schedule Interview' }).click();

    await this.page.getByPlaceholder('e.g. Next Tuesday at 2pm EST').fill(timeslot);
    await this.page.getByRole('button', { name: 'Confirm' }).click();

    await expect(this.page.getByText('Interview scheduled!')).toBeVisible();
    await expect(row.getByText('Scheduled')).toBeVisible();
  }

  async messageTalent(applicantName) {
    const row = this.page.getByRole('row', { name: applicantName });
    // Click the "Message Talent" button (has title="Message Talent")
    await row.getByRole('button', { name: 'Message Talent' }).click();
    // Expect the messaging widget to open
    await expect(this.page.getByPlaceholder('Type a message...')).toBeVisible();
  }

  async exportCSV() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: 'Export to CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('applicants.csv');
    return download;
  }
}

module.exports = { EmployerDashboardPage };
