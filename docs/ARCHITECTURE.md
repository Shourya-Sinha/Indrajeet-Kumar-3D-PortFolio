# Shourya Sinha — 3D Developer Portfolio, IT Solutions & Dynamic ATS Resume Platform
## Comprehensive System & Visual Architecture

---

## 1. Visual Design System

### 1.1 Color Palette & Surface Tokens
- **Primary Canvas**:
  - `--bg-void`: `#050608` (Primary viewport background)
  - `--bg-graphite`: `#101318` (Elevated surfaces, modular panels)
  - `--bg-carbon`: `#161B24` (Secondary glass cards, interactive stages)
- **Metallic & Glass Finishes**:
  - `--chrome-highlight`: `#E6ECF5`
  - `--chrome-silver`: `#9BA7BA`
  - `--glass-surface`: `rgba(16, 19, 24, 0.58)` with `backdrop-filter: blur(22px) saturate(140%)`
  - `--glass-border`: `rgba(255, 255, 255, 0.11)`
- **Accent Spectrum**:
  - `--accent-cyan`: `#00E5FF` (Primary interactive energy, telemetry, active states)
  - `--accent-blue`: `#2979FF` (Secondary structural highlights, links)
  - `--accent-violet`: `#8B5CF6` (3D rim illumination, AI & research accents)
  - `--status-emerald`: `#10B981` (Production status, verified availability)
  - `--status-amber`: `#F59E0B` (Experimental / pending verification states)
- **Typography Scale**:
  - Display / Hero Heading: `Space Grotesk` (700, `-0.03em` tracking, `clamp(2.75rem, 6.2vw, 5.75rem)`)
  - Section Titles: `Sora` (600, `-0.02em` tracking, `clamp(2rem, 4vw, 3.5rem)`)
  - Subheadings & Interactive Labels: `Plus Jakarta Sans` (500–600)
  - Body Copy & Technical Specs: `Inter` (400–500, `1.65` line-height)
  - Code / Telemetry / Version Badges: Monospace (`ui-monospace`)

### 1.2 Motion & Depth Rules
- Cinematic dark ambient occlusion feel, crisp 1px specular top-borders on glass containers, subtle radial volumetric glows, and purposeful depth-of-field layering.
- Global `prefers-reduced-motion` support disables camera drift, auto-rotation, and parallax while retaining state clarity.

---

## 2. Desktop & Mobile Wireframes

### 2.1 Public Application Flow (`/`)
```
+-------------------------------------------------------------------+
| [Nav Bar: Brand | About | Expertise | Services | Work | Resume | Hire]
+-------------------------------------------------------------------+
| SECTION 01: HERO (100vh)                                          |
|  [Left/Center]                     [Full-bleed R3F Canvas]        |
|  • Availability Pulse              • Liquid Chrome Core + Rings   |
|  • SHOURYA SINHA / KUMAR INDRAJEET • Interactive Particle Field   |
|  • "Engineering Intelligent        • Mouse + Scroll Camera Rig    |
|     Digital Experiences."                                         |
|  • [Explore Work] [Hire Me] [Download Resume]                     |
+-------------------------------------------------------------------+
| SECTION 02: ABOUT ME                                              |
|  [3D Geometric Identity Visual]  |  [Floating Glass Bio Panel]    |
|  • Verified 5+ Yrs Experience    • MCA Cybersecurity (9.4 GPA)    |
|  • Patna, Bihar · India          • Download Resume CTA            |
+-------------------------------------------------------------------+
| SECTION 03: TECHNICAL EXPERTISE                                   |
|  [Interactive 3D Orbital Clusters] + [8 Admin-Managed Categories] |
|  Frontend · Backend · Mobile · DB · AI/ML · Cyber · DevOps · SEO  |
+-------------------------------------------------------------------+
| SECTION 04: IMMERSIVE SERVICES (GSAP Pinned Scroll Stage)         |
|  Desktop: Sticky 100vh split — [Left: Step Index/Copy/Tech/CTAs]  |
|           [Right: Synchronized 3D Service Stage + Visual Preview] |
|  Mobile:  Touch-swipeable / tabbed stage + compact 3D preview     |
|  17 Ordered Services (01 Web Dev -> 17 CRM & Enterprise Systems)  |
+-------------------------------------------------------------------+
| SECTION 05: PROFESSIONAL EXPERIENCE (3D Animated Career Timeline) |
|  Ananta Infratech -> Galaxy Software -> Fillip -> CSDT            |
+-------------------------------------------------------------------+
| SECTION 06: FEATURED PROJECTS (Large Product Showcase Stages)     |
|  #1 Attack Path Discovery v2.5 (3D Attack Graph + 8 Live Demos)   |
|  #2 JARVIS Local AI (Ollama + Hugging Face GGUF)                  |
|  #3 PortPilot · #4 StreamNova · #5 Telegram Blockchain            |
|  #6 Maa Bhawani · #7 BetMaster · #8 Adversarial URL Classifier    |
+-------------------------------------------------------------------+
| SECTION 07: CERTIFICATIONS (3D Metallic Frames + PDF Reader)      |
|  3D Interactive Frames + Page-Turn / Zoom / Fullscreen / Download |
+-------------------------------------------------------------------+
| SECTION 08: EDUCATION (3D Academic Progression)                   |
|  MCA Cybersecurity (Amrita, 9.4) · B.Sc. IT (Sunrise Univ, 2018)  |
+-------------------------------------------------------------------+
| SECTION 09: GITHUB ACTIVITY (Live Cached Public Profile & Repos)  |
+-------------------------------------------------------------------+
| SECTION 10: FREELANCE SERVICES ("Let's Build Something Exceptional")|
+-------------------------------------------------------------------+
| SECTION 11: CONTACT PORTAL (3D Glass Portal + Inquiry Form)       |
+-------------------------------------------------------------------+
| FOOTER: "Designed, Developed & Maintained by Shourya Sinha..."    |
+-------------------------------------------------------------------+
```

