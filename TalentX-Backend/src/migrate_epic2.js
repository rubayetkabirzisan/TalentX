import { query } from "./db.js";

async function up() {
  console.log("Altering users and jobs tables for Profile Expansion...");

  const sql = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_min INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS salary_max INT DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS work_style_flags JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS endorsements JSONB DEFAULT '[]'::jsonb;

    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_min INT DEFAULT 0;
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_max INT DEFAULT 0;
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_style_flags JSONB DEFAULT '[]'::jsonb;
  `;

  await query(sql);
  console.log("Migration complete!");
}

up().catch(console.error).finally(() => process.exit(0));
