import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { deleteById, findOne, updateById } from "@/lib/db/repository";
import type { CollectionName, SiteSettingsDoc } from "@/lib/db/types";
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { collection, id } = await context.params;
  if (!ALLOWED_CMS_COLLECTIONS.has(collection as CollectionName)) {
    return NextResponse.json({ ok: false, error: "Unsupported collection." }, { status: 400 });
  }

  const name = collection as CollectionName;
  let patch: Record<string, unknown>;
  try {
    patch = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const existingBefore =
    name === "siteSettings"
      ? ((await findOne("siteSettings", { _id: id })) as SiteSettingsDoc | null)
      : null;

  try {
    const updated = await updateById(name, id, patch as never);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
    }

    let triggerResumeCheck = RESUME_RELEVANT_COLLECTIONS.has(name);

    // Sync profile <-> siteSettings contact metadata selectively
    if (name === "professionalProfiles") {
      const settings = await findOne("siteSettings", { settingsKey: "primary" });
      if (settings) {
        const p = updated as unknown as Record<string, string>;
        await updateById("siteSettings", settings._id, {
          contactEmail: p.email ?? settings.contactEmail,
          contactPhone: p.phone ?? settings.contactPhone,
          location: p.location ?? settings.location,
          githubUrl: p.githubUrl ?? settings.githubUrl,
          linkedinUrl: p.linkedinUrl ?? settings.linkedinUrl,
        });
      }
    } else if (name === "siteSettings" && existingBefore) {
      const nextSettings = updated as unknown as SiteSettingsDoc;
      const contactChanged =
        existingBefore.contactEmail !== nextSettings.contactEmail ||
        existingBefore.contactPhone !== nextSettings.contactPhone ||
        existingBefore.location !== nextSettings.location ||
        existingBefore.githubUrl !== nextSettings.githubUrl ||
        existingBefore.linkedinUrl !== nextSettings.linkedinUrl;
      if (contactChanged) {
        const profile = await findOne("professionalProfiles", { profileKey: "master" });
        if (profile) {
          await updateById("professionalProfiles", profile._id, {
            email: nextSettings.contactEmail,
            phone: nextSettings.contactPhone,
            location: nextSettings.location,
            githubUrl: nextSettings.githubUrl,
            linkedinUrl: nextSettings.linkedinUrl,
          });
        }
        triggerResumeCheck = true;
      }
    }

    await recordAuditLog({
      actorId: auth.user.sub,
      actorEmail: auth.user.email,
      action: "UPDATE",
      collectionName: name,
      targetId: id,
      summary: `Updated document ${id} in ${name}`,
      metadata: { updatedKeys: Object.keys(patch) },
      ipAddress: getClientIp(req),
    });

    if (triggerResumeCheck) {
      await onResumeRelevantContentChanged(`update:${name}:${id}`);
    }

    return NextResponse.json({ ok: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { collection, id } = await context.params;
  if (!ALLOWED_CMS_COLLECTIONS.has(collection as CollectionName)) {
    return NextResponse.json({ ok: false, error: "Unsupported collection." }, { status: 400 });
  }
  const name = collection as CollectionName;

  if (["siteSettings", "heroContent", "aboutContent", "professionalProfiles"].includes(name)) {
    return NextResponse.json(
      { ok: false, error: "Core singleton configuration records cannot be deleted." },
      { status: 400 }
    );
  }

  const deleted = await deleteById(name, id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }

  await recordAuditLog({
    actorId: auth.user.sub,
    actorEmail: auth.user.email,
    action: "DELETE",
    collectionName: name,
    targetId: id,
    summary: `Deleted document ${id} from ${name}`,
    ipAddress: getClientIp(req),
  });

  if (RESUME_RELEVANT_COLLECTIONS.has(name)) {
    await onResumeRelevantContentChanged(`delete:${name}:${id}`);
  }

  return NextResponse.json({ ok: true, deleted: true });
}
