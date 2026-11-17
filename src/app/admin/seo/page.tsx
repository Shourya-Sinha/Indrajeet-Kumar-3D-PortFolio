"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminSeoPage() {
  return (
    <AdminShell
      title="SEO Metadata Manager"
      subtitle="Control per-route meta titles, descriptions, keywords, canonical URLs, OpenGraph headers, and indexing rules."
    >
      <GenericCollectionManager
        collection="seoMetadata"
        itemLabel="SEO Route Rule"
        titleField="routeKey"
        subtitleField="title"
        allowReorder={false}
        defaultItem={{
          routeKey: "/",
          title: "",
          description: "",
          keywords: [],
          canonicalUrl: "https://shouryasinha.dev/",
          ogTitle: "",
          ogDescription: "",
          ogImageUrl: "/assets/visuals/hero-environment.webp",
          twitterCard: "summary_large_image",
          noIndex: false,
        }}
        fields={[
          { key: "routeKey", label: "Route Key (e.g. / or /resume)", type: "text", required: true },
          { key: "title", label: "Meta Title", type: "text", required: true },
          { key: "description", label: "Meta Description", type: "textarea", required: true },
          { key: "keywords", label: "Keywords (one per line)", type: "array" },
          { key: "canonicalUrl", label: "Canonical URL", type: "text" },
          { key: "ogTitle", label: "OpenGraph Title", type: "text" },
          { key: "ogDescription", label: "OpenGraph Description", type: "textarea" },
          { key: "ogImageUrl", label: "OpenGraph Image URL", type: "text" },
          { key: "twitterCard", label: "Twitter Card", type: "select", options: ["summary_large_image", "summary"] },
          { key: "noIndex", label: "Disallow Indexing (noindex)", type: "boolean" },
        ]}
      />
    </AdminShell>
  );
}
