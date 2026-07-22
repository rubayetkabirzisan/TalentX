# TalentX QA Strategy & Post-Mortem

## Overview
This document outlines the Quality Assurance strategy for TalentX. It is a living record of real bugs discovered, critical flows verified, and environment risks identified during our extensive end-to-end (E2E) automation journey using Playwright, Next.js, and Express.

---

## 1. Bugs Discovered & Resolved 🐛

During the maturation of our E2E test suite, we uncovered and resolved several complex full-stack issues:

### A. React Strict Mode Race Conditions
- **The Bug:** Tests verifying Talent Profile updates were inexplicably failing, showing old profile names instead of newly saved ones. 
- **The Cause:** React 18's Strict Mode double-mounts components in development. The `ProfileSettingsTab` was firing a `GET` request immediately after a `PATCH` request. Because network latency fluctuates, the stale `GET` response was arriving *after* the `PATCH`, overwriting the UI with old data.
- **The Fix:** Implemented a boolean `ignore` flag inside the `useEffect` hook to discard stale fetch responses if the component was unmounted or re-fetching.

### B. Client-Side Routing Desync & `NS_BINDING_ABORTED`
- **The Bug:** `toHaveURL` assertions were failing constantly across Authentication and Dashboard tests, particularly crashing Firefox completely.
- **The Cause:** The frontend was using native `window.location.href = ...` for redirects. This completely unmounts the React tree and forces a hard browser reload. Playwright would fire its assertions during the "dead zone" of the reload, causing timeouts.
- **The Fix:** Replaced all native redirects with Next.js `useRouter().push()`. This kept the Single Page Application (SPA) intact, resulting in lightning-fast, predictable DOM transitions.

### C. Firefox Headed Mode Scroll-Lock
- **The Bug:** In headed mode (but not headless), Firefox would permanently freeze when trying to click the "Create Account" button, stating: *"scrolling into view if needed"*.
- **The Cause:** Playwright's Firefox engine on Windows struggles to calculate scroll positions when rendering GUI windows with fixed CSS layouts or animations.
- **The Fix:** Enforced `click({ force: true })` on the login submit button to bypass the virtual scrolling check and immediately fire the click event.

### D. Next.js Cold-Start Timeouts
- **The Bug:** The very first test in the Chromium suite would often fail with a `toHaveURL` timeout, while every subsequent test passed instantly.
- **The Cause:** Next.js compiles pages on-demand in `dev` mode. The 4-second compilation time exceeded Playwright's strict 5000ms assertion timeout.
- **The Fix:** Acknowledged as a dev-environment quirk. Running tests on a "warmed up" Next.js server resolves it, and building for production in CI/CD completely eliminates it.

### E. Silent Auth-Mode Fallback Locking Every User to "Employer"
- **The Bug:** `Talent can apply to a job using the 3-step wizard` failed 100% of the time in CI, on both Chromium and Firefox, across all retries — the "Applied" confirmation button never appeared after clicking Submit.
- **The Cause:** The CI workflow never set `AUTH_PROVIDER` when starting the Express backend, so it silently defaulted to `"none"` bypass mode. That mode attaches every request to a single hardcoded dev user and hardcodes that user's role to `"employer"` on insert. Because the upsert used `coalesce(users.role, excluded.role)`, whichever role got written on the very first authenticated request of the entire CI run stuck permanently — which was always `"employer"`. Every route gated with `roleGuard("talent")`, including the job-apply endpoint, then rejected every request for the rest of the run with a 403, regardless of which account the frontend UI showed as logged in.
- **The Fix:** Explicitly set `AUTH_PROVIDER=header` in the backend's CI environment, so the middleware honors the `x-user-id`/`x-role` headers the frontend actually sends per-account instead of collapsing every request into one identity. Also added a startup warning in `auth.js` so a missing `AUTH_PROVIDER` is caught immediately in server logs rather than surfacing later as a confusing, deterministic-but-unexplained test failure.

