// e2e/fixtures/test-data.js
/**
 * Test Data Generator
 *
 * Provides timestamp-based unique data so tests never collide when run in parallel
 * or repeated over time.
 */

export function generateJobData(prefix = 'QA Engineer') {
  const timestamp = Date.now()
  return {
    title: `${prefix} - ${timestamp}`,
    description: `Automated test description for ${prefix} created at ${timestamp}. Must have experience with Playwright.`,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  }
}

export function generateUserData(role) {
  const timestamp = Date.now()
  return {
    email: `test-${role}-${timestamp}@talentx.dev`,
    password: 'Password123!',
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)} ${timestamp}`,
    role,
  }
}
