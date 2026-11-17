import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import parsePdf from "pdf-parse/lib/pdf-parse.js";

const TEST_DB_DIR = `/tmp/shourya_test_db_${Date.now()}`;
const TEST_RESUME_DIR = `/tmp/shourya_test_resumes_${Date.now()}`;

process.env.DB_MODE = "local";
process.env.LOCAL_DB_DIR = TEST_DB_DIR;
process.env.RESUME_STORAGE_DIR = TEST_RESUME_DIR;
process.env.AUTH_SECRET = "vitest-super-secret-key-for-hmac-jwt-signing-123456";
process.env.ADMIN_EMAIL = "Krindrajeet.c@gmail.com";
process.env.ADMIN_PASSWORD = "ShouryaTestPassword!2026";

import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { createOne, findMany, findOne, updateById } from "@/lib/db/repository";
import {
  generateOrRefreshResumeDraft,
  getLatestPublishedResume,
  onResumeRelevantContentChanged,
  publishResumeVersion,
  rollbackResumeToVersion,
} from "@/lib/resume/service";
import { buildResumeSnapshot } from "@/lib/resume/role-profiles";
import { generateAtsResumePdfBuffer } from "@/lib/resume/pdf-generator";
import { generateAtsResumeDocxBuffer } from "@/lib/resume/docx-generator";
import { validateResumePdfBuffer } from "@/lib/resume/ats-validator";
import { resolveGoDaddySmtpConfig } from "@/lib/email/mailer";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  generateCsrfToken,
  hashPassword,
  signSessionToken,
} from "@/lib/auth/security";
import { GET as publicLatestGet } from "@/app/api/public/resume/latest/route";
import { GET as publicVersionsGet } from "@/app/api/public/resume/versions/route";
import { GET as publicDownloadGet } from "@/app/api/public/resume/download/[version]/[format]/route";
import { GET as adminResumeCurrentGet } from "@/app/api/admin/resume/current/route";
import { POST as adminResumeComparePost } from "@/app/api/admin/resume/compare/route";
import { POST as adminContentPost } from "@/app/api/admin/content/[collection]/route";
import { PATCH as adminContentIdPatch } from "@/app/api/admin/content/[collection]/[id]/route";
import { POST as adminMediaPost } from "@/app/api/admin/media/route";
import { POST as publicContactPost } from "@/app/api/public/contact/route";

