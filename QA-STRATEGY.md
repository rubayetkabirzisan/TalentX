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

---

## 4. Automation Architecture

- **Framework:** Playwright (`npx playwright test`)
- **CI/CD:** GitHub Actions (`.github/workflows/playwright.yml`). The pipeline spins up a Postgres database, starts Express and Next.js concurrently, utilizes `wait-on` for readiness checks, and runs the E2E suite in headless Ubuntu runners on every PR.
- **Data Isolation:** Every test creates uniquely timestamped user accounts (e.g., `talent.1690001122@test.com`) to ensure parallel test execution never experiences database collisions.
