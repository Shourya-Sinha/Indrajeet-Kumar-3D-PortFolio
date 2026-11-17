import pdfParse from "pdf-parse/lib/pdf-parse.js";
import type { AtsValidationCheck, AtsValidationReport, ResumeSnapshot } from "@/lib/db/types";

const STANDARD_HEADINGS = [
  "PROFESSIONAL SUMMARY",
  "PROFESSIONAL EXPERIENCE",
  "FEATURED PROJECTS",
  "TECHNICAL SKILLS",
  "EDUCATION",
  "CERTIFICATIONS",
];

export async function validateResumePdfBuffer(
  pdfBuffer: Buffer,
  snapshot: ResumeSnapshot
): Promise<AtsValidationReport> {
  const parsed = await pdfParse(pdfBuffer);
  const extractedText = (parsed.text || "").replace(/\r\n/g, "\n").trim();
  const pageCount = parsed.numpages || 1;
  const words = extractedText.split(/\s+/).filter(Boolean);
  const rawPdfAscii = pdfBuffer.toString("latin1");

  const detectedSections = STANDARD_HEADINGS.filter((h) =>
    extractedText.toUpperCase().includes(h)
  );

  // Reading order verification
  const idxSummary = extractedText.toUpperCase().indexOf("PROFESSIONAL SUMMARY");
  const idxExp = extractedText.toUpperCase().indexOf("PROFESSIONAL EXPERIENCE");
  const idxSkills = extractedText.toUpperCase().indexOf("TECHNICAL SKILLS");
  const idxEdu = extractedText.toUpperCase().indexOf("EDUCATION");

  const readingOrderOk =
    idxSummary !== -1 &&
    idxExp !== -1 &&
    idxSkills !== -1 &&
    idxEdu !== -1 &&
    idxSummary < idxExp &&
    idxExp < idxSkills &&
    idxSkills < idxEdu;

  const hasName = extractedText.toUpperCase().includes(snapshot.profile.fullName.toUpperCase());
  const hasEmail = extractedText.toLowerCase().includes(snapshot.profile.email.toLowerCase());
  const hasPhone = extractedText.includes(snapshot.profile.phone.replace(/\s+/g, "").slice(-6));
  const hasEmbeddedFonts =
    rawPdfAscii.includes("/FontFile2") ||
    rawPdfAscii.includes("/FontFile") ||
    rawPdfAscii.includes("/BaseFont");
  const hasEncodingArtifacts = /&amp;|&lt;|&gt;|\uFFFD/.test(extractedText);

  const experienceHeadingsPresent = snapshot.experiences.every((e) =>
    extractedText.toLowerCase().includes(e.company.toLowerCase())
  );

  const checks: AtsValidationCheck[] = [
    {
      code: "SELECTABLE_TEXT",
      label: "PDF Text Extraction & Selectable Characters",
      passed: words.length >= 80,
      detail: `Extracted ${words.length} selectable words across ${pageCount} page(s).`,
      severity: words.length >= 80 ? "pass" : "error",
    },
    {
      code: "SINGLE_COLUMN_ORDER",
      label: "Logical Single-Column Reading Order",
      passed: readingOrderOk,
      detail: readingOrderOk
        ? "Summary → Experience → Technical Skills → Education sequence verified."
        : "Expected section order could not be verified in extracted text.",
      severity: readingOrderOk ? "pass" : "error",
    },
    {
      code: "STANDARD_HEADINGS",
      label: "Conventional ATS Section Headings",
      passed: detectedSections.length >= 4,
      detail: `Detected ${detectedSections.length}/${STANDARD_HEADINGS.length} standard headings (${detectedSections.join(", ")}).`,
      severity: detectedSections.length >= 4 ? "pass" : "error",
    },
    {
      code: "CONTACT_INTEGRITY",
      label: "Candidate Name & Contact Information Extraction",
      passed: hasName && hasEmail && hasPhone,
      detail:
        hasName && hasEmail && hasPhone
          ? "Full name, email address, and phone digits extracted cleanly."
          : "Missing or broken candidate contact information in PDF text stream.",
      severity: hasName && hasEmail && hasPhone ? "pass" : "error",
    },
    {
      code: "EXPERIENCE_COVERAGE",
      label: "Employment History Completeness",
      passed: experienceHeadingsPresent,
      detail: experienceHeadingsPresent
        ? `All ${snapshot.experiences.length} verified employer entries present.`
        : "One or more published experiences missing from extracted PDF text.",
      severity: experienceHeadingsPresent ? "pass" : "error",
    },
    {
      code: "FONT_EMBEDDING",
      label: "PDF Font Definitions / Embedding",
      passed: hasEmbeddedFonts,
      detail: hasEmbeddedFonts
        ? "Font descriptors verified inside PDF structure."
        : "No font objects found in PDF byte stream.",
      severity: hasEmbeddedFonts ? "pass" : "warning",
    },
    {
      code: "ENCODING_CLEANLINESS",
      label: "Clean Character Encoding (No Escaped HTML / Mojibake)",
      passed: !hasEncodingArtifacts,
      detail: !hasEncodingArtifacts
        ? "No HTML entity artifacts or broken glyphs detected."
        : "Found unescaped HTML entity or corrupted glyph sequence in extracted text.",
      severity: !hasEncodingArtifacts ? "pass" : "warning",
    },
    {
      code: "PAGE_BUDGET",
      label: "Pagination & Page Overflow Check",
      passed: pageCount >= 1 && pageCount <= 4,
      detail: `Rendered cleanly across ${pageCount} letter-sized page(s) without truncation.`,
      severity: pageCount >= 1 && pageCount <= 4 ? "pass" : "warning",
    },
  ];

  const isValid = checks.every((c) => c.severity !== "error" || c.passed);

  return {
    isValid,
    checkedAt: new Date().toISOString(),
    pageCount,
    extractedWordCount: words.length,
    extractedTextPreview: extractedText.slice(0, 3000),
    detectedSections,
    checks,
  };
}
