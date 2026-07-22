// e2e/specs/invitations.spec.js
/**
 * Invitations lifecycle tests — verify the employer-invite → talent-respond
 * flow, including the state-transition rules and authorization checks that
 * are hard to exercise naturally through the UI. API-level (no browser).
 *
 * Added after auditing the repo for coverage gaps: this feature (POST
 * /employer/jobs/:id/invite, GET /employer/jobs/:id/invitations, GET
 * /talent/invitations, POST /talent/invitations/:id/respond, and the
 * source="invitation" path on /talent/jobs/:id/apply) had no test coverage
 * at all — the only file that ever touched it was the legacy, never-run
 * e2e/specs/invitations.spec.js that was retired in QA-STRATEGY.md Entry G.
 * This is a fresh file, not a restoration of the old one.
 */
import { test, expect } from '@playwright/test'

const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000'
const FAKE_UUID = '00000000-0000-0000-0000-000000000001'

function uniqueEmail(label) {
    return `${label}.${Date.now()}.${Math.floor(Math.random() * 100000)}@invitations-test.com`
}

function headersFor(email, role) {
    return {
        'x-user-id': email,
        'x-role': role,
        'Content-Type': 'application/json',
    }
}

async function getUserId(request, headers) {
    const res = await request.get(`${API}/me`, { headers })
    const body = await res.json()
    return body.data.id
}

async function createJob(request, employerHeaders) {
    const res = await request.post(`${API}/employer/jobs`, {
        headers: employerHeaders,
        data: {
            title: 'Invitations Test Role',
            tech_stack: ['Node.js'],
            deadline: new Date(Date.now() + 7 * 86_400_000).toISOString(),
            description: 'Fixture job for invitations testing.',
        },
    })
    const body = await res.json()
    return body.data.id
}

