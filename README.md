# TalentX

TalentX is an AI-powered job marketplace connecting top-tier tech talent with the best opportunities. It features a dual-sided platform for Employers and Job Seekers, utilizing real-time skill matching algorithms to surface the best candidates for open roles.

## 🚀 Application Features
### For Employers
- **Job Management**: Create and manage job postings with required tech stacks and deadlines.
- **Applicant Tracking**: View incoming applications for specific roles.
- **AI Talent Discovery**: Automatically score and rank the entire talent pool against your job requirements.
- **Direct Invitations**: Send direct interview invitations to high-matching candidates.
### For Talent (Job Seekers)
- **AI Job Feed**: A personalized, real-time feed that scores every open job against your specific skill set.
- **One-Click Apply**: Seamless application process for matching jobs.
- **Application Tracking**: Keep track of pending applications and employer invitations.
- **Skill Profile**: Update your technical skills to instantly recalibrate your job feed matches.

## 🛠 Tech Stack & Architecture
**Frontend (`/TalentX-Frontend`)**
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS & shadcn/ui (Styling)

**Backend (`/TalentX-Backend`)**
- Node.js & Express
- PostgreSQL (via `pg` and Supabase)
- Zod (Schema Validation)
- Built-in Rate Limiting & Stateless Authentication

**Architecture Highlights**
- **Stateless Auth**: Configured for frictionless MVP testing via headers, upgradeable to Clerk JWTs.
- **Bulk AI Matching**: Optimized endpoints to resolve N+1 queries and handle massive job-pool scaling without rate-limit exhaustion.

---

## 🧪 E2E Test Automation (Playwright)

TalentX features a robust, zero-to-one End-to-End Test Automation suite built with **Playwright (JavaScript)**. The testing framework is designed to validate complex, multi-actor workflows while maintaining lightning-fast execution times.

### Automation Highlights
- **Page Object Model (POM)**: The entire suite utilizes POM (e.g., `LoginPage.js`, `JobsPage.js`) to completely abstract DOM selectors (`data-testid`), drastically reducing maintenance overhead when the UI changes.
- **Global Authentication Setup**: Uses Playwright's `globalSetup` to log in test users once via the UI, saving their session state (`storageState.json`) and injecting it into all subsequent tests to bypass repetitive logins.
- **Multi-Actor Testing**: Seamlessly boots up multiple isolated browser contexts in a single test to simulate the critical path (e.g., Browser A creates a job as Employer, Browser B searches and applies as Talent).
- **Test Data Management**: Uses timestamp-based fixtures to dynamically generate unique job titles and user accounts, guaranteeing deterministic execution and preventing database collisions during parallel runs.
- **API Security Testing**: Directly leverages Playwright's `APIRequestContext` to programmatically test backend security boundaries (Rate Limiting, CORS, and RBAC `403 Forbidden` assertions).
- **CI/CD Integration**: Fully integrated into GitHub Actions, orchestrating a Postgres service container, full-stack server bootups, and automated HTML report artifact generation for every Pull Request.

---

## ⚙️ Running Locally
TalentX requires both the Next.js frontend and Express backend to be running simultaneously.
### 1. Database Setup
Create a `.env` file in `TalentX-Backend/` with your PostgreSQL connection string:
```env
DATABASE_URL=postgresql://user:password@host:port/postgres
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