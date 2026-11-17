import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { ensureDbConnected, getDbState } from "./connection";
import { countDocs, createOne, findOne } from "./repository";
import type { ResumeProfileType } from "./types";
import { buildResumeSnapshot } from "../resume/role-profiles";
import { computeSnapshotHash } from "../resume/hash";
import { generateAtsResumePdfBuffer } from "../resume/pdf-generator";
import { generateAtsResumeDocxBuffer } from "../resume/docx-generator";
import { validateResumePdfBuffer } from "../resume/ats-validator";
import {
  getGeneratedVersionPaths,
  getOriginalBaselinePdfPath,
} from "../resume/service";

let seedPromise: Promise<void> | null = null;

export async function ensureDatabaseSeeded(): Promise<void> {
  const state = getDbState();
  if (state.seeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = runSeed()
    .then(() => {
      state.seeded = true;
    })
    .finally(() => {
      seedPromise = null;
    });

  return seedPromise;
}

async function runSeed(): Promise<void> {
  await ensureDbConnected();

  // 1. Admin user
  const userCount = await countDocs("users");
  if (userCount === 0) {
    const adminEmail = (process.env.ADMIN_EMAIL || "Krindrajeet.c@gmail.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "ShouryaAdmin!2026";
    const adminName = process.env.ADMIN_NAME || "Shourya Sinha";
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await createOne("users", {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });
  }

  // 2. Site Settings
  if (!(await findOne("siteSettings", { settingsKey: "primary" }))) {
    await createOne("siteSettings", {
      settingsKey: "primary",
      brandName: "SHOURYA SINHA",
      alternateName: "KUMAR INDRAJEET",
      tagline: "Full Stack Developer | Mobile App Engineer | AI & Cybersecurity Enthusiast",
      footerCredit: "Designed, Developed & Maintained by Shourya Sinha (Kumar Indrajeet).",
      availabilityStatus: "Available for Freelance & Full-Stack / AppSec Roles",
      availableForHire: true,
      githubUsername: "Shourya-Sinha",
      contactEmail: "Krindrajeet.c@gmail.com",
      contactPhone: "+91 917488348576",
      location: "Patna, Bihar, India",
      githubUrl: "https://github.com/Shourya-Sinha",
      linkedinUrl: "https://linkedin.com/in/indrajeetsinha1",
      maintenanceMode: false,
      themeConfig: {
        voidColor: "#050608",
        graphiteColor: "#101318",
        cyanAccent: "#00E5FF",
        blueAccent: "#2979FF",
        violetAccent: "#8B5CF6",
        glowIntensity: 0.75,
        enableReducedMotionByDefault: false,
      },
      sectionVisibility: {
        hero: true,
        about: true,
        expertise: true,
        services: true,
        experience: true,
        projects: true,
        certifications: true,
        education: true,
        github: true,
        freelance: true,
        contact: true,
      },
    });
  }

  // 3. Master Professional Profile (Single Source of Truth)
  if (!(await findOne("professionalProfiles", { profileKey: "master" }))) {
    await createOne("professionalProfiles", {
      profileKey: "master",
      fullName: "KUMAR INDRAJEET",
      displayName: "SHOURYA SINHA",
      headline: "Full Stack Developer | Mobile App Engineer | AI & Cybersecurity Enthusiast",
      resumeHeadline: "Full Stack Developer | MERN Stack | Cybersecurity Enthusiast",
      email: "Krindrajeet.c@gmail.com",
      phone: "+91 917488348576",
      location: "Patna, Bihar, India",
      githubUrl: "https://github.com/Shourya-Sinha",
      linkedinUrl: "https://linkedin.com/in/indrajeetsinha1",
      summary:
        "Full Stack Developer with 5+ years of progressive experience delivering production-grade MERN stack applications — from enterprise workforce management platforms to real-money gaming ecosystems. Track record of owning full product cycles: system design, secure API architecture, encrypted data handling, role-based access control, and mobile-first React Native delivery. Currently pursuing MCA in Cybersecurity (GPA 9.4/10) at Amrita Vishwa Vidyapeetham with applied research in adversarial ML and threat detection. Combines deep full-stack engineering with growing security expertise — a strong fit for Senior Full Stack, Mobile App, or Application Security Engineering roles.",
      customSectionOrder: [
        "summary",
        "experience",
        "projects",
        "skills",
        "education",
        "certifications",
      ],
    });
  }

  // 4. Hero Content
  if (!(await findOne("heroContent", { contentKey: "primary" }))) {
    await createOne("heroContent", {
      contentKey: "primary",
      badgeText: "AVAILABLE FOR SELECTIVE ENGINEERING & SECURITY ENGAGEMENTS",
      primaryName: "SHOURYA SINHA",
      alternateName: "KUMAR INDRAJEET",
      roles: [
        "Full Stack Developer",
        "Mobile App Engineer",
        "AI & Cybersecurity Enthusiast",
      ],
      headline: "Engineering Intelligent Digital Experiences.",
      subheading:
        "Building powerful web applications, mobile products, intelligent automation and secure digital systems that transform ideas into real-world solutions.",
      primaryCtaLabel: "EXPLORE MY WORK",
      secondaryCtaLabel: "HIRE ME",
      resumeCtaLabel: "DOWNLOAD RESUME",
      heroImageUrl: "/assets/visuals/hero-environment.webp",
      heroImageAlt: "Futuristic liquid chrome sphere surrounded by holographic rings and particles",
      sceneConfig: {
        chromeDistortion: 0.35,
        particleCount: 320,
        rotationSpeed: 0.25,
      },
      status: "published",
    });
  }

  // 5. About Content
  if (!(await findOne("aboutContent", { contentKey: "primary" }))) {
    await createOne("aboutContent", {
      contentKey: "primary",
      headline: "Engineering Full-Stack Systems with Security-First Architecture",
      summary:
        "Full Stack Developer with 5+ years of progressive experience delivering production-grade MERN stack applications — from enterprise workforce management platforms to real-time gaming and local AI systems. Currently pursuing MCA in Cybersecurity (GPA 9.4/10) at Amrita Vishwa Vidyapeetham with applied research in graph-based attack path discovery, adversarial machine learning, and automated threat detection.",
      location: "Patna, Bihar, India",
      yearsExperience: "5+ Years",
      educationHighlight: "MCA in Cybersecurity · Amrita Vishwa Vidyapeetham (GPA 9.4/10)",
      specialties: [
        "Full-Stack Engineering (Next.js, React, Node.js, NestJS)",
        "Mobile Development (React Native & Expo)",
        "Backend & Secure API Architecture (JWT, RBAC, AES Encryption)",
        "AI & Local LLM Automation (Ollama, Hugging Face GGUF)",
        "Cybersecurity Research & Adversarial ML",
        "Cloud Deployment & System Automation",
      ],
      careerGoals:
        "Architecting resilient full-stack platforms, cross-platform mobile products, and intelligent security automation systems across web, cloud, and local AI ecosystems.",
      profileImageUrl: "/assets/visuals/about-identity.webp",
      profileImageAlt: "Geometric obsidian and glass architectural identity monolith",
      stats: [
        { label: "Engineering Experience", value: "5+ Years", note: "Since Feb 2019" },
        { label: "MCA Cybersecurity GPA", value: "9.4 / 10", note: "Amrita Vishwa Vidyapeetham" },
        { label: "Public GitHub Repositories", value: "51+", note: "github.com/Shourya-Sinha" },
        { label: "Attack Discovery Engines", value: "121", note: "Attack Path Framework v2.5" },
      ],
      status: "published",
    });
  }

  // 6. Experiences (Verified exact data from Kumar_Indrajeet_Resume_Ananta_Updated.pdf)
  if ((await countDocs("experiences")) === 0) {
    const experiencesData = [
      {
        company: "Ananta Infratech Solutions",
        role: "Full Stack Developer",
        location: "India",
        startDate: "",
        endDate: "Present",
        isCurrent: true,
        description:
          "Engineering business-operations CRM platforms and custom workforce support systems.",
        responsibilities: [
          "Developing a CRM website to support business operations, customer relationship workflows, and centralized information management.",
          "Building a custom support application for workforce management to streamline employee coordination and operational support.",
        ],
        technologies: ["React", "Next.js", "Node.js", "Express.js", "MongoDB", "Docker", "WebSockets"],
        order: 1,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack", "mobile", "cybersecurity", "it-support"] as ResumeProfileType[],
      },
      {
        company: "Galaxy Software Solutions",
        role: "Full Stack Developer",
        location: "Yangon",
        startDate: "Apr 2023",
        endDate: "Present",
        isCurrent: true,
        description:
          "Architected and shipped enterprise workforce management, encrypted KYC pipelines, financial P&L modules, and multivendor commerce systems.",
        responsibilities: [
          "Architected and shipped a full workforce management platform (Maa Bhawani Construction) — covering admin, co-admin, and worker (user) roles — currently in production (v2.0 completed).",
          "Built per-day attendance tracking, salary management, increment request workflows, and kharchi (mid-month advance) deduction system with automated end-of-month reconciliation.",
          "Engineered encrypted document upload and storage for sensitive worker profile data (Aadhaar and other KYC documents) using AES encryption with server-side key management.",
          "Developed investment and P&L tracking module for company financials — tracking capital rotation, site-level investment, and live profit/loss dashboard for admin visibility.",
          "Built and deployed multivendor e-commerce platform with product listings, vendor dashboards, user ratings/reviews, and Razorpay/Stripe payment integration.",
          "Designed JWT-secured RESTful APIs with RBAC across all roles; optimized React frontend with code splitting and Redux state normalization — reducing load times by ~30%.",
          "Led peer code reviews, mentored junior developers, and collaborated cross-functionally with designers and product stakeholders to ship features on schedule.",
        ],
        technologies: [
          "React Native",
          "React.js",
          "Node.js",
          "Express.js",
          "MongoDB",
          "Redux",
          "JWT",
          "AES Encryption",
          "Razorpay",
          "Stripe",
        ],
        order: 2,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack", "mobile", "cybersecurity", "it-support"] as ResumeProfileType[],
      },
      {
        company: "Fillip Software",
        role: "React Developer",
        location: "Patna, India",
        startDate: "Jun 2020",
        endDate: "Jul 2022",
        isCurrent: false,
        description:
          "Built interactive React web applications, atomic design systems, and transitioned into full-stack Node.js services.",
        responsibilities: [
          "Built and maintained 10+ interactive React web applications using ES6+, React Hooks, and Context API for state management.",
          "Developed atomic design component library adopted across 3 product lines, reducing development time by ~25%.",
          "Spearheaded redesign of flagship e-commerce platform, improving user engagement and driving measurable sales growth.",
          "Began full-stack transition by building Node.js/Express services and REST endpoints alongside React frontend work.",
        ],
        technologies: ["React.js", "JavaScript (ES6+)", "Context API", "Node.js", "Express.js", "REST APIs"],
        order: 3,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack", "mobile", "it-support"] as ResumeProfileType[],
      },
      {
        company: "CSDT IT Solutions",
        role: "Frontend Developer",
        location: "Patna, India",
        startDate: "Feb 2019",
        endDate: "Mar 2020",
        isCurrent: false,
        description:
          "Delivered responsive cross-browser client websites, interactive UX prototypes, and frontend engineering standards.",
        responsibilities: [
          "Delivered responsive, cross-browser websites for 15+ clients using HTML5, CSS3, JavaScript, and Bootstrap.",
          "Produced interactive mockups and clickable prototypes to validate UX with clients before build — reducing revision cycles significantly.",
          "Mentored junior team members and enforced coding standards across the team.",
        ],
        technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "Responsive Design"],
        order: 4,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack"] as ResumeProfileType[],
      },
    ];
    for (const item of experiencesData) {
      await createOne("experiences", item);
    }
  }

  // 7. 17 Ordered Pinned Scroll Services (Master Prompt Section 04)
  if ((await countDocs("services")) === 0) {
    const servicesData = [
      {
        slug: "web-development",
        numberLabel: "01",
        title: "Web Development",
        shortTagline: "High-precision interactive web applications engineered for speed and clarity.",
        description:
          "Custom modern web platforms built with React, Next.js, TypeScript, and hardware-accelerated 3D visuals with accessible semantic architecture.",
        deliverables: ["Responsive Web Apps", "Interactive 3D Experiences", "Atomic Component Systems", "Performance Budgets"],
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "GSAP"],
        imageUrl: "/assets/visuals/service-web-dev.webp",
        imageAlt: "3D floating dark glass browser planes and titanium grid",
        sceneThemeKey: "web-prism",
      },
      {
        slug: "full-stack-development",
        numberLabel: "02",
        title: "Full-Stack Development",
        shortTagline: "End-to-end product architecture from MongoDB/PostgreSQL to polished client UI.",
        description:
          "Complete production software cycles covering system architecture, relational/document database modeling, real-time sockets, and admin dashboards.",
        deliverables: ["End-to-End SaaS Platforms", "Role-Based Admin Dashboards", "Database & API Design", "Real-Time Sync"],
        technologies: ["Next.js", "Node.js", "NestJS", "MongoDB", "PostgreSQL", "Redis"],
        imageUrl: "/assets/visuals/service-web-dev.webp",
        imageAlt: "3D layered full-stack architecture interface",
        sceneThemeKey: "fullstack-core",
      },
      {
        slug: "react-native-expo-development",
        numberLabel: "03",
        title: "React Native and Expo Development",
        shortTagline: "Cross-platform native mobile apps with offline resilience and encrypted local storage.",
        description:
          "Mobile-first Android and iOS experiences built with React Native and Expo featuring Redux state normalization, smooth 60fps gestures, and biometric/JWT auth.",
        deliverables: ["iOS & Android Apps", "Push Notifications", "Offline Sync", "Encrypted KYC Capture"],
        technologies: ["React Native", "Expo", "TypeScript", "Redux", "Reanimated", "REST APIs"],
        imageUrl: "/assets/visuals/service-mobile-dev.webp",
        imageAlt: "3D titanium smartphones with holographic mobile UI planes",
        sceneThemeKey: "mobile-monolith",
      },
      {
        slug: "android-application-development",
        numberLabel: "04",
        title: "Android Application Development",
        shortTagline: "Production Android builds engineered for diverse devices, permissions, and field reliability.",
        description:
          "Dedicated Android client engineering with fine-grained OS permission handling, file-system tooling, background services, and signed release pipelines.",
        deliverables: ["Signed APK / AAB Releases", "Permission & Media Pipelines", "Background Telemetry", "Play Store Readiness"],
        technologies: ["React Native CLI", "Android SDK", "Expo", "JWT Auth", "SQLite"],
        imageUrl: "/assets/visuals/service-mobile-dev.webp",
        imageAlt: "3D Android smartphone studio mockup",
        sceneThemeKey: "android-slate",
      },
      {
        slug: "python-development",
        numberLabel: "05",
        title: "Python Development",
        shortTagline: "High-throughput FastAPI backends, security engines, ML pipelines, and CLI tools.",
        description:
          "Modular Python systems spanning async FastAPI microservices, graph algorithms, Scikit-Learn/TensorFlow pipelines, and Windows/Linux system utilities.",
        deliverables: ["FastAPI Microservices", "Data & ML Pipelines", "Desktop Automation Tools", "Security Analyzers"],
        technologies: ["Python", "FastAPI", "Scikit-Learn", "TensorFlow", "NumPy", "Pandas"],
        imageUrl: "/assets/visuals/service-python-dev.webp",
        imageAlt: "3D holographic algorithmic prisms and code streams",
        sceneThemeKey: "python-lattice",
      },
      {
        slug: "ai-local-llm-integration",
        numberLabel: "06",
        title: "AI and Local LLM Integration",
        shortTagline: "Privacy-first AI workflows powered by Ollama and local Hugging Face GGUF models.",
        description:
          "Zero-leakage local intelligence integrating Ollama, quantized GGUF inference, voice pipelines, and retrieval workflows directly into desktop or enterprise apps.",
        deliverables: ["Local Ollama Workflows", "GGUF Inference Pipelines", "Voice & Face-Auth Agents", "AI API Gateways"],
        technologies: ["Ollama", "Hugging Face", "GGUF", "Python", "FastAPI", "TensorFlow"],
        imageUrl: "/assets/visuals/service-ai-automation.webp",
        imageAlt: "3D glowing neural network core",
        sceneThemeKey: "ai-neural",
      },
      {
        slug: "seo-optimization",
        numberLabel: "07",
        title: "SEO Optimization",
        shortTagline: "Technical search engineering, structured JSON-LD schema, and Core Web Vitals tuning.",
        description:
          "Comprehensive technical SEO covering canonical routing, dynamic XML sitemaps, schema.org Person/Service markup, Open Graph telemetry, and crawl budget efficiency.",
        deliverables: ["JSON-LD Schema", "Dynamic Sitemaps & Robots", "Core Web Vitals Audits", "Metadata CMS Controls"],
        technologies: ["Next.js Metadata", "JSON-LD", "Schema.org", "Lighthouse", "Technical SEO"],
        imageUrl: "/assets/visuals/service-seo-analytics.webp",
        imageAlt: "3D luminous search telemetry ribbons",
        sceneThemeKey: "seo-telemetry",
      },
      {
        slug: "backend-api-engineering",
        numberLabel: "08",
        title: "Backend and API Engineering",
        shortTagline: "Hardened REST and WebSocket backends with RBAC, rate limiting, and audit trails.",
        description:
          "Fault-tolerant server architectures engineered with Node.js, Express, NestJS, and FastAPI featuring JWT rotation, Redis throttling, and cryptographic data protection.",
        deliverables: ["REST & WebSocket APIs", "RBAC Authorization", "Redis Rate Limiting", "AES Data Encryption"],
        technologies: ["Node.js", "NestJS", "Express.js", "Socket.io", "Redis", "PostgreSQL"],
        imageUrl: "/assets/visuals/service-cloud-devops.webp",
        imageAlt: "3D modular server blades and optical conduits",
        sceneThemeKey: "backend-nodes",
      },
      {
        slug: "ecommerce-business-applications",
        numberLabel: "09",
        title: "E-commerce and Business Applications",
        shortTagline: "Multivendor storefronts, vendor dashboards, inventory engines, and Razorpay/Stripe checkout.",
        description:
          "Scalable commerce systems supporting multi-vendor catalogs, variant pricing, review moderation, order reconciliation, and verified payment gateway webhooks.",
        deliverables: ["Multivendor Platforms", "Vendor Control Panels", "Razorpay & Stripe Integration", "Order Reconciliation"],
        technologies: ["Next.js", "MongoDB", "Redux", "Razorpay", "Stripe", "Cloudinary"],
        imageUrl: "/assets/visuals/service-web-dev.webp",
        imageAlt: "3D commerce platform interface layers",
        sceneThemeKey: "commerce-grid",
      },
      {
        slug: "cloud-hosting-devops",
        numberLabel: "10",
        title: "Cloud Hosting and DevOps",
        shortTagline: "Containerized Docker workflows, reverse proxies, CI pipelines, and automated deploys.",
        description:
          "Reproducible deployment architectures across cloud platforms, VPS hosts, and local-first build orchestrators with health checks and metrics observability.",
        deliverables: ["Docker & Compose Stacks", "CI/CD Workflows", "Reverse Proxy Routing", "Zero-Downtime Deploys"],
        technologies: ["Docker", "Nginx", "GitHub Actions", "Vercel", "Linux", "Prometheus"],
        imageUrl: "/assets/visuals/service-cloud-devops.webp",
        imageAlt: "3D floating cloud server infrastructure",
        sceneThemeKey: "cloud-mesh",
      },
      {
        slug: "system-administration",
        numberLabel: "11",
        title: "System Administration",
        shortTagline: "Linux & Windows server administration, process supervision, and automated maintenance.",
        description:
          "Reliable OS administration covering Linux hardening, Windows operational tooling, shell automation, automated backups, and service lifecycle monitoring.",
        deliverables: ["Linux & Windows Ops", "Unix Shell Automation", "Backup & Recovery", "Service Supervision"],
        technologies: ["Linux", "Unix Shell Script", "Windows Admin", "Systemd", "Docker"],
        imageUrl: "/assets/visuals/service-it-support.webp",
        imageAlt: "3D dark technical operations console",
        sceneThemeKey: "sysadmin-rack",
      },
      {
        slug: "it-support-engineering",
        numberLabel: "12",
        title: "IT Support Engineering",
        shortTagline: "Structured troubleshooting, workstation provisioning, and operational escalation.",
        description:
          "Hands-on technical engineering resolving hardware, software, endpoint tooling, and developer workstation bottlenecks across growing teams.",
        deliverables: ["Incident Triage", "Endpoint Diagnostics", "Workstation Tooling", "Runbook Documentation"],
        technologies: ["Windows Diagnostics", "Linux CLI", "Python Utilities", "Networking Tools"],
        imageUrl: "/assets/visuals/service-it-support.webp",
        imageAlt: "3D diagnostic monitoring HUD environment",
        sceneThemeKey: "it-console",
      },
      {
        slug: "network-administration",
        numberLabel: "13",
        title: "Network Administration",
        shortTagline: "DNS routing, TLS termination, segmentation hygiene, and service connectivity.",
        description:
          "Clean local and cloud network architecture covering DNS sync, hostname reverse proxying, firewall policy validation, and latency diagnostics.",
        deliverables: ["Reverse Proxy & DNS", "TLS Configuration", "Firewall Rulesets", "Traffic Diagnostics"],
        technologies: ["DNS", "Nginx", "TLS/SSL", "TCP/IP Diagnostics", "Zero-Trust Rules"],
        imageUrl: "/assets/visuals/service-cybersecurity.webp",
        imageAlt: "3D illuminated network routing shield",
        sceneThemeKey: "network-web",
      },
      {
        slug: "authorized-penetration-testing",
        numberLabel: "14",
        title: "Authorized Penetration Testing",
        shortTagline: "Scoped, explicitly authorized web and API security testing with actionable remediation.",
        description:
          "Authorized defensive security assessments evaluating OWASP Top 10 exposure, JWT/RBAC flaws, and lateral movement risk strictly under documented permission.",
        deliverables: ["Scoped Web & API Testing", "Attack Path Mapping", "Proof-of-Concept Evidence", "Remediation Patches"],
        technologies: ["OWASP Top 10", "Attack Graph Analysis", "Burp Suite", "Nmap", "JWT Audits"],
        imageUrl: "/assets/visuals/service-cybersecurity.webp",
        imageAlt: "3D digital security shield with attack path graph",
        sceneThemeKey: "pentest-shield",
      },
      {
        slug: "vulnerability-assessment-security-hardening",
        numberLabel: "15",
        title: "Vulnerability Assessment and Security Hardening",
        shortTagline: "Systematic posture evaluation, zero-trust policy generation, and code-level hardening.",
        description:
          "Continuous posture review across headers, cryptography, dependency supply chains, secrets hygiene, and least-privilege access policies.",
        deliverables: ["Posture & Config Audits", "Secrets & Crypto Checks", "Zero-Trust Policies", "Header/WAF Hardening"],
        technologies: ["AES Encryption", "Zero-Trust", "Supply-Chain Checks", "Security Headers", "RBAC"],
        imageUrl: "/assets/visuals/service-cybersecurity.webp",
        imageAlt: "3D cryptographic security lattice",
        sceneThemeKey: "hardening-vault",
      },
      {
        slug: "workflow-automation",
        numberLabel: "16",
        title: "Workflow Automation",
        shortTagline: "Eliminating manual bottlenecks with custom bots, schedulers, and multi-channel automation.",
        description:
          "Automated operational pipelines connecting Telegram bots, email dispatch, scheduled cron tasks, document generation, and desktop command orchestration.",
        deliverables: ["Telegram & API Bots", "Scheduled Job Runners", "Document Generation", "Cross-App Triggers"],
        technologies: ["Python", "Node.js", "grammY", "BullMQ", "Cron", "Webhooks"],
        imageUrl: "/assets/visuals/service-ai-automation.webp",
        imageAlt: "3D automated synaptic workflow conduits",
        sceneThemeKey: "automation-helix",
      },
      {
        slug: "crm-enterprise-systems",
        numberLabel: "17",
        title: "CRM and Enterprise Systems",
        shortTagline: "Custom ERP, workforce attendance, payroll reconciliation, and executive P&L dashboards.",
        description:
          "Tailored enterprise applications covering multi-tier role hierarchies, attendance logs, advance deduction ledgers, encrypted KYC vaults, and live reporting.",
        deliverables: ["Custom CRM Platforms", "Workforce Attendance & Payroll", "Encrypted KYC Vaults", "Executive P&L Analytics"],
        technologies: ["React", "React Native", "Node.js", "MongoDB", "AES Encryption", "RBAC"],
        imageUrl: "/assets/visuals/project-workforce.webp",
        imageAlt: "3D enterprise grid and encrypted management vault",
        sceneThemeKey: "enterprise-cube",
      },
    ];

    for (let i = 0; i < servicesData.length; i += 1) {
      await createOne("services", {
        ...servicesData[i],
        ctaLabel: "Request Service",
        order: i + 1,
        status: "published",
        includeInPortfolio: true,
      });
    }
  }

  // 8. 8 Prioritized Featured Projects
  if ((await countDocs("projects")) === 0) {
    const projectsData = [
      {
        slug: "intelligent-graph-based-attack-path-discovery",
        title:
          "Intelligent Graph-Based Attack Path Discovery & Automated Lateral Movement Simulation Framework",
        version: "v2.5",
        badge: "Flagship Security Research",
        summary:
          "Autonomous 121-engine attack graph platform transforming raw security findings into Dijkstra critical paths, FAIR financial risk models, zero-trust policies, and code-level remediation patches.",
        fullDescription:
          "Built as a modular FastAPI/Python security research platform designed strictly for authorized security assessments and defensive infrastructure simulation. Converts telemetry from 121 selectable scanning engines across Reconnaissance (10), Network (16), Web Exploits (26), API & Cloud (14), Secrets & Crypto (10), Supply Chain (9), and Intelligence (9) into weighted attack graphs that identify Internet-to-crown-jewel lateral movement paths, quantify annualized risk with FAIR + 4,000-iteration Monte Carlo simulation, and output actionable Nginx/WAF/code remediations alongside zero-trust policy baselines.",
        category: "Cybersecurity & Graph Intelligence",
        projectStatus: "In Development" as const,
        featuredRank: 1,
        capabilities: [
          "121 selectable scanning engines across 7 specialized categories",
          "Reconnaissance (10) & Network Security Analysis (16)",
          "Web Application Security Testing (26) & API/Cloud Assessment (14)",
          "Secrets & Cryptography Checks (10) & Supply-Chain Analysis (9)",
          "Threat Intelligence (9) & Compliance Posture Mapping",
          "Attack Graph Construction & Dijkstra Critical Path Discovery",
          "PageRank & Betweenness Centrality Choke-Point Analysis",
          "FAIR Financial Risk Modeling with 4,000-Iteration Monte Carlo Simulation",
          "Automated Remediation Engine with 20 Auto-Fix Patch Generators",
          "Autonomous Scheduled Scanning BOT & Live WebSocket Telemetry",
          "Threat Hunting Console & Zero-Trust Policy Generation",
          "SQLite Persistence, Prometheus-Style Metrics & Docker Deployment",
          "$0 Offline AI Provider Support (free-local + optional free-hf)",
        ],
        experimentalFeatures: [
          "Automated lateral movement exploit chaining in isolated lab topologies",
          "AI-assisted adaptive remediation pull-request synthesis",
        ],
        plannedFeatures: [
          "Multi-tenant organization federation and enterprise SSO integration",
          "Continuous Kubernetes admission webhook policy enforcement",
        ],
        technologies: [
          "Python",
          "FastAPI",
          "Graph Algorithms (Dijkstra / PageRank)",
          "FAIR Risk + Monte Carlo",
          "SQLite",
          "WebSockets",
          "Prometheus Metrics",
          "Docker",
        ],
        architectureModules: [
          "attack_graph_engine.py",
          "engine_registry.py (121 Engines)",
          "auto_fix_engine.py (20 Auto-Fixers)",
          "autonomous_manager.py",
          "cloud_posture_engine.py",
          "ai_engine.py ($0 Local AI)",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/Intelligent-Graph-Based-Attack-Path-Discovery",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-attack-path.webp",
        imageAlt: "3D cybersecurity attack graph highlighting critical path from Internet to vault",
        galleryUrls: ["/assets/visuals/project-attack-path.webp", "/assets/visuals/service-cybersecurity.webp"],
        interactiveDemoKey: "attack-path-v25",
        order: 1,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["cybersecurity", "python-ai"] as ResumeProfileType[],
        resumeBullets: [
          "Architected a modular 121-engine Python security research framework mapping Internet-to-database attack graphs via Dijkstra, PageRank, and betweenness centrality.",
          "Implemented FAIR quantitative financial risk modeling powered by 4,000-iteration Monte Carlo simulation and 20 automated remediation patch generators.",
          "Built autonomous scheduled scanning, threat hunting workflows, zero-trust policy output, SQLite persistence, Prometheus-style metrics, and Docker containerization.",
        ],
      },
      {
        slug: "jarvis-local-ai-assistant",
        title: "JARVIS Local AI Assistant (Ollama & Hugging Face GGUF Editions)",
        version: "v2.0",
        badge: "Local AI & Automation",
        summary:
          "Privacy-first desktop AI engineering suite built in two architectures: Ollama-powered reasoning and fully local Hugging Face GGUF inference with voice control and owner face authorization.",
        fullDescription:
          "Dual-architecture intelligent desktop assistant engineered for offline privacy and system automation. Version A integrates local Ollama inference with Windows desktop control, browser orchestration, media playback, and messaging automation (WhatsApp, Telegram, Gmail workflows). Version B introduces fully local Hugging Face GGUF model execution paired with owner face authorization gating and multilingual voice interaction without external cloud dependencies.",
        category: "AI & Desktop Automation",
        projectStatus: "Completed" as const,
        featuredRank: 2,
        capabilities: [
          "Edition A: Ollama-powered local LLM orchestration",
          "Edition B: Fully offline Hugging Face GGUF local inference",
          "Face-based owner authorization before sensitive system actions",
          "Voice command recognition and spoken response pipeline",
          "Windows system automation, app launch, and tab/scroll control",
          "Multilingual interaction with zero third-party cloud telemetry",
        ],
        experimentalFeatures: [
          "Continuous background wake-word optimization on consumer CPUs",
        ],
        plannedFeatures: [
          "Unified cross-platform tray UI for Linux and Windows",
        ],
        technologies: ["Python", "Ollama", "Hugging Face", "GGUF", "OpenCV / Face Auth", "Speech Synthesis"],
        architectureModules: [
          "jarvis.py",
          "Automation_Brain.py",
          "update_autollama_file.py",
          "Open_app.py",
          "YT_playback.py",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/Python_Jarvis",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-jarvis-ai.webp",
        imageAlt: "3D holographic AI assistant sphere surrounded by metallic acoustic wave rings",
        galleryUrls: ["/assets/visuals/project-jarvis-ai.webp", "/assets/visuals/service-ai-automation.webp"],
        interactiveDemoKey: "jarvis-ai",
        order: 2,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["python-ai"] as ResumeProfileType[],
        resumeBullets: [
          "Engineered local AI desktop assistant editions utilizing Ollama and Hugging Face GGUF models for privacy-preserving offline inference.",
          "Integrated voice recognition, owner face authorization gating, and multi-channel desktop/web automation modules in Python.",
        ],
      },
      {
        slug: "portpilot-homedeploy-platform",
        title: "PortPilot — Local-First Cloud Deployment & Hosting Platform",
        version: "v1.0",
        badge: "DevOps & Infrastructure",
        summary:
          "Vercel/Render-inspired local deployment control plane with GitHub clone/build orchestration, reverse-proxy *.localhost hostnames, port allocation, and live build logs.",
        fullDescription:
          "Full TypeScript monorepo implementing a self-hosted application deployment dashboard and runtime supervisor. Connects public or PAT-authenticated GitHub repositories, auto-detects frameworks, executes install/build stages with live streaming logs, allocates ports, and exposes apps cleanly via custom *.localhost hostnames and reverse proxy routing without mandatory VPS or Docker overhead.",
        category: "Cloud & Developer Platforms",
        projectStatus: "Completed" as const,
        featuredRank: 3,
        capabilities: [
          "GitHub repository cloning, branch checkout, and webhook/polling auto-redeploy",
          "Managed build pipeline with live stdout/stderr streaming logs",
          "Automatic port allocation and process lifecycle supervision",
          "Reverse proxy routing with custom *.localhost hostnames and DNS sync",
          "Environment variable management and network diagnostics console",
        ],
        experimentalFeatures: [
          "Optional external tunnel diagnostics and automated SSL verification",
        ],
        plannedFeatures: [
          "Container runtime driver option alongside native Node supervision",
        ],
        technologies: ["TypeScript", "Node.js", "Express.js", "React", "Vite", "SQLite", "Reverse Proxy"],
        architectureModules: [
          "apps/api (GitHub & Build Engine)",
          "apps/dashboard (React + Vite UI)",
          "dns-sync.ts & reverse proxy",
          "start-project.ts supervisor",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/PortPilot",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-portpilot.webp",
        imageAlt: "3D cloud deployment platform modules connected by luminous routing paths",
        galleryUrls: ["/assets/visuals/project-portpilot.webp", "/assets/visuals/service-cloud-devops.webp"],
        interactiveDemoKey: "portpilot",
        order: 3,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["fullstack", "it-support"] as ResumeProfileType[],
        resumeBullets: [
          "Built PortPilot, a TypeScript deployment dashboard and reverse-proxy orchestrator supporting GitHub build automation, live runtime logs, and custom local hostname routing.",
        ],
      },
      {
        slug: "streamnova-media-platform",
        title: "StreamNova — Audio & Video Discovery & Playback Platform",
        version: "v1.2",
        badge: "Mobile & Media Engineering",
        summary:
          "Cross-platform audio and video streaming application featuring discovery feeds, background playback, custom playlists, local music indexing, and compliant YouTube Data API integrations.",
        fullDescription:
          "Designed as a sleek unified media discovery and playback ecosystem combining local audio library management with structured public metadata discovery through compliant YouTube Data APIs. Features low-latency queue transitions, background audio service handling across mobile OS versions, and adaptive dark glass player controls while respecting third-party platform terms and content rights.",
        category: "Media & Mobile Systems",
        projectStatus: "In Development" as const,
        featuredRank: 4,
        capabilities: [
          "Unified audio & video discovery search and metadata browsing",
          "Background audio playback with lock-screen media controls",
          "Custom playlist creation and persistent local music library indexing",
          "Compliant YouTube Data integration respecting third-party terms",
        ],
        experimentalFeatures: [
          "Adaptive audio equalizer presets and waveform visualizer",
        ],
        plannedFeatures: [
          "Cross-device queue synchronization via WebSockets",
        ],
        technologies: ["React Native", "TypeScript", "Node.js", "Media Playback APIs", "YouTube Data API"],
        architectureModules: [
          "Media Queue & Background Audio Service",
          "Playlist & Local Library Indexer",
          "Compliant Discovery API Adapter",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/Storefromnet",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-streamnova.webp",
        imageAlt: "3D spatial audio and video streaming stage with smartphone glass interface",
        galleryUrls: ["/assets/visuals/project-streamnova.webp", "/assets/visuals/service-mobile-dev.webp"],
        order: 4,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["mobile", "fullstack"] as ResumeProfileType[],
        resumeBullets: [
          "Engineered StreamNova audio/video discovery and background playback platform with playlist persistence, local file scanning, and compliant YouTube Data integration.",
        ],
      },
      {
        slug: "telegram-blockchain-transactions",
        title: "Telegram Blockchain Transaction Integration & Red-Envelope Mini App",
        version: "v1.0",
        badge: "FinTech & Web3 Ledger",
        summary:
          "Custodial Telegram Mini App wallet and fair-claim envelope architecture backed by a PostgreSQL double-entry ledger, BullMQ workers, and TRC20 USDT boundary transfers.",
        fullDescription:
          "Enterprise TypeScript monorepo combining a React Telegram Mini App, Express + grammY bot backend, Prisma PostgreSQL double-entry ledger with row-level locks (`SELECT ... FOR UPDATE`), integer minor-unit USDT accounting, HMAC-SHA256 Telegram `initData` authentication, BullMQ async withdrawal processing, and TronWeb TRC20 boundary integration alongside an audited operations console.",
        category: "Blockchain & Distributed Systems",
        projectStatus: "Completed" as const,
        featuredRank: 5,
        capabilities: [
          "PostgreSQL double-entry WalletAccount + LedgerEntry ledger with row locks",
          "Exact integer USDT minor-unit arithmetic and atomic envelope claim splits",
          "HMAC-SHA256 verified Telegram Mini App initData authentication",
          "Redis/BullMQ asynchronous withdrawal pipeline and TronGrid confirmation polling",
          "Admin operations console with audit logs and emergency circuit switches",
        ],
        experimentalFeatures: [
          "Configurable fairness weighting algorithm for group claim distribution",
        ],
        plannedFeatures: [
          "HSM/Vault key management integration for live production deployment",
        ],
        technologies: ["TypeScript", "Express.js", "PostgreSQL", "Prisma", "grammY", "BullMQ", "TronWeb", "Redis"],
        architectureModules: [
          "apps/backend (Ledger + grammY Bot + TronWeb)",
          "apps/frontend (Telegram Mini App)",
          "apps/admin (Operations Console)",
          "packages/shared (BigInt Money Schemas)",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/Telegram-Blockchain-Transactions",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-blockchain.webp",
        imageAlt: "3D crystalline blockchain ledger nodes and cryptographic vault",
        galleryUrls: ["/assets/visuals/project-blockchain.webp"],
        order: 5,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["fullstack"] as ResumeProfileType[],
        resumeBullets: [
          "Built a TypeScript custodial Telegram Mini App wallet using a PostgreSQL double-entry ledger, row-level locking, HMAC-SHA256 initData validation, BullMQ workers, and TRC20 USDT boundary transfers.",
        ],
      },
      {
        slug: "maa-bhawani-construction-workforce-app",
        title: "Maa Bhawani Construction – Workforce & Finance Management App",
        version: "v2.0",
        badge: "Production Enterprise Platform",
        summary:
          "Production multi-role mobile and web ERP covering Admin, Co-Admin, and Worker workflows: daily attendance, payroll, kharchi advances, AES-encrypted KYC storage, and live site P&L.",
        fullDescription:
          "Delivered in production (v2.0) for enterprise construction operations. Implements strict 3-tier role isolation (Admin, Co-Admin, Worker), automated monthly wage and kharchi (mid-month advance) reconciliation, AES-encrypted Aadhaar/KYC document vaults with server-side decryption controls, and real-time site capital rotation and profit/loss visibility.",
        category: "Enterprise & Mobile Systems",
        projectStatus: "Production" as const,
        featuredRank: 6,
        capabilities: [
          "Three distinct role layers: Admin, Co-Admin, and Worker",
          "Worker dashboard: per-day attendance, daily salary, kharchi requests & history",
          "Admin console: site management, worker onboarding, overrides & approvals",
          "AES-encrypted document storage for Aadhaar and sensitive KYC files",
          "Investment and financial rotation tracker with live profit/loss reporting",
          "Multi-role JWT authentication with scoped RBAC route protection",
        ],
        experimentalFeatures: [],
        plannedFeatures: [
          "Offline-first site supervisor attendance queue sync",
        ],
        technologies: ["React Native", "Node.js", "Express.js", "MongoDB", "JWT", "AES Encryption", "Redux"],
        architectureModules: [
          "Worker & Admin Mobile Views",
          "Payroll & Kharchi Reconciliation Engine",
          "AES Document Vault",
          "Site Financial P&L Module",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/Ananta_Infratech_Solutions",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-workforce.webp",
        imageAlt: "3D enterprise workforce structural grid and encrypted KYC vault",
        galleryUrls: ["/assets/visuals/project-workforce.webp"],
        order: 6,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack", "mobile", "cybersecurity", "it-support"] as ResumeProfileType[],
        resumeBullets: [
          "Designed and built a full-stack mobile application with three distinct role layers: Admin, Co-Admin, and Worker (user).",
          "Worker dashboard: per-day attendance view, daily salary display, kharchi (advance) request and deduction tracking, salary increment requests, and full payment history.",
          "Admin dashboard: site management, worker onboarding, salary configuration, attendance overrides, approval workflows for increments and advance requests.",
          "Implemented AES-encrypted document storage for Aadhaar and KYC files during profile creation — files encrypted at rest with access-controlled decryption.",
          "Built investment and financial rotation tracker: monitors capital allocated per site, tracks expenditure vs. revenue, and surfaces real-time profit/loss reporting for management.",
          "Architected multi-role JWT authentication with RBAC — each role scoped to specific routes and data access levels.",
        ],
      },
      {
        slug: "betmaster-fantasy-gaming-platform",
        title: "BetMaster – Real-Money Fantasy Sports & Gaming Platform",
        version: "v1.0",
        badge: "Real-Time Architecture",
        summary:
          "High-concurrency fantasy sports and multi-game platform architecture utilizing Socket.io live score feeds, Redis session caching & rate limiting, wallet ledger, and admin controls.",
        fullDescription:
          "Currently in active development combining a React Native client with a scalable Node.js/Express, MongoDB, Socket.io, and Redis backend. Engineered for low-latency match state synchronization, modular plugin-based game engines (fantasy cricket, football, Ludo, Teen Patti architecture), transactional wallet accounting, and admin odds/KYC risk monitoring.",
        category: "Real-Time & Gaming Systems",
        projectStatus: "In Development" as const,
        featuredRank: 7,
        capabilities: [
          "Fantasy team builder and international match contest tracking",
          "Real-time match event sync and live leaderboards via Socket.io",
          "Extensible multi-game module architecture",
          "Wallet deposit, deduction, settlement, and transaction ledger design",
          "Admin controls for match setup, KYC review, and risk monitoring",
          "Redis session caching and API rate limiting for concurrent rooms",
        ],
        experimentalFeatures: [
          "Plugin-based tournament bracket and dynamic prize-pool calculator",
        ],
        plannedFeatures: [
          "Regional compliance verification before external payment gateway activation",
        ],
        technologies: ["React Native", "Node.js", "Express.js", "MongoDB", "Socket.io", "Redis", "Payment Gateway API"],
        architectureModules: [
          "Socket.io Live Match Gateway",
          "Redis Rate Limiter & Leaderboard Cache",
          "Wallet Transaction Ledger",
          "Admin Odds & KYC Dashboard",
        ],
        githubUrl: "https://github.com/Shourya-Sinha/fantasy-arena-full",
        liveUrl: "https://shourya-sinha.github.io/Betmaster_static_web",
        imageUrl: "/assets/visuals/project-gaming.webp",
        imageAlt: "3D real-time telemetry stadium arena core with glass phones",
        galleryUrls: ["/assets/visuals/project-gaming.webp"],
        order: 7,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "fullstack", "mobile"] as ResumeProfileType[],
        resumeBullets: [
          "Building a Dream11-style real-money gaming platform: users create fantasy teams and bet on international match outcomes (win/loss/draw).",
          "Developing real-time match event tracking and live score integration using Socket.io for low-latency game state updates across concurrent users.",
          "Implementing multi-game architecture: sports betting (cricket, football), Teen Patti, Ludo, and extensible plugin-based game module system for future additions.",
          "Designing secure wallet system: deposits, withdrawals, bet deductions, winnings credit, and transaction history with payment gateway integration.",
          "Building admin panel for match management, odds configuration, user KYC verification, and fraud/risk monitoring dashboards.",
          "Applying Redis-based session caching and rate limiting for high-concurrency game rooms and real-time leaderboard updates.",
        ],
      },
      {
        slug: "adversarial-attack-url-classifier",
        title: "Adversarial Attack & Self-Improving URL Classifier",
        version: "v1.0",
        badge: "Applied Security & ML Research",
        summary:
          "Applied adversarial machine learning research testing perturbation evasion against malicious URL classifiers with an iterative self-learning retraining pipeline.",
        fullDescription:
          "Developed during MCA Cybersecurity research to study evasion robustness in automated phishing and malicious URL detection systems. Generates structured feature perturbations against trained Scikit-Learn and TensorFlow classifiers, measures evasion drift, and feeds adversarial examples back into an automated hardening loop to reinforce detection boundaries.",
        category: "Adversarial ML & Threat Research",
        projectStatus: "Research" as const,
        featuredRank: 8,
        capabilities: [
          "Adversarial URL perturbation and lexical/structural feature manipulation",
          "Classifier evasion stress-testing and detection-gap telemetry",
          "Automated iterative retraining loop ingests adversarial outputs",
          "SOC-aligned malicious URL threat-signal analysis",
        ],
        experimentalFeatures: [
          "Gradient-free evolutionary perturbation testing on ensemble models",
        ],
        plannedFeatures: [
          "Exportable ONNX defensive model weights for API gateway inspection",
        ],
        technologies: ["Python", "Scikit-Learn", "TensorFlow", "NumPy", "Pandas"],
        architectureModules: [
          "Adversarial Perturbation Generator",
          "Feature Extraction Pipeline",
          "Iterative Adversarial Retraining Loop",
        ],
        githubUrl: "https://github.com/Shourya-Sinha",
        liveUrl: "",
        imageUrl: "/assets/visuals/project-adversarial-ml.webp",
        imageAlt: "3D glowing decision boundary surface rippling with perturbation waves",
        galleryUrls: ["/assets/visuals/project-adversarial-ml.webp"],
        order: 8,
        status: "published" as const,
        includeInPortfolio: true,
        includeInResume: true,
        resumeProfiles: ["general", "python-ai", "cybersecurity"] as ResumeProfileType[],
        resumeBullets: [
          "Designed and executed adversarial attacks against ML-based malicious URL classifiers using perturbation and feature-manipulation techniques.",
          "Built a self-learning retraining pipeline where the classifier ingested previous attack outputs to iteratively improve robustness — achieving continuous accuracy gains each cycle.",
          "Simulated real-world attacker behavior to identify detection weaknesses — strengthening SOC-oriented threat analysis thinking.",
        ],
      },
    ];
    for (const p of projectsData) {
      await createOne("projects", p);
    }
  }

  // 9. Certifications (Strictly verified from resume only; no fabricated images)
  if ((await countDocs("certifications")) === 0) {
    await createOne("certifications", {
      title: "React.js & Node.js",
      issuer: "Infosys Springboard",
      location: "Chandigarh",
      issueDate: "2022",
      credentialId: "",
      verificationUrl: "",
      description:
        "Verified full-stack certification covering modern React.js component architecture, state management, and Node.js server engineering. Original PDF certificate document can be uploaded through Admin Certification Manager.",
      documentUrl: "",
      previewImageUrl: "/assets/visuals/section-certifications.webp",
      documentType: "credential_summary",
      hasOriginalDocument: false,
      order: 1,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack", "mobile", "cybersecurity", "it-support"],
    });
    await createOne("certifications", {
      title: "Frontend & Backend Development",
      issuer: "Internshala Distance Learning",
      location: "",
      issueDate: "2023",
      credentialId: "",
      verificationUrl: "",
      description:
        "Verified training certification covering end-to-end web application development across responsive frontend UI and backend API workflows. Original PDF/image can be uploaded via Admin.",
      documentUrl: "",
      previewImageUrl: "/assets/visuals/section-certifications.webp",
      documentType: "credential_summary",
      hasOriginalDocument: false,
      order: 2,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack", "mobile", "python-ai", "it-support"],
    });
  }

  // 10. Education (Verified exact data from resume)
  if ((await countDocs("education")) === 0) {
    await createOne("education", {
      degree: "MCA – Cybersecurity",
      field: "Cybersecurity",
      institution: "Amrita Vishwa Vidyapeetham",
      location: "India",
      startDate: "Oct 2024",
      endDate: "Present",
      gpa: "9.4/10",
      highlights: [
        "Focused coursework and research in application security, network defense, cryptography, and adversarial machine learning.",
        "Maintaining 9.4/10 GPA while leading real-world full-stack engineering deliverables.",
      ],
      order: 1,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack", "mobile", "python-ai", "cybersecurity", "it-support"],
    });
    await createOne("education", {
      degree: "B.Sc. (Information Technology)",
      field: "Information Technology",
      institution: "Sunrise University, Rajasthan",
      location: "Rajasthan, India",
      startDate: "",
      endDate: "2018",
      gpa: "",
      highlights: [
        "Core undergraduate foundation in programming, software engineering, databases, and computer networking.",
      ],
      order: 2,
      status: "published",
      includeInPortfolio: true,
      includeInResume: true,
      resumeProfiles: ["general", "fullstack", "mobile", "python-ai", "cybersecurity", "it-support"],
    });
  }

  // 11. Skills (Resume verified baseline + portfolio skills with exact resume inclusion settings)
  if ((await countDocs("skills")) === 0) {
    const resumeBaselineSkills: Array<{
      name: string;
      category:
        | "Languages"
        | "Frontend Engineering"
        | "Backend Engineering"
        | "Mobile Development"
        | "Database"
        | "Cybersecurity"
        | "DevOps and Infrastructure"
        | "Payments"
        | "AI & Machine Learning"
        | "SEO";
      proficiency: number;
      years: string;
      inGeneralResume: boolean;
      profiles: ResumeProfileType[];
    }> = [
      // Languages
      { name: "JavaScript (ES6+)", category: "Languages", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "Python", category: "Languages", proficiency: 88, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "python-ai", "cybersecurity", "it-support"] },
      { name: "C", category: "Languages", proficiency: 76, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity"] },
      { name: "Unix Shell Script", category: "Languages", proficiency: 82, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "it-support", "cybersecurity"] },
      { name: "TypeScript", category: "Languages", proficiency: 92, years: "3+ yrs", inGeneralResume: false, profiles: ["fullstack", "mobile"] },

      // Frontend
      { name: "React.js", category: "Frontend Engineering", proficiency: 96, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "React Native", category: "Frontend Engineering", proficiency: 92, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "mobile", "fullstack"] },
      { name: "Redux", category: "Frontend Engineering", proficiency: 90, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "Tailwind CSS", category: "Frontend Engineering", proficiency: 94, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Material UI", category: "Frontend Engineering", proficiency: 88, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Bootstrap", category: "Frontend Engineering", proficiency: 90, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "HTML5", category: "Frontend Engineering", proficiency: 96, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "CSS3", category: "Frontend Engineering", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Expo", category: "Frontend Engineering", proficiency: 88, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "mobile"] },
      { name: "Next.js", category: "Frontend Engineering", proficiency: 92, years: "3+ yrs", inGeneralResume: false, profiles: ["fullstack"] },

      // Mobile category for portfolio expertise cluster
      { name: "Android App Development", category: "Mobile Development", proficiency: 88, years: "3+ yrs", inGeneralResume: false, profiles: ["mobile"] },

      // Backend
      { name: "Node.js", category: "Backend Engineering", proficiency: 94, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "Express.js", category: "Backend Engineering", proficiency: 94, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "Socket.io", category: "Backend Engineering", proficiency: 89, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "REST API Design", category: "Backend Engineering", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile", "python-ai"] },
      { name: "JWT", category: "Backend Engineering", proficiency: 94, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "cybersecurity"] },
      { name: "RBAC", category: "Backend Engineering", proficiency: 92, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "cybersecurity"] },
      { name: "API Gateway", category: "Backend Engineering", proficiency: 84, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Microservices", category: "Backend Engineering", proficiency: 85, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "python-ai"] },
      { name: "NestJS", category: "Backend Engineering", proficiency: 86, years: "2+ yrs", inGeneralResume: false, profiles: ["fullstack"] },
      { name: "FastAPI", category: "Backend Engineering", proficiency: 88, years: "2+ yrs", inGeneralResume: false, profiles: ["python-ai", "cybersecurity"] },

      // Database
      { name: "MongoDB", category: "Database", proficiency: 94, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile"] },
      { name: "Redis", category: "Database", proficiency: 86, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "it-support"] },
      { name: "PostgreSQL", category: "Database", proficiency: 85, years: "2+ yrs", inGeneralResume: false, profiles: ["fullstack", "python-ai"] },

      // Security
      { name: "AES Encryption", category: "Cybersecurity", proficiency: 90, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity", "fullstack"] },
      { name: "JWT Auth", category: "Cybersecurity", proficiency: 94, years: "4+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity", "fullstack"] },
      { name: "Penetration Testing (in progress)", category: "Cybersecurity", proficiency: 78, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity"] },
      { name: "Adversarial ML", category: "Cybersecurity", proficiency: 84, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity", "python-ai"] },
      { name: "Threat Detection", category: "Cybersecurity", proficiency: 85, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity"] },
      { name: "SOC Fundamentals", category: "Cybersecurity", proficiency: 82, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "cybersecurity", "it-support"] },
      { name: "Secure API Design", category: "Cybersecurity", proficiency: 92, years: "4+ yrs", inGeneralResume: false, profiles: ["cybersecurity", "fullstack"] },

      // DevOps / Tools
      { name: "Git", category: "DevOps and Infrastructure", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "mobile", "python-ai", "cybersecurity", "it-support"] },
      { name: "GitHub", category: "DevOps and Infrastructure", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack", "it-support"] },
      { name: "Postman", category: "DevOps and Infrastructure", proficiency: 92, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Responsive Web Design", category: "DevOps and Infrastructure", proficiency: 95, years: "5+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Docker", category: "DevOps and Infrastructure", proficiency: 86, years: "2+ yrs", inGeneralResume: false, profiles: ["fullstack", "it-support", "cybersecurity"] },
      { name: "Linux", category: "DevOps and Infrastructure", proficiency: 86, years: "3+ yrs", inGeneralResume: false, profiles: ["it-support", "cybersecurity"] },
      { name: "Windows Administration", category: "DevOps and Infrastructure", proficiency: 88, years: "4+ yrs", inGeneralResume: false, profiles: ["it-support"] },
      { name: "Cloud Infrastructure", category: "DevOps and Infrastructure", proficiency: 84, years: "3+ yrs", inGeneralResume: false, profiles: ["fullstack", "it-support"] },

      // Payments
      { name: "Razorpay", category: "Payments", proficiency: 90, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },
      { name: "Stripe Integration", category: "Payments", proficiency: 88, years: "3+ yrs", inGeneralResume: true, profiles: ["general", "fullstack"] },

      // AI / ML
      { name: "Scikit-Learn", category: "AI & Machine Learning", proficiency: 85, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "python-ai", "cybersecurity"] },
      { name: "TensorFlow", category: "AI & Machine Learning", proficiency: 82, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "python-ai", "cybersecurity"] },
      { name: "NumPy", category: "AI & Machine Learning", proficiency: 86, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "python-ai"] },
      { name: "Pandas", category: "AI & Machine Learning", proficiency: 86, years: "2+ yrs", inGeneralResume: true, profiles: ["general", "python-ai"] },
      { name: "Ollama", category: "AI & Machine Learning", proficiency: 88, years: "1+ yr", inGeneralResume: false, profiles: ["python-ai"] },
      { name: "Hugging Face GGUF", category: "AI & Machine Learning", proficiency: 85, years: "1+ yr", inGeneralResume: false, profiles: ["python-ai"] },

      // SEO
      { name: "Technical SEO", category: "SEO", proficiency: 86, years: "3+ yrs", inGeneralResume: false, profiles: ["fullstack"] },
      { name: "Structured Data (JSON-LD)", category: "SEO", proficiency: 88, years: "3+ yrs", inGeneralResume: false, profiles: ["fullstack"] },
    ];

    for (let i = 0; i < resumeBaselineSkills.length; i += 1) {
      const s = resumeBaselineSkills[i];
      await createOne("skills", {
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        experienceYears: s.years,
        description: `${s.name} engineering & implementation`,
        order: i + 1,
        status: "published",
        includeInPortfolio: true,
        includeInResume: s.inGeneralResume || s.profiles.length > 0,
        resumeProfiles: s.inGeneralResume ? s.profiles : s.profiles,
      });
    }
  }

  // 12. Freelance Services
  if ((await countDocs("freelanceServices")) === 0) {
    const packages = [
      {
        title: "Full-Stack Web Platform Engineering",
        category: "Web & SaaS",
        description: "End-to-end Next.js, TypeScript, Node.js/NestJS, and MongoDB/PostgreSQL platform build with custom CMS admin and technical SEO.",
        deliverables: ["Architecture Blueprint", "Responsive Frontend + API", "Admin Control Panel", "Production Deployment"],
        timelineEstimate: "3 – 6 Weeks",
        startingBudget: "Custom Quote",
      },
      {
        title: "React Native & Expo Mobile App",
        category: "Mobile Engineering",
        description: "Production iOS and Android apps with Redux state normalization, JWT/RBAC auth, offline support, and encrypted KYC document capture.",
        deliverables: ["React Native Client", "Backend API Sync", "Signed APK / App Bundle", "Push & Realtime Setup"],
        timelineEstimate: "4 – 8 Weeks",
        startingBudget: "Custom Quote",
      },
      {
        title: "AI Automation & Local LLM Systems",
        category: "AI & Automation",
        description: "Private Ollama / Hugging Face GGUF assistant pipelines, FastAPI intelligence endpoints, and automated workflow orchestration.",
        deliverables: ["Local LLM Inference Pipeline", "Automation Workflows", "API & Dashboard Integration", "Privacy Audit"],
        timelineEstimate: "2 – 4 Weeks",
        startingBudget: "Custom Quote",
      },
      {
        title: "Authorized AppSec Review & Hardening",
        category: "Cybersecurity",
        description: "Authorized vulnerability assessment, API RBAC/JWT audit, zero-trust policy specification, and remediation implementation.",
        deliverables: ["Authorized Posture Assessment", "API & Auth Hardening", "Code-Level Patch Guide", "Verification Re-test"],
        timelineEstimate: "1 – 3 Weeks",
        startingBudget: "Custom Quote",
      },
    ];
    for (let i = 0; i < packages.length; i += 1) {
      await createOne("freelanceServices", {
        ...packages[i],
        order: i + 1,
        status: "published",
      });
    }
  }

  // 13. Navigation Items
  if ((await countDocs("navigationItems")) === 0) {
    const navs = [
      { label: "About", href: "/#about", zone: "header" as const, order: 1, isExternal: false, isVisible: true },
      { label: "Expertise", href: "/#expertise", zone: "header" as const, order: 2, isExternal: false, isVisible: true },
      { label: "Services", href: "/#services", zone: "header" as const, order: 3, isExternal: false, isVisible: true },
      { label: "Experience", href: "/#experience", zone: "header" as const, order: 4, isExternal: false, isVisible: true },
      { label: "Projects", href: "/#projects", zone: "header" as const, order: 5, isExternal: false, isVisible: true },
      { label: "Certifications", href: "/#certifications", zone: "header" as const, order: 6, isExternal: false, isVisible: true },
      { label: "Resume", href: "/resume", zone: "header" as const, order: 7, isExternal: false, isVisible: true },
      { label: "Hire Me", href: "/#contact", zone: "header" as const, order: 8, isExternal: false, isVisible: true },
      { label: "GitHub", href: "https://github.com/Shourya-Sinha", zone: "footer" as const, order: 9, isExternal: true, isVisible: true },
      { label: "LinkedIn", href: "https://linkedin.com/in/indrajeetsinha1", zone: "footer" as const, order: 10, isExternal: true, isVisible: true },
      { label: "Resume Archive", href: "/resume", zone: "footer" as const, order: 11, isExternal: false, isVisible: true },
      { label: "Admin CMS", href: "/admin", zone: "footer" as const, order: 12, isExternal: false, isVisible: true },
    ];
    for (const n of navs) {
      await createOne("navigationItems", n);
    }
  }

  // 14. SEO Metadata
  if ((await countDocs("seoMetadata")) === 0) {
    await createOne("seoMetadata", {
      routeKey: "/",
      title: "Shourya Sinha (Kumar Indrajeet) — Full Stack Developer, Mobile Engineer & Cybersecurity Researcher",
      description:
        "Immersive 3D portfolio and IT solutions platform for Shourya Sinha (Kumar Indrajeet). Full Stack Web, React Native, AI/Local LLM Automation, and Cybersecurity Engineering.",
      keywords: [
        "Shourya Sinha",
        "Kumar Indrajeet",
        "Full Stack Developer",
        "React Native Engineer",
        "Cybersecurity Portfolio",
        "Next.js Three.js Developer",
        "Patna Software Engineer",
      ],
      canonicalUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      ogTitle: "Shourya Sinha — Engineering Intelligent Digital Experiences",
      ogDescription:
        "Production-grade 3D developer portfolio, cybersecurity graph discovery showcase, AI automation, and freelance engineering services.",
      ogImageUrl: "/assets/visuals/hero-environment.webp",
      twitterCard: "summary_large_image",
      noIndex: false,
    });
    await createOne("seoMetadata", {
      routeKey: "/resume",
      title: "Professional Resume Archive — Shourya Sinha (Kumar Indrajeet)",
      description:
        "Download the latest ATS-friendly PDF and DOCX resume or inspect verified versioned releases for Shourya Sinha (Kumar Indrajeet).",
      keywords: ["Shourya Sinha Resume", "Kumar Indrajeet CV", "Full Stack Resume PDF", "ATS Resume"],
      canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/resume`,
      ogTitle: "Professional Resume — Shourya Sinha (Kumar Indrajeet)",
      ogDescription: "Verified ATS-friendly PDF & DOCX resume archive with version history.",
      ogImageUrl: "/assets/visuals/hero-environment.webp",
      twitterCard: "summary_large_image",
      noIndex: false,
    });
  }

  // 15. Seed 22 Media Assets for our visual gallery in CMS Media Library
  if ((await countDocs("mediaAssets")) === 0) {
    const visualFiles = [
      ["hero-environment.webp", "Hero 3D liquid chrome sphere and holographic rings"],
      ["about-identity.webp", "About section obsidian and glass architectural identity monolith"],
      ["service-web-dev.webp", "3D floating web development glass browser planes"],
      ["service-mobile-dev.webp", "3D titanium smartphone mockups with holographic UI"],
      ["service-ai-automation.webp", "3D crystalline neural network and synaptic pathways"],
      ["service-cybersecurity.webp", "3D illuminated cybersecurity shield with graph nodes"],
      ["service-seo-analytics.webp", "3D luminous search telemetry and analytics ribbons"],
      ["service-cloud-devops.webp", "3D floating cloud infrastructure and server nodes"],
      ["service-it-support.webp", "3D technical operations console with diagnostic panels"],
      ["service-python-dev.webp", "3D Python algorithmic prisms and optical conduits"],
      ["project-attack-path.webp", "3D Attack Path Discovery critical network graph"],
      ["project-jarvis-ai.webp", "3D JARVIS local AI holographic core"],
      ["project-portpilot.webp", "3D PortPilot cloud deployment architecture"],
      ["project-streamnova.webp", "3D StreamNova media player and soundwave rings"],
      ["project-blockchain.webp", "3D Telegram blockchain double-entry ledger blocks"],
      ["project-workforce.webp", "3D enterprise workforce management and encrypted KYC cube"],
      ["project-gaming.webp", "3D real-time fantasy gaming telemetry core"],
      ["project-adversarial-ml.webp", "3D adversarial ML decision boundary wavefield"],
      ["section-experience.webp", "3D illuminated chronological career helix"],
      ["section-certifications.webp", "3D suspended obsidian and glass certificate gallery"],
      ["section-education.webp", "3D geometric knowledge lattice"],
      ["section-contact.webp", "3D glowing glass contact portal"],
    ];

    for (const [fileName, altText] of visualFiles) {
      await createOne("mediaAssets", {
        publicId: `seed/visuals/${fileName}`,
        secureUrl: `/assets/visuals/${fileName}`,
        resourceType: "image",
        format: "webp",
        fileName,
        folder: "visuals",
        altText,
        bytes: 65000,
        width: 1280,
        height: 720,
        storageProvider: "local",
        uploadedBy: "system-seed",
      });
    }
  }

  // 16. Resume Templates & Settings
  if (!(await findOne("resumeTemplates", { key: "ats-classic-1.0" }))) {
    await createOne("resumeTemplates", {
      key: "ats-classic-1.0",
      name: "Classic Single-Column ATS (Baseline Match)",
      description:
        "Preserves the clean single-column hierarchy, royal blue section dividers, embedded typography, and logical reading order of the original uploaded resume.",
      layout: "ats-single-column",
      accentColor: "#1D549F",
      fontFamily: "Roboto",
      sectionOrder: [
        "summary",
        "experience",
        "projects",
        "skills",
        "education",
        "certifications",
      ],
      isDefault: true,
    });
  }

  if (!(await findOne("resumeSettings", { settingsKey: "primary" }))) {
    await createOne("resumeSettings", {
      settingsKey: "primary",
      publishingMode: "manual",
      activeTemplateKey: "ats-classic-1.0",
      autoGenerateDraftOnProfileChange: true,
      enabledRoleProfiles: [
        "general",
        "fullstack",
        "mobile",
        "python-ai",
        "cybersecurity",
        "it-support",
      ],
    });
  }

  // 17. Seed Baseline v1.0 ResumeVersion preserving exact original uploaded PDF
  const existingGeneralV1 = await findOne("resumeVersions", {
    profileType: "general",
    version: "v1.0",
  });

  if (!existingGeneralV1) {
    const generalSnapshot = await buildResumeSnapshot("general");
    const generalHash = computeSnapshotHash(generalSnapshot);
    const origPdfPath = getOriginalBaselinePdfPath();
    const repoSourcePdf = path.join(process.cwd(), "Kumar_Indrajeet_Resume_Ananta_Updated.pdf");
    const outPaths = getGeneratedVersionPaths("general", "v1.0");
    if (!fs.existsSync(outPaths.dir)) fs.mkdirSync(outPaths.dir, { recursive: true });

    let pdfBuffer: Buffer;
    if (fs.existsSync(origPdfPath)) {
      pdfBuffer = fs.readFileSync(origPdfPath);
      fs.copyFileSync(origPdfPath, outPaths.pdfPath);
    } else if (fs.existsSync(repoSourcePdf)) {
      const origDir = path.dirname(origPdfPath);
      if (!fs.existsSync(origDir)) fs.mkdirSync(origDir, { recursive: true });
      fs.copyFileSync(repoSourcePdf, origPdfPath);
      fs.copyFileSync(repoSourcePdf, outPaths.pdfPath);
      pdfBuffer = fs.readFileSync(origPdfPath);
    } else {
      pdfBuffer = await generateAtsResumePdfBuffer(generalSnapshot);
      fs.writeFileSync(outPaths.pdfPath, pdfBuffer);
      const origDir = path.dirname(origPdfPath);
      if (!fs.existsSync(origDir)) fs.mkdirSync(origDir, { recursive: true });
      fs.writeFileSync(origPdfPath, pdfBuffer);
    }

    const docxBuffer = await generateAtsResumeDocxBuffer(generalSnapshot);
    fs.writeFileSync(outPaths.docxPath, docxBuffer);
    const validationReport = await validateResumePdfBuffer(pdfBuffer, generalSnapshot);
    const now = new Date().toISOString();

    await createOne("resumeVersions", {
      profileType: "general",
      version: "v1.0",
      major: 1,
      minor: 0,
      patch: 0,
      title: "v1.0 — Original Resume",
      description: "Baseline original uploaded resume (Kumar_Indrajeet_Resume_Ananta_Updated.pdf).",
      releaseNotes: "Original verified resume baseline preserved verbatim alongside editable DOCX twin.",
      generatedAt: now,
      publishedAt: now,
      createdBy: "system-seed",
      status: "published",
      profileSnapshot: generalSnapshot,
      contentHash: generalHash,
      pdfUrl: "/api/public/resume/download/v1.0/pdf?profile=general",
      docxUrl: "/api/public/resume/download/v1.0/docx?profile=general",
      pdfStoragePath: fs.existsSync(origPdfPath) ? origPdfPath : outPaths.pdfPath,
      docxStoragePath: outPaths.docxPath,
      templateVersion: "ats-classic-1.0",
      isLatest: true,
      isPublic: true,
      isOriginalBaseline: true,
      changeSummary: {
        added: ["Baseline original resume v1.0 imported"],
        modified: [],
        removed: [],
        totalChanges: 1,
      },
      validationReport,
    });

    // Also seed initial v1.0 for the 5 role-specific resume profiles
    const roleProfiles: ResumeProfileType[] = [
      "fullstack",
      "mobile",
      "python-ai",
      "cybersecurity",
      "it-support",
    ];
    for (const profileType of roleProfiles) {
      const snap = await buildResumeSnapshot(profileType);
      const hash = computeSnapshotHash(snap);
      const rolePdf = await generateAtsResumePdfBuffer(snap);
      const roleDocx = await generateAtsResumeDocxBuffer(snap);
      const rolePaths = getGeneratedVersionPaths(profileType, "v1.0");
      if (!fs.existsSync(rolePaths.dir)) fs.mkdirSync(rolePaths.dir, { recursive: true });
      fs.writeFileSync(rolePaths.pdfPath, rolePdf);
      fs.writeFileSync(rolePaths.docxPath, roleDocx);
      const report = await validateResumePdfBuffer(rolePdf, snap);

      await createOne("resumeVersions", {
        profileType,
        version: "v1.0",
        major: 1,
        minor: 0,
        patch: 0,
        title: `v1.0 — ${profileType} Baseline`,
        description: `Initial ATS-friendly ${profileType} profile compiled from verified master database.`,
        releaseNotes: `Generated verified ${profileType} profile from baseline career records.`,
        generatedAt: now,
        publishedAt: now,
        createdBy: "system-seed",
        status: "published",
        profileSnapshot: snap,
        contentHash: hash,
        pdfUrl: `/api/public/resume/download/v1.0/pdf?profile=${profileType}`,
        docxUrl: `/api/public/resume/download/v1.0/docx?profile=${profileType}`,
        pdfStoragePath: rolePaths.pdfPath,
        docxStoragePath: rolePaths.docxPath,
        templateVersion: "ats-classic-1.0",
        isLatest: true,
        isPublic: true,
        isOriginalBaseline: false,
        changeSummary: {
          added: [`Initial ${profileType} profile release`],
          modified: [],
          removed: [],
          totalChanges: 1,
        },
        validationReport: report,
      });
    }
  }
}
