import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne, findOne } from "@/lib/db/repository";
import { getClientIp, hashIp } from "@/lib/auth/security";
import type { ResumeProfileType } from "@/lib/db/types";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ version: string; format: string }> }
) {
  await ensureDatabaseSeeded();
  const { version, format } = await context.params;
  const decodedVersion = decodeURIComponent(version);
  const cleanFormat = format.toLowerCase();

  if (cleanFormat !== "pdf" && cleanFormat !== "docx") {
    return NextResponse.json({ ok: false, error: "Format must be pdf or docx." }, { status: 400 });
  }

  const profileType = (req.nextUrl.searchParams.get("profile") || "general") as ResumeProfileType;
  const record = await findOne("resumeVersions", {
    profileType,
    version: decodedVersion,
    isPublic: true,
    status: "published",
  });

  if (!record) {
    return NextResponse.json({ ok: false, error: "Published resume version not found." }, { status: 404 });
  }

  const filePath = cleanFormat === "pdf" ? record.pdfStoragePath : record.docxStoragePath;
  if (!filePath || !fs.existsSync(filePath)) {
    return NextResponse.json({ ok: false, error: "Resume file artifact missing on storage." }, { status: 404 });
  }

  const bytes = fs.readFileSync(filePath);
  const inline = req.nextUrl.searchParams.get("inline") === "1";
  const fileName = `Shourya_Sinha_${profileType}_Resume_${record.version}.${cleanFormat}`;

  await createOne("resumeDownloadLogs", {
    version: record.version,
    profileType,
    format: cleanFormat,
    sourceRoute: req.nextUrl.searchParams.get("source") || "/resume",
    userAgent: req.headers.get("user-agent") || "",
    ipHash: hashIp(getClientIp(req)),
    downloadedAt: new Date().toISOString(),
  });

  const mimeType =
    cleanFormat === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": mimeType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${inline && cleanFormat === "pdf" ? "inline" : "attachment"}; filename="${fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
