const { test, expect } = require('./fixtures/test');

test.describe('Talent Profile Edge Cases & Updates', () => {
  test('Talent can update their profile name', async ({ loginPage, talentDashboard, page }) => {
    await loginPage.goto();
    await loginPage.loginAsTalent();

    const newName = `Test Name updated at ${Date.now()}`;
    await talentDashboard.updateProfile(newName);

    await expect(page.getByText('Profile updated successfully').first()).toBeVisible();
    await expect(talentDashboard.nameInput).toHaveValue(newName);
  });
});
