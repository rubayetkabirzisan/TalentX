// src/routes/jobs.js
import express from "express";
import { z } from "zod";
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

// GET /jobs?search=term
router.get(
  "/",
  validate(
    z.object({
      query: z.object({
        search: z.string().trim().min(1).optional(),
      }),
      body: z.any().optional(),
      params: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const search = req.validated.query.search || null;
      const term = search ? `%${search}%` : null;

      const sql = `
        select
          j.id,
          j.title,
          j.tech_stack,
          j.deadline,
          j.created_at,
          u.name as employer_name,
          (
            select count(*)::int
            from applications a
            where a.job_id = j.id
          ) as "applicationCount"
        from jobs j
        join users u on u.id = j.employer_id
        where
          ($1::text is null)
          or (
            j.title ilike $1
            or j.description ilike $1
            or exists (
              select 1
              from unnest(j.tech_stack) t
              where t ilike $1
            )
          )
        order by j.created_at desc
        limit 100;
      `;

      const { rows } = await query(sql, [term]);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// GET /jobs/:id
router.get(
  "/:id",
  validate(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      query: z.any().optional(),
      body: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { id } = req.validated.params;

      const sql = `
        select
          j.id,
          j.title,
          j.tech_stack,
          j.deadline,
          j.description,
          j.created_at,
          u.name as employer_name,
          (
            select count(*)::int
            from applications a
            where a.job_id = j.id
          ) as "applicationCount"
        from jobs j
        join users u on u.id = j.employer_id
        where j.id = $1
        limit 1;
      `;
      const { rows } = await query(sql, [id]);
      const job = rows[0];
      if (!job) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Job not found" },
        });
      }

      res.json({ data: job });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
