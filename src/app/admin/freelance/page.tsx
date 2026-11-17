"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminFreelancePage() {
  return (
    <AdminShell
      title="Freelance Service Tiers"
      subtitle="Manage freelance offering categories, SLA deliverables, timeline estimates, and scope indicators."
    >
      <GenericCollectionManager
        collection="freelanceServices"
        itemLabel="Freelance Tier"
        titleField="title"
        subtitleField="category"
        defaultItem={{
          title: "",
          category: "Engineering",
          description: "",
          deliverables: [],
          timelineEstimate: "2–4 weeks",
          startingBudget: "Custom Scope Estimate",
          status: "published",
        }}
        fields={[
          { key: "title", label: "Tier Title", type: "text", required: true },
          { key: "category", label: "Category", type: "text", required: true },
          { key: "timelineEstimate", label: "Timeline Estimate", type: "text", required: true },
          { key: "startingBudget", label: "Budget / Scope Note", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", required: true },
          { key: "deliverables", label: "Deliverables (one per line)", type: "array" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
        ]}
      />
    </AdminShell>
  );
}
