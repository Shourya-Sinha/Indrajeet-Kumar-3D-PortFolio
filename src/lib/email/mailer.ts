import nodemailer from "nodemailer";

export interface InquiryEmailPayload {
  fullName: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  budget?: string;
  preferredContactMethod: string;
  description: string;
  adminRecipient: string;
}

export async function sendInquiryNotification(
  payload: InquiryEmailPayload
): Promise<{ status: "sent" | "logged_locally" | "failed"; detail: string }> {
  const subject = `[Portfolio Inquiry] ${payload.serviceCategory} — ${payload.fullName}`;
  const textBody = [
    `New Freelance / Client Inquiry Received`,
    `----------------------------------------`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "Not provided"}`,
    `Service Category: ${payload.serviceCategory}`,
    `Budget: ${payload.budget || "Not specified"}`,
    `Preferred Contact: ${payload.preferredContactMethod}`,
    ``,
    `Project Description:`,
    payload.description,
  ].join("\n");

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.SMTP_FROM?.trim() || "portfolio@shouryasinha.dev";

  if (resendKey) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.adminRecipient],
          reply_to: payload.email,
          subject,
          text: textBody,
        }),
      });
      if (resp.ok) {
        return { status: "sent", detail: "Dispatched via Resend API." };
      }
      const errText = await resp.text();
      return { status: "failed", detail: `Resend HTTP ${resp.status}: ${errText}` };
    } catch (err) {
      return { status: "failed", detail: (err as Error).message };
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  if (smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || "",
            }
          : undefined,
      });
      await transporter.sendMail({
        from: fromEmail,
        to: payload.adminRecipient,
        replyTo: payload.email,
        subject,
        text: textBody,
      });
      return { status: "sent", detail: "Dispatched via SMTP server." };
    } catch (err) {
      return { status: "failed", detail: (err as Error).message };
    }
  }

  return {
    status: "logged_locally",
    detail: "Saved in database inquiry queue (configure RESEND_API_KEY or SMTP_HOST to send external email).",
  };
}
