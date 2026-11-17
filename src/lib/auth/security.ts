import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { createOne, findOne } from "@/lib/db/repository";
import type { UserDoc, UserRole } from "@/lib/db/types";

export const SESSION_COOKIE_NAME = "ss_admin_session";
export const CSRF_COOKIE_NAME = "ss_admin_csrf";

function resolveAuthSecret(): Uint8Array {
  const envSecret = process.env.AUTH_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return new TextEncoder().encode(envSecret);
  }
  const secretFile = path.resolve(process.cwd(), "storage", "db", ".runtime-auth-secret");
  const dir = path.dirname(secretFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(secretFile)) {
    return new TextEncoder().encode(fs.readFileSync(secretFile, "utf8").trim());
  }
  const generated = crypto.randomBytes(48).toString("hex");
  fs.writeFileSync(secretFile, generated, { mode: 0o600 });
  return new TextEncoder().encode(generated);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionClaims {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function signSessionToken(claims: SessionClaims): Promise<string> {
  return new SignJWT({
    email: claims.email,
    name: claims.name,
    role: claims.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(resolveAuthSecret());
}

export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, resolveAuthSecret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name || ""),
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export async function getSessionFromCookies(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims) return null;
  const user = await findOne("users", { _id: claims.sub, isActive: true });
  if (!user) return null;
  return {
    sub: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function requireAdmin(
  req: NextRequest,
  allowedRoles: UserRole[] = ["super_admin", "editor", "viewer"],
  options?: { verifyCsrf?: boolean }
): Promise<{ ok: true; user: SessionClaims } | { ok: false; status: number; error: string }> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const claims = await verifySessionToken(token);
  if (!claims) {
    return { ok: false, status: 401, error: "Session expired or invalid." };
  }

  const dbUser: UserDoc | null = await findOne("users", { _id: claims.sub, isActive: true });
  if (!dbUser) {
    return { ok: false, status: 401, error: "Account disabled or not found." };
  }

  if (!allowedRoles.includes(dbUser.role)) {
    return { ok: false, status: 403, error: "Insufficient permissions for this action." };
  }

  const method = req.method.toUpperCase();
  const shouldVerifyCsrf =
    options?.verifyCsrf !== false && ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (shouldVerifyCsrf) {
    const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    const csrfHeader = req.headers.get("x-csrf-token");
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return { ok: false, status: 403, error: "Invalid or missing CSRF token." };
    }
  }

  return {
    ok: true,
    user: {
      sub: dbUser._id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    },
  };
}

// Sliding window rate limiter
const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  const timestamps = (rateBuckets.get(key) ?? []).filter((ts) => ts > cutoff);
  if (timestamps.length >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((timestamps[0] + windowMs - now) / 1000));
    rateBuckets.set(key, timestamps);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function recordAuditLog(params: {
  actorId: string;
  actorEmail: string;
  action: string;
  collectionName: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  await createOne("auditLogs", {
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: params.action,
    collectionName: params.collectionName,
    targetId: params.targetId,
    summary: params.summary,
    metadata: params.metadata || {},
    ipAddress: params.ipAddress || "system",
  });
}
