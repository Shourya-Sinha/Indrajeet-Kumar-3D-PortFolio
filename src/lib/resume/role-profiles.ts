import { findMany, findOne } from "@/lib/db/repository";
import type { ResumeProfileType, ResumeSnapshot } from "@/lib/db/types";

export const ROLE_PROFILE_META: Record<
  ResumeProfileType,
  { label: string; headline: string; description: string }
> = {
  general: {
    label: "General Technical Resume",
    headline: "Full Stack Developer | MERN Stack | Cybersecurity Enthusiast",
    description: "Complete verified full-stack, mobile, AI, and cybersecurity profile.",
  },
  fullstack: {
    label: "Full Stack Developer Resume",
    headline: "Full Stack Developer | Next.js, TypeScript, MERN & Cloud Architecture",
    description: "Tailored for senior web engineering, distributed APIs, and SaaS platforms.",
  },
  mobile: {
    label: "React Native / Mobile App Developer Resume",
    headline: "Mobile App Engineer | React Native, Expo, Android & Real-Time Systems",
    description: "Focused on cross-platform React Native applications, state sync, and encrypted storage.",
  },
  "python-ai": {
    label: "Python and AI Developer Resume",
    headline: "Python & AI Engineer | FastAPI, Local LLMs (Ollama/GGUF) & Machine Learning",
    description: "Focused on Python backends, local LLM automation, and adversarial ML pipelines.",
  },
  cybersecurity: {
    label: "Cybersecurity and Application Security Resume",
    headline: "Application Security & Full Stack Engineer | MCA Cybersecurity (9.4 GPA)",
    description: "Highlights attack graph research, secure API design, encryption, and defensive tooling.",
  },
  "it-support": {
    label: "IT Support Engineer / System Administrator Resume",
    headline: "Systems, Cloud Deployment & IT Operations Engineer | Linux, Windows & Automation",
    description: "Focused on system administration, local hosting platforms, automation, and support engineering.",
  },
};

const SKILL_CATEGORY_ORDER = [
  "Languages",
  "Frontend Engineering",
  "Backend Engineering",
  "Mobile Development",
  "Database",
  "Cybersecurity",
  "DevOps and Infrastructure",
  "Payments",
  "AI & Machine Learning",
  "SEO",
];

function matchesProfile(itemProfiles: string[] | undefined, target: ResumeProfileType): boolean {
  if (!itemProfiles || itemProfiles.length === 0) {
    return target === "general";
  }
  return itemProfiles.includes(target);
}

export async function buildResumeSnapshot(
  profileType: ResumeProfileType = "general"
): Promise<ResumeSnapshot> {
  const [profileDoc, experiences, projects, skills, education, certifications] = await Promise.all([
    findOne("professionalProfiles", { profileKey: "master" }),
    findMany("experiences", { status: "published", includeInResume: true }, { sort: { order: 1 } }),
    findMany("projects", { status: "published", includeInResume: true }, { sort: { order: 1 } }),
    findMany("skills", { status: "published", includeInResume: true }, { sort: { order: 1 } }),
    findMany("education", { status: "published", includeInResume: true }, { sort: { order: 1 } }),
    findMany("certifications", { status: "published", includeInResume: true }, { sort: { order: 1 } }),
  ]);

  if (!profileDoc) {
    throw new Error("Master professional profile not found in database.");
  }

  const filteredExperiences = experiences.filter((e) =>
    profileType === "general" ? matchesProfile(e.resumeProfiles, "general") : true
  );

  const filteredProjects = projects.filter((p) => matchesProfile(p.resumeProfiles, profileType));
  const finalProjects =
    filteredProjects.length > 0
      ? filteredProjects
      : projects.filter((p) => matchesProfile(p.resumeProfiles, "general"));

  const filteredSkills = skills.filter((s) => matchesProfile(s.resumeProfiles, profileType));
  const effectiveSkills =
    filteredSkills.length > 0
      ? filteredSkills
      : skills.filter((s) => matchesProfile(s.resumeProfiles, "general"));

  const groupedSkillsMap = new Map<string, string[]>();
  for (const s of effectiveSkills) {
    const label =
      s.category === "Frontend Engineering"
        ? "Frontend"
        : s.category === "Backend Engineering"
          ? "Backend"
          : s.category === "DevOps and Infrastructure"
            ? "DevOps / Tools"
            : s.category === "AI & Machine Learning"
              ? "AI / ML"
              : s.category === "Cybersecurity"
                ? "Security"
                : s.category;
    const list = groupedSkillsMap.get(label) ?? [];
    list.push(s.name);
    groupedSkillsMap.set(label, list);
  }

  const orderedCategoryLabels = [
    "Languages",
    "Frontend",
    "Backend",
    "Mobile Development",
    "Database",
    "Security",
    "DevOps / Tools",
    "Payments",
    "AI / ML",
    "SEO",
  ];

  const skillGroups: ResumeSnapshot["skillGroups"] = [];
  for (const label of orderedCategoryLabels) {
    const items = groupedSkillsMap.get(label);
    if (items && items.length > 0) {
      skillGroups.push({ category: label, items });
      groupedSkillsMap.delete(label);
    }
  }
  for (const [label, items] of groupedSkillsMap.entries()) {
    if (items.length > 0) skillGroups.push({ category: label, items });
  }

  const headline =
    profileType === "general"
      ? profileDoc.resumeHeadline
      : ROLE_PROFILE_META[profileType].headline;

  return {
    profile: {
      fullName: profileDoc.fullName,
      displayName: profileDoc.displayName,
      headline,
      email: profileDoc.email,
      phone: profileDoc.phone,
      location: profileDoc.location,
      githubUrl: profileDoc.githubUrl,
      linkedinUrl: profileDoc.linkedinUrl,
      summary: profileDoc.summary,
    },
    experiences: filteredExperiences.map((e) => ({
      id: e._id,
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      responsibilities: e.responsibilities,
      technologies: e.technologies,
    })),
    projects: finalProjects.map((p) => ({
      id: p._id,
      title: p.title,
      stack: p.technologies,
      bullets: p.resumeBullets.length > 0 ? p.resumeBullets : [p.summary, ...p.capabilities.slice(0, 4)],
      projectStatus: p.projectStatus,
      githubUrl: p.githubUrl,
    })),
    skillGroups,
    education: education.map((ed) => ({
      id: ed._id,
      degree: ed.degree.includes(ed.field) || !ed.field ? ed.degree : `${ed.degree} (${ed.field})`,
      institution: ed.institution,
      dates: ed.startDate ? `${ed.startDate} – ${ed.endDate}` : ed.endDate,
      gpa: ed.gpa,
    })),
    certifications: certifications.map((c) => ({
      id: c._id,
      title: c.title,
      issuer: c.issuer,
      location: c.location,
      issueDate: c.issueDate,
      credentialId: c.credentialId,
    })),
  };
}

export { SKILL_CATEGORY_ORDER };
