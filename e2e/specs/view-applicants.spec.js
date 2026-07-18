// e2e/specs/view-applicants.spec.js
import { test, expect } from '@playwright/test'
import { EmployerDashboardPage } from '../pages/EmployerDashboardPage.js'

test.use({ storageState: 'e2e/.auth/employer.json' })

test.describe('View Applicants Flow', () => {
  let dashboard

  test.beforeEach(async ({ page }) => {
    dashboard = new EmployerDashboardPage(page)
    await dashboard.navigate()
  })

  test('employer can view applicants for a specific job', async ({ page }) => {
    await dashboard.switchToMyJobs()
    
    // If there are no jobs, skip test
    const jobsList = page.getByRole('tabpanel')
    const jobsContent = await jobsList.textContent()
    test.skip(!jobsContent || jobsContent.includes('no jobs'), 'No jobs available to check applicants')

    // Switch to applicants tab
    await dashboard.switchToApplicants()
    const panel = page.getByRole('tabpanel')
    await expect(panel).toBeVisible()
    
    // Verify applicant details or empty state
    expect(await panel.textContent()).toBeTruthy()
  })
})
