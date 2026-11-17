"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SingletonEditor } from "@/components/admin/SingletonEditor";

export default function AdminSiteSettingsPage() {
  return (
    <AdminShell
      title="Global Site Settings"
      subtitle="Control availability status, freelance inquiry switch, GitHub showcase username, and maintenance mode."
    >
      <SingletonEditor
        collection="siteSettings"
        saveLabel="Save Site Settings"
        fields={[
          { path: "availabilityStatus", label: "Availability Banner Text", type: "text" },
          { path: "availableForHire", label: "Open for Freelance / Hiring", type: "boolean" },
          { path: "githubUsername", label: "GitHub Username for Live Feed", type: "text" },
          { path: "maintenanceMode", label: "Maintenance Mode", type: "boolean" },
          { path: "contactEmail", label: "Public Contact Email", type: "text" },
          { path: "contactPhone", label: "Public Contact Phone", type: "text" },
          { path: "location", label: "Location", type: "text" },
        ]}
      />
    </AdminShell>
  );
}
