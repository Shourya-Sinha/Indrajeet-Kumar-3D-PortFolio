import nodemailer from "nodemailer";

export const DEFAULT_INQUIRY_EMAIL = "support@anantainfratechsolutions.com";
export const DEFAULT_GODADDY_SMTP_HOST = "smtpout.secureserver.net";
export const DEFAULT_GODADDY_SMTP_PORT = 465;

export interface InquiryEmailPayload {
  fullName: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  budget?: string;
  preferredContactMethod: string;
  description: string;
  adminRecipient?: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function resolveGoDaddySmtpConfig(adminRecipient?: string) {
  const host = process.env.SMTP_HOST?.trim() || DEFAULT_GODADDY_SMTP_HOST;
  const parsedPort = Number.parseInt(process.env.SMTP_PORT || String(DEFAULT_GODADDY_SMTP_PORT), 10);
  const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_GODADDY_SMTP_PORT;
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === "true" ? true : secureEnv === "false" ? false : port === 465;
  const user = process.env.SMTP_USER?.trim() || DEFAULT_INQUIRY_EMAIL;
  const pass = process.env.SMTP_PASS?.trim() || "";
  const fromEmail = process.env.SMTP_FROM?.trim() || user;
  const recipient =
    adminRecipient?.trim() ||
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    DEFAULT_INQUIRY_EMAIL;

  return { host, port, secure, user, pass, fromEmail, recipient };
}

export async function sendInquiryNotification(
  payload: InquiryEmailPayload
): Promise<{ status: "sent" | "logged_locally" | "failed"; detail: string }> {
  const config = resolveGoDaddySmtpConfig(payload.adminRecipient);
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

  const htmlBody = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:10px;background:#ffffff;color:#0f172a;">
      <h2 style="margin:0 0 12px;font-size:18px;color:#0284c7;">New Portfolio / Client Inquiry</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:6px 0;font-weight:bold;width:160px;">Full Name</td><td style="padding:6px 0;">${escapeHtml(payload.fullName)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;">Phone</td><td style="padding:6px 0;">${escapeHtml(payload.phone || "Not provided")}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;">Service Track</td><td style="padding:6px 0;">${escapeHtml(payload.serviceCategory)}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;">Budget</td><td style="padding:6px 0;">${escapeHtml(payload.budget || "Not specified")}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;">Preferred Contact</td><td style="padding:6px 0;">${escapeHtml(payload.preferredContactMethod)}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;" />
      <p style="margin:0 0 6px;font-weight:bold;font-size:14px;">Project Scope & Requirements:</p>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;color:#334155;">${escapeHtml(payload.description)}</div>
    </div>
  `.trim();

  if (!config.pass) {
    return {
      status: "logged_locally",
      detail: `Saved in database inquiry queue for ${config.recipient} (set SMTP_PASS in .env to enable live GoDaddy SMTP delivery via ${config.host}:${config.port}).`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    await transporter.sendMail({
      from: `"Shourya Sinha Portfolio" <${config.fromEmail}>`,
      to: config.recipient,
      replyTo: payload.email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return {
      status: "sent",
      detail: `Dispatched via GoDaddy SMTP (${config.host}:${config.port}) to ${config.recipient}.`,
    };
  } catch (err) {
    return {
      status: "failed",
      detail: `GoDaddy SMTP (${config.host}:${config.port}) error: ${(err as Error).message}`,
    };
  }
}
