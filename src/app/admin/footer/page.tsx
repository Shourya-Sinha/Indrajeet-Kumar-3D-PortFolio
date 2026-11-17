"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminFooterPage() {
  return (
    <AdminShell
      title="Footer Editor"
      subtitle="Manage footer brand wording, tagline, and maintainer attribution."
    >
      <SingletonEditor
        collection="siteSettings"
        saveLabel="Save Footer Configuration"
        fields={[
          { path: "brandName", label: "Primary Footer Brand", type: "text" },
          { path: "alternateName", label: "Alternate Name", type: "text" },
          { path: "tagline", label: "Footer Tagline", type: "textarea" },
          { path: "footerCredit", label: "Developer & Maintainer Attribution", type: "text" },
          { path: "githubUrl", label: "GitHub URL", type: "text" },
          { path: "linkedinUrl", label: "LinkedIn URL", type: "text" },
        ]}
      />
    </AdminShell>
  );
}
