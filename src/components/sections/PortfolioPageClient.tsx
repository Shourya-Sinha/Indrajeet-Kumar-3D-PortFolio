"use client";

import React, { useState } from "react";
import type { PublicPortfolioData } from "@/lib/portfolio/public-data";
import { PublicShell } from "@/components/layout/PublicShell";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ExpertiseSection } from "@/components/sections/ExpertiseSection";
import { ServicesPinnedSection } from "@/components/sections/ServicesPinnedSection";
import { ExperienceTimelineSection } from "@/components/sections/ExperienceTimelineSection";
import { ProjectsGallerySection } from "@/components/sections/ProjectsGallerySection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { GitHubActivitySection } from "@/components/sections/GitHubActivitySection";
import { FreelanceContactSection } from "@/components/sections/FreelanceContactSection";

export function PortfolioPageClient({ data }: { data: PublicPortfolioData }) {
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState<string | undefined>();
  const vis = data.siteSettings.sectionVisibility;
  const latestVer = data.latestResume?.version || "v1.0";

  return (
    <PublicShell themeConfig={data.siteSettings.themeConfig}>
      <Navbar
        settings={data.siteSettings}
        navigation={data.navigation}
        latestResumeVersion={latestVer}
      />

      <main>
        {vis.hero && (
          <HeroSection
            hero={data.hero}
            settings={data.siteSettings}
            latestVersion={latestVer}
          />
        )}

        {vis.about && (
          <AboutSection
            about={data.about}
            profile={data.profile}
            latestVersion={latestVer}
          />
        )}

        {vis.expertise && <ExpertiseSection skills={data.skills} />}

        {vis.services && (
          <ServicesPinnedSection
            services={data.services}
            onRequestService={(title) => setSelectedServiceForInquiry(title)}
          />
        )}

        {vis.experience && (
          <ExperienceTimelineSection experiences={data.experiences} />
        )}

        {vis.projects && <ProjectsGallerySection projects={data.projects} />}

        {vis.certifications && (
          <CertificationsSection certifications={data.certifications} />
        )}

        {vis.education && <EducationSection education={data.education} />}

        {vis.github && <GitHubActivitySection github={data.github} />}

        {(vis.freelance || vis.contact) && (
          <FreelanceContactSection
            freelanceServices={data.freelanceServices}
            allServices={data.services}
            settings={data.siteSettings}
            preselectedService={selectedServiceForInquiry}
            latestResumeVersion={latestVer}
          />
        )}
      </main>

      <Footer settings={data.siteSettings} navigation={data.navigation} />
    </PublicShell>
  );
}
