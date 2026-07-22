// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { ZodError } from "zod";
import talentsRouter from "./routes/users.js"
import jobsRoutes from "./routes/jobs.js";
import meRoutes from "./routes/me.js";
import employerRoutes from "./routes/employer.js";
import talentRoutes from "./routes/talent.js";
import aiRoutes from "./routes/ai.js";
import statsRoutes from "./routes/stats.js";
import authRoutes from "./routes/auth.js";
import messagesRoutes from "./routes/messages.js";
import notificationsRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();

// ─── CORS — restrict to configured origins only ───────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3001")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ─── WebSockets (Socket.IO) ──────────────────────────────────────────────────
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected via WebSocket:", socket.id);

  socket.on("join", (userId) => {
    // Users join a room with their userId so we can easily emit to them
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Attach io to req object so routes can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Rate Limiting ────────────────────────────────────────────────────────
// Was stripped out during earlier local test debugging (previously just a
// comment here saying "removed for tests"), which meant the API had no rate
// limiting at all — in production too, not just in tests. Scoped to specific
// routes rather than app.use() globally, so it can't collide with the rest
// of the E2E suite, which shares one IP with these on the CI runner.
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again shortly." },
  });
};

// Key by the authenticated identity, not by IP. IP-based keying meant every
// test account (and real users behind a shared NAT/proxy in production)
// shared one counter — as the local test suite grew, legitimate traffic
// from unrelated test accounts started tripping the limit meant for a
// single dedicated burst test, breaking a real feature (/api/talent/feed)
// as collateral damage. This middleware runs before authRequired() resolves
// req.user, so in "header" mode we key off the raw x-user-id header
// directly; in "clerk"/"none" mode (no such header) this falls back to
// req.ip, matching the previous, safe production behavior.
const rateLimitKey = (req) => req.header("x-user-id") || ipKeyGenerator(req.ip);

const meLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: rateLimitHandler,
});

const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: rateLimitKey,
  handler: rateLimitHandler,
});

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/jobs", jobsRoutes);
app.use("/me", meLimiter, meRoutes);      // onboard endpoint gets strict limit
app.use("/employer", employerRoutes);
app.use("/talent", talentRoutes);
app.use("/ai", aiLimiter, aiRoutes);      // AI endpoints are expensive — rate-limit hard
app.use("/talents", talentsRouter);
app.use("/stats", statsRoutes);
app.use("/auth", authRoutes);
app.use("/messages", messagesRoutes);
app.use("/notifications", notificationsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === "production";

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
        details: isProd ? undefined : (err?.constraint || err?.detail || undefined),
      },
    });
  }

  const status = err?.statusCode || err?.status || 500;
  return res.status(status).json({
    error: {
      code: err?.code || "INTERNAL_ERROR",
      message: err?.message || "Unexpected server error",
      // Stack traces NEVER exposed in production
      details: isProd ? undefined : String(err?.stack || err),
    },
  });
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`API + WebSockets listening on port ${PORT} [env: ${process.env.NODE_ENV || "development"}]`);
});