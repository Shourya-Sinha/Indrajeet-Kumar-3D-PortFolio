"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminNavigationPage() {
  return (
    <AdminShell
      title="Navigation Manager"
      subtitle="Reorder, show/hide, or edit top navigation and footer links dynamically."
    >
      <GenericCollectionManager
        collection="navigationItems"
        itemLabel="Navigation Link"
        titleField="label"
        subtitleField="href"
        defaultItem={{
          label: "",
          href: "/",
          zone: "header",
          isVisible: true,
          isExternal: false,
        }}
        fields={[
          { key: "label", label: "Link Label", type: "text", required: true },
          { key: "href", label: "Target Path or Anchor", type: "text", required: true },
          { key: "zone", label: "Zone", type: "select", options: ["header", "footer"] },
          { key: "isVisible", label: "Visible", type: "boolean" },
          { key: "isExternal", label: "External Link", type: "boolean" },
        ]}
      />
    </AdminShell>
  );
}
