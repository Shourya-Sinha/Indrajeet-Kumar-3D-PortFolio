import { NextRequest, NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne } from "@/lib/db/repository";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/auth/security";
import { contactInquirySchema } from "@/lib/validation/schemas";
import { DEFAULT_INQUIRY_EMAIL, sendInquiryNotification } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const ip = getClientIp(req);
  const ipHash = hashIp(ip);

  const rl = checkRateLimit(`contact:${ipHash}`, 8, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many inquiry submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = contactInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.errors[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  const adminRecipient =
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || DEFAULT_INQUIRY_EMAIL;

  const delivery = await sendInquiryNotification({
    ...parsed.data,
    adminRecipient,
  });

  const saved = await createOne("contactInquiries", {
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone || "",
    serviceCategory: parsed.data.serviceCategory,
    budget: parsed.data.budget || "",
    preferredContactMethod: parsed.data.preferredContactMethod,
    description: parsed.data.description,
    status: "new",
    adminNotes: "",
    emailDeliveryStatus: delivery.status,
    emailDeliveryDetail: delivery.detail,
    ipHash,
  });

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: saved._id,
        status: saved.status,
        emailDeliveryStatus: saved.emailDeliveryStatus,
      },
      message: "Inquiry received successfully. Shourya Sinha will respond shortly.",
    },
    { status: 201 }
  );
}
