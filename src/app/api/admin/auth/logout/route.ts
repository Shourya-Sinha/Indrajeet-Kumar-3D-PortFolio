import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME, requireAdmin } from "@/lib/auth/security";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req, ["super_admin", "editor", "viewer"], { verifyCsrf: false });
  const response = NextResponse.json({
    ok: true,
    signedOut: auth.ok,
  });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  response.cookies.set(CSRF_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
