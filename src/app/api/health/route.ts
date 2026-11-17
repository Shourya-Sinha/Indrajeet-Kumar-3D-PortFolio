import { NextResponse } from "next/server";
import { ensureDbConnected } from "@/lib/db/connection";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { isCloudinaryConfigured } from "@/lib/cloudinary/storage";

export async function GET() {
  const mode = await ensureDbConnected();
  await ensureDatabaseSeeded();
  return NextResponse.json({
    ok: true,
    status: "healthy",
    dbMode: mode,
    cloudinaryConfigured: isCloudinaryConfigured(),
    timestamp: new Date().toISOString(),
  });
}
