import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { ResumeSnapshot } from "@/lib/db/types";

const ROYAL_BLUE = "#1D549F";
const TEXT_DARK = "#111827";
const TEXT_MUTED = "#374151";
const MARGIN_X = 46;
const MARGIN_Y = 44;
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function resolveFontPaths() {
  const fontDir = path.resolve(process.cwd(), "src", "lib", "resume", "fonts");
  const regular = path.join(fontDir, "Roboto-Regular.ttf");
  const bold = path.join(fontDir, "Roboto-Medium.ttf");
  const italic = path.join(fontDir, "Roboto-Italic.ttf");
  const boldItalic = path.join(fontDir, "Roboto-MediumItalic.ttf");
  return {
    hasEmbedded: fs.existsSync(regular) && fs.existsSync(bold),
    regular,
    bold,
    italic,
    boldItalic,
  };
}

function cleanUrlLabel(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export async function generateAtsResumePdfBuffer(
  snapshot: ResumeSnapshot,
  options?: { accentColor?: string }
): Promise<Buffer> {
  const accent = options?.accentColor || ROYAL_BLUE;
  const fonts = resolveFontPaths();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: MARGIN_Y, bottom: MARGIN_Y, left: MARGIN_X, right: MARGIN_X },
      info: {
        Title: `${snapshot.profile.fullName} - Resume`,
        Author: snapshot.profile.fullName,
        Subject: snapshot.profile.headline,
        Keywords: "Software Engineer, Full Stack Developer, Resume",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (fonts.hasEmbedded) {
      doc.registerFont("Body", fonts.regular);
      doc.registerFont("Bold", fonts.bold);
      doc.registerFont("Italic", fonts.italic);
      doc.registerFont("BoldItalic", fonts.boldItalic);
    } else {
      doc.registerFont("Body", "Helvetica");
      doc.registerFont("Bold", "Helvetica-Bold");
      doc.registerFont("Italic", "Helvetica-Oblique");
      doc.registerFont("BoldItalic", "Helvetica-BoldOblique");
    }

    const bottomLimit = PAGE_HEIGHT - MARGIN_Y;

    const ensureSpace = (neededHeight: number) => {
      if (doc.y + neededHeight > bottomLimit) {
        doc.addPage();
      }
    };

    const drawSectionHeader = (title: string) => {
      ensureSpace(125);
      doc.moveDown(0.45);
      doc
        .font("Bold")
        .fontSize(10.5)
        .fillColor(accent)
        .text(title.toUpperCase(), MARGIN_X, doc.y, { width: CONTENT_WIDTH });
      const ruleY = doc.y + 1.5;
      doc
        .moveTo(MARGIN_X, ruleY)
        .lineTo(MARGIN_X + CONTENT_WIDTH, ruleY)
        .lineWidth(0.9)
        .strokeColor(accent)
        .stroke();
      doc.y = ruleY + 5;
    };

    const drawBullet = (text: string) => {
      doc.font("Body").fontSize(9.2);
      const h = doc.heightOfString(text, { width: CONTENT_WIDTH - 14 });
      ensureSpace(h + 4);
      const startY = doc.y;
      doc.fillColor(TEXT_DARK).text("•", MARGIN_X + 3, startY, { lineBreak: false });
      doc.text(text, MARGIN_X + 14, startY, {
        width: CONTENT_WIDTH - 14,
        align: "left",
        lineGap: 1.2,
      });
      doc.y = Math.max(doc.y, startY + h) + 2;
    };

    // 1. Header — Centered Name, Headline, Contact & Hyperlinks
    doc
      .font("Bold")
      .fontSize(19)
      .fillColor(TEXT_DARK)
      .text(snapshot.profile.fullName.toUpperCase(), MARGIN_X, MARGIN_Y, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc.moveDown(0.1);
    doc
      .font("Bold")
      .fontSize(10)
      .fillColor(accent)
      .text(snapshot.profile.headline, MARGIN_X, doc.y, {
        width: CONTENT_WIDTH,
        align: "center",
      });

    doc.moveDown(0.2);
    const contactSegments: Array<{ label: string; link?: string }> = [
      { label: snapshot.profile.phone },
      { label: snapshot.profile.email, link: `mailto:${snapshot.profile.email}` },
      { label: snapshot.profile.location },
      {
        label: cleanUrlLabel(snapshot.profile.githubUrl),
        link: normalizeUrl(snapshot.profile.githubUrl),
      },
      {
        label: cleanUrlLabel(snapshot.profile.linkedinUrl),
        link: normalizeUrl(snapshot.profile.linkedinUrl),
      },
    ];

    doc.font("Body").fontSize(8.8).fillColor(TEXT_MUTED);
    const contactLine = contactSegments.map((s) => s.label).join("  |  ");
    doc.text(contactLine, MARGIN_X, doc.y, {
      width: CONTENT_WIDTH,
      align: "center",
      lineGap: 1.5,
    });

    // Clickable link annotations on top/inline metadata row
    const linkRowY = doc.y + 1;
    doc.font("Body").fontSize(8);
    const ghLabel = "GitHub Profile";
    const liLabel = "LinkedIn Profile";
    const ghW = doc.widthOfString(ghLabel);
    const liW = doc.widthOfString(liLabel);
    const totalLinksW = ghW + 24 + liW;
    const linksStartX = MARGIN_X + (CONTENT_WIDTH - totalLinksW) / 2;
    doc.fillColor(accent).text(ghLabel, linksStartX, linkRowY, {
      lineBreak: false,
      underline: false,
    });
    doc.link(linksStartX, linkRowY, ghW, 11, normalizeUrl(snapshot.profile.githubUrl));
    doc.fillColor(TEXT_MUTED).text("  •  ", linksStartX + ghW, linkRowY, { lineBreak: false });
    doc.fillColor(accent).text(liLabel, linksStartX + ghW + 18, linkRowY, {
      lineBreak: false,
      underline: false,
    });
    doc.link(linksStartX + ghW + 18, linkRowY, liW, 11, normalizeUrl(snapshot.profile.linkedinUrl));
    doc.y = linkRowY + 12;

    // 2. Professional Summary
    drawSectionHeader("PROFESSIONAL SUMMARY");
    doc.font("Body").fontSize(9.2).fillColor(TEXT_DARK);
    const summaryH = doc.heightOfString(snapshot.profile.summary, { width: CONTENT_WIDTH });
    ensureSpace(summaryH + 6);
    doc.text(snapshot.profile.summary, MARGIN_X, doc.y, {
      width: CONTENT_WIDTH,
      align: "left",
      lineGap: 1.5,
    });
    doc.moveDown(0.25);

    // 3. Professional Experience
    drawSectionHeader("PROFESSIONAL EXPERIENCE");
    for (const exp of snapshot.experiences) {
      const dateRange = exp.startDate ? `${exp.startDate} – ${exp.endDate}` : exp.endDate;
      const firstBullet = exp.responsibilities[0] || "";
      doc.font("Body").fontSize(9.2);
      const firstBulletH = firstBullet ? doc.heightOfString(firstBullet, { width: CONTENT_WIDTH - 14 }) : 0;
      ensureSpace(34 + firstBulletH);

      const roleY = doc.y;
      doc.font("Bold").fontSize(10).fillColor(TEXT_DARK).text(exp.role, MARGIN_X, roleY, {
        width: CONTENT_WIDTH * 0.72,
      });
      doc
        .font("Body")
        .fontSize(9.2)
        .fillColor(TEXT_MUTED)
        .text(dateRange, MARGIN_X, roleY + 0.5, {
          width: CONTENT_WIDTH,
          align: "right",
        });

      const companyLine = exp.location ? `${exp.company} · ${exp.location}` : exp.company;
      doc
        .font("Italic")
        .fontSize(9.2)
        .fillColor(TEXT_MUTED)
        .text(companyLine, MARGIN_X, roleY + 13, { width: CONTENT_WIDTH });

      doc.y = roleY + 26;
      for (const bullet of exp.responsibilities) {
        drawBullet(bullet);
      }
      doc.moveDown(0.3);
    }

    // 4. Featured Projects
    if (snapshot.projects.length > 0) {
      drawSectionHeader("FEATURED PROJECTS");
      for (const proj of snapshot.projects) {
        const stackStr = `Stack: ${proj.stack.join(", ")}`;
        doc.font("Body").fontSize(9.2);
        const firstBulletH = proj.bullets[0]
          ? doc.heightOfString(proj.bullets[0], { width: CONTENT_WIDTH - 14 })
          : 0;
        ensureSpace(32 + firstBulletH);

        const titleY = doc.y;
        doc.font("Bold").fontSize(10).fillColor(TEXT_DARK).text(proj.title, MARGIN_X, titleY, {
          width: CONTENT_WIDTH,
        });
        doc
          .font("Italic")
          .fontSize(9)
          .fillColor(TEXT_MUTED)
          .text(stackStr, MARGIN_X, doc.y + 1, { width: CONTENT_WIDTH });
        doc.y += 3;

        for (const b of proj.bullets) {
          drawBullet(b);
        }
        doc.moveDown(0.3);
      }
    }

    // 5. Technical Skills
    if (snapshot.skillGroups.length > 0) {
      drawSectionHeader("TECHNICAL SKILLS");
      for (const group of snapshot.skillGroups) {
        const line = `${group.category}: ${group.items.join(", ")}`;
        doc.font("Body").fontSize(9.2);
        const h = doc.heightOfString(line, { width: CONTENT_WIDTH });
        ensureSpace(h + 4);
        doc.font("Bold").fontSize(9.2).fillColor(TEXT_DARK).text(`${group.category}: `, MARGIN_X, doc.y, {
          continued: true,
        });
        doc.font("Body").fontSize(9.2).fillColor(TEXT_DARK).text(group.items.join(", "), {
          width: CONTENT_WIDTH,
          lineGap: 1.3,
        });
        doc.y += 2;
      }
      doc.moveDown(0.2);
    }

    // 6. Education
    if (snapshot.education.length > 0) {
      drawSectionHeader("EDUCATION");
      for (const ed of snapshot.education) {
        const lineLeft = `${ed.degree} | ${ed.institution}`;
        const lineRight = ed.gpa ? `${ed.dates} | GPA: ${ed.gpa}` : ed.dates;
        ensureSpace(18);
        const y = doc.y;
        doc.font("Bold").fontSize(9.4).fillColor(TEXT_DARK).text(lineLeft, MARGIN_X, y, {
          continued: true,
        });
        doc.font("Body").fontSize(9.2).fillColor(TEXT_MUTED).text(`  ${lineRight}`, {
          width: CONTENT_WIDTH,
        });
        doc.y = Math.max(doc.y, y + 13) + 2;
      }
    }

    // 7. Certifications
    if (snapshot.certifications.length > 0) {
      drawSectionHeader("CERTIFICATIONS");
      for (const cert of snapshot.certifications) {
        const locPart = cert.location ? `, ${cert.location}` : "";
        const credPart = cert.credentialId ? ` [ID: ${cert.credentialId}]` : "";
        drawBullet(`${cert.title} – ${cert.issuer}${locPart} (${cert.issueDate})${credPart}`);
      }
    }

    doc.end();
  });
}
