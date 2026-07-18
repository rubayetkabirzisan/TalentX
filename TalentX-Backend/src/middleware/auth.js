// src/middleware/auth.js
import dotenv from "dotenv";
import { jwtVerify, createRemoteJWKSet } from "jose";
import { query } from "../db.js";

dotenv.config();

const AUTH_PROVIDER = (process.env.AUTH_PROVIDER || "none").toLowerCase();

/**
 * Modes:
 * - none: bypass auth (best for local MVP speed)
 * - header: fake auth via headers x-user-id and x-role
 * - clerk: real JWT verification via Clerk JWKS
 */

let JWKS = null;
let CLERK_ISSUER = undefined;
let CLERK_AUDIENCE = undefined;

if (AUTH_PROVIDER === "clerk") {
  if (!process.env.CLERK_JWKS_URL) {
    throw new Error("CLERK_JWKS_URL is required for Clerk JWT verification");
  }
  JWKS = createRemoteJWKSet(new URL(process.env.CLERK_JWKS_URL));
  CLERK_ISSUER = process.env.CLERK_ISSUER || undefined;
  CLERK_AUDIENCE = process.env.CLERK_AUDIENCE || undefined;
}

function attachUser(req, user) {
  req.user = {
    id: user.id ?? null,
    auth_provider_id: user.auth_provider_id ?? null,
    name: user.name ?? null,
    role: user.role ?? null,
    skills: user.skills ?? [],
  };
}

export function authRequired() {
  return async function authMiddleware(req, res, next) {
    try {
      // ✅ Mode 1: none (bypass)
      if (AUTH_PROVIDER === "none") {
        // Upsert the dev user into the DB so req.user.id always references
        // a real row. Previously this only faked req.user in memory, which
        // meant employer_id FK inserts (e.g. creating a job) failed on any
        // fresh database (like a new CI Postgres container) where this
        // hardcoded UUID had never actually been inserted.
        const devUserSql = `
          insert into users (id, auth_provider_id, name, role)
          values ($1, $2, $3, $4)
          on conflict (id) do update set
            name = coalesce(users.name, excluded.name),
            role = coalesce(users.role, excluded.role)
          returning id, auth_provider_id, name, role, skills;
        `;
        const { rows } = await query(devUserSql, [
          "00000000-0000-0000-0000-000000000001",
          "dev-user",
          "Dev User",
          "employer",
        ]);
        attachUser(req, rows[0]);
        return next();
      }

      // ✅ Mode 2: header (fake auth)
      if (AUTH_PROVIDER === "header") {
        const auth_provider_id = req.header("x-user-id");
        const role = req.header("x-role");
        const name = req.header("x-name") || null;

        if (!auth_provider_id || !role) {
          return res.status(401).json({
            error: {
              code: "UNAUTHORIZED",
              message: "Missing x-user-id or x-role headers",
            },
          });
        }

        // Optional: keep using DB users table (upsert) so rest of app works the same
        const upsertSql = `
          insert into users (auth_provider_id, name, role)
          values ($1, $2, $3)
          on conflict (auth_provider_id)
          do update set
            name = coalesce(users.name, excluded.name),
            role = coalesce(users.role, excluded.role)
          returning id, auth_provider_id, name, role, skills;
        `;
        const { rows } = await query(upsertSql, [auth_provider_id, name, role]);
        attachUser(req, rows[0]);

        return next();
      }

      // ✅ Mode 3: clerk (real JWT)
      if (AUTH_PROVIDER === "clerk") {
        const header = req.headers.authorization || "";
        const [scheme, token] = header.split(" ");

        if (scheme !== "Bearer" || !token) {
          return res.status(401).json({
            error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
          });
        }

        const verifyOpts = {};
        if (CLERK_ISSUER) verifyOpts.issuer = CLERK_ISSUER;
        if (CLERK_AUDIENCE) verifyOpts.audience = CLERK_AUDIENCE;

        const { payload } = await jwtVerify(token, JWKS, verifyOpts);

        const auth_provider_id = payload.sub;
        if (!auth_provider_id) {
          return res.status(401).json({
            error: { code: "UNAUTHORIZED", message: "Token missing subject (sub)" },
          });
        }

        const nameFromToken =
          payload.name ||
          payload.full_name ||
          payload.given_name ||
          payload.email ||
          null;

        const upsertSql = `
          insert into users (auth_provider_id, name)
          values ($1, $2)
          on conflict (auth_provider_id)
          do update set
            name = coalesce(users.name, excluded.name)
          returning id, auth_provider_id, name, role;
        `;
        const { rows } = await query(upsertSql, [auth_provider_id, nameFromToken]);
        attachUser(req, rows[0]);

        return next();
      }

      // Unknown provider
      return res.status(500).json({
        error: {
          code: "SERVER_MISCONFIG",
          message: `Unsupported AUTH_PROVIDER=${AUTH_PROVIDER}. Use none|header|clerk.`,
        },
      });
    } catch (err) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          details: process.env.NODE_ENV === "production" ? undefined : String(err?.message || err),
        },
      });
    }
  };
}

// Optional: role guard (use in routes)
export function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    const role = req.user?.role;
    if (!role) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Missing role" },
      });
    }
    if (!roles.includes(role)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: `Requires role: ${roles.join(" or ")}` },
      });
    }
    return next();
  };
}