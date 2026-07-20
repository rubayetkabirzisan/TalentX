// e2e/specs/security.spec.js
/**
 * Security / access-control tests.
 * These tests call the backend API directly (no browser UI needed for API tests).
 * Browser tests verify frontend route guards.
 */
import { test, expect } from '@playwright/test'

const API = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3000'

// ─── API-level security tests ─────────────────────────────────────────────────
test.describe('API Security', () => {

  test('GET /me without auth headers returns 401', async ({ request }) => {
    const res = await request.get(`${API}/me`)
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('POST /employer/jobs as talent role returns 403', async ({ request }) => {
    const res = await request.post(`${API}/employer/jobs`, {
      headers: {
        'x-user-id': 'talent@security-test.com',
        'x-role': 'talent',      // ← impersonating talent attempting employer action
        'Content-Type': 'application/json',
      },
      data: {
        title: 'Injected Job',
        deadline: new Date(Date.now() + 86_400_000).toISOString(),
        description: 'Should be rejected by role guard',
      },
    })
    expect(res.status()).toBe(403)
  })

  test('POST /talent/jobs/:id/apply without auth returns 401', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000001'
    const res = await request.post(`${API}/talent/jobs/${fakeId}/apply`, {
      data: { source: 'manual' },
      headers: { 'Content-Type': 'application/json' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /talents requires authentication', async ({ request }) => {
    // With no auth headers, should return 401 (now protected by authRequired)
    const res = await request.get(`${API}/talents`)
    expect(res.status()).toBe(401)
  })

  test('GET /talents as talent role returns 403', async ({ request }) => {
    const res = await request.get(`${API}/talents`, {
      headers: {
        'x-user-id': 'talent-trying-to-list@test.com',
        'x-role': 'talent',
      },
    })
    // Only employers should list talent
    expect(res.status()).toBe(403)
  })

  test('CORS rejects requests from unknown origins', async ({ request }) => {
    const res = await request.get(`${API}/health`, {
      headers: { Origin: 'https://evil.example.com' },
    })
    // The server should either refuse or not set Access-Control-Allow-Origin to the evil origin
    const corsHeader = res.headers()['access-control-allow-origin']
    if (corsHeader) {
      expect(corsHeader).not.toBe('https://evil.example.com')
    }
    // Health itself is allowed; we just verify the origin isn't reflected
  })

  test('rate limiter returns 429 after many rapid requests', async ({ request }) => {
    // Send 25 rapid requests to the strict-limited /me endpoint to trigger rate limit
    const results = await Promise.all(
      Array.from({ length: 25 }).map(() =>
        request.get(`${API}/me`, {
          headers: { 'x-user-id': 'ratelimit-test@test.com', 'x-role': 'talent' },
        })
      )
    )
    const statuses = results.map((r) => r.status())
    // At least one request should have been rate-limited (429)
    expect(statuses.some((s) => s === 429)).toBe(true)
  })

  test('applying to a nonexistent job returns 400 or 404', async ({ request }) => {
    const fakeId = '00000000-0000-0000-0000-000000000099'
    const res = await request.post(`${API}/talent/jobs/${fakeId}/apply`, {
      headers: {
        'x-user-id': 'talent@security-test.com',
        'x-role': 'talent',
        'Content-Type': 'application/json',
      },
      data: { source: 'manual' },
    })
    expect([400, 404]).toContain(res.status())
  })

  test('invalid UUID in route param returns 400', async ({ request }) => {
    const res = await request.get(`${API}/jobs/not-a-uuid`)
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
  })

  test('error response does not leak stack trace in production mode', async ({ request }) => {
    // Trigger a 404 and verify the error body has no stack key
    const res = await request.get(`${API}/nonexistent-route-xyz`)
    const body = await res.json()
    expect(body.error).toBeDefined()
    // In production mode, `details` should be undefined (no stack trace)
    // In dev mode this may be present — the test validates the shape is correct
    if (process.env.NODE_ENV === 'production') {
      expect(body.error.details).toBeUndefined()
    }
  })
})

// ─── Frontend route-guard tests ───────────────────────────────────────────────
test.describe('Frontend Route Guards', () => {

  test('unauthenticated access to /employer/dashboard redirects to login', async ({ page }) => {
    await page.goto('http://localhost:3001/employer/dashboard')
    await page.waitForURL(/login|landing/, { timeout: 8_000 })
  })

  test('unauthenticated access to /talent/dashboard redirects to login', async ({ page }) => {
    await page.goto('http://localhost:3001/talent/dashboard')
    await page.waitForURL(/login|landing/, { timeout: 8_000 })
  })

  test('DemoAuth widget is NOT visible in production builds', async ({ page }) => {
    await page.goto('http://localhost:3001/landing')
    // The widget should only show if NEXT_PUBLIC_SHOW_DEV_AUTH=true
    const devWidget = page.locator('[data-testid="dev-auth-widget"]')
    const isVisible = await devWidget.isVisible().catch(() => false)
    // It should be hidden unless explicitly enabled
    const showDevAuth = process.env.NEXT_PUBLIC_SHOW_DEV_AUTH === 'true'
    if (!showDevAuth) {
      expect(isVisible).toBe(false)
    }
  })
})