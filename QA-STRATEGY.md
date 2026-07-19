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

---

## 2. Core Flows Verified ✅

Our Playwright suite now boasts a **100% pass rate** in Chromium and Firefox for the following critical user journeys (30/30 tests passing):

- **Authentication:** End-to-end Sign-ups and Logins for both Employer and Talent roles.
- **Role-Based Access Control (RBAC):** Verified that Talents are hard-blocked from Employer dashboards, and unauthenticated users are seamlessly redirected to `/login`.
- **The Employer Workflow:** Creating jobs, validating missing required fields, viewing applicant lists, and exporting applicant data.
- **The Talent Workflow:** Successfully navigating the multi-step Application Wizard and safely canceling out of flows without ghost-submissions.
- **Data Persistence:** Verifying that profile name edits successfully travel from the Next.js UI, through the Express Backend, into Postgres, and reflect back on the UI.
- **Real-Time WebSockets:** Employer can initiate a message directly from the Applicant Tab, and the Talent receives the message instantly without refreshing.
- **UI/UX Integrity:** Toggling Dark/Light mode correctly updates HTML root classes.

---

## 3. Risk Register & Mitigations ⚠️

| Risk Area | Impact | Mitigation Strategy |
|-----------|--------|---------------------|
| **WebKit Windows Networking Quirks** | Low | Playwright's WebKit engine on Windows struggles with `localhost` IPv4/IPv6 routing, causing false timeouts. **Mitigation:** We accept WebKit test failures locally and rely exclusively on Ubuntu GitHub Actions runners for Safari verification. |
| **Double-Fetch State Bleeding** | High | If React `useEffect` hooks lack AbortControllers or ignore flags, production race conditions will occur on slow connections. **Mitigation:** Strict code review enforcing cleanup functions on all data-fetching hooks. |
| **Headless vs Headed Discrepancies** | Medium | CSS animations and fixed viewports behave differently when physically rendered. **Mitigation:** Isolating CI pipelines to purely headless execution, and utilizing `force: true` on notoriously stubborn modal buttons. |
| **Playwright Locator Ambiguity** | Medium | Using `.getByRole('button', { name: 'Cancel' })` can fail if multiple buttons share the same accessible name. **Mitigation:** Tighten locator scopes (e.g., targeting specific containers) rather than relying on generic text matches. |
| **Silent Environment Misconfiguration** | High | Optional environment variables (e.g. `AUTH_PROVIDER`) that default to a "safe-looking" fallback can silently change application behavior in an entire environment without any error at startup. **Mitigation:** Fail loudly — log explicit warnings (or hard-fail in non-local environments) whenever a security- or identity-relevant config value falls back to a default, rather than assuming defaults are always harmless. |

---

## 4. Automation Architecture

- **Framework:** Playwright (`npx playwright test`)
- **CI/CD:** GitHub Actions (`.github/workflows/playwright.yml`). The pipeline spins up a Postgres database, starts Express and Next.js concurrently, utilizes `wait-on` for readiness checks, and runs the E2E suite in headless Ubuntu runners on every PR.
- **Data Isolation:** Every test creates uniquely timestamped user accounts (e.g., `talent.1690001122@test.com`) to ensure parallel test execution never experiences database collisions.
- **Service Health Checks:** The Postgres service container's healthcheck explicitly authenticates as the `postgres` role (`pg_isready -U postgres`) rather than relying on the container's default OS user, eliminating spurious `FATAL: role "root" does not exist` log noise during startup.