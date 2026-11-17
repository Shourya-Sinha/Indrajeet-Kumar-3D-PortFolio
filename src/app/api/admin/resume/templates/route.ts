import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne, findMany, updateById } from "@/lib/db/repository";
import { requireAdmin } from "@/lib/auth/security";

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const templates = await findMany("resumeTemplates", {});
  return NextResponse.json({ ok: true, data: templates });
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const auth = await requireAdmin(req, ["super_admin", "editor"]);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }
  const body = (await req.json()) as {
    _id?: string;
    key: string;
    name: string;
    description: string;
    accentColor: string;
    fontFamily: string;
    sectionOrder: string[];
    isDefault?: boolean;
  };
  if (body._id) {
    const updated = await updateById("resumeTemplates", body._id, {
      name: body.name,
      description: body.description,
      accentColor: body.accentColor,
      fontFamily: body.fontFamily,
      sectionOrder: body.sectionOrder,
      isDefault: Boolean(body.isDefault),
    });
    return NextResponse.json({ ok: true, data: updated });
  }
  const created = await createOne("resumeTemplates", {
    key: body.key,
    name: body.name,
    description: body.description,
    layout: "ats-single-column",
    accentColor: body.accentColor || "#1D549F",
    fontFamily: body.fontFamily || "Roboto",
    sectionOrder: body.sectionOrder || ["summary", "experience", "projects", "skills", "education", "certifications"],
    isDefault: Boolean(body.isDefault),
  });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
