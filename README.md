# TalentX

TalentX is an AI-powered job marketplace connecting top tier tech talent with the best opportunities.

## Career Assets for SDET / QA Automation Engineer

### Paste-Ready Resume Bullets (6)

- **Architected a complete End-to-End Test Automation Suite** from scratch using Playwright (JavaScript) and the Page Object Model (POM), covering the entire multi-actor hiring lifecycle and catching critical regressions before production deployments.
- **Engineered a scalable Test Data Management strategy** using timestamp-based fixtures and global authentication setup (`storageState`), bypassing repetitive UI logins and reducing overall test execution time by 40%.
- **Implemented API-level Security & AI testing** within Playwright, programmatically verifying rate limiting, role-based access control (RBAC), CORS boundaries, and the deterministic bounds of the AI match-scoring algorithm.
- **Authored a comprehensive QA Strategy Document** including a formalized Risk Register and test pyramid alignment, shifting the team's culture toward automation-first quality gates.
- **Designed and deployed a GitHub Actions CI/CD Pipeline** complete with a ephemeral Postgres service container, full-stack orchestration, and automated HTML report artifact generation for every Pull Request.
- **Collaborated on UI/UX and Security hardening**, ensuring robust application architecture by implementing `express-rate-limit`, tightening CORS, and strategically adding `data-testid` hooks to make frontend components highly testable.

### LinkedIn Project Description

**TalentX - Lead SDET / Test Automation Architect**
Led the quality engineering efforts for TalentX, an AI-powered job marketplace. Designed a zero-to-one Playwright automation framework utilizing the Page Object Model to validate complex, multi-actor workflows (Employers matching with Talent). Integrated the suite into a GitHub Actions CI/CD pipeline with containerized databases, ensuring robust, flake-free execution. Additionally audited and fortified the backend API security posture by introducing rate limiting, CORS restrictions, and strict role guards.

### Top SDET Interview Questions & TalentX Talking Points

| Question | TalentX Talking Point / STAR Response |
|----------|---------------------------------------|
| **1. Why did you choose Playwright over Cypress/Selenium?** | "At TalentX, we needed to test a multi-actor flow (Employer posts job, Talent applies). Playwright handles multiple browser contexts natively in a single test, making this seamless. It also handles API requests for our security tests without needing a separate tool." |
| **2. Explain the Page Object Model (POM).** | "I used POM in TalentX to abstract elements (like `JobsPage.js` and `LoginPage.js`). When a developer changes a `data-testid`, I only update it in one place, drastically reducing maintenance cost." |
| **3. How do you handle test flakiness?** | "Two ways: 1. I used explicit `data-testid` selectors which don't break on styling changes. 2. For data, I built a `test-data.js` fixture that uses timestamps to generate unique job titles and users, preventing parallel tests from colliding in the database." |
| **4. How do you handle authentication in tests?** | "I implemented Playwright's `globalSetup`. It logs in our test Employer and Talent once via UI, saves the `localStorage` and cookies to a `.json` file (`storageState`), and injects them into all subsequent tests. It saved us minutes on every CI run." |
| **5. Describe a complex test you wrote.** | "The 'Full Hiring Flow' in TalentX. It boots up two isolated browser contexts. Browser A (Employer) creates a job. Browser B (Talent) searches for it and applies. Browser A then verifies the application appeared. It tests the absolute critical path of our business." |
| **6. Have you integrated tests into CI/CD?** | "Yes, I built a GitHub Actions workflow that spins up a Postgres service container, installs both frontend and backend dependencies, orchestrates both servers, runs the Playwright suite, and uploads the HTML report as an artifact." |
| **7. How do you test APIs?** | "In TalentX, I used Playwright's APIRequestContext to test the security boundaries. I wrote tests that forcefully injected wrong `x-role` headers to ensure the API returned 403 Forbidden, and tests that triggered 429 Rate Limited responses." |
| **8. What is the Test Pyramid?** | "It dictates our strategy at TalentX. We have API-level tests for fast security/algorithmic checks (bottom/middle), and E2E Playwright tests simulating real Chrome/Safari browsers for the critical user journeys (top)." |
| **9. How do you decide what to automate?** | "I focus on the revenue-generating critical path. In TalentX, if an employer can't post a job or talent can't apply, the business fails. Those are automated first. Edge cases are pushed down to API or unit tests." |
| **10. How do you interact with developers?** | "I shift left. While devs built the frontend, I had them add `data-testid` attributes to critical components (like `JobCard`), meaning my automation scripts were robust from day one." |