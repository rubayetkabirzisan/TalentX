// e2e/specs/talent.spec.js
import { test, expect } from '@playwright/test'
import { TalentDashboardPage } from '../pages/TalentDashboardPage.js'

// ─── Use saved talent auth state ───────────────────────────────────────────────
test.use({ storageState: 'e2e/.auth/talent.json' })

test.describe('Talent Dashboard', () => {
  let dashboard

  test.beforeEach(async ({ page }) => {
    dashboard = new TalentDashboardPage(page)
    await dashboard.navigate()
  })

  test('dashboard loads and heading is visible', async () => {
    await expect(dashboard.heading).toBeVisible()
  })

  test('all three tabs are rendered', async () => {
    await expect(dashboard.jobMatchesTab).toBeVisible()
    await expect(dashboard.invitationsTab).toBeVisible()
    await expect(dashboard.applicationsTab).toBeVisible()
  })

  test('Job Matches tab is the default view', async ({ page }) => {
    await expect(page.getByRole('tabpanel')).toBeVisible()
    // AI Recommendations heading should be visible
    await expect(page.getByText(/AI Job Recommendations/i)).toBeVisible()
  })

  test('Invitations tab loads without error', async ({ page }) => {
    await dashboard.openInvitations()
    // Should show invitations list or "no invitations" empty state
    const panelText = await page.getByRole('tabpanel').textContent()
    expect(panelText).toBeTruthy()
  })

  test('Applications tab loads without error', async ({ page }) => {
    await dashboard.openApplications()
    const panelText = await page.getByRole('tabpanel').textContent()
    expect(panelText).toBeTruthy()
  })

  test('Skills section is visible', async ({ page }) => {
    await expect(page.getByText(/skills/i).first()).toBeVisible()
  })

  test('talent cannot navigate to employer dashboard', async ({ page }) => {
    await page.goto('/employer/dashboard')
    // Should redirect away since talent is not an employer
    await page.waitForURL(/talent\/dashboard/, { timeout: 5_000 })
  })
})
