// e2e/pages/JobsPage.js
import { BasePage } from './BasePage.js'

/**
 * POM for /jobs (job listing page)
 */
export class JobsPage extends BasePage {
  constructor(page) {
    super(page)
    this.searchInput  = page.locator('[data-testid="job-search-input"]')
    this.jobCards     = page.locator('[data-testid="job-card"]')
    this.jobTitles    = page.locator('[data-testid="job-title"]')
  }

  async navigate() {
    await this.goto('/jobs')
  }

  /**
   * Types into the search input (triggers debounced search)
   * @param {string} query
   */
  async search(query) {
    await this.searchInput.fill(query)
    // Allow debounce to fire
    await this.page.waitForTimeout(600)
  }

  async clearSearch() {
    await this.searchInput.clear()
    await this.page.waitForTimeout(600)
  }

  /** Returns the count of visible job cards */
  async getJobCount() {
    return this.jobCards.count()
  }

  /** Returns an array of all visible job titles */
  async getAllTitles() {
    return this.jobTitles.allTextContents()
  }

  /** Click the first job card */
  async clickFirstJob() {
    await this.jobCards.first().click()
    await this.page.waitForURL('**/jobs/**')
  }

  /** Returns the current page URL */
  currentUrl() {
    return this.page.url()
  }
}
