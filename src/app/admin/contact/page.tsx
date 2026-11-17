"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminContactProfilePage() {
  return (
    <AdminShell
      title="Contact & Master Professional Profile"
      subtitle="Single source of truth for contact channels, public links, and resume header summary. Changes automatically sync to Site Settings and Resume Drafts."
    >
      <SingletonEditor
        collection="professionalProfiles"
        saveLabel="Save Master Profile & Sync Resume"
        fields={[
          { path: "fullName", label: "Full Name (Resume Header)", type: "text" },
          { path: "displayName", label: "Portfolio Display Name", type: "text" },
          { path: "headline", label: "Portfolio Headline", type: "text" },
          { path: "resumeHeadline", label: "ATS Resume Headline", type: "text" },
          { path: "email", label: "Primary Contact Email", type: "text" },
          { path: "phone", label: "Primary Phone Number", type: "text" },
          { path: "location", label: "Location", type: "text" },
          { path: "githubUrl", label: "GitHub URL", type: "text" },
          { path: "linkedinUrl", label: "LinkedIn URL", type: "text" },
          { path: "summary", label: "ATS Professional Summary", type: "textarea" },
          { path: "customSectionOrder", label: "Resume Section Order (one per line)", type: "array" },
        ]}
      />
    </AdminShell>
  );
}
