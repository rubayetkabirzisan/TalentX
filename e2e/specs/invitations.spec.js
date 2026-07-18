// e2e/specs/invitations.spec.js
import { test, expect } from '@playwright/test'
import { TalentDashboardPage } from '../pages/TalentDashboardPage.js'

test.use({ storageState: 'e2e/.auth/talent.json' })

test.describe('Talent Invitations Flow', () => {
  let dashboard

  test.beforeEach(async ({ page }) => {
    dashboard = new TalentDashboardPage(page)
    await dashboard.navigate()
  })

  test('talent can view invitations', async ({ page }) => {
    await dashboard.openInvitations()
    const panel = page.getByRole('tabpanel')
    await expect(panel).toBeVisible()
    expect(await panel.textContent()).toBeTruthy()
  })
})
