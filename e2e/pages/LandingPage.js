// e2e/pages/LandingPage.js
import { BasePage } from './BasePage.js'

/**
 * POM for /landing
 */
export class LandingPage extends BasePage {
  constructor(page) {
    super(page)
    // Locators
    this.heroSection     = page.locator('[data-testid="hero-section"]')
    this.heroHeading     = page.locator('[data-testid="hero-heading"]')
    this.heroStats       = page.locator('[data-testid="hero-stats"]')
    this.exploreJobsBtn  = page.locator('[data-testid="hero-explore-jobs"]')
    this.postJobBtn      = page.locator('[data-testid="hero-post-job"]')
    this.featuresSection = page.locator('[data-testid="features-section"]')
    this.ctaSection      = page.locator('[data-testid="cta-section"]')
    this.footer          = page.locator('[data-testid="footer"]')
    this.navbar          = page.locator('[data-testid="navbar"]')
    this.navLogo         = page.locator('[data-testid="navbar-logo"]')
    this.themeToggle     = page.locator('[data-testid="theme-toggle"]')
    this.browseJobsLink  = page.locator('[data-testid="nav-browse-jobs"]')
    this.ctaExploreBtn   = page.locator('[data-testid="cta-explore-jobs"]')
  }

  async navigate() {
    await this.goto('/landing')
  }

  async clickExplorJobs() {
    await this.exploreJobsBtn.click()
  }

  async clickPostJob() {
    await this.postJobBtn.click()
  }

  async toggleTheme() {
    await this.themeToggle.click()
  }

  /** Returns the text of all stat values */
  async getStatValues() {
    return this.heroStats.locator('div > div').allTextContents()
  }
}