### 2.2 Dedicated Routes
- `/projects/[slug]` — Full interactive case study + deep interactive 3D architecture/simulation views.
- `/resume` — Public ATS Resume Download Center (latest version + full historical archive starting at original `v1.0`, role-specific profiles, PDF viewer + PDF/DOCX downloads).
- `/admin/*` — Protected 21-module CMS sidebar shell with responsive drawer on mobile/tablet, live preview status, and ATS Resume Management Center.

---

## 3. Original 3D Visual Asset Plan (22 Bespoke Visuals)

Every major section, service domain, and project uses a dedicated text-free dark futuristic 3D visual composition stored under `public/assets/visuals/` (and synced to Cloudinary via Admin Media Library):
1. `hero-environment.webp` — Liquid chrome sphere, holographic circuits, cyan/violet lighting
2. `about-identity.webp` — Geometric holographic identity monolith & floating glass panels
3. `service-web-dev.webp` — Floating dark glass browsers, metallic code slabs
4. `service-mobile-dev.webp` — 3D titanium smartphone mockups with holographic UI layers
5. `service-ai-automation.webp` — Glowing cyan-violet neural lattice & digital core
6. `service-cybersecurity.webp` — Illuminated crystalline digital shield with graph nodes
7. `service-seo-analytics.webp` — Volumetric holographic search & telemetry graph landscape
8. `service-cloud-devops.webp` — Floating modular server clusters & orbital network nodes
9. `service-it-support.webp` — Technical operations console with floating telemetry HUDs
10. `service-python-dev.webp` — Holographic algorithmic code prisms & data conduits
11. `project-attack-path.webp` — 3D cybersecurity attack graph showing choke points & critical paths
12. `project-jarvis-ai.webp` — Holographic local AI assistant sphere & voice/vision rings
13. `project-portpilot.webp` — Cloud deployment engine & routing mesh infrastructure
14. `project-streamnova.webp` — Spatial audio waveforms, 3D phone & media player stage
15. `project-blockchain.webp` — Interconnected glowing ledger nodes & holographic wallet frame
16. `project-workforce.webp` — Enterprise construction operations grid & secure encrypted vault
17. `project-gaming.webp` — Real-time stadium telemetry arena & multi-node WebSocket core
18. `project-adversarial-ml.webp` — Decision boundary manifold & adversarial perturbation wavefield
19. `section-experience.webp` — Illuminated chronological helix & metallic milestone discs
20. `section-certifications.webp` — Suspended obsidian/chrome gallery plinths & glass frames
21. `section-education.webp` — Architectural geometric knowledge lattice & crystal prism
22. `section-contact.webp` — Glowing liquid-glass communication portal & particle rings

---

## 4. Three.js & React Three Fiber Scene Architecture

- **`SafeCanvas` Wrapper**:
  - WebGL2 capability probe before mounting `<Canvas>`.
  - Graceful interactive 2D/CSS-3D fallback when WebGL is unavailable or `prefers-reduced-motion: reduce` is enabled.
  - `IntersectionObserver` pauses `frameloop` when off-screen to preserve battery and frame budget.
  - Adaptive `dpr={[1, 1.75]}` (clamped to `[1, 1.25]` on coarse/mobile viewports).
