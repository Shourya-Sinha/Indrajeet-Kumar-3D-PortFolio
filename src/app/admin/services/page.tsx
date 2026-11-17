"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminServicesPage() {
  return (
    <AdminShell
      title="Pinned Scroll Services Manager"
      subtitle="Add, edit, publish, and reorder services featured in the GSAP pinned scroll showcase."
    >
      <GenericCollectionManager
        collection="services"
        itemLabel="Service"
        titleField="title"
        subtitleField="shortTagline"
        defaultItem={{
          slug: "",
          numberLabel: "18",
          title: "",
          shortTagline: "",
          description: "",
          deliverables: [],
          technologies: [],
          imageUrl: "/assets/visuals/service-web-dev.webp",
          imageAlt: "3D service render",
          sceneThemeKey: "custom-stage",
          ctaLabel: "Request Service",
          status: "published",
          includeInPortfolio: true,
        }}
        fields={[
          { key: "numberLabel", label: "Step Number (e.g. 01)", type: "text", required: true },
          { key: "slug", label: "URL Slug", type: "text", required: true },
          { key: "title", label: "Service Title", type: "text", required: true },
          { key: "shortTagline", label: "Tagline", type: "text", required: true },
          { key: "description", label: "Detailed Description", type: "textarea", required: true },
          { key: "deliverables", label: "Deliverables (one per line)", type: "array" },
          { key: "technologies", label: "Technologies (one per line)", type: "array" },
          { key: "imageUrl", label: "3D Visual Asset", type: "file", fileFolder: "services" },
          { key: "imageAlt", label: "Image Alt Text", type: "text", required: true },
          { key: "sceneThemeKey", label: "3D Scene Theme Key", type: "text", required: true },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show in Public Section", type: "boolean" },
        ]}
      />
    </AdminShell>
  );
}
