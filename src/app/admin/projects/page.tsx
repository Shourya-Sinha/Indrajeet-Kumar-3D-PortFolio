"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminProjectsPage() {
  return (
    <AdminShell
      title="Projects Manager"
      subtitle="Manage featured showcases, status labels (Production / In Development / Research), GitHub URLs, and resume inclusion."
    >
      <GenericCollectionManager
        collection="projects"
        itemLabel="Project"
        titleField="title"
        subtitleField="category"
        defaultItem={{
          slug: "",
          title: "",
          version: "v1.0",
          badge: "Featured",
          summary: "",
          fullDescription: "",
          category: "Full Stack",
          projectStatus: "Completed",
          featuredRank: 10,
          capabilities: [],
          experimentalFeatures: [],
          plannedFeatures: [],
          technologies: [],
          architectureModules: [],
          githubUrl: "https://github.com/Shourya-Sinha",
          liveUrl: "",
          imageUrl: "/assets/visuals/project-portpilot.webp",
          imageAlt: "Project 3D illustration",
          galleryUrls: [],
          status: "published",
          includeInPortfolio: true,
          includeInResume: false,
          resumeProfiles: ["fullstack"],
          resumeBullets: [],
        }}
        fields={[
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "title", label: "Project Title", type: "text", required: true },
          { key: "version", label: "Version", type: "text" },
          { key: "badge", label: "Showcase Badge", type: "text" },
          { key: "category", label: "Category", type: "text", required: true },
          {
            key: "projectStatus",
            label: "Engineering Status",
            type: "select",
            options: ["Production", "Completed", "In Development", "Experimental", "Research", "Planned"],
          },
          { key: "featuredRank", label: "Featured Rank", type: "number" },
          { key: "summary", label: "Short Summary", type: "textarea", required: true },
          { key: "fullDescription", label: "Full Architecture Description", type: "textarea", required: true },
          { key: "capabilities", label: "Implemented Capabilities (one per line)", type: "array" },
          { key: "experimentalFeatures", label: "Experimental Features (one per line)", type: "array" },
          { key: "plannedFeatures", label: "Planned Features (one per line)", type: "array" },
          { key: "technologies", label: "Technologies (one per line)", type: "array" },
          { key: "architectureModules", label: "Architecture Modules (one per line)", type: "array" },
          { key: "githubUrl", label: "GitHub URL", type: "text", required: true },
          { key: "liveUrl", label: "Live URL (if deployed)", type: "text" },
          { key: "imageUrl", label: "3D Project Visual", type: "file", fileFolder: "projects" },
          { key: "imageAlt", label: "Image Alt Text", type: "text", required: true },
          { key: "status", label: "CMS Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show on Portfolio", type: "boolean" },
          { key: "includeInResume", label: "Include in Resume", type: "boolean" },
          {
            key: "resumeProfiles",
            label: "Resume Profiles",
            type: "multiselect",
            options: ["general", "fullstack", "mobile", "python-ai", "cybersecurity", "it-support"],
          },
          { key: "resumeBullets", label: "ATS Resume Bullet Points (one per line)", type: "array" },
        ]}
      />
    </AdminShell>
  );
}
