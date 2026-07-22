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
    return page.locator('nav')
        .getByRole('button')
        .filter({ hasText: '' })
        .locator('span.animate-pulse');
}

function bellButtonFor(page) {
    return page.locator('nav')
        .locator('button')
        .filter({ has: page.locator('svg.lucide-bell') });
}

// Only logs the app's own socket.io connection to the backend — a first
// attempt at this logged Next.js's dev-mode Hot Module Reload websocket
// instead (ws://localhost:3001/_next/webpack-hmr), which is unrelated
// dev-tooling noise, not the app's actual realtime connection.
function instrumentSocket(page, label) {
    page.on('console', (msg) => console.log(`[${label} console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', (err) => console.log(`[${label} page error]`, err));

    page.on('websocket', (ws) => {
        if (!ws.url().includes('/socket.io/')) return; // skip Next.js HMR and anything else

        console.log(`[${label} websocket] opened: ${ws.url()}`);
        ws.on('framesent', (f) => console.log(`[${label} ws SENT] ${f.payload}`));
        ws.on('framereceived', (f) => console.log(`[${label} ws RECV] ${f.payload}`));
        ws.on('close', () => console.log(`[${label} websocket] closed`));
        ws.on('socketerror', (err) => console.log(`[${label} websocket error]`, err));
    });
}

// Wait for the app's Socket.IO WebSocket connection to be fully established
// and the 'join' room event to be sent, so notifications can be delivered.
async function waitForSocketIO(page) {
    await page.waitForEvent('websocket', {
        predicate: ws => ws.url().includes('/socket.io/'),
        timeout: 10000,
    });
    // Small buffer for the 'join' event to be emitted after connect
    await page.waitForTimeout(500);
}

test.describe('Real-Time Notifications — Invitations & Scheduling', () => {

    test('Talent receives a live notification when an interview is scheduled', async ({ browser }) => {
        test.setTimeout(60_000);
        const employerContext = await browser.newContext();
        const talentContext = await browser.newContext();

        const employerPage = await employerContext.newPage();
        const talentPage = await talentContext.newPage();

        instrumentSocket(talentPage, 'talent');

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

        // The JobMatchFeed component fetches once on mount — by the time the
        // talent dashboard first rendered (during login redirect), the employer's
        // job didn't exist yet. Reload so the feed re-mounts and picks it up.
        await talentPage.reload();
        await waitForSocketIO(talentPage);
        await talentDashboard.matchFeedTab.click();

        // Talent applies so a real application exists for the employer to act on
        await talentDashboard.applyToFirstJob('Applying to the realtime scheduling fixture job.');

        // Employer schedules the interview — this is what should trigger the
        // live WebSocket notification, not a page refresh on the talent's side.
        await employerDashboard.selectJobToViewApplicants(jobTitle);
        const timeslot = `Realtime Test Slot ${Date.now()}`;
        await employerDashboard.scheduleInterview(talentName, timeslot);

        const bellDot = bellDotFor(talentPage);
        await expect(bellDot).toBeVisible({ timeout: 10000 });
        await bellButtonFor(talentPage).click();
        await expect(talentPage.getByText('Interview Scheduled')).toBeVisible();
    });

    test('Talent receives a live notification when invited to a job', async ({ browser, request }) => {
        const talentContext = await browser.newContext();
        const talentPage = await talentContext.newPage();

        instrumentSocket(talentPage, 'talent');

        const talentLogin = new LoginPage(talentPage);
        await talentLogin.goto();

        // Start waiting for the Socket.IO connection BEFORE login — the
        // auth_changed event fires during loginAsTalent(), which triggers
        // the socket connection. page.waitForEvent only catches future
        // events, so we must register the promise first.
        const socketReady = waitForSocketIO(talentPage);
        await talentLogin.loginAsTalent();
        await socketReady;

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
        await expect(bellDot).toBeVisible({ timeout: 10000 });
        await bellButtonFor(talentPage).click();
        await expect(talentPage.getByText('New Interview Invitation')).toBeVisible();
    });

});