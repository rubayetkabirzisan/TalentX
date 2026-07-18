// src/routes/employer.js
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

function isFutureDate(dateStr) {
  const d = new Date(dateStr);
  const endOfDay = d.getTime() + 24 * 60 * 60 * 1000 - 1;
  return Number.isFinite(d.getTime()) && endOfDay > Date.now();
}

// POST /employer/jobs
router.post(
  "/jobs",
  authRequired(),
  roleGuard("employer"),
  validate(
    z.object({
      body: z.object({
        title: z.string().trim().min(1).max(200),
        tech_stack: z.array(z.string().trim().min(1).max(50)).default([]),
        deadline: z.string().datetime(),
        description: z.string().trim().min(1).optional(),
        useAI: z.boolean().optional().default(false),
        salary_min: z.number().min(0).optional().default(0),
        salary_max: z.number().min(0).optional().default(0),
        work_style_flags: z.array(z.string()).optional().default([]),
      }),
      params: z.any().optional(),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { title, tech_stack, deadline, description, useAI, salary_min, salary_max, work_style_flags } = req.validated.body;

      if (!isFutureDate(deadline)) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "deadline must be a future datetime" },
        });
      }

      let finalDescription = description;
      if (useAI && !finalDescription) {
        // Internal generation (same logic as /ai/generate-jd)
        finalDescription = templateJD(title, tech_stack);
      }
      if (!finalDescription) {
        return res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "description is required unless useAI=true" },
        });
      }

      const sql = `
        insert into jobs (employer_id, title, tech_stack, deadline, description, salary_min, salary_max, work_style_flags)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning *;
      `;
      const { rows } = await query(sql, [
        req.user.id,
        title,
        tech_stack,
        deadline,
        finalDescription,
        salary_min,
        salary_max,
        JSON.stringify(work_style_flags)
      ]);

      res.status(201).json({ data: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// GET /employer/jobs/:id/applicants
router.get(
  "/jobs/:id/applicants",
  authRequired(),
  roleGuard("employer"),
  validate(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: z.any().optional(),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const jobId = req.validated.params.id;

      // Rule: Employer can only view applicants for their own jobs
      const owns = await query(`select 1 from jobs where id=$1 and employer_id=$2`, [
        jobId,
        req.user.id,
      ]);
      if (owns.rowCount === 0) {
        return res.status(403).json({
          error: { code: "FORBIDDEN", message: "Not allowed to view applicants for this job" },
        });
      }

      const sql = `
        select
          a.id,
          a.talent_id,
          u.name as talent_name,
          a.source,
          a.cover_letter,
          a.status,
          a.created_at as applied_at
        from applications a
        join users u on u.id = a.talent_id
        where a.job_id = $1
        order by a.created_at desc;
      `;
      const { rows } = await query(sql, [jobId]);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);


// GET /employer/jobs
router.get(
  "/jobs",
  authRequired(),
  roleGuard("employer"),
  async (req, res, next) => {
    try {
      const sql = `
        select
  j.id,
  j.employer_id,
  j.title,
  j.tech_stack,
  j.deadline,
  j.description,
  j.created_at,
  count(a.id)::int as applicant_count
from jobs j
left join applications a on a.job_id = j.id
where j.employer_id = $1
group by j.id
order by j.created_at desc;
      `;
      const { rows } = await query(sql, [req.user.id]);
      res.json({ data: rows });
    } catch (err) {
      next(err);
    }
  }
);
// POST /employer/jobs/:id/invite
router.post(
  "/jobs/:id/invite",
  authRequired(),
  roleGuard("employer"),
  validate(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ talent_id: z.string().uuid() }),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const jobId = req.validated.params.id;
      const { talent_id } = req.validated.body;

      const result = await withTransaction(async (client) => {
        // Ensure job belongs to employer
        const job = await client.query(
          `select id from jobs where id=$1 and employer_id=$2 for update`,
          [jobId, req.user.id]
        );
        if (job.rowCount === 0) {
          const e = new Error("Job not found or not owned by employer");
          e.statusCode = 403;
          e.code = "FORBIDDEN";
          throw e;
        }

        // Create invitation pending (unique handles duplicates)
        const ins = await client.query(
          `
          insert into invitations (job_id, talent_id, employer_id, status)
          values ($1, $2, $3, 'pending')
          on conflict (job_id, talent_id)
          do update set status = invitations.status
          returning id, job_id, talent_id, employer_id, status, created_at;
          `,
          [jobId, talent_id, req.user.id]
        );

        const invite = ins.rows[0];

        // Insert Notification
        const notifIns = await client.query(
          `
          insert into notifications (user_id, type, title, body)
          values ($1, 'invite', 'New Interview Invitation', 'An employer has invited you to interview for a job!')
          returning *;
          `,
          [talent_id]
        );

        return { invite, notification: notifIns.rows[0] };
      });

      // Emit WS event
      if (req.io) {
        req.io.to(talent_id).emit("new_notification", result.notification);
      }

      res.status(201).json({ data: result.invite });
    } catch (err) {
      next(err);
    }
  }
);

