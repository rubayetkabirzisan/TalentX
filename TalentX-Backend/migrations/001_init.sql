-- migrations/001_init.sql
-- Required for gen_random_uuid()
create extension if not exists pgcrypto;

-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_provider_id text unique not null,
  password_hash text,
  name text,
  role text check (role in ('employer','talent')),
  skills text[] not null default '{}'::text[],
  salary_min int default 0,
  salary_max int default 0,
  work_style_flags jsonb default '[]'::jsonb,
  endorsements jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- JOBS
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references users(id) on delete cascade,
  title text not null,
  tech_stack text[] not null default '{}'::text[],
  deadline timestamptz not null,
  description text not null,
  salary_min int default 0,
  salary_max int default 0,
  work_style_flags jsonb default '[]'::jsonb,
  screening_question text,
  created_at timestamptz not null default now(),
  -- Optional: protect against absurd past deadlines at DB level
  constraint jobs_deadline_reasonable check (deadline > '2000-01-01'::timestamptz)
);

-- APPLICATIONS
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  talent_id uuid not null references users(id) on delete cascade,
  source text not null check (source in ('manual','invitation')),
  cover_letter text,
  status varchar(50) default 'applied',
  created_at timestamptz not null default now(),
  unique(job_id, talent_id)
);

-- INVITATIONS
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  talent_id uuid not null references users(id) on delete cascade,
  employer_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  unique(job_id, talent_id)
);

-- OPTIONAL: JOB AI SCORES
create table if not exists job_ai_scores (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  talent_id uuid not null references users(id) on delete cascade,
  score int not null check (score between 0 and 100),
  created_at timestamptz not null default now(),
  unique(job_id, talent_id)
);

-- INDEXES
create index if not exists idx_jobs_employer_id on jobs(employer_id);
create index if not exists idx_jobs_deadline on jobs(deadline);

create index if not exists idx_applications_job_id on applications(job_id);
create index if not exists idx_applications_talent_id on applications(talent_id);

create index if not exists idx_invitations_talent_id on invitations(talent_id);
create index if not exists idx_invitations_job_id on invitations(job_id);
create index if not exists idx_invitations_status on invitations(status);

-- MESSAGES
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references users(id) on delete cascade,
  receiver_id uuid not null references users(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_messages_sender_id on messages(sender_id);
create index if not exists idx_messages_receiver_id on messages(receiver_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- NOTIFICATIONS
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type varchar(50) not null,
  title varchar(255) not null,
  body text,
  link varchar(255),
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);

-- Helpful for search performance (optional but recommended)
-- Note: requires extension; keep optional if you want minimal.
-- create extension if not exists pg_trgm;
-- create index if not exists idx_jobs_title_trgm on jobs using gin (title gin_trgm_ops);
-- create index if not exists idx_jobs_desc_trgm on jobs using gin (description gin_trgm_ops);
