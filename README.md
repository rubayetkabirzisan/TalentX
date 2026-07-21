# TalentX

TalentX is an AI-powered job marketplace connecting top-tier tech talent with the best opportunities. It features a dual-sided platform for Employers and Job Seekers, utilizing real-time skill matching algorithms to surface the best candidates for open roles, complete with real-time messaging and dark mode support.

## 🚀 Application Features

### For Employers
- **Job Management**: Create and manage job postings with required tech stacks and deadlines.
- **Applicant Tracking**: View incoming applications for specific roles.
- **AI Talent Discovery**: Automatically score and rank the entire talent pool against your job requirements.
- **Direct Invitations & Messaging**: Send direct interview invitations and communicate with talents instantly via real-time WebSockets.

### For Talent (Job Seekers)
- **AI Job Feed**: A personalized, real-time feed that scores every open job against your specific skill set.
- **One-Click Apply**: Seamless application process via a dynamic 3-step wizard.
- **Application Tracking**: Keep track of pending applications and employer invitations.
- **Skill Profile**: Update your technical skills to instantly recalibrate your job feed matches.

### Global Features
- **Real-Time Messaging**: Built-in WebSocket integration for instant cross-role communication.
- **Dynamic Theming**: Full Dark/Light mode support across all UI components.

---

## 🛠 Tech Stack & Architecture

**Frontend (`/TalentX-Frontend`)**
- Next.js (App Router) & React 18
- Tailwind CSS & shadcn/ui (Styling)
- Socket.io-client (Real-time WebSockets)
- Zod & React Hook Form (Validation)

**Backend (`/TalentX-Backend`)**
- Node.js & Express
- PostgreSQL (via `pg`)
- Socket.io (WebSocket Server)
- Built-in Rate Limiting & Stateless Authentication

**Architecture Highlights**
- **Backend-For-Frontend (BFF)**: Next.js API routes orchestrate data between the UI and the Express backend to prevent client-side data over-fetching.
- **State Integrity**: Strict boolean flags mitigate React 18 Strict Mode double-fetch race conditions.
- **SPA Routing**: Optimized client-side routing via `useRouter().push()` to prevent DOM reload crashes.

---

## 🧪 E2E Test Automation & QA Strategy

TalentX features a hyper-robust, 100% passing End-to-End Test Automation suite built with **Playwright**. The testing framework validates complex, multi-actor workflows while maintaining lightning-fast execution times. (See [QA-STRATEGY.md](./QA-STRATEGY.md) for a full post-mortem of our QA process).

### Automation Highlights
- **100% Pass Rate**: 30/30 UI tests passing across both Chromium and Firefox, plus 21/21 API-level tests with no browser involved.
- **API-Level Testing**: A dedicated `api` Playwright project hits the Express backend directly (auth requirements, RBAC, CORS, rate limiting, input validation, error-response hygiene) with no browser overhead, catching gaps — like a rate limiter that was imported but never wired up — that UI clicks alone can't reach. See [QA-STRATEGY.md](./QA-STRATEGY.md) Entry F.
- **Page Object Model (POM)**: The entire suite utilizes POM (e.g., `LoginPage.js`, `TalentDashboardPage.js`) to completely abstract DOM selectors, drastically reducing maintenance overhead.
- **Multi-Actor Testing**: Seamlessly boots up multiple isolated browser contexts in a single test to simulate real-time WebSocket messaging between an Employer browser and a Talent browser simultaneously.
- **Test Data Management**: Uses timestamp-based fixtures to dynamically generate unique job titles and user accounts, guaranteeing deterministic execution and preventing database collisions.
- **CI/CD Integration**: Fully integrated into GitHub Actions (`.github/workflows/playwright.yml`), orchestrating a Postgres service container, full-stack background server bootups, both the UI and API test projects, and automated HTML report generation (one artifact per project) for every Pull Request.
- **No Unmaintained Suites**: A second, earlier-generation UI test suite (root-level `e2e/specs/`) existed alongside this one but had never actually run in CI and had drifted from the current app. It was retired rather than left in the repo — see [QA-STRATEGY.md](./QA-STRATEGY.md) Entry G. Only `e2e/specs/ai.spec.js` and `security.spec.js` remain, and they power the `api` project above.

---

## ⚙️ Running Locally

TalentX requires both the Next.js frontend and Express backend to be running simultaneously.

### 1. Database Setup
Create a `.env` file in `TalentX-Backend/` with your PostgreSQL connection string **and an explicit `AUTH_PROVIDER`**:
```env
DATABASE_URL=postgresql://user:password@host:port/postgres
AUTH_PROVIDER=header
```
> **Why `AUTH_PROVIDER` matters:** if this is left unset, the backend silently falls back to a `none` bypass mode that attributes *every* request to a single hardcoded dev user with a locked-in role. Any role-gated route (e.g. a Talent applying to a job) will then fail unpredictably regardless of which account the UI shows as logged in. Use `header` for local/demo development (matches the fake `x-user-id`/`x-role` headers the frontend sends) or `clerk` if real JWT auth is configured. See [QA-STRATEGY.md § Bugs Discovered & Resolved, Entry E](./QA-STRATEGY.md) for the full story of what happens when this is skipped.

Load the schema into your database:
```bash
psql -d your_db_name -f TalentX-Backend/migrations/001_init.sql
```

### 2. Start the Backend (Port 3000)
```bash
cd TalentX-Backend
npm install
npm start
```

### 3. Start the Frontend (Port 3001)
```bash
cd TalentX-Frontend
npm install
npm run dev
```

### 4. Run E2E Tests (Optional)
With both servers running, execute the Playwright suite:
```bash
cd TalentX-Frontend
npx playwright test --project=chromium --headed
```