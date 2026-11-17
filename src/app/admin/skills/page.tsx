"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminSkillsPage() {
  return (
    <AdminShell
      title="Technical Skills Matrix"
      subtitle="Add, edit, categorize, reorder, and control which skills propagate to the public 3D matrix and ATS resumes."
    >
      <GenericCollectionManager
        collection="skills"
        itemLabel="Skill"
        titleField="name"
        subtitleField="category"
        defaultItem={{
          name: "",
          category: "Frontend Engineering",
          proficiency: 85,
          experienceYears: "2+ yrs",
          description: "",
          status: "published",
          includeInPortfolio: true,
          includeInResume: true,
          resumeProfiles: ["general", "fullstack"],
        }}
        fields={[
          { key: "name", label: "Skill Name", type: "text", required: true },
          {
            key: "category",
            label: "Category",
            type: "select",
            options: [
              "Frontend Engineering",
              "Backend Engineering",
              "Mobile Development",
              "Database",
              "AI & Machine Learning",
              "Cybersecurity",
              "DevOps and Infrastructure",
              "SEO",
              "Languages",
              "Payments",
            ],
          },
          { key: "proficiency", label: "Proficiency (1–100)", type: "number", required: true },
          { key: "experienceYears", label: "Experience Duration", type: "text" },
          { key: "description", label: "Short Context", type: "text" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show on Portfolio", type: "boolean" },
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
