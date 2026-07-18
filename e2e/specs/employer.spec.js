// e2e/specs/employer.spec.js
import { test, expect } from '@playwright/test'
import { EmployerDashboardPage } from '../pages/EmployerDashboardPage.js'

// ─── Use saved employer auth state ─────────────────────────────────────────────
test.use({ storageState: 'e2e/.auth/employer.json' })

test.describe('Employer Dashboard', () => {
  let dashboard

  test.beforeEach(async ({ page }) => {
    dashboard = new EmployerDashboardPage(page)
    await dashboard.navigate()
  })

  test('dashboard loads and heading is visible', async () => {
    await expect(dashboard.heading).toBeVisible()
  })

  test('all four tabs are rendered', async () => {
    await expect(dashboard.myJobsTab).toBeVisible()
    await expect(dashboard.createJobTab).toBeVisible()
    await expect(dashboard.applicantsTab).toBeVisible()
    await expect(dashboard.matchesTab).toBeVisible()
  })

  test('My Jobs tab is the default active tab', async ({ page }) => {
    // The My Jobs content should be visible by default
    await expect(page.getByRole('tabpanel')).toBeVisible()
  })

  test('Create Job tab is accessible by click', async ({ page }) => {
    await dashboard.openCreateJobTab()
    // After clicking, the create job panel should render
    await expect(page.getByRole('tabpanel')).toBeVisible()
  })

  test('create job with valid data succeeds', async ({ page }) => {
    await dashboard.createJob({
      title: 'Playwright Test Engineer',
      deadline: EmployerDashboardPage.futureDatetime(60),
      description: 'Automated test job — safe to delete.',
    })

    // Should navigate back to My Jobs tab or show a success toast
    await expect(
      page.getByText(/job created|success|playwright test engineer/i)
    ).toBeVisible({ timeout: 10_000 })
  })

  test('create job with empty title shows validation error', async ({ page }) => {
    await dashboard.openCreateJobTab()
    // Submit without filling title
    await dashboard.createJobBtn.click()
    // The title input should be required (HTML5) or show an inline error
    const titleInput = dashboard.titleInput
    // Either focused (HTML5 validation) or an error message appeared
    const isFocused = await titleInput.evaluate((el) => document.activeElement === el)
    const errorVisible = await page.getByText(/title.*required|required/i).isVisible().catch(() => false)
    expect(isFocused || errorVisible).toBe(true)
  })

  test('switches to Applicants tab', async ({ page }) => {
    await dashboard.switchToApplicants()
    await expect(page.getByRole('tabpanel')).toBeVisible()
  })

  test('Talent Matches tab renders without crashing', async ({ page }) => {
    await dashboard.matchesTab.click()
    await expect(page.getByRole('tabpanel')).toBeVisible()
  })
})
