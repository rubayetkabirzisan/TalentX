// e2e/specs/ai.spec.js
/**
 * AI route tests — verify job description generation and match scoring.
 * These are API-level tests (no browser UI needed).
 */
import { test, expect } from '@playwright/test'

const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000'

// Auth headers for the test user (header-mode only)
const AUTH_HEADERS = {
  'x-user-id': 'ai-test-employer@talentx.dev',
  'x-role': 'employer',
  'Content-Type': 'application/json',
}

test.describe('AI — /ai/generate-jd', () => {

  test('generates a job description for a valid title', async ({ request }) => {
    const res = await request.post(`${API}/ai/generate-jd`, {
      headers: AUTH_HEADERS,
      data: {
        title: 'Senior Frontend Engineer',
        tech_stack: ['React', 'TypeScript', 'Next.js'],
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.description).toBeTruthy()
    expect(typeof body.data.description).toBe('string')
    expect(body.data.description.length).toBeGreaterThan(50)
  })

  test('uses tech stack in the generated description', async ({ request }) => {
    const res = await request.post(`${API}/ai/generate-jd`, {
      headers: AUTH_HEADERS,
      data: {
        title: 'Backend Engineer',
        tech_stack: ['Node.js', 'PostgreSQL'],
      },
    })
    const body = await res.json()
    // At least one tech stack item should appear in the description
    const desc = body.data.description.toLowerCase()
    expect(desc.includes('node.js') || desc.includes('postgresql')).toBe(true)
  })

  test('works with an empty tech_stack array', async ({ request }) => {
    const res = await request.post(`${API}/ai/generate-jd`, {
      headers: AUTH_HEADERS,
      data: { title: 'Generalist Engineer', tech_stack: [] },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.description).toBeTruthy()
  })

  test('rejects missing title with 400', async ({ request }) => {
    const res = await request.post(`${API}/ai/generate-jd`, {
      headers: AUTH_HEADERS,
      data: { tech_stack: ['Python'] }, // title missing
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  test('requires authentication', async ({ request }) => {
    const res = await request.post(`${API}/ai/generate-jd`, {
      headers: { 'Content-Type': 'application/json' }, // no auth
      data: { title: 'Dev', tech_stack: [] },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('AI — /ai/match', () => {

  test('returns a score between 0 and 100', async ({ request }) => {
    const res = await request.post(`${API}/ai/match`, {
      headers: AUTH_HEADERS,
      data: {
        job: {
          title: 'React Developer',
          tech_stack: ['React', 'TypeScript'],
          description: 'Build UI components.',
        },
        talent: {
          skills: ['React', 'TypeScript', 'CSS'],
          bio: 'Experienced frontend developer.',
        },
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(typeof body.data.score).toBe('number')
    expect(body.data.score).toBeGreaterThanOrEqual(0)
    expect(body.data.score).toBeLessThanOrEqual(100)
  })

  test('high-overlap skills score higher than zero-overlap', async ({ request }) => {
    const makeRequest = (talentSkills) =>
      request.post(`${API}/ai/match`, {
        headers: AUTH_HEADERS,
        data: {
          job: {
            title: 'Go Engineer',
            tech_stack: ['Go', 'Docker', 'Kubernetes'],
            description: 'Backend systems engineer.',
          },
          talent: { skills: talentSkills },
        },
      })

    const [highRes, lowRes] = await Promise.all([
      makeRequest(['Go', 'Docker', 'Kubernetes']),
      makeRequest(['PHP', 'jQuery']),
    ])

    const highBody = await highRes.json()
    const lowBody = await lowRes.json()

    expect(highBody.data.score).toBeGreaterThan(lowBody.data.score)
  })

  test('requires authentication', async ({ request }) => {
    const res = await request.post(`${API}/ai/match`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        job: { title: 'Dev', tech_stack: [], description: 'x' },
        talent: { skills: [] },
      },
    })
    expect(res.status()).toBe(401)
  })
})

// Added after auditing route coverage: this endpoint powers both the talent
// job feed (app/api/talent/feed/route.ts) and the employer matched-talents
// view (app/api/jobs/[id]/matched-talents/route.ts) — it runs on essentially
// every dashboard load for both roles, and had zero test coverage despite
// being real, load-bearing logic, not a peripheral endpoint.
test.describe('AI — /ai/match-bulk', () => {

  test('requires authentication', async ({ request }) => {
    const res = await request.post(`${API}/ai/match-bulk`, {
      headers: { 'Content-Type': 'application/json' },
      data: { matches: [] },
    })
    expect(res.status()).toBe(401)
  })

  test('rejects a request missing the matches field', async ({ request }) => {
    const res = await request.post(`${API}/ai/match-bulk`, {
      headers: AUTH_HEADERS,
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test('handles an empty matches array', async ({ request }) => {
    const res = await request.post(`${API}/ai/match-bulk`, {
      headers: AUTH_HEADERS,
      data: { matches: [] },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data.scores)).toBe(true)
    expect(body.data.scores.length).toBe(0)
  })

  test('returns one score per match, in the same order as the input', async ({ request }) => {
    const res = await request.post(`${API}/ai/match-bulk`, {
      headers: AUTH_HEADERS,
      data: {
        matches: [
          {
            job: { title: 'Go Engineer', tech_stack: ['Go', 'Docker'], description: 'Backend.' },
            talent: { skills: ['Go', 'Docker'] }, // high overlap — index 0
          },
          {
            job: { title: 'Go Engineer', tech_stack: ['Go', 'Docker'], description: 'Backend.' },
            talent: { skills: ['PHP', 'jQuery'] }, // zero overlap — index 1
          },
        ],
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.scores.length).toBe(2)
    // Order must be preserved — this is what both consuming UIs rely on to
    // map scores back to the correct talent/job by array index.
    expect(body.data.scores[0]).toBeGreaterThan(body.data.scores[1])
  })
})