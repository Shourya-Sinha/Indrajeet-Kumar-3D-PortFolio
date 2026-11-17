"use client";

import React, { useEffect, useState } from "react";
import { Copy, FileText, Trash2, Upload } from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import type { MediaAssetDoc } from "@/lib/db/types";

export function MediaLibraryManager() {
  const [assets, setAssets] = useState<MediaAssetDoc[]>([]);
  const [cloudConfigured, setCloudConfigured] = useState(false);
  const [folder, setFolder] = useState("portfolio");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = async () => {
    const resp = await fetch("/api/admin/media", { credentials: "same-origin" });
    const json = (await resp.json()) as {
      ok?: boolean;
      data?: MediaAssetDoc[];
      cloudinaryConfigured?: boolean;
    };
    if (json.ok && json.data) {
      setAssets(json.data);
      setCloudConfigured(Boolean(json.cloudinaryConfigured));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setFeedback(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    fd.append("altText", altText || file.name);

    const res = await adminFetch<MediaAssetDoc>("/api/admin/media", {
      method: "POST",
      body: fd,
    });

    if (res.ok && res.data) {
      setFeedback(`Uploaded ${res.data.fileName} (${res.data.storageProvider}).`);
      setAltText("");
      await load();
    } else {
      setFeedback(res.error || "Upload failed.");
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this media asset?")) return;
    const res = await adminFetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (res.ok) await load();
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Authenticated Media & Document Upload
            </h2>
            <p className="text-xs text-slate-400">
              Storage Driver:{" "}
              <strong className="text-cyan-300">
                {cloudConfigured ? "Cloudinary Signed CDN" : "Local Authenticated Storage (Set CLOUDINARY_* env vars for Cloud CDN)"}
              </strong>
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            placeholder="Folder (e.g. projects, certificates)"
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          />
          <input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Descriptive Alt Text (SEO)"
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          />
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300">
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Select Image / Video / PDF"}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,application/pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {feedback && <div className="mt-3 text-xs text-cyan-300">{feedback}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset._id} className="glass-panel overflow-hidden rounded-2xl">
            <div className="flex h-40 items-center justify-center bg-[#07090d]">
              {asset.resourceType === "image" ? (
                <img
                  src={asset.secureUrl}
                  alt={asset.altText}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-cyan-300">
                  <FileText className="h-8 w-8" />
                  <span className="font-mono text-xs uppercase">{asset.format}</span>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="truncate text-xs font-bold text-white">{asset.fileName}</div>
              <div className="truncate text-[11px] text-slate-400">{asset.altText}</div>
              <div className="flex items-center justify-between pt-2 text-[11px]">
                <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-slate-300">
                  {asset.storageProvider} · {asset.folder}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(asset.secureUrl)}
                    className="rounded border border-white/15 p-1 text-slate-300 hover:text-cyan-300"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset._id)}
                    className="rounded border border-rose-400/30 p-1 text-rose-300 hover:bg-rose-500/15"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