- **Scene Modules**:
  - `HeroCanvas`: Custom vertex/fragment noise-displaced liquid-chrome core (`MeshPhysicalMaterial` + procedural `Environment` lightformers), 3 tilted orbital holographic rings, instanced floating particles, pointer parallax + scroll camera interpolation.
  - `ExpertiseCanvas`: 8 orbital technology nodes grouped by category; hovering/selecting a category smoothly lerps camera focus and highlights links.
  - `ServicesStageCanvas`: Single persistent R3F scene driven by normalized GSAP scroll progress (`0..1` across 17 steps); morphs centerpiece geometry, shader color spectrum, orbital satellites, and floor grid reflectivity per service index.
  - `AttackGraph3DCanvas`: Interactive 3D node-link graph for Attack Path Discovery v2.5 with selectable path modes (Internet Exposure -> API Gateway -> Auth Service -> Admin Role -> Crown Jewel DB), animated pulse packets along Dijkstra shortest critical path, and betweenness choke-point halos.
  - `ContactPortalCanvas`: Toroidal glass-refractive portal with rotating chrome rings and ambient particle halo.

---

## 5. Scroll Animation Architecture

- **Lenis**: Smooth scroll provider initialized on public routes, synced cleanly with `gsap.ticker` and `ScrollTrigger.update()`, disabled gracefully inside modals and `/admin` routes.
- **GSAP ScrollTrigger**:
  - Section 04 (Services): Single pinned container (`pin: true`, `scrub: 0.8`) calculating discrete active step (`0..16`) plus continuous intra-step interpolation passed via ref to `ServicesStageCanvas`. Mobile viewports (`< 1024px`) switch to a crisp touch-friendly horizontal pill/swipe deck paired with a lightweight 3D preview to prevent mobile scroll-lock friction.
  - Hero & About: Scroll-scrubbed camera dolly & subtle parallax glass cards.
  - Timeline & Projects: Staggered `fromTo` entrance reveals with `once: true` and `clearProps` hygiene.

---

## 6. Component Architecture

- `src/components/ui/`: `MagneticButton`, `GlassPanel`, `SectionShell`, `StatusBadge`, `SitePreloader`.
- `src/components/layout/`: `Navbar` (dynamic from `navigationItems` CMS), `Footer` (dynamic from `siteSettings`), `PublicShell` (Lenis + theme CSS variable injector).
- `src/components/sections/`: Modular section components (`HeroSection`, `AboutSection`, `ExpertiseSection`, `ServicesPinnedSection`, `ExperienceTimelineSection`, `ProjectsGallerySection`, `CertificationsSection`, `EducationSection`, `GitHubActivitySection`, `FreelanceSection`, `ContactSection`).
- `src/components/projects/`: `AttackPathInteractiveSuite` (all 8 live simulated architectural demos: Attack Graph, Critical Path Dijkstra, 121-Engine Selector, FAIR 4000x Monte Carlo Risk Visualizer, Autonomous BOT Scheduler, Threat Hunting Query Console, Zero-Trust Policy Generator, Automated Remediation Patch Viewer).
- `src/components/certificates/`: `CertificateReaderModal` powered by `pdfjs-dist` with local worker, CSS 3D page-turn animation, zoom controls, fullscreen toggle, and original download.
- `src/components/admin/`: `AdminSidebar`, `CollectionCrudView`, `MediaUploader`, `ResumeManagementWorkspace`, `AuditLogViewer`.

---

## 7. Backend Architecture

Unified modular TypeScript backend hosted inside Next.js App Router API routes (`src/app/api/**`) with strict layering:
1. **Route Layer**: Auth/RBAC middleware, CSRF & origin validation, rate limiting, Zod schema validation, HTTP status normalization.
2. **Service Layer**: Business rules (Resume change detection & semantic versioning, Cloudinary signed upload generation, GitHub API TTL caching, SMTP/Resend dispatch, Audit log emission).
3. **Persistence Layer (`src/lib/db`)**:
   - Real **MongoDB + Mongoose** models across all 23 collections when `MONGODB_URI` is configured.
   - Schema-validated local file-backed repository adapter (`mingo` query engine + Mongoose `.validate()` enforcement) for self-contained local development when `MONGODB_URI` is unset.

---

## 8. MongoDB Schema Architecture (23 Collections)