// ─── Auth & validation — independent of any shared fixture state ───────────
test.describe('Invitations — Authorization & Validation', () => {

    test('POST invite requires authentication', async ({ request }) => {
        const res = await request.post(`${API}/employer/jobs/${FAKE_UUID}/invite`, {
            headers: { 'Content-Type': 'application/json' },
            data: { talent_id: FAKE_UUID },
        })
        expect(res.status()).toBe(401)
    })

    test('POST invite as talent role returns 403', async ({ request }) => {
        const res = await request.post(`${API}/employer/jobs/${FAKE_UUID}/invite`, {
            headers: headersFor(uniqueEmail('talent-inviting'), 'talent'),
            data: { talent_id: FAKE_UUID },
        })
        expect(res.status()).toBe(403)
    })

    test('POST invite for a job the employer does not own returns 403', async ({ request }) => {
        const res = await request.post(`${API}/employer/jobs/${FAKE_UUID}/invite`, {
            headers: headersFor(uniqueEmail('employer-not-owner'), 'employer'),
            data: { talent_id: FAKE_UUID },
        })
        expect(res.status()).toBe(403)
    })

    test('GET /talent/invitations requires authentication', async ({ request }) => {
        const res = await request.get(`${API}/talent/invitations`)
        expect(res.status()).toBe(401)
    })

    test('GET /talent/invitations as employer role returns 403', async ({ request }) => {
        const res = await request.get(`${API}/talent/invitations`, {
            headers: headersFor(uniqueEmail('employer-listing'), 'employer'),
        })
        expect(res.status()).toBe(403)
    })

    test('POST respond requires authentication', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${FAKE_UUID}/respond`, {
            headers: { 'Content-Type': 'application/json' },
            data: { action: 'accepted' },
        })
        expect(res.status()).toBe(401)
    })

    test('POST respond to a nonexistent invitation returns 404', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${FAKE_UUID}/respond`, {
            headers: headersFor(uniqueEmail('talent-responding'), 'talent'),
            data: { action: 'accepted' },
        })
        expect(res.status()).toBe(404)
    })

    test('POST respond with an invalid action is rejected with 400', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${FAKE_UUID}/respond`, {
            headers: headersFor(uniqueEmail('talent-bad-action'), 'talent'),
            data: { action: 'maybe' }, // not "accepted" or "declined"
        })
        expect(res.status()).toBe(400)
    })
})

// ─── Full lifecycle — sequential, shares one employer/talent/job fixture ───
test.describe.serial('Invitations — Full Lifecycle', () => {
    const employerHeaders = headersFor(uniqueEmail('lifecycle-employer'), 'employer')
    const talentHeaders = headersFor(uniqueEmail('lifecycle-talent'), 'talent')
    const strangerHeaders = headersFor(uniqueEmail('lifecycle-stranger'), 'talent')

    let jobId
    let talentId
    let invitationId

    test.beforeAll(async ({ request }) => {
        jobId = await createJob(request, employerHeaders)
        talentId = await getUserId(request, talentHeaders)
    })

    test('employer invites the talent and gets back a pending invitation', async ({ request }) => {
        const res = await request.post(`${API}/employer/jobs/${jobId}/invite`, {
            headers: employerHeaders,
            data: { talent_id: talentId },
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        expect(body.data.status).toBe('pending')
        expect(body.data.job_id).toBe(jobId)
        invitationId = body.data.id
    })

    test('re-inviting the same talent to the same job does not error or reset status', async ({ request }) => {
        const res = await request.post(`${API}/employer/jobs/${jobId}/invite`, {
            headers: employerHeaders,
            data: { talent_id: talentId },
        })
        expect(res.status()).toBe(201)
        const body = await res.json()
        expect(body.data.id).toBe(invitationId) // same row, not a duplicate
        expect(body.data.status).toBe('pending')
    })

    test('the invited talent sees it in GET /talent/invitations with job and employer names', async ({ request }) => {
        const res = await request.get(`${API}/talent/invitations`, { headers: talentHeaders })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const found = body.data.find((i) => i.id === invitationId)
        expect(found).toBeTruthy()
        expect(found.job_title).toBe('Invitations Test Role')
        expect(found.status).toBe('pending')
    })

    test('the employer sees it in GET /employer/jobs/:id/invitations', async ({ request }) => {
        const res = await request.get(`${API}/employer/jobs/${jobId}/invitations`, { headers: employerHeaders })
        expect(res.status()).toBe(200)
        const body = await res.json()
        const found = body.data.find((i) => i.id === invitationId)
        expect(found).toBeTruthy()
        expect(found.talent_id).toBe(talentId)
        expect(found.status).toBe('pending')
    })

    test('a different talent cannot respond to this invitation', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${invitationId}/respond`, {
            headers: strangerHeaders,
            data: { action: 'accepted' },
        })
        expect(res.status()).toBe(403)
    })

    test('the invited talent accepts the invitation', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${invitationId}/respond`, {
            headers: talentHeaders,
            data: { action: 'accepted' },
        })
        expect(res.status()).toBe(200)
        const body = await res.json()
        expect(body.data.status).toBe('accepted')
    })

    test('responding again to an already-answered invitation returns 400', async ({ request }) => {
        const res = await request.post(`${API}/talent/invitations/${invitationId}/respond`, {
            headers: talentHeaders,
            data: { action: 'declined' },
        })
        expect(res.status()).toBe(400)
    })
})

// ─── Applying via invitation — a second, independent fixture ──────────────
test.describe.serial('Invitations — Apply via Invitation', () => {
    const employerHeaders = headersFor(uniqueEmail('apply-employer'), 'employer')
    const talentHeaders = headersFor(uniqueEmail('apply-talent'), 'talent')

    let jobId
    let talentId

    test.beforeAll(async ({ request }) => {
        jobId = await createJob(request, employerHeaders)
        talentId = await getUserId(request, talentHeaders)
    })

    test('applying with source=invitation fails without a pending invitation', async ({ request }) => {
        const res = await request.post(`${API}/talent/jobs/${jobId}/apply`, {
            headers: talentHeaders,
            data: { source: 'invitation' },
        })
        expect(res.status()).toBe(400)
        const body = await res.json()
        expect(body.error.code).toBe('INVITATION_REQUIRED')
    })

    test('applying with source=invitation succeeds once invited, and accepts the invitation as a side effect', async ({ request }) => {
        await request.post(`${API}/employer/jobs/${jobId}/invite`, {
            headers: employerHeaders,
            data: { talent_id: talentId },
        })

        const applyRes = await request.post(`${API}/talent/jobs/${jobId}/apply`, {
            headers: talentHeaders,
            data: { source: 'invitation' },
        })
        expect(applyRes.status()).toBe(201)

        const invRes = await request.get(`${API}/talent/invitations`, { headers: talentHeaders })
        const invBody = await invRes.json()
        const found = invBody.data.find((i) => i.job_id === jobId)
        expect(found.status).toBe('accepted')
    })
})