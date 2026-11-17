import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await context.params;
  const uploadRoot = path.resolve(process.cwd(), "storage", "uploads");
  const target = path.resolve(uploadRoot, ...segments);

  if (!target.startsWith(uploadRoot + path.sep) || !fs.existsSync(target)) {
    return NextResponse.json({ ok: false, error: "File not found." }, { status: 404 });
  }

  const ext = path.extname(target).toLowerCase();
  const mime = MIME_BY_EXT[ext] || "application/octet-stream";
  const bytes = fs.readFileSync(target);

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
