import fs from "node:fs";
import path from "node:path";
import type {
  ResumeDraftDoc,
  ResumeProfileType,
  ResumeSnapshot,
  ResumeVersionDoc,
} from "@/lib/db/types";
import { createOne, findMany, findOne, updateById } from "@/lib/db/repository";
import { buildResumeSnapshot } from "./role-profiles";
import { bumpSemver, computeSnapshotHash, diffResumeSnapshots, inferBumpType } from "./hash";
import { generateAtsResumePdfBuffer } from "./pdf-generator";
import { generateAtsResumeDocxBuffer } from "./docx-generator";
import { validateResumePdfBuffer } from "./ats-validator";

export function getResumeStorageRoot(): string {
  return process.env.RESUME_STORAGE_DIR
    ? path.resolve(process.env.RESUME_STORAGE_DIR)
    : path.resolve(process.cwd(), "storage", "resumes");
}

export function getGeneratedVersionPaths(profileType: ResumeProfileType, version: string) {
  const root = getResumeStorageRoot();
  const safeVersion = version.replace(/[^a-zA-Z0-9._-]/g, "");
  const dir = path.join(root, "generated", profileType, safeVersion);
  return {
    dir,
    pdfPath: path.join(dir, "resume.pdf"),
    docxPath: path.join(dir, "resume.docx"),
  };
}

export function getDraftPreviewPaths(profileType: ResumeProfileType) {
  const root = getResumeStorageRoot();
  const dir = path.join(root, "drafts", profileType);
  return {
    dir,
    pdfPath: path.join(dir, "preview.pdf"),
    docxPath: path.join(dir, "preview.docx"),
  };
}

