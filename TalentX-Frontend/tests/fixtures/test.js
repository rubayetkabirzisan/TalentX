const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { TalentDashboardPage } = require('../pages/TalentDashboardPage');
const { EmployerDashboardPage } = require('../pages/EmployerDashboardPage');

const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  talentDashboard: async ({ page }, use) => {
    const talentDashboard = new TalentDashboardPage(page);
    await use(talentDashboard);
  },
  employerDashboard: async ({ page }, use) => {
    const employerDashboard = new EmployerDashboardPage(page);
    await use(employerDashboard);
  },
});

module.exports = { test, expect };
