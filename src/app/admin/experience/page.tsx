"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminExperiencePage() {
  return (
    <AdminShell
      title="Experience Manager"
      subtitle="Adding, editing, or reordering experiences automatically synchronizes the portfolio timeline and prepares an updated ATS resume draft."
    >
      <GenericCollectionManager
        collection="experiences"
        itemLabel="Experience"
        titleField="role"
        subtitleField="company"
        defaultItem={{
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "Present",
          isCurrent: false,
          description: "",
          responsibilities: [],
          technologies: [],
          status: "published",
          includeInPortfolio: true,
          includeInResume: true,
          resumeProfiles: ["general", "fullstack"],
        }}
        fields={[
          { key: "company", label: "Company Name", type: "text", required: true },
          { key: "role", label: "Job Title", type: "text", required: true },
          { key: "location", label: "Location", type: "text", required: true },
          { key: "startDate", label: "Start Date (e.g. Apr 2023)", type: "text" },
          { key: "endDate", label: "End Date (e.g. Present)", type: "text", required: true },
          { key: "isCurrent", label: "Currently Active Role", type: "boolean" },
          { key: "description", label: "Overview Description", type: "textarea", required: true },
          { key: "responsibilities", label: "Key Responsibilities (one per line)", type: "array" },
          { key: "technologies", label: "Technologies (one per line)", type: "array" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show on Public Portfolio", type: "boolean" },
          { key: "includeInResume", label: "Include in ATS Resume", type: "boolean" },
          {
            key: "resumeProfiles",
            label: "Target Resume Profiles",
            type: "multiselect",
            options: ["general", "fullstack", "mobile", "python-ai", "cybersecurity", "it-support"],
          },
        ]}
      />
    </AdminShell>
  );
}