### Core CMS & Portfolio Collections (16)
1. `users`: `{ email, name, passwordHash, role ('super_admin' | 'editor' | 'viewer'), isActive, lastLoginAt, timestamps }`
2. `siteSettings`: `{ brandName, alternateName, footerCredit, resumeAutoPublish, defaultResumeProfile, contactVisibility, githubUsername, maintenanceMode, themeConfig, timestamps }`
3. `heroContent`: `{ badgeText, primaryName, alternateName, roles[], headline, subheading, primaryCtaLabel, secondaryCtaLabel, resumeCtaLabel, heroImageUrl, sceneSettings, isPublished, timestamps }`
4. `aboutContent`: `{ summary, location, yearsExperience, educationHighlight, specialties[], careerGoals, profileImageUrl, stats[], isPublished, timestamps }`
5. `experiences`: `{ company, role, location, startDate, endDate, isCurrent, description, responsibilities[], technologies[], logoUrl, order, status, includeInPortfolio, includeInResume, resumeProfiles[], timestamps }`
6. `services`: `{ slug, numberLabel, title, shortTagline, description, deliverables[], technologies[], imageUrl, sceneThemeKey, ctaLabel, order, status, includeInPortfolio, timestamps }`
7. `projects`: `{ slug, title, version, badge, summary, fullDescription, category, status ('Production'|'Completed'|'In Development'|'Experimental'|'Research'|'Planned'), featuredRank, capabilities[], experimentalFeatures[], plannedFeatures[], technologies[], architectureModules[], githubUrl, liveUrl, imageUrl, galleryUrls[], videoUrl, interactiveDemoKey, order, isPublished, includeInPortfolio, includeInResume, resumeProfiles[], timestamps }`
8. `certifications`: `{ title, issuer, location, issueDate, credentialId, verificationUrl, description, documentUrl, previewImageUrl, documentType ('pdf'|'image'|'credential_summary'), hasOriginalDocument, order, status, includeInPortfolio, includeInResume, resumeProfiles[], timestamps }`
9. `education`: `{ degree, field, institution, location, startDate, endDate, gpa, highlights[], order, status, includeInPortfolio, includeInResume, resumeProfiles[], timestamps }`
10. `skills`: `{ name, category, proficiency, experienceYears, description, order, status, includeInPortfolio, includeInResume, resumeProfiles[], timestamps }`
11. `freelanceServices`: `{ title, category, description, deliverables[], timelineEstimate, startingBudget, order, status, timestamps }`
12. `mediaAssets`: `{ publicId, secureUrl, resourceType, format, fileName, folder, altText, bytes, width, height, storageProvider ('cloudinary'|'local'), uploadedBy, timestamps }`
13. `contactInquiries`: `{ fullName, email, phone, serviceCategory, budget, preferredContactMethod, description, status ('new'|'reviewed'|'replied'|'archived'), adminNotes, emailDeliveryStatus, ipHash, timestamps }`
14. `seoMetadata`: `{ routeKey, title, description, keywords[], canonicalUrl, ogTitle, ogDescription, ogImageUrl, twitterCard, noIndex, structuredDataOverrides, timestamps }`
15. `navigationItems`: `{ label, href, zone ('header'|'footer'), order, isExternal, isVisible, timestamps }`
16. `auditLogs`: `{ actorId, actorEmail, action, collectionName, targetId, summary, metadata, ipAddress, createdAt }`

### Dynamic Professional Profile & Automated ATS Resume Collections (7)
17. `professionalProfiles`: `{ profileKey ('master'), fullName, displayName, headline, email, phone, location, githubUrl, linkedinUrl, summary, resumeHeadline, customSections, updatedAt }`
18. `resumeTemplates`: `{ key, name, description, layout ('ats-single-column'), accentColor, fontFamily, sectionOrder[], isDefault, timestamps }`
19. `resumeVersions`: `{ profileType ('general'|'fullstack'|'mobile'|'python-ai'|'cybersecurity'|'it-support'), version, major, minor, patch, title, description, releaseNotes, generatedAt, publishedAt, createdBy, status ('published'|'archived'), profileSnapshot, contentHash, pdfUrl, docxUrl, pdfStorageKey, docxStorageKey, templateVersion, isLatest, isPublic, isOriginalBaseline, changeSummary, validationReport, timestamps }`
20. `resumeDrafts`: `{ profileType, suggestedVersion, bumpType ('patch'|'minor'|'major'), status ('pending'|'outdated'|'validated'|'discarded'), profileSnapshot, contentHash, basedOnVersion, changeSummary, validationReport, previewPdfUrl, previewDocxUrl, timestamps }`
21. `resumeGenerationJobs`: `{ profileType, triggerSource, status ('queued'|'running'|'completed'|'failed'), versionTarget, errorMessage, durationMs, timestamps }`
22. `resumeSettings`: `{ publishingMode ('manual'|'automatic'), activeTemplateKey, autoGenerateDraftOnProfileChange, enabledRoleProfiles[], timestamps }`
23. `resumeDownloadLogs`: `{ version, profileType, format ('pdf'|'docx'), sourceRoute, userAgent, ipHash, downloadedAt }`

