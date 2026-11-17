import mongoose, { Schema, type Model } from "mongoose";
import type { CollectionName } from "./types";

const BaseSchemaOptions = {
  timestamps: true,
  minimize: false,
} as const;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "editor", "viewer"], default: "editor" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: String },
  },
  BaseSchemaOptions
);

const SiteSettingsSchema = new Schema(
  {
    settingsKey: { type: String, required: true, unique: true, default: "primary" },
    brandName: { type: String, required: true },
    alternateName: { type: String, required: true },
    tagline: { type: String, required: true },
    footerCredit: { type: String, required: true },
    availabilityStatus: { type: String, required: true },
    availableForHire: { type: Boolean, default: true },
    githubUsername: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    location: { type: String, required: true },
    githubUrl: { type: String, required: true },
    linkedinUrl: { type: String, required: true },
    maintenanceMode: { type: Boolean, default: false },
    themeConfig: {
      voidColor: { type: String, default: "#050608" },
      graphiteColor: { type: String, default: "#101318" },
      cyanAccent: { type: String, default: "#00E5FF" },
      blueAccent: { type: String, default: "#2979FF" },
      violetAccent: { type: String, default: "#8B5CF6" },
      glowIntensity: { type: Number, default: 0.75 },
      enableReducedMotionByDefault: { type: Boolean, default: false },
    },
    sectionVisibility: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      expertise: { type: Boolean, default: true },
      services: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      github: { type: Boolean, default: true },
      freelance: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
  },
  BaseSchemaOptions
);

const HeroContentSchema = new Schema(
  {
    contentKey: { type: String, required: true, unique: true, default: "primary" },
    badgeText: { type: String, required: true },
    primaryName: { type: String, required: true },
    alternateName: { type: String, required: true },
    roles: [{ type: String }],
    headline: { type: String, required: true },
    subheading: { type: String, required: true },
    primaryCtaLabel: { type: String, required: true },
    secondaryCtaLabel: { type: String, required: true },
    resumeCtaLabel: { type: String, required: true },
    heroImageUrl: { type: String, required: true },
    heroImageAlt: { type: String, required: true },
    sceneConfig: {
      chromeDistortion: { type: Number, default: 0.35 },
      particleCount: { type: Number, default: 320 },
      rotationSpeed: { type: Number, default: 0.25 },
    },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published" },
  },
  BaseSchemaOptions
);

const AboutContentSchema = new Schema(
  {
    contentKey: { type: String, required: true, unique: true, default: "primary" },
    headline: { type: String, required: true },
    summary: { type: String, required: true },
    location: { type: String, required: true },
    yearsExperience: { type: String, required: true },
    educationHighlight: { type: String, required: true },
    specialties: [{ type: String }],
    careerGoals: { type: String, required: true },
    profileImageUrl: { type: String, required: true },
    profileImageAlt: { type: String, required: true },
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        note: { type: String, default: "" },
      },
    ],
    status: { type: String, enum: ["published", "draft", "archived"], default: "published" },
  },
  BaseSchemaOptions
);

const ExperienceSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, required: true },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    technologies: [{ type: String }],
    logoUrl: { type: String },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    includeInPortfolio: { type: Boolean, default: true },
    includeInResume: { type: Boolean, default: true },
    resumeProfiles: [{ type: String }],
  },
  BaseSchemaOptions
);

const ServiceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    numberLabel: { type: String, required: true },
    title: { type: String, required: true },
    shortTagline: { type: String, required: true },
    description: { type: String, required: true },
    deliverables: [{ type: String }],
    technologies: [{ type: String }],
    imageUrl: { type: String, required: true },
    imageAlt: { type: String, required: true },
    sceneThemeKey: { type: String, required: true },
    ctaLabel: { type: String, default: "Request Service" },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    includeInPortfolio: { type: Boolean, default: true },
  },
  BaseSchemaOptions
);

const ProjectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    version: { type: String, default: "1.0" },
    badge: { type: String, default: "Featured" },
    summary: { type: String, required: true },
    fullDescription: { type: String, required: true },
    category: { type: String, required: true },
    projectStatus: {
      type: String,
      enum: ["Production", "Completed", "In Development", "Experimental", "Research", "Planned"],
      default: "Completed",
    },
    featuredRank: { type: Number, default: 10 },
    capabilities: [{ type: String }],
    experimentalFeatures: [{ type: String }],
    plannedFeatures: [{ type: String }],
    technologies: [{ type: String }],
    architectureModules: [{ type: String }],
    githubUrl: { type: String, required: true },
    liveUrl: { type: String },
    imageUrl: { type: String, required: true },
    imageAlt: { type: String, required: true },
    galleryUrls: [{ type: String }],
    videoUrl: { type: String },
    interactiveDemoKey: { type: String },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    includeInPortfolio: { type: Boolean, default: true },
    includeInResume: { type: Boolean, default: false },
    resumeProfiles: [{ type: String }],
    resumeBullets: [{ type: String }],
  },
  BaseSchemaOptions
);

