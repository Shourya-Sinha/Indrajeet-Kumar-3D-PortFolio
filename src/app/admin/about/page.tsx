"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminAboutPage() {
  return (
    <AdminShell
      title="About Section Editor"
      subtitle="Control biography narrative, specialties, career goals, and visual presentation."
    >
      <SingletonEditor
        collection="aboutContent"
        fields={[
          { path: "headline", label: "Section Headline", type: "text" },
          { path: "yearsExperience", label: "Experience Badge", type: "text" },
          { path: "location", label: "Location", type: "text" },
          { path: "educationHighlight", label: "Education Highlight", type: "text" },
          { path: "summary", label: "About Narrative", type: "textarea" },
          { path: "careerGoals", label: "Career Goals", type: "textarea" },
          { path: "specialties", label: "Primary Specialties (one per line)", type: "array" },
          { path: "profileImageUrl", label: "Environment / Profile Image URL", type: "text" },
          { path: "profileImageAlt", label: "Image Alt Text", type: "text" },
        ]}
      />
    </AdminShell>
  );
}
