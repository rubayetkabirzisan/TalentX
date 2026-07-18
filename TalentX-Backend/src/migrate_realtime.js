import { query } from "./db.js";

async function up() {
  console.log("Creating messages and notifications tables...");

  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL, -- e.g. 'invite', 'message', 'application_update'
      title VARCHAR(255) NOT NULL,
      body TEXT,
      link VARCHAR(255),
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `;

  await query(sql);
  console.log("Migration complete!");
}

up().catch(console.error).finally(() => process.exit(0));
