"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileCheck2, MessageSquare } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin/client";

interface DashboardStats {
  counts: {
    experiences: number;
    services: number;
    projects: number;
    certifications: number;
    skills: number;
    inquiries: number;
    newInquiries: number;
    media: number;
    resumeVersions: number;
    resumeDownloads: number;
  };
  resumeStatus: {
    currentVersion: string;
    hasPendingDraft: boolean;
    suggestedVersion: string | null;
    draftStatus: string | null;
  };
  recentInquiries: Array<{
    _id: string;
    fullName: string;
    email: string;
    serviceCategory: string;
    status: string;
    createdAt: string;
  }>;
  recentLogs: Array<{
    _id: string;
    actorEmail: string;
    action: string;
    collectionName: string;
    summary: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await adminFetch<DashboardStats>("/api/admin/dashboard");
      if (res.ok && res.data) setData(res.data);
    })();
  }, []);

  return (
    <AdminShell
      title="Administrator Dashboard"
      subtitle="Unified content management, security telemetry, inquiry triage, and automated ATS resume status."
    >
      {data?.resumeStatus.hasPendingDraft ? (
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <div>
              <div className="font-semibold text-white">
                Resume Draft Ready ({data.resumeStatus.suggestedVersion})
              </div>
              <div className="text-xs text-amber-200/80">
                Profile data changed since {data.resumeStatus.currentVersion}. Review changes and publish when ready.
              </div>
            </div>
          </div>
          <Link
            href="/admin/resume-management"
            className="rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950"
          >
            Review & Publish
          </Link>
        </div>
      ) : (
        <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4">
          <div className="flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>
              Resume synchronized with master database ({data?.resumeStatus.currentVersion || "v1.0"} published).
            </span>
          </div>
          <Link href="/admin/resume-management" className="text-xs font-semibold text-cyan-300">
            Manage Resumes →
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Experiences", value: data?.counts.experiences ?? 0, href: "/admin/experience" },
          { label: "Services", value: data?.counts.services ?? 0, href: "/admin/services" },
          { label: "Projects", value: data?.counts.projects ?? 0, href: "/admin/projects" },
          { label: "Skills", value: data?.counts.skills ?? 0, href: "/admin/skills" },
          { label: "Certifications", value: data?.counts.certifications ?? 0, href: "/admin/certifications" },
          { label: "Media Assets", value: data?.counts.media ?? 0, href: "/admin/media" },
          { label: "Inquiries", value: data?.counts.inquiries ?? 0, href: "/admin/inquiries" },
          { label: "New Inquiries", value: data?.counts.newInquiries ?? 0, href: "/admin/inquiries" },
          { label: "Resume Releases", value: data?.counts.resumeVersions ?? 0, href: "/admin/resume-management" },
          { label: "Resume Downloads", value: data?.counts.resumeDownloads ?? 0, href: "/admin/resume-management" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass-panel glass-panel-hover rounded-2xl p-4"
          >
            <div className="text-xs text-slate-400">{card.label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-white">{card.value}</div>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries & Audit Logs */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
              <MessageSquare className="h-4 w-4 text-cyan-300" />
              Recent Client Inquiries
            </h2>
            <Link href="/admin/inquiries" className="text-xs text-cyan-300">
              View All →
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {!data?.recentInquiries.length ? (
              <div className="text-xs text-slate-400">No inquiries submitted yet.</div>
            ) : (
              data.recentInquiries.map((inq) => (
                <div
                  key={inq._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{inq.fullName}</div>
                    <div className="text-slate-400">
                      {inq.serviceCategory} · {inq.email}
                    </div>
                  </div>
                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-cyan-300">
                    {inq.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
              <FileCheck2 className="h-4 w-4 text-cyan-300" />
              Recent Security & CMS Audit Trail
            </h2>
            <Link href="/admin/audit-logs" className="text-xs text-cyan-300">
              Full Logs →
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {(data?.recentLogs || []).map((log) => (
              <div
                key={log._id}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-cyan-300">{log.action}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-0.5 text-slate-200">{log.summary}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