function templateJD(title, techStack) {
  const stack = techStack?.length ? techStack.join(", ") : "relevant technologies";
  return [
    `We are hiring a ${title}.`,
    ``,
    `### What you’ll do`,
    `- Build, test, and ship features with high ownership`,
    `- Collaborate with product/design to deliver user value`,
    `- Improve performance, reliability, and code quality`,
    ``,
    `### Requirements`,
    `- Hands-on experience with ${stack}`,
    `- Strong problem-solving and communication`,
    `- Comfort working with APIs and databases`,
    ``,
    `### Nice to have`,
    `- CI/CD and cloud experience`,
    `- Security and observability mindset`,
  ].join("\n");
}


// GET /employer/jobs/:id/invitations
router.get(
  "/jobs/:id/invitations",
  authRequired(),
  roleGuard("employer"),
  async (req, res, next) => {
    try {
      const jobId = req.params.id
      const sql = `
        select id, job_id, talent_id, status, created_at
        from invitations
        where job_id = $1 and employer_id = $2
        order by created_at desc;
      `
      const { rows } = await query(sql, [jobId, req.user.id])
      res.json({ data: rows })
    } catch (err) {
      next(err)
    }
  }
)

// POST /employer/jobs/:id/applicants/:appId/schedule
router.post(
  "/jobs/:id/applicants/:appId/schedule",
  authRequired(),
  roleGuard("employer"),
  validate(
    z.object({
      params: z.object({ id: z.string().uuid(), appId: z.string().uuid() }),
      body: z.object({
        timeslot: z.string().trim().min(1)
      })
    })
  ),
  async (req, res, next) => {
    try {
      const jobId = req.validated.params.id;
      const appId = req.validated.params.appId;
      const { timeslot } = req.validated.body;

      // Verify job ownership
      const owns = await query(`select 1 from jobs where id=$1 and employer_id=$2`, [
        jobId,
        req.user.id,
      ]);
      if (owns.rowCount === 0) {
        return res.status(403).json({ error: { message: "Not allowed" } });
      }

      // Update application status
      const sql = `
        UPDATE applications
        SET status = 'interviewing',
            cover_letter = COALESCE(cover_letter, '') || '\n\n---\nInterview Scheduled: ' || $1
        WHERE id = $2 AND job_id = $3
        RETURNING *;
      `;
      const { rows } = await query(sql, [timeslot, appId, jobId]);
      const app = rows[0];

      if (!app) {
        return res.status(404).json({ error: { message: "Application not found" } });
      }

      // Send notification
      const notifSql = `
        INSERT INTO notifications (user_id, type, title, body)
        VALUES ($1, 'interview', 'Interview Scheduled', $2)
        RETURNING *;
      `;
      const notif = await query(notifSql, [
        app.talent_id,
        `An employer has scheduled an interview with you for ${timeslot}.`
      ]);

      if (req.io) {
        req.io.to(app.talent_id).emit("new_notification", notif.rows[0]);
      }

      res.json({ data: app });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
