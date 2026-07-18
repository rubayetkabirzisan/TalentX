// e2e/pages/TalentDashboardPage.js
import { BasePage } from './BasePage.js'

/**
 * POM for /talent/dashboard
 */
export class TalentDashboardPage extends BasePage {
  constructor(page) {
    super(page)
    // Tabs
    this.jobMatchesTab  = page.getByRole('tab', { name: /job matches/i })
    this.invitationsTab = page.getByRole('tab', { name: /invitations/i })
    this.applicationsTab = page.getByRole('tab', { name: /applications/i })

    // Heading
    this.heading = page.getByRole('heading', { name: /talent dashboard/i })
  }

  async navigate() {
    await this.goto('/talent/dashboard')
  }

  async openInvitations() {
    await this.invitationsTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async openApplications() {
    await this.applicationsTab.click()
    await this.page.waitForLoadState('networkidle')
  }

  async openJobMatches() {
    await this.jobMatchesTab.click()
    await this.page.waitForLoadState('networkidle')
  }
}
