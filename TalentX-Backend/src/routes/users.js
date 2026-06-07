import express from "express"
import { authRequired } from "../middleware/auth.js"
import { roleGuard } from "../middleware/roleGuard.js"
import { query } from "../db.js"

const router = express.Router()

// GET /talents — list all talent users (employer only)
router.get(
  "/",
  authRequired(),
  roleGuard("employer"),
  async (req, res, next) => {
    try {
      const sql = `
        select id, auth_provider_id, name, skills, created_at
        from users
        where role = 'talent'
        order by created_at desc;
      `
      const { rows } = await query(sql)
      res.json({ data: rows })
    } catch (err) {
      next(err)
    }
  }
)

export default router