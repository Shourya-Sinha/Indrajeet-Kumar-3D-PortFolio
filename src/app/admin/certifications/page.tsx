"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { GenericCollectionManager } from "@/components/admin/GenericCollectionManager";

export default function AdminCertificationsPage() {
  return (
    <AdminShell
      title="Certifications Manager"
      subtitle="Upload original certificate PDFs or scanned images, manage issuers/credential IDs, and synchronize the 3D gallery and ATS resume."
    >
      <GenericCollectionManager
        collection="certifications"
        itemLabel="Certification"
        titleField="title"
        subtitleField="issuer"
        defaultItem={{
          title: "",
          issuer: "",
          location: "",
          issueDate: "",
          credentialId: "",
          verificationUrl: "",
          description: "",
          documentUrl: "",
          previewImageUrl: "/assets/visuals/section-certifications.webp",
          documentType: "credential_summary",
          hasOriginalDocument: false,
          status: "published",
          includeInPortfolio: true,
          includeInResume: true,
          resumeProfiles: ["general", "fullstack"],
        }}
        fields={[
          { key: "title", label: "Certification Title", type: "text", required: true },
          { key: "issuer", label: "Issuing Organization", type: "text", required: true },
          { key: "location", label: "Location", type: "text" },
          { key: "issueDate", label: "Issue Date / Year", type: "text", required: true },
          { key: "credentialId", label: "Credential ID", type: "text" },
          { key: "verificationUrl", label: "Verification URL", type: "text" },
          { key: "description", label: "Description", type: "textarea", required: true },
          {
            key: "documentUrl",
            label: "Original Certificate Document (PDF or Image)",
            type: "file",
            fileFolder: "certificates",
            fileTargetMimeHint: "application/pdf,image/*",
          },
          {
            key: "documentType",
            label: "Document Format",
            type: "select",
            options: ["pdf", "image", "credential_summary"],
          },
          { key: "hasOriginalDocument", label: "Original File Attached", type: "boolean" },
          { key: "status", label: "Publish Status", type: "select", options: ["published", "draft", "archived"] },
          { key: "includeInPortfolio", label: "Show in 3D Gallery", type: "boolean" },
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
