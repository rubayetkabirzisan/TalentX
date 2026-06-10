// src/routes/me.js
import express from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.validated = parsed;
    next();
  };
}

// GET /me
router.get("/", authRequired(), async (req, res) => {
  res.json({ data: req.user });
});

// POST /me/onboard (or PUT /me/role)
router.post(
  "/onboard",
  authRequired(),
  validate(
    z.object({
      body: z.object({
        role: z.enum(["employer", "talent"]),
        name: z.string().trim().min(1).max(200).optional(),
      }),
      query: z.any().optional(),
      params: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { role, name } = req.validated.body;

      const sql = `
        update users
        set
          role = $1,
          name = coalesce($2, name)
        where id = $3
        returning id, auth_provider_id, name, role;
      `;
      const { rows } = await query(sql, [role, name || null, req.user.id]);
      res.json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /me/skills
router.put("/skills", authRequired(), async (req, res, next) => {
  try {
    const { skills } = req.body
    if (!Array.isArray(skills)) {
      return res.status(400).json({ error: { message: "skills must be an array" } })
    }
    const sql = `
      update users set skills = $1 where id = $2
      returning id, name, role, skills;
    `
    const { rows } = await query(sql, [skills, req.user.id])
    res.json({ data: rows[0] })
  } catch (err) {
    next(err)
  }
});

export default router;
