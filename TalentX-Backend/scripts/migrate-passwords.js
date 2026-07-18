import { query, pool } from "../src/db.js";
import bcrypt from "bcryptjs";

async function migrate() {
  try {
    // 1. Add password_hash column if it doesn't exist
    console.log("Adding password_hash column...");
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `);

    // 2. Hash default password
    console.log("Hashing default password...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);

    // 3. Update existing users who don't have a password
    console.log("Updating existing users...");
    const result = await query(`
      UPDATE users
      SET password_hash = $1
      WHERE password_hash IS NULL;
    `, [hash]);

    console.log(`Successfully updated ${result.rowCount} users with default password.`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
