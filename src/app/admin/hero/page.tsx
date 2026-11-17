"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminHeroPage() {
  return (
    <AdminShell
      title="Hero Editor"
      subtitle="Manage hero branding, roles, headline, CTA buttons, fallback 3D image, and Three.js scene physics."
    >
      <SingletonEditor
        collection="heroContent"
        fields={[
          { path: "badgeText", label: "Availability Badge", type: "text" },
          { path: "primaryName", label: "Primary Name", type: "text" },
          { path: "alternateName", label: "Alternate Professional Name", type: "text" },
          { path: "roles", label: "Role Titles (one per line)", type: "array" },
          { path: "headline", label: "Hero Headline", type: "text" },
          { path: "subheading", label: "Hero Subheading", type: "textarea" },
          { path: "primaryCtaLabel", label: "Primary CTA Label", type: "text" },
          { path: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text" },
          { path: "resumeCtaLabel", label: "Resume CTA Label", type: "text" },
          { path: "heroImageUrl", label: "Hero 3D Fallback Image URL", type: "text" },
          { path: "heroImageAlt", label: "Hero Image Alt Text", type: "text" },
          { path: "sceneConfig.chromeDistortion", label: "3D Chrome Distortion (0-1)", type: "number" },
          { path: "sceneConfig.particleCount", label: "3D Particle Count", type: "number" },
          { path: "sceneConfig.rotationSpeed", label: "3D Rotation Speed", type: "number" },
        ]}
      />
    </AdminShell>
  );
}
