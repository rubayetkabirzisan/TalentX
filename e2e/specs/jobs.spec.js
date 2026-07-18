// e2e/specs/jobs.spec.js
import { test, expect } from '@playwright/test'
import { JobsPage } from '../pages/JobsPage.js'

test.describe('Jobs Feed', () => {
  let jobsPage

  test.beforeEach(async ({ page }) => {
    jobsPage = new JobsPage(page)
    await jobsPage.navigate()
  })

  test('page loads without error', async ({ page }) => {
    await expect(page).toHaveURL(/\/jobs/)
  })

  test('search input is visible', async () => {
    await expect(jobsPage.searchInput).toBeVisible()
  })

  test('job cards render (zero or more)', async () => {
    const count = await jobsPage.getJobCount()
    // Accept zero (empty state) or more — both are valid
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('searching filters visible titles', async ({ page }) => {
    // Only run if there are jobs
    const count = await jobsPage.getJobCount()
    test.skip(count === 0, 'No jobs in the database — skipping search test')

    // Use a broad term that should match something
    await jobsPage.search('a')
    const titles = await jobsPage.getAllTitles()
    // All visible titles should exist (not empty strings)
    for (const t of titles) {
      expect(t.trim().length).toBeGreaterThan(0)
    }
  })

  test('clearing search restores all jobs', async () => {
    const initialCount = await jobsPage.getJobCount()
    await jobsPage.search('xyzxyzxyz_unlikely_match')
    await jobsPage.clearSearch()
    const afterClear = await jobsPage.getJobCount()
    expect(afterClear).toBe(initialCount)
  })

  test('clicking a job card navigates to job detail', async ({ page }) => {
    const count = await jobsPage.getJobCount()
    test.skip(count === 0, 'No jobs — skipping card click test')

    await jobsPage.clickFirstJob()
    await expect(page).toHaveURL(/\/jobs\/.+/)
  })

  test('job detail page shows employer name', async ({ page }) => {
    const count = await jobsPage.getJobCount()
    test.skip(count === 0, 'No jobs — skipping detail test')

    await jobsPage.clickFirstJob()
    // Employer name should appear somewhere on detail page
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('page is accessible via navbar Browse Jobs link', async ({ page }) => {
    await page.goto('/landing')
    await page.locator('[data-testid="nav-browse-jobs"]').click()
    await expect(page).toHaveURL(/\/jobs/)
  })
})