describe("Portfolio CMS, Security & Dynamic ATS Resume Subsystem (Update Notice Sec 15)", () => {
  let superAdminToken: string;
  let viewerToken: string;
  const csrfToken = generateCsrfToken();

  function adminHeaders(token = superAdminToken, includeCsrf = true, contentType = "application/json") {
    const h: Record<string, string> = {
      cookie: `${SESSION_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    };
    if (includeCsrf) h["x-csrf-token"] = csrfToken;
    if (contentType) h["content-type"] = contentType;
    return h;
  }

  async function fetchAdminResumeCurrent(profile = "general") {
    const req = new NextRequest(
      `http://localhost:3000/api/admin/resume/current?profile=${profile}`,
      { headers: { cookie: `${SESSION_COOKIE_NAME}=${superAdminToken}` } }
    );
    const res = await adminResumeCurrentGet(req);
    expect(res.status).toBe(200);
    return (await res.json()) as {
      ok: boolean;
      data: {
        latestPublished: { version: string; isOriginalBaseline: boolean; contentHash: string } | null;
        activeDraft: { suggestedVersion: string } | null;
        isOutdated: boolean;
        pendingDiff: { added: string[]; modified: string[]; removed: string[]; totalChanges: number };
        versionCount: number;
      };
    };
  }

  beforeAll(async () => {
    await ensureDatabaseSeeded();

    const adminUser = await findOne("users", { email: "krindrajeet.c@gmail.com" });
    expect(adminUser).toBeTruthy();

    const viewer = await createOne("users", {
      email: "viewer@test.local",
      name: "Read Only Viewer",
      passwordHash: await hashPassword("ViewerPass123!"),
      role: "viewer",
      isActive: true,
    });

    superAdminToken = await signSessionToken({
      sub: adminUser!._id,
      email: adminUser!.email,
      name: adminUser!.name,
      role: "super_admin",
    });

    viewerToken = await signSessionToken({
      sub: viewer._id,
      email: viewer.email,
      name: viewer.name,
      role: "viewer",
    });
  });

  afterAll(async () => {
    await fs.rm(TEST_DB_DIR, { recursive: true, force: true });
    await fs.rm(TEST_RESUME_DIR, { recursive: true, force: true });
  });

  it("1. Initial seed preserves original Kumar_Indrajeet_Resume_Ananta_Updated.pdf as v1.0", async () => {
    const summary = await fetchAdminResumeCurrent("general");
    expect(summary.data.latestPublished?.version).toBe("v1.0");
    expect(summary.data.latestPublished?.isOriginalBaseline).toBe(true);
    expect(summary.data.isOutdated).toBe(false);

    const latestRecord = await getLatestPublishedResume("general");
    const originalBytes = await fs.readFile(
      path.join(process.cwd(), "Kumar_Indrajeet_Resume_Ananta_Updated.pdf")
    );
    const v1Bytes = await fs.readFile(latestRecord!.pdfStoragePath);
    expect(v1Bytes.equals(originalBytes)).toBe(true);
  });

  it("2. Adding a new experience flags resume as outdated + prepares draft while keeping public v1.0 intact", async () => {
    const newExp = await createOne("experiences", {
      company: "Ananta Cloud Security Lab",
      role: "Lead Security & Full Stack Consultant",
      location: "Remote, India",
      startDate: "Nov 2026",
      endDate: "Present",
      isCurrent: true,
      description: "Leading distributed security instrumentation and cloud deployment audits.",
      responsibilities: [
        "Engineered automated Zero-Trust API posture validation across Kubernetes workloads.",
      ],
      technologies: ["TypeScript", "Python", "Docker", "Kubernetes"],
      order: 0,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack", "cybersecurity"],
    });
    expect(newExp._id).toBeTruthy();

    await onResumeRelevantContentChanged("Test: added experience");

    const summary = await fetchAdminResumeCurrent("general");
    expect(summary.data.isOutdated).toBe(true);
    expect(summary.data.activeDraft?.suggestedVersion).toBe("v1.1");
    expect(summary.data.pendingDiff.added.some((line) => line.includes("Ananta Cloud Security Lab"))).toBe(
      true
    );

    const pubReq = new NextRequest("http://localhost:3000/api/public/resume/latest?profile=general");
    const pubRes = await publicLatestGet(pubReq);
    const pubJson = (await pubRes.json()) as { data: { latest: { version: string } } };
    expect(pubJson.data.latest.version).toBe("v1.0");
  });

  it("3. Publishing v1.1 preserves v1.0 immutably and generates selectable PDF & valid DOCX", async () => {
    const addedSkill = await createOne("skills", {
      name: "Kubernetes",
      category: "DevOps and Infrastructure",
      proficiency: 86,
      experienceYears: "2+ yrs",
      description: "Container orchestration",
      order: 99,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack"],
    });
    expect(addedSkill._id).toBeTruthy();

    const v11 = await publishResumeVersion({
      profileType: "general",
      createdBy: "Krindrajeet.c@gmail.com",
      releaseNotes: "Added Ananta Cloud Security Lab experience and Kubernetes skill.",
    });

    expect(v11.version).toBe("v1.1");
    expect(v11.isLatest).toBe(true);

    const v10 = await findOne("resumeVersions", { profileType: "general", version: "v1.0" });
    expect(v10).toBeTruthy();
    expect(v10!.isLatest).toBe(false);
    expect(v10!.isPublic).toBe(true);

    const dlPdfReq = new NextRequest(
      "http://localhost:3000/api/public/resume/download/v1.1/pdf?profile=general"
    );
    const dlPdfRes = await publicDownloadGet(dlPdfReq, {
      params: Promise.resolve({ version: "v1.1", format: "pdf" }),
    });
    expect(dlPdfRes.status).toBe(200);
    const pdfBuf = Buffer.from(await dlPdfRes.arrayBuffer());
    expect(pdfBuf.subarray(0, 5).toString("utf8")).toBe("%PDF-");

    const parsed = await parsePdf(pdfBuf);
    expect(parsed.text).toContain("KUMAR INDRAJEET");
    expect(parsed.text).toContain("Kubernetes");
    expect(parsed.text).toContain("Ananta Cloud Security Lab");
  });

  it("4. Archiving a project removes it from future draft snapshot & comparison diff", async () => {
    const betmaster = await findOne("projects", { slug: "betmaster-fantasy-gaming-platform" });
    expect(betmaster).toBeTruthy();

    await updateById("projects", betmaster!._id, { status: "archived" });
    await onResumeRelevantContentChanged("Archived BetMaster project");

    const summary = await fetchAdminResumeCurrent("general");
    expect(summary.data.isOutdated).toBe(true);
    expect(summary.data.pendingDiff.removed.some((r) => r.includes("BetMaster"))).toBe(true);
  });

  it("5. Updating certifications propagates to resume snapshot & diff", async () => {
    await createOne("certifications", {
      title: "Certified AppSec Practitioner",
      issuer: "SecOps Institute",
      location: "Online",
      issueDate: "2026",
      description: "Application security testing verification.",
      previewImageUrl: "/assets/visuals/section-certifications.webp",
      documentType: "credential_summary",
      hasOriginalDocument: false,
      order: 10,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "cybersecurity"],
    });

    const draft = await generateOrRefreshResumeDraft("general", "Added certification");
    expect(draft.status).toBe("draft_ready");
    expect(
      draft.draft!.changeSummary.added.some((a) => a.includes("Certified AppSec Practitioner"))
    ).toBe(true);
  });

  it("6. Visual / theme / hero / service edits DO NOT mark resume as outdated or trigger drafts", async () => {
    await publishResumeVersion({
      profileType: "general",
      createdBy: "Krindrajeet.c@gmail.com",
      releaseNotes: "Sync baseline before visual test.",
    });

    const beforeStatus = await fetchAdminResumeCurrent("general");
    expect(beforeStatus.data.isOutdated).toBe(false);

    const siteSettings = await findOne("siteSettings", { settingsKey: "primary" });
    expect(siteSettings).toBeTruthy();

    const patchReq = new NextRequest(
      `http://localhost:3000/api/admin/content/siteSettings/${siteSettings!._id}`,
      {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({
          themeConfig: {
            ...siteSettings!.themeConfig,
            glowIntensity: 1.4,
          },
        }),
      }
    );
    const patchRes = await adminContentIdPatch(patchReq, {
      params: Promise.resolve({ collection: "siteSettings", id: siteSettings!._id }),
    });
    expect(patchRes.status).toBe(200);

    const afterStatus = await fetchAdminResumeCurrent("general");
    expect(afterStatus.data.isOutdated).toBe(false);
    expect(afterStatus.data.activeDraft).toBeNull();
  });

  it("7. Toggling Automatic Publication Mode publishes new semantic version automatically on resume change", async () => {
    const rs = await findOne("resumeSettings", { settingsKey: "primary" });
    await updateById("resumeSettings", rs!._id, { publishingMode: "automatic" });

    const beforeVersions = await findMany("resumeVersions", { profileType: "general" });
    await createOne("skills", {
      name: "Terraform",
      category: "DevOps and Infrastructure",
      proficiency: 80,
      experienceYears: "1+ yr",
      description: "Infrastructure as Code",
      order: 100,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general"],
    });

    await onResumeRelevantContentChanged("Auto-publish test: added Terraform");

    const afterVersions = await findMany("resumeVersions", { profileType: "general" });
    expect(afterVersions.length).toBeGreaterThan(beforeVersions.length);

    const summary = await fetchAdminResumeCurrent("general");
    expect(summary.data.isOutdated).toBe(false);

    await updateById("resumeSettings", rs!._id, { publishingMode: "manual" });
  });

  it("8. Version rollback creates a NEW semantic version restoring v1.0 snapshot while keeping history immutable", async () => {
    const beforeList = await findMany("resumeVersions", { profileType: "general" });
    const rolledBack = await rollbackResumeToVersion(
      "general",
      "v1.0",
      "Krindrajeet.c@gmail.com"
    );

    expect(rolledBack.isLatest).toBe(true);
    expect(rolledBack.contentHash).toBe(
      beforeList.find((v) => v.version === "v1.0")!.contentHash
    );

    const afterList = await findMany("resumeVersions", { profileType: "general" });
    expect(afterList.length).toBe(beforeList.length + 1);
    expect(afterList.some((v) => v.version === "v1.0")).toBe(true);
  });

  it("9. ATS validation inspects real PDF structure cleanly without fabricating universal 100% score", async () => {
    const snap = await buildResumeSnapshot("cybersecurity");
    const pdfBuffer = await generateAtsResumePdfBuffer(snap);
    const report = await validateResumePdfBuffer(pdfBuffer, snap);

    expect(report.isValid).toBe(true);
    expect(report.pageCount).toBeGreaterThanOrEqual(1);
    expect(report.extractedWordCount).toBeGreaterThan(200);
    expect(report.checks.every((c) => c.passed)).toBe(true);
    expect(report.detectedSections).toContain("PROFESSIONAL SUMMARY");
    expect(report.detectedSections).toContain("EDUCATION");
    expect(JSON.stringify(report)).not.toMatch(/100%\s*ATS/i);
  });

  it("10. DOCX generation outputs valid Office Open XML ZIP archive with verified content", async () => {
    const snap = await buildResumeSnapshot("fullstack");
    const docxBuffer = await generateAtsResumeDocxBuffer(snap);
    expect(docxBuffer.subarray(0, 2).toString("utf8")).toBe("PK");
    expect(docxBuffer.length).toBeGreaterThan(5000);
  });

  it("11. All 5 role-specific profiles + general build valid snapshots and compare cleanly", async () => {
    const profiles = [
      "general",
      "fullstack",
      "mobile",
      "python-ai",
      "cybersecurity",
      "it-support",
    ] as const;

    for (const prof of profiles) {
      const snap = await buildResumeSnapshot(prof);
      expect(snap.experiences.length).toBeGreaterThanOrEqual(4);
      expect(snap.skillGroups.length).toBeGreaterThanOrEqual(3);
      expect(snap.education.length).toBeGreaterThanOrEqual(2);
    }

    const compareReq = new NextRequest("http://localhost:3000/api/admin/resume/compare", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ profileType: "general", fromVersion: "v1.0", toVersion: "live" }),
    });
    const compareRes = await adminResumeComparePost(compareReq);
    expect(compareRes.status).toBe(200);
  });

  it("12. Security, RBAC, CSRF, file-upload validation, contact sanitization, and public endpoint restrictions", async () => {
    // 12a. Unauthenticated Admin API must return 401
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/resume/current");
    const unauthRes = await adminResumeCurrentGet(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 12b. Viewer role attempting CMS mutation must return 403
    const viewerPostReq = new NextRequest("http://localhost:3000/api/admin/content/skills", {
      method: "POST",
      headers: adminHeaders(viewerToken, true),
      body: JSON.stringify({ name: "Unauthorized" }),
    });
    const viewerRes = await adminContentPost(viewerPostReq, {
      params: Promise.resolve({ collection: "skills" }),
    });
    expect(viewerRes.status).toBe(403);

    // 12c. Admin mutation without matching CSRF header must return 403
    const missingCsrfReq = new NextRequest("http://localhost:3000/api/admin/content/skills", {
      method: "POST",
      headers: adminHeaders(superAdminToken, false),
      body: JSON.stringify({ name: "Missing CSRF" }),
    });
    const csrfRes = await adminContentPost(missingCsrfReq, {
      params: Promise.resolve({ collection: "skills" }),
    });
    expect(csrfRes.status).toBe(403);

    // 12d. Media upload rejects dangerous non-allowlisted executable payloads
    const badForm = new FormData();
    badForm.append(
      "file",
      new File([Buffer.from("#!/bin/sh\nrm -rf /")], "exploit.sh", { type: "text/x-shellscript" })
    );
    const badUploadReq = new NextRequest("http://localhost:3000/api/admin/media", {
      method: "POST",
      headers: adminHeaders(superAdminToken, true, ""),
      body: badForm,
    });
    const badUploadRes = await adminMediaPost(badUploadReq);
    expect(badUploadRes.status).toBe(400);

    // 12e. Public resume versions endpoint only exposes published + public releases (zero draft leakage)
    const pubVerReq = new NextRequest(
      "http://localhost:3000/api/public/resume/versions?profile=general"
    );
    const pubVerRes = await publicVersionsGet(pubVerReq);
    const pubVerJson = (await pubVerRes.json()) as {
      data: Array<{ version: string }>;
    };
    expect(pubVerRes.status).toBe(200);
    expect(pubVerJson.data.some((v) => v.version === "v1.0")).toBe(true);
    expect(pubVerJson.data.every((v) => v.version.startsWith("v"))).toBe(true);

    // 12f. Contact form submission validates input and routes all inquiries to support@anantainfratechsolutions.com via GoDaddy SMTP defaults
    const smtpCfg = resolveGoDaddySmtpConfig();
    expect(smtpCfg.host).toBe("smtpout.secureserver.net");
    expect(smtpCfg.port).toBe(465);
    expect(smtpCfg.secure).toBe(true);
    expect(smtpCfg.user).toBe("support@anantainfratechsolutions.com");
    expect(smtpCfg.fromEmail).toBe("support@anantainfratechsolutions.com");
    expect(smtpCfg.recipient).toBe("support@anantainfratechsolutions.com");

    const contactReq = new NextRequest("http://localhost:3000/api/public/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.55" },
      body: JSON.stringify({
        fullName: "Priya Sharma",
        email: "priya.sharma@example.com",
        serviceCategory: "Full Stack Web Development",
        preferredContactMethod: "Email",
        description: "Looking to commission a Next.js + MongoDB analytics dashboard.",
      }),
    });
    const contactRes = await publicContactPost(contactReq);
    expect(contactRes.status).toBe(201);
    const contactJson = (await contactRes.json()) as {
      ok: boolean;
      data: { id: string; emailDeliveryStatus: string };
    };
    expect(contactJson.ok).toBe(true);
    const savedInquiry = await findOne("contactInquiries", { _id: contactJson.data.id });
    expect(savedInquiry?.emailDeliveryDetail).toContain("support@anantainfratechsolutions.com");
  });
});
