const { expect } = require('@playwright/test');

class TalentDashboardPage {
  constructor(page) {
    this.page = page;
    this.matchFeedTab = page.getByRole('tab', { name: 'Job Matches' });
    this.applicationHistoryTab = page.getByRole('tab', { name: 'Applications' });
    this.profileSettingsTab = page.getByRole('tab', { name: 'Settings' });

    this.applyWizardTitle = page.getByRole('heading', { name: 'Job Application' });
    this.nextButton = page.getByRole('button', { name: 'Next Step' });
    this.submitButton = page.getByRole('button', { name: 'Submit Application' });
    this.coverLetterTextarea = page.getByPlaceholder('I have 5 years of experience in...');
    
    // Additional Locators for new tests
    this.cancelWizardButton = page.getByRole('button', { name: 'Cancel' });
    this.nameInput = page.getByPlaceholder('Your name');
    this.saveProfileButton = page.getByRole('button', { name: 'Save Profile' });
  }

  async applyToFirstJob(coverLetterText) {
    await this.page.getByRole('button', { name: 'Apply for this position' }).first().click();
    await expect(this.applyWizardTitle).toBeVisible();

    await this.nextButton.click();
    await this.coverLetterTextarea.fill(coverLetterText);
    await this.nextButton.click();
    await this.submitButton.click();

    await expect(this.page.getByRole('button', { name: 'Applied' }).first()).toBeVisible();
  }

  async cancelWizard() {
    await this.page.getByRole('button', { name: 'Apply for this position' }).first().click();
    await expect(this.applyWizardTitle).toBeVisible();
    await this.cancelWizardButton.click();
    await expect(this.applyWizardTitle).toBeHidden();
  }

  async updateProfile(newName) {
    await this.profileSettingsTab.click();
    // Wait for the initial profile fetch to populate the input
    await expect(this.nameInput).not.toBeEmpty({ timeout: 10000 });
    await this.nameInput.fill(newName);
    await this.saveProfileButton.click();
  }

  async verifyInterviewScheduled(expectedTime) {
    await this.applicationHistoryTab.click();
    await expect(this.page.getByText(expectedTime)).toBeVisible();
    await expect(this.page.getByText('interviewing')).toBeVisible();
  }
}

module.exports = { TalentDashboardPage };
