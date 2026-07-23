const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { EmployerDashboardPage } = require('./pages/EmployerDashboardPage');

/**
 * Tests the full invitation lifecycle — the core two-sided marketplace
 * interaction where an employer reaches out and a talent responds.
 *
 * The invite is created via the API rather than the Matches tab UI because
 * that tab depends on AI-powered scoring which is non-deterministic in
 * test environments.
 */
const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000';

/**
 * Shared setup: logs in an employer and a talent in separate browser
 * contexts, creates a job, and sends an invitation to the talent.
 * Returns everything needed for the talent-side UI assertions.
 */
async function setupInvitation(browser, request) {
    const employerContext = await browser.newContext();
    const talentContext = await browser.newContext();
    const employerPage = await employerContext.newPage();
    const talentPage = await talentContext.newPage();

    // Login both users
    const employerLogin = new LoginPage(employerPage);
    await employerLogin.goto();
    await employerLogin.loginAsEmployer();

    const talentLogin = new LoginPage(talentPage);
    await talentLogin.goto();
    await talentLogin.loginAsTalent();

    // Read auth from localStorage
    const employerAuth = await employerPage.evaluate(() =>
        JSON.parse(localStorage.getItem('auth') || '{}')
    );
    const talentAuth = await talentPage.evaluate(() =>
        JSON.parse(localStorage.getItem('auth') || '{}')
    );

    // Employer creates a job via the UI
    const employerDashboard = new EmployerDashboardPage(employerPage);
    const jobTitle = `Invite Lifecycle ${Date.now()}`;
    await employerDashboard.createJob(jobTitle, '80000', '120000');

    // Fetch the job ID we just created
    const employerHeaders = {
        'x-user-id': employerAuth.id,
        'x-role': 'employer',
        'Content-Type': 'application/json',
    };
    const jobsRes = await request.get(`${API}/employer/jobs`, {
        headers: employerHeaders,
    });
    const jobsBody = await jobsRes.json();
    const job = jobsBody.data.find(j => j.title === jobTitle);
    expect(job).toBeTruthy();

    // Send the invitation
    const inviteRes = await request.post(`${API}/employer/jobs/${job.id}/invite`, {
        headers: employerHeaders,
        data: { talent_id: talentAuth.id },
    });
    expect(inviteRes.ok()).toBeTruthy();

    return { talentPage, employerContext, talentContext, jobTitle };
}

test.describe('Invitation Lifecycle', () => {

    test('Talent can see and accept a pending invitation', async ({ browser, request }) => {
        const { talentPage, employerContext, talentContext, jobTitle } =
            await setupInvitation(browser, request);

        // Navigate to the Invitations tab
        await talentPage.getByRole('tab', { name: 'Invitations' }).click();

        // The invitation card should show the job title
        await expect(talentPage.getByText(jobTitle)).toBeVisible({ timeout: 10000 });

        // Pending invitation should have Accept and Decline buttons
        const acceptBtn = talentPage.getByRole('button', { name: 'Accept' });
        const declineBtn = talentPage.getByRole('button', { name: 'Decline' });
        await expect(acceptBtn).toBeVisible();
        await expect(declineBtn).toBeVisible();

        // Accept the invitation
        await acceptBtn.click();

        // Toast confirms the action. .first() because each toast renders both
        // a visible card and a duplicate aria-live announcer with the same
        // text — this codebase's established pattern for handling that
        // (see EmployerDashboardPage.js's scheduleInterview()).
        await expect(talentPage.getByText('Invitation accepted').first()).toBeVisible();

        // Status badge should now read "Accepted" (.first() + exact to avoid
        // matching the toast's "Invitation accepted" text and aria-live regions)
        await expect(talentPage.getByText('Accepted', { exact: true }).first()).toBeVisible();

        // Accept/Decline buttons should disappear for a non-pending invitation
        await expect(acceptBtn).toBeHidden();
        await expect(declineBtn).toBeHidden();

        await employerContext.close();
        await talentContext.close();
    });

    test('Talent can see and decline a pending invitation', async ({ browser, request }) => {
        const { talentPage, employerContext, talentContext, jobTitle } =
            await setupInvitation(browser, request);

        // Navigate to the Invitations tab
        await talentPage.getByRole('tab', { name: 'Invitations' }).click();

        // The invitation card should show the job title
        await expect(talentPage.getByText(jobTitle)).toBeVisible({ timeout: 10000 });

        // Decline the invitation
        const acceptBtn = talentPage.getByRole('button', { name: 'Accept' });
        const declineBtn = talentPage.getByRole('button', { name: 'Decline' });
        await expect(declineBtn).toBeVisible();
        await declineBtn.click();

        // Toast confirms the action (.first() — see note above)
        await expect(talentPage.getByText('Invitation declined').first()).toBeVisible();

        // Status badge should now read "Declined"
        await expect(talentPage.getByText('Declined', { exact: true }).first()).toBeVisible();

        // Buttons should disappear
        await expect(acceptBtn).toBeHidden();
        await expect(declineBtn).toBeHidden();

        await employerContext.close();
        await talentContext.close();
    });

});