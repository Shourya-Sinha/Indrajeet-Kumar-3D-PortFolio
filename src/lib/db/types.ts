export type PublishStatus = "published" | "draft" | "archived";
export type UserRole = "super_admin" | "editor" | "viewer";
export type ProjectStatus =
  | "Production"
  | "Completed"
  | "In Development"
  | "Experimental"
  | "Research"
  | "Planned";

export type ResumeProfileType =
  | "general"
  | "fullstack"
  | "mobile"
  | "python-ai"
  | "cybersecurity"
  | "it-support";

export interface BaseDoc {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDoc extends BaseDoc {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface SiteSettingsDoc extends BaseDoc {
  settingsKey: string;
  brandName: string;
  alternateName: string;
  tagline: string;
  footerCredit: string;
  availabilityStatus: string;
  availableForHire: boolean;
  githubUsername: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  maintenanceMode: boolean;
  themeConfig: {
    voidColor: string;
    graphiteColor: string;
    cyanAccent: string;
    blueAccent: string;
    violetAccent: string;
    glowIntensity: number;
    enableReducedMotionByDefault: boolean;
  };
  sectionVisibility: {
    hero: boolean;
    about: boolean;
    expertise: boolean;
    services: boolean;
    experience: boolean;
    projects: boolean;
    certifications: boolean;
    education: boolean;
    github: boolean;
    freelance: boolean;
    contact: boolean;
  };
}

export interface HeroContentDoc extends BaseDoc {
  contentKey: string;
  badgeText: string;
  primaryName: string;
  alternateName: string;
  roles: string[];
  headline: string;
  subheading: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  resumeCtaLabel: string;
  heroImageUrl: string;
  heroImageAlt: string;
  sceneConfig: {
    chromeDistortion: number;
    particleCount: number;
    rotationSpeed: number;
  };
  status: PublishStatus;
}

export interface AboutStat {
  label: string;
  value: string;
  note: string;
}

export interface AboutContentDoc extends BaseDoc {
  contentKey: string;
  headline: string;
  summary: string;
  location: string;
  yearsExperience: string;
  educationHighlight: string;
  specialties: string[];
  careerGoals: string;
  profileImageUrl: string;
  profileImageAlt: string;
  stats: AboutStat[];
  status: PublishStatus;
}

export interface ExperienceDoc extends BaseDoc {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  logoUrl?: string;
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
  includeInResume: boolean;
  resumeProfiles: ResumeProfileType[];
}

export interface ServiceDoc extends BaseDoc {
  slug: string;
  numberLabel: string;
  title: string;
  shortTagline: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  imageUrl: string;
  imageAlt: string;
  sceneThemeKey: string;
  ctaLabel: string;
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
}

export interface ProjectDoc extends BaseDoc {
  slug: string;
  title: string;
  version: string;
  badge: string;
  summary: string;
  fullDescription: string;
  category: string;
  projectStatus: ProjectStatus;
  featuredRank: number;
  capabilities: string[];
  experimentalFeatures: string[];
  plannedFeatures: string[];
  technologies: string[];
  architectureModules: string[];
  githubUrl: string;
  liveUrl?: string;
  imageUrl: string;
  imageAlt: string;
  galleryUrls: string[];
  videoUrl?: string;
  interactiveDemoKey?: string;
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
  includeInResume: boolean;
  resumeProfiles: ResumeProfileType[];
  resumeBullets: string[];
}

export interface CertificationDoc extends BaseDoc {
  title: string;
  issuer: string;
  location: string;
  issueDate: string;
  credentialId?: string;
  verificationUrl?: string;
  description: string;
  documentUrl?: string;
  previewImageUrl: string;
  documentType: "pdf" | "image" | "credential_summary";
  hasOriginalDocument: boolean;
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
  includeInResume: boolean;
  resumeProfiles: ResumeProfileType[];
}

export interface EducationDoc extends BaseDoc {
  degree: string;
  field: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
  includeInResume: boolean;
  resumeProfiles: ResumeProfileType[];
}

export interface SkillDoc extends BaseDoc {
  name: string;
  category:
    | "Frontend Engineering"
    | "Backend Engineering"
    | "Mobile Development"
    | "Database"
    | "AI & Machine Learning"
    | "Cybersecurity"
    | "DevOps and Infrastructure"
    | "SEO"
    | "Languages"
    | "Payments";
  proficiency: number;
  experienceYears: string;
  description: string;
  order: number;
  status: PublishStatus;
  includeInPortfolio: boolean;
  includeInResume: boolean;
  resumeProfiles: ResumeProfileType[];
}

export interface FreelanceServiceDoc extends BaseDoc {
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  timelineEstimate: string;
  startingBudget: string;
  order: number;
  status: PublishStatus;
}

export interface MediaAssetDoc extends BaseDoc {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw";
  format: string;
  fileName: string;
  folder: string;
  altText: string;
  bytes: number;
  width?: number;
  height?: number;
  storageProvider: "cloudinary" | "local";
  uploadedBy: string;
}

export interface ContactInquiryDoc extends BaseDoc {
  fullName: string;
  email: string;
  phone?: string;
  serviceCategory: string;
  budget?: string;
  preferredContactMethod: "Email" | "Phone" | "WhatsApp" | "LinkedIn";
  description: string;
  status: "new" | "reviewed" | "replied" | "archived";
  adminNotes?: string;
  emailDeliveryStatus: "sent" | "logged_locally" | "failed";
  emailDeliveryDetail?: string;
  ipHash: string;
}

export interface SeoMetadataDoc extends BaseDoc {
  routeKey: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: "summary_large_image" | "summary";
  noIndex: boolean;
}

export interface NavigationItemDoc extends BaseDoc {
  label: string;
  href: string;
  zone: "header" | "footer";
  order: number;
  isExternal: boolean;
  isVisible: boolean;
}

export interface AuditLogDoc extends BaseDoc {
  actorId: string;
  actorEmail: string;
  action: string;
  collectionName: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
}

export interface ProfessionalProfileDoc extends BaseDoc {
  profileKey: string;
  fullName: string;
  displayName: string;
  headline: string;
  resumeHeadline: string;
  email: string;
  phone: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  summary: string;
  customSectionOrder: string[];
}

export interface ResumeSnapshot {
  profile: {
    fullName: string;
    displayName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    githubUrl: string;
    linkedinUrl: string;
    summary: string;
  };
  experiences: Array<{
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    technologies: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    stack: string[];
    bullets: string[];
    projectStatus: string;
    githubUrl: string;
  }>;
  skillGroups: Array<{
    category: string;
    items: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    dates: string;
    gpa?: string;
  }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    location: string;
    issueDate: string;
    credentialId?: string;
  }>;
}

export interface ResumeChangeSummary {
  added: string[];
  modified: string[];
  removed: string[];
  totalChanges: number;
}

export interface AtsValidationCheck {
  code: string;
  label: string;
  passed: boolean;
  detail: string;
  severity: "pass" | "warning" | "error";
}

export interface AtsValidationReport {
  isValid: boolean;
  checkedAt: string;
  pageCount: number;
  extractedWordCount: number;
  extractedTextPreview: string;
  detectedSections: string[];
  checks: AtsValidationCheck[];
}

export interface ResumeTemplateDoc extends BaseDoc {
  key: string;
  name: string;
  description: string;
  layout: "ats-single-column";
  accentColor: string;
  fontFamily: string;
  sectionOrder: string[];
  isDefault: boolean;
}

export interface ResumeVersionDoc extends BaseDoc {
  profileType: ResumeProfileType;
  version: string;
  major: number;
  minor: number;
  patch: number;
  title: string;
  description: string;
  releaseNotes: string;
  generatedAt: string;
  publishedAt: string;
  createdBy: string;
  status: "published" | "archived";
  profileSnapshot: ResumeSnapshot;
  contentHash: string;
  pdfUrl: string;
  docxUrl: string;
  pdfStoragePath: string;
  docxStoragePath: string;
  templateVersion: string;
  isLatest: boolean;
  isPublic: boolean;
  isOriginalBaseline: boolean;
  changeSummary: ResumeChangeSummary;
  validationReport: AtsValidationReport;
}

export interface ResumeDraftDoc extends BaseDoc {
  profileType: ResumeProfileType;
  suggestedVersion: string;
  bumpType: "patch" | "minor" | "major";
  status: "pending" | "outdated" | "validated" | "discarded";
  profileSnapshot: ResumeSnapshot;
  contentHash: string;
  basedOnVersion: string;
  changeSummary: ResumeChangeSummary;
  validationReport: AtsValidationReport;
  previewPdfPath: string;
  previewDocxPath: string;
}

export interface ResumeGenerationJobDoc extends BaseDoc {
  profileType: ResumeProfileType;
  triggerSource: string;
  status: "queued" | "running" | "completed" | "failed";
  versionTarget: string;
  errorMessage?: string;
  durationMs: number;
}

export interface ResumeSettingsDoc extends BaseDoc {
  settingsKey: string;
  publishingMode: "manual" | "automatic";
  activeTemplateKey: string;
  autoGenerateDraftOnProfileChange: boolean;
  enabledRoleProfiles: ResumeProfileType[];
}

export interface ResumeDownloadLogDoc extends BaseDoc {
  version: string;
  profileType: ResumeProfileType;
  format: "pdf" | "docx";
  sourceRoute: string;
  userAgent: string;
  ipHash: string;
  downloadedAt: string;
}

export interface CollectionMap {
  users: UserDoc;
  siteSettings: SiteSettingsDoc;
  heroContent: HeroContentDoc;
  aboutContent: AboutContentDoc;
  experiences: ExperienceDoc;
  services: ServiceDoc;
  projects: ProjectDoc;
  certifications: CertificationDoc;
  education: EducationDoc;
  skills: SkillDoc;
  freelanceServices: FreelanceServiceDoc;
  mediaAssets: MediaAssetDoc;
  contactInquiries: ContactInquiryDoc;
  seoMetadata: SeoMetadataDoc;
  navigationItems: NavigationItemDoc;
  auditLogs: AuditLogDoc;
  professionalProfiles: ProfessionalProfileDoc;
  resumeTemplates: ResumeTemplateDoc;
  resumeVersions: ResumeVersionDoc;
  resumeDrafts: ResumeDraftDoc;
  resumeGenerationJobs: ResumeGenerationJobDoc;
  resumeSettings: ResumeSettingsDoc;
  resumeDownloadLogs: ResumeDownloadLogDoc;
}

export type CollectionName = keyof CollectionMap;
