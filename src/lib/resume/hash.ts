import crypto from "node:crypto";
import type { ResumeChangeSummary, ResumeSnapshot } from "@/lib/db/types";

export function computeSnapshotHash(snapshot: ResumeSnapshot): string {
  const canonical = JSON.stringify({
    profile: snapshot.profile,
    experiences: snapshot.experiences.map((e) => ({
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      responsibilities: e.responsibilities,
      technologies: e.technologies,
    })),
    projects: snapshot.projects.map((p) => ({
      title: p.title,
      stack: p.stack,
      bullets: p.bullets,
      projectStatus: p.projectStatus,
      githubUrl: p.githubUrl,
    })),
    skillGroups: snapshot.skillGroups,
    education: snapshot.education.map((ed) => ({
      degree: ed.degree,
      institution: ed.institution,
      dates: ed.dates,
      gpa: ed.gpa || "",
    })),
    certifications: snapshot.certifications.map((c) => ({
      title: c.title,
      issuer: c.issuer,
      location: c.location,
      issueDate: c.issueDate,
      credentialId: c.credentialId || "",
    })),
  });
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function diffResumeSnapshots(
  prev: ResumeSnapshot,
  next: ResumeSnapshot
): ResumeChangeSummary {
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  if (prev.profile.fullName !== next.profile.fullName) modified.push("Full name");
  if (prev.profile.headline !== next.profile.headline) modified.push("Professional headline");
  if (prev.profile.summary !== next.profile.summary) modified.push("Professional summary");
  if (
    prev.profile.email !== next.profile.email ||
    prev.profile.phone !== next.profile.phone ||
    prev.profile.location !== next.profile.location ||
    prev.profile.githubUrl !== next.profile.githubUrl ||
    prev.profile.linkedinUrl !== next.profile.linkedinUrl
  ) {
    modified.push("Contact & profile links");
  }

  // Experiences diff
  const prevExpMap = new Map(prev.experiences.map((e) => [`${e.company}::${e.role}`, e]));
  const nextExpMap = new Map(next.experiences.map((e) => [`${e.company}::${e.role}`, e]));
  for (const [k, exp] of nextExpMap) {
    const old = prevExpMap.get(k);
    if (!old) {
      added.push(`Experience: ${exp.role} at ${exp.company}`);
    } else if (JSON.stringify(old) !== JSON.stringify(exp)) {
      modified.push(`Experience: ${exp.role} at ${exp.company}`);
    }
  }
  for (const [k, exp] of prevExpMap) {
    if (!nextExpMap.has(k)) {
      removed.push(`Experience: ${exp.role} at ${exp.company}`);
    }
  }

  // Projects diff
  const prevProjMap = new Map(prev.projects.map((p) => [p.title, p]));
  const nextProjMap = new Map(next.projects.map((p) => [p.title, p]));
  for (const [title, proj] of nextProjMap) {
    const old = prevProjMap.get(title);
    if (!old) {
      added.push(`Project: ${title}`);
    } else if (JSON.stringify(old) !== JSON.stringify(proj)) {
      modified.push(`Project: ${title}`);
    }
  }
  for (const title of prevProjMap.keys()) {
    if (!nextProjMap.has(title)) {
      removed.push(`Project: ${title}`);
    }
  }

  // Skills diff
  const flattenSkills = (groups: ResumeSnapshot["skillGroups"]) =>
    new Set(groups.flatMap((g) => g.items.map((item) => `${g.category}: ${item}`)));
  const prevSkills = flattenSkills(prev.skillGroups);
  const nextSkills = flattenSkills(next.skillGroups);
  for (const s of nextSkills) {
    if (!prevSkills.has(s)) added.push(`Skill: ${s}`);
  }
  for (const s of prevSkills) {
    if (!nextSkills.has(s)) removed.push(`Skill: ${s}`);
  }

  // Education diff
  const prevEdu = new Map(prev.education.map((e) => [`${e.degree}::${e.institution}`, e]));
  const nextEdu = new Map(next.education.map((e) => [`${e.degree}::${e.institution}`, e]));
  for (const [k, ed] of nextEdu) {
    const old = prevEdu.get(k);
    if (!old) added.push(`Education: ${ed.degree} — ${ed.institution}`);
    else if (JSON.stringify(old) !== JSON.stringify(ed)) {
      modified.push(`Education: ${ed.degree}`);
    }
  }
  for (const [k, ed] of prevEdu) {
    if (!nextEdu.has(k)) removed.push(`Education: ${ed.degree} — ${ed.institution}`);
  }

  // Certifications diff
  const prevCerts = new Map(prev.certifications.map((c) => [`${c.title}::${c.issuer}`, c]));
  const nextCerts = new Map(next.certifications.map((c) => [`${c.title}::${c.issuer}`, c]));
  for (const [k, c] of nextCerts) {
    const old = prevCerts.get(k);
    if (!old) added.push(`Certification: ${c.title} (${c.issuer})`);
    else if (JSON.stringify(old) !== JSON.stringify(c)) {
      modified.push(`Certification: ${c.title}`);
    }
  }
  for (const [k, c] of prevCerts) {
    if (!nextCerts.has(k)) removed.push(`Certification: ${c.title} (${c.issuer})`);
  }

  return {
    added,
    modified,
    removed,
    totalChanges: added.length + modified.length + removed.length,
  };
}

export function inferBumpType(summary: ResumeChangeSummary): "patch" | "minor" | "major" {
  if (
    summary.added.some((line) => line.startsWith("Experience:") || line.startsWith("Education:")) ||
    summary.added.length >= 4
  ) {
    return "minor";
  }
  if (summary.added.length > 0 || summary.removed.length > 0) {
    return "minor";
  }
  return "patch";
}

export function bumpSemver(
  currentVersion: string,
  bump: "patch" | "minor" | "major"
): { version: string; major: number; minor: number; patch: number } {
  const cleaned = currentVersion.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  let [major, minor, patch] = [cleaned[0] ?? 1, cleaned[1] ?? 0, cleaned[2] ?? 0];
  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  const version = patch === 0 ? `v${major}.${minor}` : `v${major}.${minor}.${patch}`;
  return { version, major, minor, patch };
}
