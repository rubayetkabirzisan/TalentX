// e2e/specs/post-job.spec.js
import { test, expect } from '@playwright/test'
import { EmployerDashboardPage } from '../pages/EmployerDashboardPage.js'
import { generateJobData } from '../fixtures/test-data.js'

test.use({ storageState: 'e2e/.auth/employer.json' })

test.describe('Post a Job Flow', () => {
  let dashboard

  test.beforeEach(async ({ page }) => {
    dashboard = new EmployerDashboardPage(page)
    await dashboard.navigate()
  })

  test('successfully posts a new job and sees it in My Jobs', async ({ page }) => {
    const jobData = generateJobData('Playwright SDET')
    
    await dashboard.createJob(jobData)
    
    // Verify toast or success message
    await expect(page.getByText(/created|success/i)).toBeVisible({ timeout: 10_000 })
    
    // Switch to My Jobs tab
    await dashboard.switchToMyJobs()
    
    // Verify the newly created job appears in the list
    await expect(page.getByText(jobData.title)).toBeVisible()
  })

  test('cannot post a job without a title', async ({ page }) => {
    await dashboard.openCreateJobTab()
    await dashboard.createJobBtn.click()
    
    // HTML5 validation or manual error message should appear
    const isFocused = await dashboard.titleInput.evaluate((el) => document.activeElement === el)
    const errorVisible = await page.getByText(/title.*required|required/i).isVisible().catch(() => false)
    
    expect(isFocused || errorVisible).toBe(true)
  })

  test('cannot post a job with past deadline', async ({ page }) => {
    const jobData = generateJobData('Past Job')
    // Set deadline to past
    jobData.deadline = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
    
    await dashboard.createJob(jobData)
    
    // Either the form prevents submission or shows an error
    const errorVisible = await page.getByText(/deadline|future/i).isVisible().catch(() => false)
    expect(errorVisible).toBe(true)
  })
})
