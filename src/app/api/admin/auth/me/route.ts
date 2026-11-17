import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { CSRF_COOKIE_NAME, generateCsrfToken, requireAdmin } from "@/lib/auth/security";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const csrf = req.cookies.get(CSRF_COOKIE_NAME)?.value || generateCsrfToken();
  const res = NextResponse.json({
    ok: true,
    user: auth.user,
    csrfToken: csrf,
  });
  if (!req.cookies.get(CSRF_COOKIE_NAME)?.value) {
    res.cookies.set(CSRF_COOKIE_NAME, csrf, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "1",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return res;
}
