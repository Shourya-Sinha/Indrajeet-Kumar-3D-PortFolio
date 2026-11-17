"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminEducationPage() {
  return (
    <AdminShell
      title="Education Manager"
      subtitle="Manage academic degrees, verified institutions, GPA records, and resume synchronization."
    >
      <GenericCollectionManager
        collection="education"
        itemLabel="Education"
        titleField="degree"
        subtitleField="institution"
        defaultItem={{
          degree: "",
          field: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          gpa: "",
          highlights: [],
          status: "published",
          includeInPortfolio: true,
          includeInResume: true,
          resumeProfiles: ["general", "fullstack"],
        }}
        fields={[
          { key: "degree", label: "Degree", type: "text", required: true },
          { key: "field", label: "Field of Study", type: "text", required: true },
          { key: "institution", label: "Institution", type: "text", required: true },
          { key: "location", label: "Location", type: "text", required: true },
          { key: "startDate", label: "Start Date", type: "text" },
          { key: "endDate", label: "End Date / Present", type: "text", required: true },
          { key: "gpa", label: "Verified GPA", type: "text" },
          { key: "highlights", label: "Highlights (one per line)", type: "array" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show on Portfolio", type: "boolean" },
          { key: "includeInResume", label: "Include in Resume", type: "boolean" },
        ]}
      />
    </AdminShell>
  );
}
