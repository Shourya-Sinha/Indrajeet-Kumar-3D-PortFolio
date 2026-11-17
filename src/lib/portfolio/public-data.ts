import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany, findOne } from "@/lib/db/repository";
import { getGitHubActivity, type GitHubActivityPayload } from "@/lib/github/client";
import { getLatestPublishedResume } from "@/lib/resume/service";
import type {
  AboutContentDoc,
  CertificationDoc,
  EducationDoc,
  ExperienceDoc,
  FreelanceServiceDoc,
  HeroContentDoc,
  NavigationItemDoc,
  ProfessionalProfileDoc,
  ProjectDoc,
  ResumeVersionDoc,
  SeoMetadataDoc,
  ServiceDoc,
  SiteSettingsDoc,
  SkillDoc,
} from "@/lib/db/types";

export interface PublicPortfolioData {
  siteSettings: SiteSettingsDoc;
  profile: ProfessionalProfileDoc;
  hero: HeroContentDoc;
  about: AboutContentDoc;
  experiences: ExperienceDoc[];
  services: ServiceDoc[];
  projects: ProjectDoc[];
  certifications: CertificationDoc[];
  education: EducationDoc[];
  skills: SkillDoc[];
  freelanceServices: FreelanceServiceDoc[];
  navigation: NavigationItemDoc[];
  seo: SeoMetadataDoc | null;
  latestResume: ResumeVersionDoc | null;
  github: GitHubActivityPayload;
}

export async function getPublicPortfolioData(): Promise<PublicPortfolioData> {
  await ensureDatabaseSeeded();

  const [
    siteSettings,
    profile,
    hero,
    about,
    experiences,
    services,
    projects,
    certifications,
    education,
    skills,
    freelanceServices,
    navigation,
    seo,
    latestResume,
  ] = await Promise.all([
    findOne("siteSettings", { settingsKey: "primary" }),
    findOne("professionalProfiles", { profileKey: "master" }),
    findOne("heroContent", { contentKey: "primary" }),
    findOne("aboutContent", { contentKey: "primary" }),
    findMany(
      "experiences",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1 } }
    ),
    findMany(
      "services",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1 } }
    ),
    findMany(
      "projects",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1, featuredRank: 1 } }
    ),
    findMany(
      "certifications",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1 } }
    ),
    findMany(
      "education",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1 } }
    ),
    findMany(
      "skills",
      { status: "published", includeInPortfolio: true },
      { sort: { order: 1 } }
    ),
    findMany("freelanceServices", { status: "published" }, { sort: { order: 1 } }),
    findMany("navigationItems", { isVisible: true }, { sort: { order: 1 } }),
    findOne("seoMetadata", { routeKey: "/" }),
    getLatestPublishedResume("general"),
  ]);

  const github = await getGitHubActivity(siteSettings?.githubUsername || "Shourya-Sinha");

  return {
    siteSettings: siteSettings!,
    profile: profile!,
    hero: hero!,
    about: about!,
    experiences,
    services,
    projects,
    certifications,
    education,
    skills,
    freelanceServices,
    navigation,
    seo,
    latestResume,
    github,
  };
}
