# TalentX QA Strategy & Automation Plan

## Overview
This document outlines the Quality Assurance strategy for TalentX, detailing how we ensure the reliability of the core job matching platform through automated E2E testing, risk mitigation, and manual QA processes.

## 1. Automation Scope (The Test Pyramid at TalentX)

We follow a heavily automated test strategy to maintain velocity without sacrificing quality.

### E2E Testing (Playwright)
- **Framework**: Playwright (JavaScript)
- **Coverage**: Critical user journeys (CUJs) simulating real browser interaction across Chromium and Mobile Safari.
- **Key Flows**: 
  - Authentication (Login/Register)
  - Employer creating a job
  - Talent applying to a job
  - Complete multi-actor hiring flow (Employer -> Talent -> Employer)
- **Execution**: Runs on every Pull Request via GitHub Actions.

### Integration / API Testing
- **Framework**: Playwright (API Request Context)
- **Coverage**: Endpoints without browser overhead for speed and reliability.
- **Key Flows**:
  - Security endpoints (Auth checks, role guards, CORS)
  - AI endpoints (`/ai/generate-jd`, `/ai/match`)
  - Rate limiting behavior

### Unit Testing
- *(Planned)* Jest/Vitest for pure business logic (e.g., matching algorithm edge cases).

## 2. Risk Register

| Risk Area | Likelihood | Impact | Mitigation Strategy |
|-----------|------------|--------|---------------------|
| **AI Matching Accuracy** | Medium | High | API tests verify the algorithm always outputs a valid 0-100 score and respects skill overlaps. |
| **Role Escalation** | Low | Critical | Security API tests actively attempt to execute employer actions as a talent (verifying 403 Forbidden). |
| **State Bleed (Flaky Tests)** | Medium | Medium | Unique timestamp-based data fixtures (`test-data.js`) ensure parallel tests never interact with the same database records. |
| **Supabase Outages** | Low | High | We rely on Supabase's SLA, but we handle DB connection drops gracefully in the global error handler. |

## 3. Test Data Management
To avoid flakiness and maintain idempotency:
- We use **unique, timestamped identifiers** for jobs and users in tests (e.g., `QA Engineer - 1690001122333`).
- **Global Auth Setup**: Test users are logged in once per run, saving their `localStorage` state to `e2e/.auth/*.json` to bypass UI login in 95% of tests.

## 4. Known Gaps & Future Work
- **Clerk Auth Integration**: The backend currently uses `header` auth. Real Clerk integration must be tested once wired.
- **Visual Regression**: We plan to implement Playwright's `toHaveScreenshot()` for key brand elements (e.g., the new gradient hero section).
- **Email Notifications**: Verifying invite emails currently requires a manual check. Future: Integrate Mailosaur or Mailtrap API into Playwright.
