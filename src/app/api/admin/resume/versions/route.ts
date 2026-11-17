import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const profileType = req.nextUrl.searchParams.get("profile") || "general";
  const [versions, downloadLogs] = await Promise.all([
    findMany(
      "resumeVersions",
      { profileType },
      { sort: { major: -1, minor: -1, patch: -1 } }
    ),
    findMany("resumeDownloadLogs", { profileType }),
  ]);

  const countMap = new Map<string, { pdf: number; docx: number }>();
  for (const log of downloadLogs) {
    const entry = countMap.get(log.version) || { pdf: 0, docx: 0 };
    if (log.format === "pdf") entry.pdf += 1;
    else entry.docx += 1;
    countMap.set(log.version, entry);
  }

  return NextResponse.json({
    ok: true,
    data: versions.map((v) => ({
      ...v,
      downloads: countMap.get(v.version) || { pdf: 0, docx: 0 },
    })),
  });
}
