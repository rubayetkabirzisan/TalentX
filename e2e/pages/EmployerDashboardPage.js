// e2e/pages/EmployerDashboardPage.js
import { BasePage } from './BasePage.js'

/**
 * POM for /employer/dashboard
 */
export class EmployerDashboardPage extends BasePage {
  constructor(page) {
    super(page)
    // Tabs
    this.myJobsTab    = page.getByRole('tab', { name: /my jobs/i })
    this.createJobTab = page.getByRole('tab', { name: /create job/i })
    this.applicantsTab = page.getByRole('tab', { name: /applicants/i })
    this.matchesTab   = page.getByRole('tab', { name: /matches/i })

    // Create Job form fields
    this.titleInput       = page.getByLabel(/job title/i)
    this.deadlineInput    = page.getByLabel(/deadline/i)
    this.descriptionInput = page.getByLabel(/description/i)
    this.createJobBtn     = page.getByRole('button', { name: /create job/i })

    // Header
    this.heading = page.getByRole('heading', { name: /employer dashboard/i })
  }

  async navigate() {
    await this.goto('/employer/dashboard')
  }

  async openCreateJobTab() {
    await this.createJobTab.click()
  }

  /**
   * Fills in and submits the create-job form.
   * @param {{ title: string, deadline: string, description?: string }} job
   */
  async createJob({ title, deadline, description }) {
    await this.openCreateJobTab()
    await this.titleInput.fill(title)
    await this.deadlineInput.fill(deadline)
    if (description) {
      await this.descriptionInput.fill(description)
    }
    await this.createJobBtn.click()
  }

  /** Returns a future datetime string suitable for the deadline input (ISO local) */
  static futureDatetime(daysAhead = 30) {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    // Trim seconds for datetime-local inputs
    return d.toISOString().slice(0, 16)
  }

  async switchToMyJobs() {
    await this.myJobsTab.click()
  }

  async switchToApplicants() {
    await this.applicantsTab.click()
  }
}
