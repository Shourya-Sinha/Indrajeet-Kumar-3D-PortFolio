import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne } from "@/lib/db/repository";
import { getGitHubActivity } from "@/lib/github/client";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const force = req.nextUrl.searchParams.get("refresh") === "1";
  const settings = await findOne("siteSettings", { settingsKey: "primary" });
  const data = await getGitHubActivity(settings?.githubUsername || "Shourya-Sinha", force);
  return NextResponse.json({ ok: true, data });
}
