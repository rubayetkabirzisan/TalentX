const { test, expect } = require('@playwright/test');

test.describe('UI Components & Theming', () => {
  test('User can toggle dark mode and the HTML root class updates', async ({ page }) => {
    // Go to landing page
    await page.goto('/landing');

    const htmlLocator = page.locator('html');
    const themeToggleBtn = page.getByRole('button', { name: 'Toggle dark mode' });

    // Wait for the button to appear (since it might be mounted on client side)
    await expect(themeToggleBtn).toBeVisible();

    // Click to toggle
    await themeToggleBtn.click();

    // Assert that the 'dark' class was added or removed from the root HTML element
    // We can check if it has the class 'dark' (or if it doesn't, depending on default state).
    // Let's just assert that the class changes.
    const hasDarkInitially = await htmlLocator.evaluate(el => el.classList.contains('dark'));
    
    // Toggle again
    await themeToggleBtn.click();
    
    const hasDarkAfter = await htmlLocator.evaluate(el => el.classList.contains('dark'));
    expect(hasDarkAfter).not.toBe(hasDarkInitially);
  });
});
