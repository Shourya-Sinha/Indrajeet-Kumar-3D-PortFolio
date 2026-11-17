"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResumeManagementCenter } from "@/components/admin/ResumeManagementCenter";

export default function AdminResumeManagementPage() {
  return (
    <AdminShell
      title="ATS Resume Management Center"
      subtitle="Single-source change detection, ATS PDF/DOCX generation, structural validation, role profiles, and immutable version control."
    >
      <ResumeManagementCenter />
    </AdminShell>
  );
}
