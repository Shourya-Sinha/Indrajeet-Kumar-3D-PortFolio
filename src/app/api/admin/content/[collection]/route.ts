import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import {
  bulkReorder,
  createOne,
  findMany,
  findOne,
  updateById,
} from "@/lib/db/repository";
import type { CollectionName } from "@/lib/db/types";
import { getClientIp, recordAuditLog, requireAdmin } from "@/lib/auth/security";
import { onResumeRelevantContentChanged } from "@/lib/resume/service";

const ALLOWED_CMS_COLLECTIONS = new Set<CollectionName>([
  "siteSettings",
  "heroContent",
  "aboutContent",
  "experiences",
  "services",
  "projects",
  "certifications",
  "education",
  "skills",
  "freelanceServices",
  "contactInquiries",
  "seoMetadata",
  "navigationItems",
  "professionalProfiles",
]);

const RESUME_RELEVANT_COLLECTIONS = new Set<CollectionName>([
  "experiences",
  "projects",
  "skills",
  "education",
  "certifications",
  "professionalProfiles",
]);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { collection } = await context.params;
  if (!ALLOWED_CMS_COLLECTIONS.has(collection as CollectionName)) {
    return NextResponse.json({ ok: false, error: "Unsupported collection." }, { status: 400 });
  }

  const name = collection as CollectionName;
  const sortField: Record<string, 1 | -1> =
    name === "contactInquiries" ? { createdAt: -1 } : { order: 1, createdAt: -1 };
  const rows = await findMany(name, {}, { sort: sortField });
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { collection } = await context.params;
  if (!ALLOWED_CMS_COLLECTIONS.has(collection as CollectionName)) {
    return NextResponse.json({ ok: false, error: "Unsupported collection." }, { status: 400 });
  }

  const name = collection as CollectionName;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const ip = getClientIp(req);

  if (body.action === "reorder" && Array.isArray(body.orderedIds)) {
    const ids = body.orderedIds.map(String);
    await bulkReorder(name, ids);
    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "REORDER",
      collectionName: name,
      targetId: "batch",
      summary: `Reordered ${ids.length} item(s) in ${name}`,
      metadata: { orderedIds: ids },
      ipAddress: ip,
    });
    return NextResponse.json({ ok: true, message: "Order updated." });
  }

  try {
    const created = await createOne(name, body as never);

    if (name === "professionalProfiles") {
      const settings = await findOne("siteSettings", { settingsKey: "primary" });
      if (settings) {
        await updateById("siteSettings", settings._id, {
          contactEmail: String(body.email || settings.contactEmail),
          contactPhone: String(body.phone || settings.contactPhone),
          location: String(body.location || settings.location),
          githubUrl: String(body.githubUrl || settings.githubUrl),
          linkedinUrl: String(body.linkedinUrl || settings.linkedinUrl),
        });
      }
    }

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "CREATE",
      collectionName: name,
      targetId: String(created._id),
      summary: `Created item in ${name}`,
      ipAddress: ip,
    });

    if (RESUME_RELEVANT_COLLECTIONS.has(name)) {
      await onResumeRelevantContentChanged(`create:${name}`);
    }

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}
