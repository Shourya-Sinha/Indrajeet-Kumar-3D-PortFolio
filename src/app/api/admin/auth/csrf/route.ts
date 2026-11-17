import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/auth/security";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(CSRF_COOKIE_NAME)?.value || generateCsrfToken();
  const isSecure =
    req.headers.get("x-forwarded-proto") === "https" || req.nextUrl.protocol === "https:";
  const res = NextResponse.json({ ok: true, csrfToken: token });
  res.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: isSecure,
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
