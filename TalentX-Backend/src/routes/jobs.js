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

router.get("/", async (req, res, next) => {
  try {
    const { search } = req.query
    const sql = `
      select
        j.id,
        j.title,
        j.tech_stack,
        j.deadline,
        j.description,
        j.employer_id,
        j.created_at,
        u.name as employer_name,
        count(a.id)::int as application_count
      from jobs j
      left join users u on u.id = j.employer_id
      left join applications a on a.job_id = j.id
      where j.deadline > NOW() ${search ? `and (j.title ilike $1 or j.description ilike $1)` : ''}
      group by j.id, u.name
      order by j.created_at desc;
    `
    const params = search ? [`%${search}%`] : []
    const { rows } = await query(sql, params)
    res.json({ data: rows })
  } catch (err) {
    next(err)
  }
});

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