export function getOriginalBaselinePdfPath(): string {
  return path.join(getResumeStorageRoot(), "original", "original_resume_v1.0.pdf");
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function getLatestPublishedResume(
  profileType: ResumeProfileType = "general"
): Promise<ResumeVersionDoc | null> {
  const latest = await findOne("resumeVersions", {
    profileType,
    isLatest: true,
    isPublic: true,
  });
  if (latest) return latest;
  const versions = await findMany(
    "resumeVersions",
    { profileType, isPublic: true },
    { sort: { major: -1, minor: -1, patch: -1 }, limit: 1 }
  );
  return versions[0] ?? null;
}

export async function generateOrRefreshResumeDraft(
  profileType: ResumeProfileType = "general",
  triggerSource = "manual"
): Promise<{
  status: "unchanged" | "draft_ready" | "auto_published";
  draft?: ResumeDraftDoc | null;
  publishedVersion?: ResumeVersionDoc;
}> {
  const started = Date.now();
  const latest = await getLatestPublishedResume(profileType);
  const snapshot = await buildResumeSnapshot(profileType);
  const contentHash = computeSnapshotHash(snapshot);

  if (latest && latest.contentHash === contentHash) {
    return { status: "unchanged", draft: null };
  }

  const prevSnapshot: ResumeSnapshot = latest
    ? latest.profileSnapshot
    : {
        profile: snapshot.profile,
        experiences: [],
        projects: [],
        skillGroups: [],
        education: [],
        certifications: [],
      };

  const changeSummary = latest
    ? diffResumeSnapshots(prevSnapshot, snapshot)
    : { added: ["Initial profile release"], modified: [], removed: [], totalChanges: 1 };

  const bumpType = inferBumpType(changeSummary);
  const nextVer = latest
    ? bumpSemver(latest.version, bumpType)
    : { version: "v1.0", major: 1, minor: 0, patch: 0 };

  const pdfBuffer = await generateAtsResumePdfBuffer(snapshot);
  const docxBuffer = await generateAtsResumeDocxBuffer(snapshot);
  const validationReport = await validateResumePdfBuffer(pdfBuffer, snapshot);

  const previewPaths = getDraftPreviewPaths(profileType);
  ensureDir(previewPaths.dir);
  fs.writeFileSync(previewPaths.pdfPath, pdfBuffer);
  fs.writeFileSync(previewPaths.docxPath, docxBuffer);

  const existingDraft = await findOne("resumeDrafts", {
    profileType,
    status: { $in: ["pending", "outdated", "validated"] },
  });

  const draftPayload = {
    profileType,
    suggestedVersion: nextVer.version,
    bumpType,
    status: (validationReport.isValid ? "validated" : "outdated") as "validated" | "outdated",
    profileSnapshot: snapshot,
    contentHash,
    basedOnVersion: latest?.version || "v0.0",
    changeSummary,
    validationReport,
    previewPdfPath: previewPaths.pdfPath,
    previewDocxPath: previewPaths.docxPath,
  };

  let savedDraft: ResumeDraftDoc;
  if (existingDraft) {
    savedDraft = (await updateById("resumeDrafts", existingDraft._id, draftPayload))!;
  } else {
    savedDraft = await createOne("resumeDrafts", draftPayload);
  }

  await createOne("resumeGenerationJobs", {
    profileType,
    triggerSource,
    status: "completed",
    versionTarget: nextVer.version,
    durationMs: Date.now() - started,
  });

  const settings = await findOne("resumeSettings", { settingsKey: "primary" });
  if (
    settings?.publishingMode === "automatic" &&
    validationReport.isValid &&
    latest
  ) {
    const published = await publishResumeVersion({
      profileType,
      version: nextVer.version,
      title: `Automated Release ${nextVer.version}`,
      releaseNotes:
        [...changeSummary.added, ...changeSummary.modified].slice(0, 6).join("; ") ||
        "Automated synchronization from professional profile update.",
      createdBy: "system-auto-publish",
      snapshot,
      validationReport,
      changeSummary,
      pdfBuffer,
      docxBuffer,
    });
    return { status: "auto_published", publishedVersion: published };
  }

  return { status: "draft_ready", draft: savedDraft };
}

export interface PublishResumeInput {
  profileType: ResumeProfileType;
  version?: string;
  title?: string;
  description?: string;
  releaseNotes?: string;
  createdBy: string;
  snapshot?: ResumeSnapshot;
  validationReport?: ResumeVersionDoc["validationReport"];
  changeSummary?: ResumeVersionDoc["changeSummary"];
  pdfBuffer?: Buffer;
  docxBuffer?: Buffer;
}

export async function publishResumeVersion(
  input: PublishResumeInput
): Promise<ResumeVersionDoc> {
  const { profileType, createdBy } = input;
  const latest = await getLatestPublishedResume(profileType);
  const activeDraft = await findOne("resumeDrafts", {
    profileType,
    status: { $in: ["pending", "outdated", "validated"] },
  });

  const snapshot =
    input.snapshot || activeDraft?.profileSnapshot || (await buildResumeSnapshot(profileType));
  const contentHash = computeSnapshotHash(snapshot);

  const changeSummary =
    input.changeSummary ||
    activeDraft?.changeSummary ||
    (latest
      ? diffResumeSnapshots(latest.profileSnapshot, snapshot)
      : { added: ["Initial release"], modified: [], removed: [], totalChanges: 1 });

  const bump = inferBumpType(changeSummary);
  const autoSemver = latest
    ? bumpSemver(latest.version, bump)
    : { version: "v1.0", major: 1, minor: 0, patch: 0 };

  let targetVersion = input.version?.trim() || activeDraft?.suggestedVersion || autoSemver.version;
  if (!targetVersion.startsWith("v")) targetVersion = `v${targetVersion}`;

  const duplicate = await findOne("resumeVersions", {
    profileType,
    version: targetVersion,
  });
  if (duplicate) {
    throw new Error(`Resume version ${targetVersion} already exists for profile ${profileType}.`);
  }

  const parsedParts = targetVersion.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const [major, minor, patch] = [parsedParts[0] ?? 1, parsedParts[1] ?? 0, parsedParts[2] ?? 0];

  const pdfBuffer = input.pdfBuffer || (await generateAtsResumePdfBuffer(snapshot));
  const docxBuffer = input.docxBuffer || (await generateAtsResumeDocxBuffer(snapshot));
  const validationReport =
    input.validationReport || (await validateResumePdfBuffer(pdfBuffer, snapshot));

  const outPaths = getGeneratedVersionPaths(profileType, targetVersion);
  ensureDir(outPaths.dir);
  fs.writeFileSync(outPaths.pdfPath, pdfBuffer);
  fs.writeFileSync(outPaths.docxPath, docxBuffer);

  // Mark previous latest versions as historical (never overwrite their files or snapshot!)
  const existingLatest = await findMany("resumeVersions", { profileType, isLatest: true });
  for (const prev of existingLatest) {
    await updateById("resumeVersions", prev._id, { isLatest: false });
  }

  const now = new Date().toISOString();
  const created = await createOne("resumeVersions", {
    profileType,
    version: targetVersion,
    major,
    minor,
    patch,
    title: input.title || `Resume ${targetVersion}`,
    description:
      input.description ||
      `Verified ATS-friendly release for ${profileType} profile.`,
    releaseNotes:
      input.releaseNotes ||
      ([...changeSummary.added, ...changeSummary.modified].slice(0, 6).join("; ") ||
        "Updated professional profile release."),
    generatedAt: now,
    publishedAt: now,
    createdBy,
    status: "published",
    profileSnapshot: snapshot,
    contentHash,
    pdfUrl: `/api/public/resume/download/${encodeURIComponent(targetVersion)}/pdf?profile=${profileType}`,
    docxUrl: `/api/public/resume/download/${encodeURIComponent(targetVersion)}/docx?profile=${profileType}`,
    pdfStoragePath: outPaths.pdfPath,
    docxStoragePath: outPaths.docxPath,
    templateVersion: "ats-classic-1.0",
    isLatest: true,
    isPublic: true,
    isOriginalBaseline: false,
    changeSummary,
    validationReport,
  });

  if (activeDraft) {
    await updateById("resumeDrafts", activeDraft._id, { status: "discarded" });
  }

  return created;
}

export async function rollbackResumeToVersion(
  profileType: ResumeProfileType,
  sourceVersion: string,
  createdBy: string
): Promise<ResumeVersionDoc> {
  const source = await findOne("resumeVersions", { profileType, version: sourceVersion });
  if (!source) {
    throw new Error(`Source version ${sourceVersion} not found for ${profileType}.`);
  }
  const latest = await getLatestPublishedResume(profileType);
  const next = latest ? bumpSemver(latest.version, "minor") : { version: "v1.1" };
  const snapshot = source.profileSnapshot;
  const pdfBuffer = await generateAtsResumePdfBuffer(snapshot);
  const docxBuffer = await generateAtsResumeDocxBuffer(snapshot);
  const validationReport = await validateResumePdfBuffer(pdfBuffer, snapshot);
  const changeSummary = latest
    ? diffResumeSnapshots(latest.profileSnapshot, snapshot)
    : { added: [`Restored snapshot from ${sourceVersion}`], modified: [], removed: [], totalChanges: 1 };

  return publishResumeVersion({
    profileType,
    version: next.version,
    title: `Restored Snapshot from ${sourceVersion}`,
    description: `Rollback release preserving historical archive while restoring ${sourceVersion} profile state.`,
    releaseNotes: `Restored verified snapshot from ${sourceVersion} into new immutable version ${next.version}.`,
    createdBy,
    snapshot,
    validationReport,
    changeSummary,
    pdfBuffer,
    docxBuffer,
  });
}

export async function onResumeRelevantContentChanged(triggerSource: string): Promise<void> {
  const settings = await findOne("resumeSettings", { settingsKey: "primary" });
  if (settings && !settings.autoGenerateDraftOnProfileChange) return;
  await generateOrRefreshResumeDraft("general", triggerSource);
}
