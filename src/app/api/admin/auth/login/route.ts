import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne, updateById } from "@/lib/db/repository";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  checkRateLimit,
  generateCsrfToken,
  getClientIp,
  hashIp,
  recordAuditLog,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth/security";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${hashIp(ip)}`, 10, 10 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please wait before retrying." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Invalid credentials." },
      { status: 400 }
    );
  }

  const user = await findOne("users", {
    email: parsed.data.email.trim().toLowerCase(),
    isActive: true,
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password." },
      { status: 401 }
    );
  }

  await updateById("users", user._id, { lastLoginAt: new Date().toISOString() });

  const token = await signSessionToken({
    sub: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  const csrf = generateCsrfToken();

  await recordAuditLog({
    actorId: user._id,
    actorEmail: user.email,
    action: "LOGIN",
    collectionName: "users",
    targetId: user._id,
    summary: `Administrator signed in (${user.role})`,
    ipAddress: ip,
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    csrfToken: csrf,
  });

  const isSecure =
    req.headers.get("x-forwarded-proto") === "https" || req.nextUrl.protocol === "https:";

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  response.cookies.set(CSRF_COOKIE_NAME, csrf, {
    httpOnly: false,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
