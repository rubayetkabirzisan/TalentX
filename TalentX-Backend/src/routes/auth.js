import express from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validated = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// POST /auth/register
router.post(
  "/register",
  validate(
    z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["employer", "talent"]),
        name: z.string().trim().min(1).max(200).optional(),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { email, password, role, name } = req.validated.body;

      // Check if user exists
      const existing = await query("SELECT id FROM users WHERE auth_provider_id = $1", [email]);
      if (existing.rowCount > 0) {
        return res.status(400).json({ error: { message: "Email is already registered" } });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Insert user
      const sql = `
        INSERT INTO users (auth_provider_id, password_hash, name, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, auth_provider_id, name, role, skills;
      `;
      const { rows } = await query(sql, [email, hash, name || email.split("@")[0], role]);
      
      res.json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  validate(
    z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string(),
        role: z.enum(["employer", "talent"]),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { email, password, role } = req.validated.body;

      const { rows } = await query("SELECT * FROM users WHERE auth_provider_id = $1", [email]);
      if (rows.length === 0) {
        return res.status(401).json({ error: { message: "Invalid email or password" } });
      }

      const user = rows[0];
      
      if (!user.password_hash) {
        return res.status(401).json({ error: { message: "Invalid email or password" } });
      }

      if (user.role !== role) {
        return res.status(401).json({ error: { message: "Invalid email, password, or incorrect role selected" } });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: { message: "Invalid email or password" } });
      }

      res.json({ 
        data: {
          id: user.id,
          auth_provider_id: user.auth_provider_id,
          name: user.name,
          role: user.role,
          skills: user.skills
        } 
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /auth/password
router.put(
  "/password",
  authRequired(),
  validate(
    z.object({
      body: z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(6),
      }),
    })
  ),
  async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.validated.body;

      const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
      const user = rows[0];

      if (!user.password_hash) {
        return res.status(400).json({ error: { message: "User does not have a password set" } });
      }

      const isValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: { message: "Incorrect current password" } });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);
      
      res.json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