### F. Rate Limiting Was Imported But Never Wired Up
- **The Bug:** After wiring the root-level `e2e/specs/ai.spec.js` and `security.spec.js` API test project into CI for the first time, `rate limiter returns 429 after many rapid requests` failed — 25 rapid requests to `/me` came back with zero 429 responses.
- **The Cause:** This wasn't a test bug. `express-rate-limit` was imported in `TalentX-Backend/src/index.js` but never actually applied to any route — a leftover comment (`// Rate limit config removed for tests`) marked where it had been stripped out at some point and never restored. The API had no rate limiting at all, in production as much as in CI, despite the README listing it as a shipped feature. Two of the same test run's failures were separately a test bug: two "Frontend Route Guards" tests called `localStorage.clear()` before any `page.goto()`, which throws on the browser's initial blank page (`about:blank` has no origin to hold storage against) — unnecessary anyway, since each Playwright test already starts with a fresh, empty browser context.
- **The Fix:** Restored `express-rate-limit`, scoped to the `/me` and `/ai` routes specifically (not applied globally, so it can't collide with the rest of the suite sharing one IP on the CI runner), tuned so the deliberate 25-request burst test trips a 429 with margin while staying well above the suite's normal incidental traffic to those routes. Removed the two dead `localStorage.clear()` calls. This is the clearest example so far of API-level testing catching something UI testing structurally cannot: a browser clicking through the app one flow at a time never fires 25 concurrent requests, so this gap was invisible to the whole rest of the suite until the API project existed.

### G. Retired a Second, Unmaintained UI Suite That Had Never Actually Run
- **The Bug:** Not a test failure — a discrepancy found while auditing the repo for further test coverage. The root-level `e2e/specs/` directory contained 12 spec files, but only 2 (`ai.spec.js`, `security.spec.js`) were ever wired into any CI project. The other 10 UI-driven spec files, plus their supporting `e2e/pages/` Page Objects and `e2e/setup/auth.setup.js`, had never been executed in CI at all.
- **The Cause:** Investigation before deciding whether to repair or retire this suite turned up two independent, confirmed blockers, not just staleness risk: (1) `e2e/setup/auth.setup.js` logged in with two hardcoded email addresses that are never seeded anywhere in the repo — on a fresh CI database this login fails on the very first step, so nothing depending on it could ever have passed; (2) `e2e/pages/LoginPage.js` looked for a `data-testid="signup-link"` element that no longer exists in the current frontend (renamed to `auth-toggle-link` at some point). This suite was written against an earlier version of the app and abandoned once `TalentX-Frontend/tests/` became the actively maintained suite, but was never deleted.
- **The Fix:** Retired rather than repaired. Deleted the 10 stale spec files along with `e2e/pages/`, `e2e/setup/`, and `e2e/fixtures/` (nothing in the two files being kept depends on any of them), and trimmed the now-orphaned `setup`/`chromium`/`mobile-safari` project definitions out of the root `playwright.config.js`. `TalentX-Frontend/tests/` already covers equivalent Authentication, RBAC, and Talent/Employer workflow flows with a suite that's actually running and passing, so no real coverage was lost — only dead code that an interviewer (or a future contributor) could have stumbled into and reasonably asked "wait, does this pass?"

### H. Closed the Coverage Gap Entry G Left Behind: Invitations
- **The Bug:** Not a bug either — a follow-up gap created by Entry G. The only file that had ever tested the Invitations feature (`POST /employer/jobs/:id/invite`, `GET /talent/invitations`, `POST /talent/invitations/:id/respond`, and the `source="invitation"` path on the apply endpoint) was the legacy, never-executed suite that was just retired. Deleting it was still the right call — dead code testing nothing is worse than no test file — but it left a real feature with zero verified coverage.
- **The Cause:** The feature itself has real business logic worth locking down: invitations can only transition `pending → accepted/declined`, only the invited talent (not just any talent) can respond, re-inviting the same talent to the same job is idempotent rather than erroring, and applying via `source="invitation"` should auto-accept the invitation as a side effect.
- **The Fix:** Added `e2e/specs/invitations.spec.js` — 16 new API-level tests, split into standalone auth/RBAC/validation checks and two serial lifecycle fixtures (the full invite → respond flow, and the apply-via-invitation path specifically). Wired into the `api` project's `testMatch` and the `test:api` script. Confirmed passing locally: 37/37 across the full `api` project, all 16 new tests included.

### I. WebKit Was Configured But Never Actually Installed or Run in CI
- **The Bug:** Not a test failure — a documentation-accuracy issue caught while investigating Entry G. This Risk Register previously claimed (see the row below) that WebKit failures were accepted locally because "we rely exclusively on Ubuntu GitHub Actions runners for Safari verification." That was false. `TalentX-Frontend/playwright.config.js` does define a `webkit` project, but the CI workflow only ever installed and ran `chromium firefox` — WebKit was never installed, never invoked, and never verified anywhere, local or CI.
- **The Cause:** The project definition and the CI wiring were added at different times, and nobody had actually gone back to confirm the wiring matched the intent.
- **The Fix:** Added `webkit` to the CI browser install step and a third `--project=webkit` to the UI test run, alongside Chromium and Firefox. **Status: pending as of this writing.** This has not yet been confirmed by an actual CI run — deliberately not verifying this locally either, since Playwright's WebKit engine has known `localhost` networking quirks on Windows (the same ones this Risk Register already documented) that could produce a false result either way. The real signal is the next Ubuntu CI run, not a local Windows one.

### J. Job Deadline Enforcement — Partially Closed, One Real Gap Left Open on Purpose
- **The Bug:** Not a bug — another route-coverage finding. Job postings have a hard deadline (`POST /employer/jobs` rejects a past deadline at creation time, and `POST /talent/jobs/:id/apply` is supposed to reject applications after a job's deadline has passed with `DEADLINE_PASSED`). Neither half had any test coverage.
- **The Cause, and why only half of this got closed:** Creation-time validation was straightforward to test — POST a past deadline, expect 400. Apply-time enforcement was not: the check compares against **end of day** for the deadline date (`deadline.getTime() + 24h - 1`), not the literal timestamp. A fixture job can't be created with an already-past deadline (creation itself rejects that), and creating one a few seconds in the future and waiting doesn't work either, since it's still "today" and therefore still within the allowed window until midnight. Properly testing this would mean either writing a test that reliably spans midnight (impractical) or giving the test suite direct database write access to backdate a job's deadline after creation — a new capability (a raw `pg` client dependency) this suite doesn't otherwise have, for the sake of one edge case.
- **The Fix:** Added the creation-time test only (`security.spec.js`). Deliberately did not ship a `test.skip()` placeholder for the apply-time case — a test that can never actually run is the same clutter problem as `ui-components.spec.js` was (Entry K), just disguised as a checkbox instead of a passing green test. The gap is real and stays open, documented here rather than hidden behind a skipped test that looks like progress but verifies nothing.

### K. Removed a Test That Existed Just for the Sake of Testing
- **The Bug:** Not a bug — the same audit lens applied backward, onto the existing suite instead of just new gaps. `TalentX-Frontend/tests/ui-components.spec.js` contained exactly one test: clicking a dark-mode toggle and asserting an HTML class changes.
- **The Cause:** Checked against the same bar used everywhere else in this document — real consequence if broken, real business logic, real risk. This test has none of those. Dark mode is a cosmetic preference with no functional, security, or business consequence if it silently broke, and the underlying mechanism (`next-themes`/shadcn `ThemeProvider`) is stable, well-established third-party code, not custom logic worth guarding.
- **The Fix:** Deleted the file rather than keep a test that exists only to keep a number higher. See the "Deliberately Not Automated" note below for the same reasoning applied to routes that were never tested in the first place.

---

## 2. Core Flows Verified ✅

**Confirmed as of the last verified run:** 30/30 UI tests in Chromium and Firefox, plus 37/37 API-level tests with no browser involved. **Since then, not yet reconfirmed:** `ui-components.spec.js` was removed (Entry K, so the UI count is now 29 until a fresh run confirms it), and one new API test was added for job-deadline validation (Entry J, so the API count should be 38). Also still pending: WebKit as a third UI browser, and the `match-bulk`/interview-scheduling/real-time-notification additions from the broader route-coverage audit (Entries I and J) — this document will report what an actual run says, not arithmetic.

Covering the following critical user journeys and API contracts:

- **Authentication:** End-to-end Sign-ups and Logins for both Employer and Talent roles.
- **Role-Based Access Control (RBAC):** Verified at both the UI layer (Talents hard-blocked from Employer dashboards, unauthenticated users redirected to `/login`) and the API layer directly (401/403 responses for missing auth and wrong-role requests, with no browser involved).
- **The Employer Workflow:** Creating jobs, validating missing required fields, viewing applicant lists, and exporting applicant data.
- **The Talent Workflow:** Successfully navigating the multi-step Application Wizard and safely canceling out of flows without ghost-submissions.
- **The Invitations Lifecycle:** Employer invites a talent, the talent sees it with job/employer details attached, only that talent can respond, only a pending invitation can be responded to, and accepting an invitation via `POST /talent/jobs/:id/apply?source=invitation` correctly marks the invitation accepted as a side effect.
- **Job Deadline Validation:** Job creation rejects a past deadline. (Apply-time enforcement of an already-passed deadline remains a known, documented gap — see Entry J.)
- **Data Persistence:** Verifying that profile name edits successfully travel from the Next.js UI, through the Express Backend, into Postgres, and reflect back on the UI.
- **Real-Time WebSockets:** Employer can initiate a message directly from the Applicant Tab, and the Talent receives the message instantly without refreshing.
- **API Security & Resilience:** Direct API-level coverage of auth requirements, RBAC, CORS rejection, rate limiting, input validation, and error-response hygiene (no stack traces leaked in production).

---

## 3. Risk Register & Mitigations ⚠️

| Risk Area | Impact | Mitigation Strategy |
|-----------|--------|---------------------|
| **WebKit Windows Networking Quirks** | Low | Playwright's WebKit engine on Windows struggles with `localhost` IPv4/IPv6 routing, causing false timeouts. **Mitigation:** We accept WebKit test failures locally. This row previously claimed we "rely exclusively on Ubuntu GitHub Actions runners for Safari verification" — that wasn't actually true; see Entry I. Corrected by wiring `--project=webkit` into CI. Pending its first real run as of this writing. |
| **Double-Fetch State Bleeding** | High | If React `useEffect` hooks lack AbortControllers or ignore flags, production race conditions will occur on slow connections. **Mitigation:** Strict code review enforcing cleanup functions on all data-fetching hooks. |
| **Headless vs Headed Discrepancies** | Medium | CSS animations and fixed viewports behave differently when physically rendered. **Mitigation:** Isolating CI pipelines to purely headless execution, and utilizing `force: true` on notoriously stubborn modal buttons. |
| **Playwright Locator Ambiguity** | Medium | Using `.getByRole('button', { name: 'Cancel' })` can fail if multiple buttons share the same accessible name. **Mitigation:** Tighten locator scopes (e.g., targeting specific containers) rather than relying on generic text matches. |
| **Silent Environment Misconfiguration** | High | Optional environment variables (e.g. `AUTH_PROVIDER`) that default to a "safe-looking" fallback can silently change application behavior in an entire environment without any error at startup. **Mitigation:** Fail loudly — log explicit warnings (or hard-fail in non-local environments) whenever a security- or identity-relevant config value falls back to a default, rather than assuming defaults are always harmless. |
| **Duplicate / Unmaintained Test Suites** | Medium | A second, earlier-generation UI suite existed alongside the maintained one, was never wired into CI, and quietly drifted out of sync with the app (stale selectors, an auth setup step assuming accounts that were never seeded). Nobody could tell it was broken without actually trying to run it. **Mitigation:** Retired it outright (see Entry G) rather than leaving an unmaintained suite of unknown pass/fail status in the repo. Going forward, a test suite that isn't running in CI is treated as a liability, not free extra coverage, until proven otherwise. |

---

## 4. Deliberately Not Automated 🚫

A full route-coverage audit (Entry J and the round before it) found several backend routes and one existing test with no real justification for the effort of testing them. Each was checked against the actual current frontend and business logic before being set aside — this is a documented decision, not an oversight:

| Item | Why it's skipped |
|-------|-------------------|
| `PUT /auth/password` | Real, working feature, but isolated, low-complexity CRUD with no dependent business logic elsewhere in the app. |
| `PUT /me/skills` | Real feature, but its main consequence — feeding match scores — is already indirectly exercised once `match-bulk` has coverage. |
| `GET/PUT /notifications` | Real feature, but simple read/mark-as-read CRUD with no state-machine logic and low consequence if broken. |
| `GET /stats` | Purely a marketing number on the landing page hero section. No business logic, no security angle, no functional consequence if wrong — the clearest example in this whole audit of a route that exists but isn't worth testing. |
| Duplicate-application prevention | Real protection exists (a DB `unique(job_id, talent_id)` constraint, converted by the app's generic error handler into a clean `409 Conflict`, not a raw crash) — but it's exercising an already-generic, already-proven mechanism, not bespoke business logic, unlike the invitation idempotency case in Entry H which had custom upsert logic worth locking down specifically. |
| Apply-time deadline enforcement (`DEADLINE_PASSED`) | Different from the rest of this list — this one is a **real, unclosed gap**, not a judgment call that it doesn't matter. See Entry J for why it's genuinely impractical to test cleanly without adding a new dependency (direct DB access) to the suite for one edge case. Documented here as an honest limitation, not swept under a skipped test. |

Separately, `TalentX-Frontend/tests/ui-components.spec.js` (dark-mode toggle) was removed outright rather than left in place — see Entry K. The standard applied consistently throughout this document: a test earns its place by verifying something with real, checkable consequence if it breaks, not by existing to make a coverage number look more complete than the app's actual risk profile.

---

## 5. Automation Architecture

- **Framework:** Playwright (`npx playwright test`)
- **CI/CD:** GitHub Actions (`.github/workflows/playwright.yml`). The pipeline spins up a Postgres database, starts Express and Next.js concurrently, utilizes `wait-on` for readiness checks, and runs both the browser-based UI suite (Chromium + Firefox) and a separate no-browser `api` project against the same running servers on every PR.
- **Data Isolation:** Every test creates uniquely timestamped user accounts (e.g., `talent.1690001122@test.com`) to ensure parallel test execution never experiences database collisions.
- **Service Health Checks:** The Postgres service container's healthcheck explicitly authenticates as the `postgres` role (`pg_isready -U postgres`) rather than relying on the container's default OS user, eliminating spurious `FATAL: role "root" does not exist` log noise during startup.