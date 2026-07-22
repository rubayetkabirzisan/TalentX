// e2e/specs/scheduling.spec.js
/**
 * Interview scheduling tests — POST /employer/jobs/:id/applicants/:appId/schedule.
 * API-level (no browser). Added after auditing route coverage: this endpoint
 * has real status-transition logic (marks an application "interviewing") and
 * a job-ownership authorization check, and had zero coverage. There was
 * already a dead, never-called `scheduleInterview()` helper sitting in
 * TalentX-Frontend/tests/pages/EmployerDashboardPage.js, suggesting someone
 * intended to test this and never finished — this is a fresh file, not a
 * revival of that abandoned attempt.
 */
import { test, expect } from '@playwright/test'

const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000'
const FAKE_UUID = '00000000-0000-0000-0000-000000000001'

function uniqueEmail(label) {
    return `${label}.${Date.now()}.${Math.floor(Math.random() * 100000)}@scheduling-test.com`
}

function headersFor(email, role) {
    return {
        'x-user-id': email,
        'x-role': role,
        'Content-Type': 'application/json',
    }
}

async function createJob(request, employerHeaders) {
    const res = await request.post(`${API}/employer/jobs`, {
        headers: employerHeaders,
        data: {
            title: 'Scheduling Test Role',
            tech_stack: ['Node.js'],
            deadline: new Date(Date.now() + 7 * 86_400_000).toISOString(),
            description: 'Fixture job for interview-scheduling tests.',
        },
    })
    const body = await res.json()
    return body.data.id
}

async function applyToJob(request, jobId, talentHeaders) {
    const res = await request.post(`${API}/talent/jobs/${jobId}/apply`, {
        headers: talentHeaders,
        data: { source: 'manual', cover_letter: 'Fixture application.' },
    })
    const body = await res.json()
    return body.data.id
}

test.describe('Interview Scheduling — Authorization & Validation', () => {

    test('requires authentication', async ({ request }) => {
        const res = await request.post(
            `${API}/employer/jobs/${FAKE_UUID}/applicants/${FAKE_UUID}/schedule`,
            {
                headers: { 'Content-Type': 'application/json' },
                data: { timeslot: 'Mon 10am' },
            },
        )
        expect(res.status()).toBe(401)
    })

    test('requires employer role', async ({ request }) => {
        const res = await request.post(
            `${API}/employer/jobs/${FAKE_UUID}/applicants/${FAKE_UUID}/schedule`,
            {
                headers: headersFor(uniqueEmail('talent-scheduling'), 'talent'),
                data: { timeslot: 'Mon 10am' },
            },
        )
        expect(res.status()).toBe(403)
    })

    test('rejects an empty timeslot', async ({ request }) => {
        const employerHeaders = headersFor(uniqueEmail('employer-empty-slot'), 'employer')
        const res = await request.post(
            `${API}/employer/jobs/${FAKE_UUID}/applicants/${FAKE_UUID}/schedule`,
            {
                headers: employerHeaders,
                data: { timeslot: '' },
            },
        )
        expect(res.status()).toBe(400)
    })

    test('scheduling for a job the employer does not own returns 403', async ({ request }) => {
        const res = await request.post(
            `${API}/employer/jobs/${FAKE_UUID}/applicants/${FAKE_UUID}/schedule`,
            {
                headers: headersFor(uniqueEmail('employer-not-owner'), 'employer'),
                data: { timeslot: 'Mon 10am' },
            },
        )
        expect(res.status()).toBe(403)
    })
})

test.describe.serial('Interview Scheduling — Full Flow', () => {
    const employerHeaders = headersFor(uniqueEmail('flow-employer'), 'employer')
    const talentHeaders = headersFor(uniqueEmail('flow-talent'), 'talent')

    let jobId
    let applicationId

    test.beforeAll(async ({ request }) => {
        jobId = await createJob(request, employerHeaders)
        applicationId = await applyToJob(request, jobId, talentHeaders)
    })

    test('a nonexistent application returns 404', async ({ request }) => {
        const res = await request.post(
            `${API}/employer/jobs/${jobId}/applicants/${FAKE_UUID}/schedule`,
            {
                headers: employerHeaders,
                data: { timeslot: 'Mon 10am' },
            },
        )
        expect(res.status()).toBe(404)
    })

    test('the owning employer can schedule an interview, marking the application "interviewing"', async ({ request }) => {
        const res = await request.post(
            `${API}/employer/jobs/${jobId}/applicants/${applicationId}/schedule`,
            {
                headers: employerHeaders,
                data: { timeslot: 'Wednesday 3pm PST' },
            },
        )
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data.status).toBe('interviewing')
    })
})