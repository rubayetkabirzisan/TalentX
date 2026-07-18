const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');

test.describe('Real-Time WebSockets Multi-Context', () => {
  test('Employer can send a message and Talent receives it instantly', async ({ browser }) => {
    const employerContext = await browser.newContext();
    const talentContext = await browser.newContext();

    const employerPage = await employerContext.newPage();
    const talentPage = await talentContext.newPage();

    const employerLogin = new LoginPage(employerPage);
    await employerLogin.goto();
    await employerLogin.loginAsEmployer();

    const talentLogin = new LoginPage(talentPage);
    await talentLogin.goto();
    await talentLogin.loginAsTalent();

    const employerWidgetBtn = employerPage.locator('button.fixed.bottom-6');
    await employerWidgetBtn.click();

    const firstConversation = employerPage.locator('div.divide-border > div').first();
    
    const hasConversations = await firstConversation.isVisible();
    if (hasConversations && !(await firstConversation.innerText()).includes('No conversations yet')) {
      await firstConversation.click();

      const testMessage = `Hello from Playwright JS - ${Date.now()}`;
      await employerPage.getByPlaceholder('Type a message...').fill(testMessage);
      await employerPage.getByRole('button', { name: 'Send' }).click();

      const bellDot = talentPage.locator('nav').getByRole('button').filter({ hasText: '' }).locator('span.animate-pulse');
      await expect(bellDot).toBeVisible({ timeout: 5000 });

      await talentPage.locator('nav').locator('button').filter({ has: talentPage.locator('svg.lucide-bell') }).click();

      await expect(talentPage.getByText('New Message')).toBeVisible();

      const talentWidgetBtn = talentPage.locator('button.fixed.bottom-6');
      await talentWidgetBtn.click();
      await expect(talentPage.getByText(testMessage)).toBeVisible({ timeout: 5000 });
    }
  });
});
