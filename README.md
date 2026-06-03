# TalentX

TalentX is a marketplace platform for employers and data professionals. It combines a modern React/Next.js frontend with an Express backend and PostgreSQL support, and includes AI-driven routes for job and talent workflows.

## Repository Structure

- `TalentX-Frontend/`
  - Frontend application source code
  - Built with Next.js, React 19, Tailwind CSS, and Radix UI
- `TalentX-Backend/`
  - Express API server
  - PostgreSQL-backed data access with Zod validation
  - Includes routes for jobs, talent, employer, and AI-related endpoints
- `package.json`
  - Primary dependency manifest for the frontend stack
- `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`
  - Frontend configuration files

## Key Features

- Employer and talent dashboards
- Job search and application workflows
- AI-enhanced route support under `/ai`
- PostgreSQL database integration
- Centralized JSON error handling in the backend

## Prerequisites

- Node.js 18+ or newer
- npm or pnpm
- PostgreSQL-compatible database
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rubayetkabirzisan/TalentX-AI---Data-Expert-Marketplace.git
cd TalentX
```

2. Install frontend dependencies from the repository root:

```bash
npm install
```

3. Install backend dependencies:

```bash
cd TalentX-Backend
npm install
```

## Backend Configuration

Create a `.env` file inside `TalentX-Backend/` with at least the following:

```env
DATABASE_URL=postgres://user:password@host:port/database
PGSSLMODE=disable
PORT=3000
```

- `DATABASE_URL` is required.
- `PGSSLMODE` can be set to `disable` for local development.
- `PORT` defaults to `3000` if not provided.

## Running the Project

### Start the backend

```bash
cd TalentX-Backend
npm start
```

The API server will start and listen on the configured port. A health check endpoint is available at:

```text
GET /health
```

### Start the frontend

From the repository root:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Database

The backend includes an initial migration script at:

- `TalentX-Backend/migrations/001_init.sql`

Run this script against your PostgreSQL database to create the required schema before using the app.

## Notes

- The frontend source files are located inside `TalentX-Frontend/`.
- The backend exposes route groups under `/jobs`, `/me`, `/employer`, `/talent`, and `/ai`.
- Validation errors are returned in a consistent JSON format via Zod.

## License

This project is licensed under the ISC License.