const CertificationSchema = new Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    location: { type: String, default: "" },
    issueDate: { type: String, required: true },
    credentialId: { type: String },
    verificationUrl: { type: String },
    description: { type: String, required: true },
    documentUrl: { type: String },
    previewImageUrl: { type: String, required: true },
    documentType: { type: String, enum: ["pdf", "image", "credential_summary"], default: "credential_summary" },
    hasOriginalDocument: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    includeInPortfolio: { type: Boolean, default: true },
    includeInResume: { type: Boolean, default: true },
    resumeProfiles: [{ type: String }],
  },
  BaseSchemaOptions
);

const EducationSchema = new Schema(
  {
    degree: { type: String, required: true },
    field: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, required: true },
    gpa: { type: String },
    highlights: [{ type: String }],
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published", index: true },
    includeInPortfolio: { type: Boolean, default: true },
    includeInResume: { type: Boolean, default: true },
    resumeProfiles: [{ type: String }],
  },
  BaseSchemaOptions
);

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    proficiency: { type: Number, min: 1, max: 100, default: 85 },
    experienceYears: { type: String, default: "3+ yrs" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published" },
    includeInPortfolio: { type: Boolean, default: true },
    includeInResume: { type: Boolean, default: true },
    resumeProfiles: [{ type: String }],
  },
  BaseSchemaOptions
);

const FreelanceServiceSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    deliverables: [{ type: String }],
    timelineEstimate: { type: String, required: true },
    startingBudget: { type: String, required: true },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ["published", "draft", "archived"], default: "published" },
  },
  BaseSchemaOptions
);

const MediaAssetSchema = new Schema(
  {
    publicId: { type: String, required: true, unique: true },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], default: "image" },
    format: { type: String, required: true },
    fileName: { type: String, required: true },
    folder: { type: String, default: "portfolio" },
    altText: { type: String, required: true },
    bytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    storageProvider: { type: String, enum: ["cloudinary", "local"], default: "local" },
    uploadedBy: { type: String, required: true },
  },
  BaseSchemaOptions
);

const ContactInquirySchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    serviceCategory: { type: String, required: true },
    budget: { type: String },
    preferredContactMethod: { type: String, enum: ["Email", "Phone", "WhatsApp", "LinkedIn"], default: "Email" },
    description: { type: String, required: true },
    status: { type: String, enum: ["new", "reviewed", "replied", "archived"], default: "new", index: true },
    adminNotes: { type: String },
    emailDeliveryStatus: { type: String, enum: ["sent", "logged_locally", "failed"], default: "logged_locally" },
    emailDeliveryDetail: { type: String },
    ipHash: { type: String, required: true },
  },
  BaseSchemaOptions
);

const SeoMetadataSchema = new Schema(
  {
    routeKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
    canonicalUrl: { type: String, required: true },
    ogTitle: { type: String, required: true },
    ogDescription: { type: String, required: true },
    ogImageUrl: { type: String, required: true },
    twitterCard: { type: String, enum: ["summary_large_image", "summary"], default: "summary_large_image" },
    noIndex: { type: Boolean, default: false },
  },
  BaseSchemaOptions
);

const NavigationItemSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    zone: { type: String, enum: ["header", "footer"], default: "header" },
    order: { type: Number, default: 0, index: true },
    isExternal: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
  },
  BaseSchemaOptions
);

const AuditLogSchema = new Schema(
  {
    actorId: { type: String, required: true },
    actorEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    collectionName: { type: String, required: true, index: true },
    targetId: { type: String, required: true },
    summary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String, default: "unknown" },
  },
  BaseSchemaOptions
);

const ProfessionalProfileSchema = new Schema(
  {
    profileKey: { type: String, required: true, unique: true, default: "master" },
    fullName: { type: String, required: true },
    displayName: { type: String, required: true },
    headline: { type: String, required: true },
    resumeHeadline: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    githubUrl: { type: String, required: true },
    linkedinUrl: { type: String, required: true },
    summary: { type: String, required: true },
    customSectionOrder: [{ type: String }],
  },
  BaseSchemaOptions
);

const ResumeTemplateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    layout: { type: String, enum: ["ats-single-column"], default: "ats-single-column" },
    accentColor: { type: String, default: "#1D549F" },
    fontFamily: { type: String, default: "Roboto" },
    sectionOrder: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  BaseSchemaOptions
);

