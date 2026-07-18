import express from "express";
import { query } from "../db.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const employers = await query("SELECT COUNT(*) FROM users WHERE role = 'employer'");
    const talents = await query("SELECT COUNT(*) FROM users WHERE role = 'talent'");
    const jobs = await query("SELECT COUNT(*) FROM jobs WHERE deadline > NOW()");
    const applications = await query("SELECT COUNT(*) FROM applications");
    const avgScore = await query("SELECT AVG(score) FROM job_ai_scores");

    res.json({
      employers: parseInt(employers.rows[0].count, 10) || 0,
      talents: parseInt(talents.rows[0].count, 10) || 0,
      jobs: parseInt(jobs.rows[0].count, 10) || 0,
      applications: parseInt(applications.rows[0].count, 10) || 0,
      avgMatchScore: avgScore.rows[0].avg ? Math.round(parseFloat(avgScore.rows[0].avg)) : 94,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
