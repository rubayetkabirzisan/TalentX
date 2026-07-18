import express from "express";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// GET /notifications
router.get("/", authRequired(), async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// PUT /notifications/:id/read
router.put("/:id/read", authRequired(), async (req, res, next) => {
  try {
    await query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
