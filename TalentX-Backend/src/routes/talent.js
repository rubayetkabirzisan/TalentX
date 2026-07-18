// src/routes/talent.js
import express from "express";
import { z } from "zod";
import { authRequired } from "../middleware/auth.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { query, withTransaction } from "../db.js";

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

// POST /talent/jobs/:id/apply
router.post(
  "/jobs/:id/apply",
  authRequired(),
  roleGuard("talent"),
  validate(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ 
        source: z.enum(["manual", "invitation"]),
        cover_letter: z.string().optional()
      }),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const jobId = req.validated.params.id;
      const { source, cover_letter } = req.validated.body;

      const result = await withTransaction(async (client) => {
        // Lock job row to enforce deadline check safely
        const jobRes = await client.query(
          `select id, deadline from jobs where id=$1 for update`,
          [jobId]
        );
        if (jobRes.rowCount === 0) {
          const e = new Error("Job not found");
          e.statusCode = 404;
          e.code = "NOT_FOUND";
          throw e;
        }
        const job = jobRes.rows[0];

        // Rule: deadline check (cannot apply if now() > end of deadline day)
        const deadline = new Date(job.deadline);
        const endOfDeadlineDay = deadline.getTime() + 24 * 60 * 60 * 1000 - 1;
        if (Date.now() > endOfDeadlineDay) {
          const e = new Error("Application deadline has passed");
          e.statusCode = 400;
          e.code = "DEADLINE_PASSED";
          throw e;
        }

        // Rule: if source=invitation require pending invitation and accept it in same transaction
        if (source === "invitation") {
          const inv = await client.query(
            `
            select id, status
            from invitations
            where job_id=$1 and talent_id=$2
            for update
            `,
            [jobId, req.user.id]
          );
          if (inv.rowCount === 0 || inv.rows[0].status !== "pending") {
            const e = new Error("Pending invitation required to apply via invitation");
            e.statusCode = 400;
            e.code = "INVITATION_REQUIRED";
            throw e;
          }

          await client.query(
            `
            update invitations
            set status='accepted'
            where id=$1 and talent_id=$2 and status='pending'
            `,
            [inv.rows[0].id, req.user.id]
          );
        } else {
          // source=manual: no extra requirement
        }

        // Insert application
        const appRes = await client.query(
          `
          insert into applications (job_id, talent_id, source, cover_letter)
          values ($1, $2, $3, $4)
          returning *;
          `,
          [jobId, req.user.id, source, cover_letter || null]
        );

        return appRes.rows[0];
      });

      res.status(201).json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /talent/invitations
router.get(
  "/invitations",
  authRequired(),
  roleGuard("talent"),
  async (req, res, next) => {
    try {
      const sql = `
        select
          i.id,
          i.job_id,
          j.title as job_title,
          i.employer_id,
          u.name as employer_name,
          i.status,
          i.created_at
        from invitations i
        join jobs j on j.id = i.job_id
        join users u on u.id = i.employer_id
        where i.talent_id = $1
        order by i.created_at desc;
      `;
      const { rows } = await query(sql, [req.user.id]);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

// POST /talent/invitations/:id/respond
router.post(
  "/invitations/:id/respond",
  authRequired(),
  roleGuard("talent"),
  validate(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ action: z.enum(["accepted", "declined"]) }),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const invId = req.validated.params.id;
      const { action } = req.validated.body;

      // Rule: invitation status transitions only by talent, only pending -> accepted/declined
      const result = await withTransaction(async (client) => {
        const inv = await client.query(
          `
          select id, status, talent_id
          from invitations
          where id=$1
          for update
          `,
          [invId]
        );
        if (inv.rowCount === 0) {
          const e = new Error("Invitation not found");
          e.statusCode = 404;
          e.code = "NOT_FOUND";
          throw e;
        }
        if (inv.rows[0].talent_id !== req.user.id) {
          const e = new Error("Not allowed to respond to this invitation");
          e.statusCode = 403;
          e.code = "FORBIDDEN";
          throw e;
        }
        if (inv.rows[0].status !== "pending") {
          const e = new Error("Only pending invitations can be responded to");
          e.statusCode = 400;
          e.code = "INVALID_STATE";
          throw e;
        }

        const upd = await client.query(
          `
          update invitations
          set status = $1
          where id=$2 and talent_id=$3 and status='pending'
          returning id, job_id, talent_id, employer_id, status, created_at;
          `,
          [action, invId, req.user.id]
        );

        return upd.rows[0];
      });

      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

// GET /talent/applications
router.get(
  "/applications",
  authRequired(),
  roleGuard("talent"),
  async (req, res, next) => {
    try {
      const sql = `
        select
          a.id,
          a.job_id,
          j.title as job_title,
          j.employer_id,
          u.name as employer_name,
          a.source,
          a.status,
          a.cover_letter,
          a.created_at
        from applications a
        join jobs j on j.id = a.job_id
        join users u on u.id = j.employer_id
        where a.talent_id = $1
        order by a.created_at desc;
      `;
      const { rows } = await query(sql, [req.user.id]);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
