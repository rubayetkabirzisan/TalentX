import express from "express";
import { z } from "zod";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function validate(schema) {
  return (req, _res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
}

// GET /messages/:userId (Fetch chat history with a specific user)
router.get(
  "/:userId",
  authRequired(),
  validate(z.object({ params: z.object({ userId: z.string().uuid() }) })),
  async (req, res, next) => {
    try {
      const otherUserId = req.validated.params.userId;
      
      const sql = `
        SELECT m.*, u.name as sender_name 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE (m.sender_id = $1 AND m.receiver_id = $2)
           OR (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.created_at ASC
        LIMIT 100
      `;
      const { rows } = await query(sql, [req.user.id, otherUserId]);
      
      // Mark as read
      await query(
        `UPDATE messages SET read = TRUE WHERE receiver_id = $1 AND sender_id = $2 AND read = FALSE`,
        [req.user.id, otherUserId]
      );

      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// POST /messages
router.post(
  "/",
  authRequired(),
  validate(z.object({ body: z.object({ receiver_id: z.string().uuid(), content: z.string().min(1) }) })),
  async (req, res, next) => {
    try {
      const { receiver_id, content } = req.validated.body;
      
      const sql = `
        INSERT INTO messages (sender_id, receiver_id, content)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const { rows } = await query(sql, [req.user.id, receiver_id, content]);
      const message = rows[0];

      // Attach sender name for real-time
      const userRes = await query(`SELECT name FROM users WHERE id = $1`, [req.user.id]);
      message.sender_name = userRes.rows[0].name;

      // Emit via WS
      if (req.io) {
        req.io.to(receiver_id).emit("new_message", message);
      }

      res.json({ data: message });
    } catch (err) {
      next(err);
    }
  }
);

// GET /messages/conversations (List all users I have chatted with)
router.get("/", authRequired(), async (req, res, next) => {
  try {
    const sql = `
      SELECT DISTINCT ON (other_user_id)
        other_user_id,
        u.name as other_user_name,
        u.role as other_user_role,
        m.content as last_message,
        m.created_at,
        m.read,
        m.sender_id
      FROM (
        SELECT receiver_id as other_user_id, id FROM messages WHERE sender_id = $1
        UNION
        SELECT sender_id as other_user_id, id FROM messages WHERE receiver_id = $1
      ) c
      JOIN messages m ON m.id = (
        SELECT id FROM messages 
        WHERE (sender_id = $1 AND receiver_id = c.other_user_id) 
           OR (sender_id = c.other_user_id AND receiver_id = $1)
        ORDER BY created_at DESC LIMIT 1
      )
      JOIN users u ON u.id = c.other_user_id
      ORDER BY other_user_id, m.created_at DESC
    `;
    const { rows } = await query(sql, [req.user.id]);
    
    // Sort by most recent message
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