const ResumeVersionSchema = new Schema(
  {
    profileType: { type: String, required: true, index: true },
    version: { type: String, required: true, index: true },
    major: { type: Number, required: true },
    minor: { type: Number, required: true },
    patch: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    releaseNotes: { type: String, required: true },
    generatedAt: { type: String, required: true },
    publishedAt: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ["published", "archived"], default: "published" },
    profileSnapshot: { type: Schema.Types.Mixed, required: true },
    contentHash: { type: String, required: true, index: true },
    pdfUrl: { type: String, required: true },
    docxUrl: { type: String, required: true },
    pdfStoragePath: { type: String, required: true },
    docxStoragePath: { type: String, required: true },
    templateVersion: { type: String, default: "ats-classic-1.0" },
    isLatest: { type: Boolean, default: false, index: true },
    isPublic: { type: Boolean, default: true },
    isOriginalBaseline: { type: Boolean, default: false },
    changeSummary: { type: Schema.Types.Mixed, required: true },
    validationReport: { type: Schema.Types.Mixed, required: true },
  },
  BaseSchemaOptions
);
ResumeVersionSchema.index({ profileType: 1, version: 1 }, { unique: true });

const ResumeDraftSchema = new Schema(
  {
    profileType: { type: String, required: true, index: true },
    suggestedVersion: { type: String, required: true },
    bumpType: { type: String, enum: ["patch", "minor", "major"], default: "minor" },
    status: { type: String, enum: ["pending", "outdated", "validated", "discarded"], default: "pending" },
    profileSnapshot: { type: Schema.Types.Mixed, required: true },
    contentHash: { type: String, required: true },
    basedOnVersion: { type: String, required: true },
    changeSummary: { type: Schema.Types.Mixed, required: true },
    validationReport: { type: Schema.Types.Mixed, required: true },
    previewPdfPath: { type: String, required: true },
    previewDocxPath: { type: String, required: true },
  },
  BaseSchemaOptions
);

const ResumeGenerationJobSchema = new Schema(
  {
    profileType: { type: String, required: true },
    triggerSource: { type: String, required: true },
    status: { type: String, enum: ["queued", "running", "completed", "failed"], default: "completed" },
    versionTarget: { type: String, required: true },
    errorMessage: { type: String },
    durationMs: { type: Number, default: 0 },
  },
  BaseSchemaOptions
);

const ResumeSettingsSchema = new Schema(
  {
    settingsKey: { type: String, required: true, unique: true, default: "primary" },
    publishingMode: { type: String, enum: ["manual", "automatic"], default: "manual" },
    activeTemplateKey: { type: String, default: "ats-classic-1.0" },
    autoGenerateDraftOnProfileChange: { type: Boolean, default: true },
    enabledRoleProfiles: [{ type: String }],
  },
  BaseSchemaOptions
);

const ResumeDownloadLogSchema = new Schema(
  {
    version: { type: String, required: true, index: true },
    profileType: { type: String, required: true },
    format: { type: String, enum: ["pdf", "docx"], required: true },
    sourceRoute: { type: String, required: true },
    userAgent: { type: String, default: "" },
    ipHash: { type: String, required: true },
    downloadedAt: { type: String, required: true },
  },
  BaseSchemaOptions
);

export const SchemaRegistry: Record<CollectionName, Schema> = {
  users: UserSchema,
  siteSettings: SiteSettingsSchema,
  heroContent: HeroContentSchema,
  aboutContent: AboutContentSchema,
  experiences: ExperienceSchema,
  services: ServiceSchema,
  projects: ProjectSchema,
  certifications: CertificationSchema,
  education: EducationSchema,
  skills: SkillSchema,
  freelanceServices: FreelanceServiceSchema,
  mediaAssets: MediaAssetSchema,
  contactInquiries: ContactInquirySchema,
  seoMetadata: SeoMetadataSchema,
  navigationItems: NavigationItemSchema,
  auditLogs: AuditLogSchema,
  professionalProfiles: ProfessionalProfileSchema,
  resumeTemplates: ResumeTemplateSchema,
  resumeVersions: ResumeVersionSchema,
  resumeDrafts: ResumeDraftSchema,
  resumeGenerationJobs: ResumeGenerationJobSchema,
  resumeSettings: ResumeSettingsSchema,
  resumeDownloadLogs: ResumeDownloadLogSchema,
};

export function getMongooseModel(name: CollectionName): Model<Record<string, unknown>> {
  const existing = mongoose.models[name];
  if (existing) return existing as Model<Record<string, unknown>>;
  return mongoose.model<Record<string, unknown>>(name, SchemaRegistry[name], name);
}
