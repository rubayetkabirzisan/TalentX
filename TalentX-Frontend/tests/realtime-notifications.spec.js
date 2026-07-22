const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { EmployerDashboardPage } = require('./pages/EmployerDashboardPage');
const { TalentDashboardPage } = require('./pages/TalentDashboardPage');

/**
 * Added after auditing route coverage: the README specifically advertises
 * "Send direct interview invitations and communicate with talents instantly
 * via real-time WebSockets" — Entry H (invitations.spec.js) already verifies
 * the invite/schedule REST endpoints work, but nothing verified the "instant,
 * real-time" part of that claim actually holds for invitations or interview
 * scheduling specifically, only for chat (realtime-messaging.spec.js).
 *
 * The bell/notification locators here are copied directly from
 * realtime-messaging.spec.js, which already proves this exact pattern works.
 */

const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000';

function bellDotFor(page) {
    return page.locator('nav').getByRole('button').filter({ hasText: '' }).locator('span.animate-pulse');
}

function bellButtonFor(page) {
    return page.locator('nav').locator('button').filter({ has: page.locator('svg.lucide-bell') });
}

test.describe('Real-Time Notifications — Invitations & Scheduling', () => {

    test('Talent receives a live notification when an interview is scheduled', async ({ browser }) => {
        const employerContext = await browser.newContext();
        const talentContext = await browser.newContext();

        const employerPage = await employerContext.newPage();
        const talentPage = await talentContext.newPage();

        const employerLogin = new LoginPage(employerPage);
        await employerLogin.goto();
        await employerLogin.loginAsEmployer();

        const talentLogin = new LoginPage(talentPage);
        await talentLogin.goto();
        await talentLogin.loginAsTalent();

        const employerDashboard = new EmployerDashboardPage(employerPage);
        const jobTitle = `Realtime Schedule Test ${Date.now()}`;
        await employerDashboard.createJob(jobTitle, '90000', '130000');

        // A freshly signed-up talent has no name set (it's optional at
        // registration and the signup form doesn't collect one), so give them a
        // known, deterministic name here — otherwise scheduleInterview()'s
        // row-matching by applicant name has nothing reliable to match against.
        const talentName = `Realtime Test Talent ${Date.now()}`;
        const talentDashboard = new TalentDashboardPage(talentPage);
        await talentDashboard.updateProfile(talentName);
        await talentDashboard.matchFeedTab.click();

        // Talent applies so a real application exists for the employer to act on
        await talentDashboard.applyToFirstJob('Applying to the realtime scheduling fixture job.');

        // Employer schedules the interview — this is what should trigger the
        // live WebSocket notification, not a page refresh on the talent's side.
        await employerDashboard.selectJobToViewApplicants(jobTitle);
        const timeslot = `Realtime Test Slot ${Date.now()}`;
        await employerDashboard.scheduleInterview(talentName, timeslot);

        const bellDot = bellDotFor(talentPage);
        await expect(bellDot).toBeVisible({ timeout: 5000 });

        await bellButtonFor(talentPage).click();
        await expect(talentPage.getByText('Interview Scheduled')).toBeVisible();
    });

    test('Talent receives a live notification when invited to a job', async ({ browser, request }) => {
        const talentContext = await browser.newContext();
        const talentPage = await talentContext.newPage();

        const talentLogin = new LoginPage(talentPage);
        await talentLogin.goto();
        await talentLogin.loginAsTalent();

        // Read the real internal user id the live UI session actually stored,
        // rather than assuming how header-mode auth maps ids — this is whatever
        // the app itself considers this talent's id.
        const talentId = await talentPage.evaluate(() => {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}');
            return auth.id;
        });
        expect(talentId).toBeTruthy();

        // Trigger the invite directly via the API rather than an unverified
        // "click Invite" UI flow — this test's job is to verify WebSocket
        // delivery reaches the talent's live page, not to re-test invite UI.
        const employerHeaders = {
            'x-user-id': `realtime-invite-employer.${Date.now()}@talentx-test.com`,
            'x-role': 'employer',
            'Content-Type': 'application/json',
        };

        const jobRes = await request.post(`${API}/employer/jobs`, {
            headers: employerHeaders,
            data: {
                title: 'Realtime Invite Test Role',
                tech_stack: ['Node.js'],
                deadline: new Date(Date.now() + 7 * 86_400_000).toISOString(),
                description: 'Fixture job for realtime invitation notification test.',
            },
        });
        const jobBody = await jobRes.json();

        await request.post(`${API}/employer/jobs/${jobBody.data.id}/invite`, {
            headers: employerHeaders,
            data: { talent_id: talentId },
        });

        const bellDot = bellDotFor(talentPage);
        await expect(bellDot).toBeVisible({ timeout: 5000 });

        await bellButtonFor(talentPage).click();
        await expect(talentPage.getByText('New Interview Invitation')).toBeVisible();
    });
});