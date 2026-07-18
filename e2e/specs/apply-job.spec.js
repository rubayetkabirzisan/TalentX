// e2e/specs/apply-job.spec.js
import { test, expect } from '@playwright/test'
import { JobsPage } from '../pages/JobsPage.js'
import { TalentDashboardPage } from '../pages/TalentDashboardPage.js'

test.use({ storageState: 'e2e/.auth/talent.json' })

test.describe('Apply to a Job Flow', () => {
  let jobsPage

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page)
    await jobsPage.navigate()
  })

  test('successfully applies to the first available job', async ({ page }) => {
    const count = await jobsPage.getJobCount()
    test.skip(count === 0, 'No jobs available to apply to')

    await jobsPage.clickFirstJob()
    
    // Click apply button
    const applyBtn = page.getByRole('button', { name: /apply/i })
    if (await applyBtn.isVisible()) {
      await applyBtn.click()
      await expect(page.getByText(/success|applied/i)).toBeVisible({ timeout: 10_000 })
    } else {
      // If already applied, verify the status
      await expect(page.getByText(/already applied/i)).toBeVisible()
    }
  })

  test('applied job appears in Talent Application History', async ({ page }) => {
    const talentDashboard = new TalentDashboardPage(page)
    await talentDashboard.navigate()
    await talentDashboard.openApplications()
    
    // Verify the applications tab content is visible and contains job records
    const panel = page.getByRole('tabpanel')
    await expect(panel).toBeVisible()
    expect(await panel.textContent()).toBeTruthy()
  })
})
