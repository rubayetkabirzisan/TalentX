# TalentX

TalentX is a talent marketplace for employers and data professionals. It combines a modern Next.js frontend with an Express backend, PostgreSQL support, and AI-enhanced workflows for job descriptions and candidate matching.

## Repository Structure

- `TalentX-Frontend/`
  - Next.js 15 application using the App Router
  - React 19, Tailwind CSS, Radix UI components, and reusable UI primitives
  - Frontend entrypoint: `TalentX-Frontend/app/page.tsx`
  - Shared UI components in `TalentX-Frontend/components/`
- `TalentX-Backend/`
  - Express API server built with ES modules
  - PostgreSQL integration using `pg`
  - Request validation with `zod`
  - Route groups for jobs, talent, employer, user profile, and AI
- `README.md`
  - Project overview, installation, and usage instructions

## Key Features

- Employer and talent dashboards
- Job feed, search, and application workflows
- Invitation management for talent and hiring teams
- AI-powered backend route support under `/ai`
- Centralized JSON error handling with consistent response structure
- PostgreSQL-backed persistence with migration support

## Prerequisites

- Node.js 18+ or newer
- npm (or pnpm)
- PostgreSQL-compatible database
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/rubayetkabirzisan/TalentX-AI---Data-Expert-Marketplace.git
cd TalentX
```

2. Install backend dependencies:

```bash
cd TalentX-Backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../TalentX-Frontend
npm install
```

## Backend Configuration

Create a `.env` file inside `TalentX-Backend/` with the required values:

```env
DATABASE_URL=postgres://user:password@host:port/database
PGSSLMODE=disable
PORT=3000
```

- `DATABASE_URL` is required.
- `PGSSLMODE` can be `disable` for local development.
- `PORT` defaults to `3000` if not provided.

## Running the Project

### Start the backend

```bash
cd TalentX-Backend
npm start
```

The backend listens on the configured port and exposes:

- `GET /health`
- `/jobs`
- `/me`
- `/employer`
- `/talent`
- `/ai`
- `/talents`

### Start the frontend

```bash
cd TalentX-Frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Database

The backend includes a migration script at:

- `TalentX-Backend/migrations/001_init.sql`

Run this script against your PostgreSQL database before using the application.

## Notes

- Frontend code lives in `TalentX-Frontend/` and uses modern Next.js app routing.
- Backend code is located in `TalentX-Backend/src/` and uses Express middleware, Zod validation, and centralized error handling.
- AI functionality is exposed via `/ai` routes.