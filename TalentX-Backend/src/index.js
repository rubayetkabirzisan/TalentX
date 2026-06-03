// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ZodError } from "zod";

import jobsRoutes from "./routes/jobs.js";
import meRoutes from "./routes/me.js";
import employerRoutes from "./routes/employer.js";
import talentRoutes from "./routes/talent.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/jobs", jobsRoutes);
app.use("/me", meRoutes);
app.use("/employer", employerRoutes);
app.use("/talent", talentRoutes);
app.use("/ai", aiRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// Error handler (consistent JSON shape)
app.use((err, req, res, next) => {
  // Zod validation
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten(),
      },
    });
  }

  // Postgres unique violations, etc.
  const pgCode = err?.code;
  if (pgCode === "23505") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Resource conflict",
        details: err?.constraint || err?.detail || undefined,
      },
    });
  }

  const status = err?.statusCode || err?.status || 500;
  return res.status(status).json({
    error: {
      code: err?.code || "INTERNAL_ERROR",
      message: err?.message || "Unexpected server error",
      details: process.env.NODE_ENV === "production" ? undefined : String(err?.stack || err),
    },
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
