import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne, findMany } from "@/lib/db/repository";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import {
  isCloudinaryConfigured,
  uploadMediaBuffer,
  verifyCloudinarySignature,
} from "@/lib/cloudinary/storage";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const assets = await findMany("mediaAssets", {}, { sort: { createdAt: -1 } });
  return NextResponse.json({
    ok: true,
    data: assets,
    cloudinaryConfigured: isCloudinaryConfigured(),
  });
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const contentType = req.headers.get("content-type") || "";

  // Branch 1: Register an already-signed direct Cloudinary client upload after signature verification
  if (contentType.includes("application/json")) {
    const body = (await req.json()) as {
      publicId: string;
      secureUrl: string;
      resourceType: "image" | "video" | "raw";
      format: string;
      fileName: string;
      folder?: string;
      altText: string;
      bytes?: number;
      width?: number;
      height?: number;
      version?: number;
      signature?: string;
    };

    if (!body.publicId || !body.secureUrl || !body.altText) {
      return NextResponse.json(
        { ok: false, error: "publicId, secureUrl, and altText are required." },
        { status: 400 }
      );
    }

    if (isCloudinaryConfigured() && body.signature && body.version) {
      const validSig = verifyCloudinarySignature(
        { public_id: body.publicId, version: body.version },
        body.signature
      );
      if (!validSig) {
        return NextResponse.json(
          { ok: false, error: "Cloudinary signature verification failed." },
          { status: 403 }
        );
      }
    }

    const asset = await createOne("mediaAssets", {
      publicId: body.publicId,
      secureUrl: body.secureUrl,
      resourceType: body.resourceType || "image",
      format: body.format || "png",
      fileName: body.fileName || "upload",
      folder: body.folder || "portfolio",
      altText: body.altText,
      bytes: body.bytes || 0,
      width: body.width,
      height: body.height,
      storageProvider: "cloudinary",
      uploadedBy: auth.user.email,
    });

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "MEDIA_REGISTER",
      collectionName: "mediaAssets",
      targetId: asset._id,
      summary: `Registered Cloudinary asset ${asset.fileName}`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true, data: asset }, { status: 201 });
  }

  // Branch 2: Multipart authenticated server upload with magic-byte validation
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Multipart 'file' field is required." }, { status: 400 });
  }

  const folder = String(form.get("folder") || "portfolio");
  const altText = String(form.get("altText") || file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const uploaded = await uploadMediaBuffer({
      buffer,
      fileName: file.name,
      mimeType: file.type,
      folder,
    });

    const asset = await createOne("mediaAssets", {
      publicId: uploaded.publicId,
      secureUrl: uploaded.secureUrl,
      resourceType: uploaded.resourceType,
      format: uploaded.format,
      fileName: file.name,
      folder,
      altText,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      storageProvider: uploaded.storageProvider,
      uploadedBy: auth.user.email,
    });

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "MEDIA_UPLOAD",
      collectionName: "mediaAssets",
      targetId: asset._id,
      summary: `Uploaded ${asset.fileName} (${asset.storageProvider})`,
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ ok: true, data: asset }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
