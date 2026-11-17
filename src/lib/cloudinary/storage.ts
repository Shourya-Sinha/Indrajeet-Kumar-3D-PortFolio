import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_MIME_MAP: Record<string, { resourceType: "image" | "video" | "raw"; ext: string }> = {
  "image/jpeg": { resourceType: "image", ext: "jpg" },
  "image/png": { resourceType: "image", ext: "png" },
  "image/webp": { resourceType: "image", ext: "webp" },
  "image/gif": { resourceType: "image", ext: "gif" },
  "video/mp4": { resourceType: "video", ext: "mp4" },
  "video/webm": { resourceType: "video", ext: "webm" },
  "application/pdf": { resourceType: "raw", ext: "pdf" },
};

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    secure: true,
  });
}

export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  const headHex = buffer.subarray(0, 12).toString("hex");
  const headAscii = buffer.subarray(0, 5).toString("ascii");

  if (mimeType === "application/pdf") return headAscii === "%PDF-";
  if (mimeType === "image/png") return headHex.startsWith("89504e47");
  if (mimeType === "image/jpeg") return headHex.startsWith("ffd8ff");
  if (mimeType === "image/gif") return headAscii.startsWith("GIF8");
  if (mimeType === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mimeType === "video/mp4") {
    return buffer.subarray(4, 8).toString("ascii") === "ftyp";
  }
  if (mimeType === "video/webm") {
    return headHex.startsWith("1a45dfa3");
  }
  return false;
}

export function validateUploadBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): { valid: true; resourceType: "image" | "video" | "raw"; ext: string } | { valid: false; error: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "File is empty." };
  }
  if (buffer.length > MAX_FILE_BYTES) {
    return { valid: false, error: "File exceeds maximum allowed 15 MB size limit." };
  }
  const spec = ALLOWED_MIME_MAP[mimeType];
  if (!spec) {
    return {
      valid: false,
      error: `Unsupported file MIME type "${mimeType}". Allowed: PNG, JPG, WebP, GIF, MP4, WebM, PDF.`,
    };
  }
  if (!validateMagicBytes(buffer, mimeType)) {
    return {
      valid: false,
      error: `File signature for "${fileName}" does not match declared MIME type "${mimeType}".`,
    };
  }
  return { valid: true, resourceType: spec.resourceType, ext: spec.ext };
}

export function createCloudinarySignedParams(folder = "portfolio"): {
  configured: boolean;
  cloudName?: string;
  apiKey?: string;
  timestamp: number;
  folder: string;
  signature?: string;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "");
  if (!isCloudinaryConfigured()) {
    return { configured: false, timestamp, folder: safeFolder };
  }
  configureCloudinary();
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: safeFolder },
    process.env.CLOUDINARY_API_SECRET!.trim()
  );
  return {
    configured: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    apiKey: process.env.CLOUDINARY_API_KEY!.trim(),
    timestamp,
    folder: safeFolder,
    signature,
  };
}

export function verifyCloudinarySignature(params: Record<string, string | number>, signature: string): boolean {
  if (!isCloudinaryConfigured()) return false;
  const secret = process.env.CLOUDINARY_API_SECRET!.trim();
  const expected = cloudinary.utils.api_sign_request(params, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export interface StoredMediaResult {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  storageProvider: "cloudinary" | "local";
}

export async function uploadMediaBuffer(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
}): Promise<StoredMediaResult> {
  const checked = validateUploadBuffer(params.buffer, params.mimeType, params.fileName);
  if (!checked.valid) {
    throw new Error(checked.error);
  }
  const safeFolder = (params.folder || "portfolio").replace(/[^a-zA-Z0-9/_-]/g, "");
  const cleanName = params.fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/\.[^.]+$/, "");

  if (isCloudinaryConfigured()) {
    configureCloudinary();
    const res = await new Promise<{
      public_id: string;
      secure_url: string;
      resource_type: "image" | "video" | "raw";
      format: string;
      bytes: number;
      width?: number;
      height?: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `shourya-portfolio/${safeFolder}`,
          public_id: `${cleanName}-${Date.now()}`,
          resource_type: checked.resourceType,
          use_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) reject(error || new Error("Cloudinary upload failed."));
          else resolve(result as never);
        }
      );
      stream.end(params.buffer);
    });
    return {
      publicId: res.public_id,
      secureUrl: res.secure_url,
      resourceType: checked.resourceType,
      format: res.format || checked.ext,
      bytes: res.bytes || params.buffer.length,
      width: res.width,
      height: res.height,
      storageProvider: "cloudinary",
    };
  }

  // Local persistent upload store for dev/preview
  const uploadRoot = path.resolve(process.cwd(), "storage", "uploads", safeFolder);
  if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
  const uniqueName = `${cleanName}-${crypto.randomBytes(4).toString("hex")}.${checked.ext}`;
  const fullPath = path.join(uploadRoot, uniqueName);
  fs.writeFileSync(fullPath, params.buffer);

  return {
    publicId: `local/${safeFolder}/${uniqueName}`,
    secureUrl: `/api/media/files/${safeFolder}/${uniqueName}`,
    resourceType: checked.resourceType,
    format: checked.ext,
    bytes: params.buffer.length,
    storageProvider: "local",
  };
}

export async function deleteStoredMedia(
  publicId: string,
  storageProvider: "cloudinary" | "local",
  resourceType: "image" | "video" | "raw"
): Promise<void> {
  if (storageProvider === "cloudinary" && isCloudinaryConfigured()) {
    configureCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return;
  }
  if (publicId.startsWith("local/")) {
    const rel = publicId.replace(/^local\//, "");
    const target = path.resolve(process.cwd(), "storage", "uploads", rel);
    const root = path.resolve(process.cwd(), "storage", "uploads");
    if (target.startsWith(root) && fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  }
}
