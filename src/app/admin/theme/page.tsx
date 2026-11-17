"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminThemePage() {
  return (
    <AdminShell
      title="Theme, Colors, 3D Glow & Section Visibility"
      subtitle="Customize palette tokens, animation defaults, and section visibility. Visual-only changes never create unnecessary resume drafts."
    >
      <SingletonEditor
        collection="siteSettings"
        saveLabel="Apply Theme & Visibility"
        fields={[
          { path: "themeConfig.voidColor", label: "Primary Void Background", type: "color" },
          { path: "themeConfig.graphiteColor", label: "Graphite Surface", type: "color" },
          { path: "themeConfig.cyanAccent", label: "Primary Cyan Accent", type: "color" },
          { path: "themeConfig.blueAccent", label: "Electric Blue Accent", type: "color" },
          { path: "themeConfig.violetAccent", label: "Cyber Violet Accent", type: "color" },
          { path: "themeConfig.glowIntensity", label: "3D Lighting Glow Intensity (0.2 - 2.0)", type: "number" },
          { path: "themeConfig.enableReducedMotionByDefault", label: "Default Reduced Motion Mode", type: "boolean" },
          { path: "sectionVisibility.hero", label: "Show Hero Section", type: "boolean" },
          { path: "sectionVisibility.about", label: "Show About Section", type: "boolean" },
          { path: "sectionVisibility.expertise", label: "Show Expertise Section", type: "boolean" },
          { path: "sectionVisibility.services", label: "Show Pinned Services Section", type: "boolean" },
          { path: "sectionVisibility.experience", label: "Show Experience Timeline", type: "boolean" },
          { path: "sectionVisibility.projects", label: "Show Projects Gallery", type: "boolean" },
          { path: "sectionVisibility.certifications", label: "Show Certifications Gallery", type: "boolean" },
          { path: "sectionVisibility.education", label: "Show Education Section", type: "boolean" },
          { path: "sectionVisibility.github", label: "Show GitHub Activity Section", type: "boolean" },
          { path: "sectionVisibility.freelance", label: "Show Freelance Tiers", type: "boolean" },
          { path: "sectionVisibility.contact", label: "Show Contact Portal", type: "boolean" },
        ]}
      />
    </AdminShell>
  );
}
