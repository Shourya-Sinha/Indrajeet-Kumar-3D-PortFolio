"use client";

import React from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { MediaLibraryManager } from "@/components/admin/MediaLibraryManager";

export default function AdminMediaPage() {
  return (
    <AdminShell
      title="Media Library"
      subtitle="Upload images, MP4/WebM loops, and original PDF certificates via Cloudinary signed uploads or authenticated local media storage."
    >
      <MediaLibraryManager />
    </AdminShell>
  );
}