---

## 9. Admin CMS Architecture (`/admin`)

21 integrated modules accessible under authenticated RBAC navigation:
1. Dashboard (metrics, pending resume drift alert, recent inquiries, quick links)
2. Hero Editor
3. About Editor
4. Experience Manager (add/edit/delete/publish/reorder + resume inclusion toggles)
5. Services Manager (17+ pinned scroll services editor & order manager)
6. Projects Manager (full metadata, status tags, capabilities, resume toggle)
7. Certifications Manager (PDF/image upload + credential metadata)
8. Education Manager
9. Skills Manager (8 groups + proficiency + resume toggle)
10. Freelance Services Manager
11. Media Library (Cloudinary signed upload + local preview store + alt text editing)
12. Contact Settings (syncs directly with `professionalProfiles`)
13. Inquiry Manager (status tracking, notes, email telemetry)
14. SEO Manager (per-route metadata, OG tags, structured data preview)
15. Navigation Manager
16. Theme Manager (accent colors, glow intensity, reduced-motion defaults, section visibility)
17. Footer Editor
18. Site Settings
19. User Management (RBAC roles, password reset, active flags)
20. Audit Logs
21. ATS Resume Management Center (`/admin/resume-management`) — Current status, draft preview, PDF/DOCX export, structural diff viewer (`ADDED` / `MODIFIED` / `REMOVED`), real PDF text-extraction ATS validation report, version history, snapshot rollback, manual vs automatic publishing toggle, and 5 role-specific resume generators.

---

## 10. API Specification

### Public Endpoints
- `GET /api/health` — System readiness, DB mode, storage driver health
- `GET /api/public/portfolio` — Published portfolio hydration payload
- `GET /api/public/github` — Cached `Shourya-Sinha` profile & public repository catalog
- `POST /api/public/contact` — Validated, rate-limited inquiry submission + email notification
- `GET /api/public/resume/latest` — Latest published public general & role resumes
- `GET /api/public/resume/versions` — Published resume version archive (`v1.0` onward)
- `GET /api/public/resume/version/[version]` — Metadata for specific published version
- `GET /api/public/resume/download/[version]/pdf` & `/docx` — Version-immutable download + audit log

### Admin Endpoints (Authenticated + CSRF Verified + Audit Logged)
- `POST /api/admin/auth/login` | `POST /api/admin/auth/logout` | `GET /api/admin/auth/me` | `GET /api/admin/auth/csrf`
- `GET /api/admin/dashboard`
- `GET/POST /api/admin/content/[collection]` | `PATCH/DELETE /api/admin/content/[collection]/[id]`
- `POST /api/admin/media/sign` | `POST /api/admin/media/upload` | `GET /api/admin/media` | `DELETE /api/admin/media/[id]`
- `GET/PATCH/DELETE /api/admin/inquiries/[id]`
- `GET/POST /api/admin/users` | `PATCH/DELETE /api/admin/users/[id]`
- `GET /api/admin/audit-logs`
- `GET /api/admin/resume/current` | `GET /api/admin/resume/versions` | `POST /api/admin/resume/generate`
- `POST /api/admin/resume/preview` | `POST /api/admin/resume/publish` | `POST /api/admin/resume/compare`
- `POST /api/admin/resume/rollback` | `PUT /api/admin/resume/settings` | `GET /api/admin/resume/validation`
- `GET /api/admin/resume/change-summary` | `GET /api/admin/resume/templates`

---

## 11. Deployment Architecture

- **Vercel / Serverless Target**: Next.js 15 App Router, MongoDB Atlas (`MONGODB_URI`), Cloudinary signed uploads, SMTP/Resend notifications, persistent S3/Cloudinary or mounted volume for generated resume archives.
- **Docker / VPS Target**: Multi-stage `Dockerfile` + `docker-compose.yml` running `web` (Next.js standalone), `mongodb` (`mongo:7` with persistent named volume), and optional `redis`, with health checks and automated backup scripts (`mongodump` + `/storage/resumes` archive).
