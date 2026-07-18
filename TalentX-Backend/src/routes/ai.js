// src/routes/ai.js
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

// POST /ai/generate-jd
router.post(
  "/generate-jd",
  authRequired(),
  validate(
    z.object({
      body: z.object({
        title: z.string().trim().min(1).max(200),
        tech_stack: z.array(z.string().trim().min(1).max(50)).default([]),
      }),
      params: z.any().optional(),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { title, tech_stack } = req.validated.body;

      // If OPENAI_API_KEY exists you can plug in later; for now template is reliable and deterministic.
      const description = techStackJD(title, tech_stack);
      res.json({ data: { description } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /ai/match
router.post(
  "/match",
  authRequired(),
  validate(
    z.object({
      body: z.object({
        job: z.object({
          title: z.string().trim().min(1),
          tech_stack: z.array(z.string().trim().min(1)).default([]),
          description: z.string().trim().min(1),
          id: z.string().uuid().optional(),
          salary_min: z.number().optional().default(0),
          salary_max: z.number().optional().default(0),
          work_style_flags: z.array(z.string()).optional().default([]),
        }),
        talent: z.object({
          skills: z.array(z.string().trim().min(1)).optional().default([]),
          bio: z.string().trim().optional(),
          id: z.string().uuid().optional(),
          salary_min: z.number().optional().default(0),
          salary_max: z.number().optional().default(0),
          work_style_flags: z.array(z.string()).optional().default([]),
        }),
        store: z
          .object({
            job_id: z.string().uuid(),
            talent_id: z.string().uuid(),
          })
          .optional(),
      }),
      params: z.any().optional(),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { job, talent, store } = req.validated.body;

      let score;
      if (process.env.OPENAI_API_KEY) {
        score = await llmMatchScore(job, talent);
      } else {
        score = heuristicScore(job, talent);
      }

      // Optional store (upsert) if table exists; safe even if you don’t call it
      if (store?.job_id && store?.talent_id) {
        // If table is missing, this will throw; you can keep schema in place to avoid issues.
        await query(
          `
          insert into job_ai_scores (job_id, talent_id, score)
          values ($1, $2, $3)
          on conflict (job_id, talent_id)
          do update set score = excluded.score, created_at = now();
          `,
          [store.job_id, store.talent_id, score]
        );
      }

      res.json({ data: { score } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /ai/match-bulk
router.post(
  "/match-bulk",
  authRequired(),
  validate(
    z.object({
      body: z.object({
        matches: z.array(
          z.object({
            job: z.object({
              title: z.string().trim().min(1),
              tech_stack: z.array(z.string().trim().min(1)).default([]),
              description: z.string().trim().min(1).optional(),
              id: z.string().uuid().optional(),
              salary_min: z.number().optional().default(0),
              salary_max: z.number().optional().default(0),
              work_style_flags: z.array(z.string()).optional().default([]),
            }),
            talent: z.object({
              skills: z.array(z.string().trim().min(1)).optional().default([]),
              bio: z.string().trim().optional(),
              id: z.string().uuid().optional(),
              salary_min: z.number().optional().default(0),
              salary_max: z.number().optional().default(0),
              work_style_flags: z.array(z.string()).optional().default([]),
            }),
          })
        ).max(1000),
      }),
      params: z.any().optional(),
      query: z.any().optional(),
    })
  ),
  async (req, res, next) => {
    try {
      const { matches } = req.validated.body;

      const scores = await Promise.all(
        matches.map(async ({ job, talent }) => {
          if (process.env.OPENAI_API_KEY) {
            try {
              return await llmMatchScore(job, talent);
            } catch {
              return 50; // Fallback for bulk if LLM fails
            }
          }
          return heuristicScore(job, talent);
        })
      );

      res.json({ data: { scores } });
    } catch (err) {
      next(err);
    }
  }
);

function techStackJD(title, techStack) {
  const stack = techStack?.length ? techStack.join(", ") : "modern technologies";
  return [
    `## ${title}`,
    `We’re looking for a ${title} to join our team and build reliable, scalable features.`,
    ``,
    `### Tech stack`,
    `- ${stack}`,
    ``,
    `### Responsibilities`,
    `- Deliver features end-to-end (design → build → test → deploy)`,
    `- Write clean, maintainable code and APIs`,
    `- Collaborate across teams and ship iteratively`,
    ``,
    `### Requirements`,
    `- Strong fundamentals in software engineering`,
    `- Experience with ${stack}`,
    `- Ownership mindset and clear communication`,
  ].join("\n");
}

function heuristicScore(job, talent) {
  const jobSet = new Set((job.tech_stack || []).map((s) => s.toLowerCase()));
  const talentSet = new Set((talent.skills || []).map((s) => s.toLowerCase()));

  if (jobSet.size === 0) return 50; // neutral if no info

  let intersection = 0;
  for (const t of talentSet) {
    if (jobSet.has(t)) intersection += 1;
  }
  let ratio = intersection / jobSet.size;

  // Penalize for extreme salary mismatch if both provided
  if (job.salary_max > 0 && talent.salary_min > 0 && talent.salary_min > job.salary_max) {
    ratio *= 0.5; // 50% penalty
  }

  // Map ratio to 0..100 with baseline
  const score = Math.round(Math.min(100, Math.max(0, 20 + ratio * 80)));
  return score;
}

async function llmMatchScore(job, talent) {
  // Minimal OpenAI-compatible call (you can swap endpoints/models later).
  // IMPORTANT: This is intentionally strict about parsing an integer 0-100.
  const prompt = `
Return ONLY an integer from 0 to 100.

Job:
Title: ${job.title}
Tech: ${(job.tech_stack || []).join(", ")}
Description: ${job.description}
Budget: $${job.salary_min} - $${job.salary_max}
Culture: ${(job.work_style_flags || []).join(", ")}

Talent:
Skills: ${(talent.skills || []).join(", ")}
Bio: ${talent.bio || ""}
Expected Salary Min: $${talent.salary_min}
Work Style Preferences: ${(talent.work_style_flags || []).join(", ")}

Score the match (0-100). Penalize the score if the talent's Expected Salary Min is significantly higher than the Job's Budget Max. Penalize if the Work Style Preferences completely clash (e.g. Talent wants strictly Remote, Job is On-site).`;

  const resp = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: prompt,
    }),
  });

  if (!resp.ok) {
    throw Object.assign(new Error("LLM request failed"), {
      statusCode: 502,
      code: "LLM_ERROR",
      message: `LLM request failed with status ${resp.status}`,
    });
  }

  const data = await resp.json();
  const text =
    data?.output_text ||
    data?.output?.[0]?.content?.[0]?.text ||
    "";

  const m = String(text).match(/(\d{1,3})/);
  if (!m) return 50;

  const n = Math.max(0, Math.min(100, Number(m[1])));
  if (!Number.isFinite(n)) return 50;
  return n;
}

export default router;
