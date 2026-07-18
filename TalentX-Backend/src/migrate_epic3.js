import { query } from "./db.js";

async function up() {
  console.log("Altering applications and jobs tables...");

  const sql = `
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'applied';
    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS screening_question TEXT;
  `;

  await query(sql);
  console.log("Migration complete!");
}

up().catch(console.error).finally(() => process.exit(0));
