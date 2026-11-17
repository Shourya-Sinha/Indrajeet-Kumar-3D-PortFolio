import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { ResumeSnapshot } from "@/lib/db/types";

const ROYAL_BLUE_HEX = "1D549F";
const DARK_HEX = "111827";
const MUTED_HEX = "4B5563";

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function createSectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 90 },
    border: {
      bottom: {
        color: ROYAL_BLUE_HEX,
        space: 3,
        style: BorderStyle.SINGLE,
        size: 8,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 22,
        color: ROYAL_BLUE_HEX,
        font: "Calibri",
      }),
    ],
  });
}

function createBullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 30, after: 45 },
    children: [
      new TextRun({
        text,
        size: 20,
        color: DARK_HEX,
        font: "Calibri",
      }),
    ],
  });
}

export async function generateAtsResumeDocxBuffer(snapshot: ResumeSnapshot): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Header Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: snapshot.profile.fullName.toUpperCase(),
          bold: true,
          size: 36,
          color: DARK_HEX,
          font: "Calibri",
        }),
      ],
    })
  );

  // Headline
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: snapshot.profile.headline,
          bold: true,
          size: 21,
          color: ROYAL_BLUE_HEX,
          font: "Calibri",
        }),
      ],
    })
  );

  // Contact line with clickable hyperlinks
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 140 },
      children: [
        new TextRun({ text: `${snapshot.profile.phone} | `, size: 19, color: MUTED_HEX, font: "Calibri" }),
        new ExternalHyperlink({
          link: `mailto:${snapshot.profile.email}`,
          children: [
            new TextRun({
              text: snapshot.profile.email,
              size: 19,
              color: ROYAL_BLUE_HEX,
              font: "Calibri",
            }),
          ],
        }),
        new TextRun({ text: ` | ${snapshot.profile.location} | `, size: 19, color: MUTED_HEX, font: "Calibri" }),
        new ExternalHyperlink({
          link: normalizeUrl(snapshot.profile.githubUrl),
          children: [
            new TextRun({
              text: cleanUrl(snapshot.profile.githubUrl),
              size: 19,
              color: ROYAL_BLUE_HEX,
              font: "Calibri",
            }),
          ],
        }),
        new TextRun({ text: " | ", size: 19, color: MUTED_HEX, font: "Calibri" }),
        new ExternalHyperlink({
          link: normalizeUrl(snapshot.profile.linkedinUrl),
          children: [
            new TextRun({
              text: cleanUrl(snapshot.profile.linkedinUrl),
              size: 19,
              color: ROYAL_BLUE_HEX,
              font: "Calibri",
            }),
          ],
        }),
      ],
    })
  );

  // Professional Summary
  children.push(createSectionHeading("PROFESSIONAL SUMMARY"));
  children.push(
    new Paragraph({
      spacing: { before: 40, after: 100 },
      children: [
        new TextRun({
          text: snapshot.profile.summary,
          size: 20,
          color: DARK_HEX,
          font: "Calibri",
        }),
      ],
    })
  );

  // Professional Experience
  children.push(createSectionHeading("PROFESSIONAL EXPERIENCE"));
  for (const exp of snapshot.experiences) {
    const dateRange = exp.startDate ? `${exp.startDate} – ${exp.endDate}` : exp.endDate;
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 20 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: exp.role, bold: true, size: 21, color: DARK_HEX, font: "Calibri" }),
          new TextRun({ text: `\t${dateRange}`, size: 19, color: MUTED_HEX, font: "Calibri" }),
        ],
      })
    );
    children.push(
      new Paragraph({
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: exp.location ? `${exp.company} · ${exp.location}` : exp.company,
            italics: true,
            size: 19,
            color: MUTED_HEX,
            font: "Calibri",
          }),
        ],
      })
    );
    for (const bullet of exp.responsibilities) {
      children.push(createBullet(bullet));
    }
  }

  // Featured Projects
  if (snapshot.projects.length > 0) {
    children.push(createSectionHeading("FEATURED PROJECTS"));
    for (const proj of snapshot.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 20 },
          children: [
            new TextRun({ text: proj.title, bold: true, size: 21, color: DARK_HEX, font: "Calibri" }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: `Stack: ${proj.stack.join(", ")}`,
              italics: true,
              size: 19,
              color: MUTED_HEX,
              font: "Calibri",
            }),
          ],
        })
      );
      for (const b of proj.bullets) {
        children.push(createBullet(b));
      }
    }
  }

  // Technical Skills
  if (snapshot.skillGroups.length > 0) {
    children.push(createSectionHeading("TECHNICAL SKILLS"));
    for (const group of snapshot.skillGroups) {
      children.push(
        new Paragraph({
          spacing: { before: 30, after: 40 },
          children: [
            new TextRun({
              text: `${group.category}: `,
              bold: true,
              size: 20,
              color: DARK_HEX,
              font: "Calibri",
            }),
            new TextRun({
              text: group.items.join(", "),
              size: 20,
              color: DARK_HEX,
              font: "Calibri",
            }),
          ],
        })
      );
    }
  }

  // Education
  if (snapshot.education.length > 0) {
    children.push(createSectionHeading("EDUCATION"));
    for (const ed of snapshot.education) {
      children.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${ed.degree} | ${ed.institution} `,
              bold: true,
              size: 20,
              color: DARK_HEX,
              font: "Calibri",
            }),
            new TextRun({
              text: ed.gpa ? `${ed.dates} | GPA: ${ed.gpa}` : ed.dates,
              size: 20,
              color: MUTED_HEX,
              font: "Calibri",
            }),
          ],
        })
      );
    }
  }

  // Certifications
  if (snapshot.certifications.length > 0) {
    children.push(createSectionHeading("CERTIFICATIONS"));
    for (const cert of snapshot.certifications) {
      const loc = cert.location ? `, ${cert.location}` : "";
      const cred = cert.credentialId ? ` [ID: ${cert.credentialId}]` : "";
      children.push(createBullet(`${cert.title} – ${cert.issuer}${loc} (${cert.issueDate})${cred}`));
    }
  }

  const doc = new Document({
    creator: snapshot.profile.fullName,
    title: `${snapshot.profile.fullName} - Resume`,
    description: snapshot.profile.headline,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 780,
              bottom: 720,
              left: 780,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
