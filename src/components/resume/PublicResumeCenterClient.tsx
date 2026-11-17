"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Eye,
  FileCode2,
  FileText,
  History,
  Layers,
  ShieldCheck,
} from "lucide-react";
import type { ResumeProfileType, ResumeVersionDoc } from "@/lib/db/types";
import { CertificateReaderModal } from "@/components/certificates/CertificateReaderModal";

const PROFILE_LABELS: Record<ResumeProfileType, string> = {
  general: "General Technical Resume",
  fullstack: "Full Stack Developer",
  mobile: "React Native / Mobile Engineer",
  "python-ai": "Python & AI Developer",
  cybersecurity: "Cybersecurity & AppSec",
  "it-support": "IT Support & SysAdmin",
};

export function PublicResumeCenterClient({
  versionsByProfile,
  enabledProfiles,
}: {
  versionsByProfile: Record<string, ResumeVersionDoc[]>;
  enabledProfiles: ResumeProfileType[];
}) {
  const [selectedProfile, setSelectedProfile] = useState<ResumeProfileType>("general");
  const profileVersions = useMemo(
    () => versionsByProfile[selectedProfile] || [],
    [versionsByProfile, selectedProfile]
  );

  const [selectedVersionStr, setSelectedVersionStr] = useState<string>(
    profileVersions.find((v) => v.isLatest)?.version || profileVersions[0]?.version || "v1.0"
  );

  const activeVersion = useMemo(() => {
    return (
      profileVersions.find((v) => v.version === selectedVersionStr) ||
      profileVersions.find((v) => v.isLatest) ||
      profileVersions[0] ||
      null
    );
  }, [profileVersions, selectedVersionStr]);

  const [previewInModal, setPreviewInModal] = useState(false);

  const handleProfileChange = (profile: ResumeProfileType) => {
    setSelectedProfile(profile);
    const list = versionsByProfile[profile] || [];
    const latest = list.find((v) => v.isLatest) || list[0];
    setSelectedVersionStr(latest?.version || "v1.0");
  };

  if (!activeVersion) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center text-slate-300">
        No published resume versions are currently available.
      </div>
    );
  }

  const snap = activeVersion.profileSnapshot;

  return (
    <div className="space-y-10">
      {/* Role Profile Selector */}
      <div className="glass-panel rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Single-Source Verified ATS Resume Center
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">
              Professional Resume — Shourya Sinha (Kumar Indrajeet)
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              ATS-structured PDF (selectable embedded typography) and editable DOCX generated from verified professional records.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-2.5 text-right">
            <div className="text-[11px] uppercase tracking-wider text-emerald-300">
              Selected Release
            </div>
            <div className="font-mono text-lg font-bold text-white">
              {activeVersion.version}{" "}
              {activeVersion.isLatest && (
                <span className="ml-1 text-xs font-normal text-emerald-300">(Latest)</span>
              )}
            </div>
          </div>
        </div>

        {/* Role-Specific Resume Profile Tabs */}
        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Choose Resume Track
          </div>
          <div className="flex flex-wrap gap-2">
            {enabledProfiles.map((prof) => (
              <button
                key={prof}
                type="button"
                onClick={() => handleProfileChange(prof)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  selectedProfile === prof
                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                    : "border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30"
                }`}
              >
                {PROFILE_LABELS[prof] || prof}
              </button>
            ))}
          </div>
        </div>

        {/* Version Selector + Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#07090e] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <History className="h-4 w-4 text-cyan-300" />
            <label htmlFor="version-select" className="text-xs font-semibold text-slate-300">
              Version Archive:
            </label>
            <select
              id="version-select"
              value={activeVersion.version}
              onChange={(e) => setSelectedVersionStr(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#0f131b] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400"
            >
              {profileVersions.map((ver) => (
                <option key={ver._id} value={ver.version}>
                  {ver.version} — {ver.isLatest ? "Latest Published" : ver.isOriginalBaseline ? "Original Resume" : "Historical Release"} (
                  {new Date(ver.publishedAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPreviewInModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-400/40"
            >
              <Eye className="h-3.5 w-3.5 text-cyan-300" />
              View Interactive PDF
            </button>

            <a
              href={`/api/public/resume/download/${encodeURIComponent(activeVersion.version)}/pdf?profile=${selectedProfile}`}
              download
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2 text-xs font-bold text-slate-950 hover:brightness-110"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF ({activeVersion.version})
            </a>

            <a
              href={`/api/public/resume/download/${encodeURIComponent(activeVersion.version)}/docx?profile=${selectedProfile}`}
              download
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
            >
              <FileText className="h-3.5 w-3.5" />
              Download DOCX
            </a>
          </div>
        </div>
      </div>

      {/* Main Split: ATS Document Preview + Version History Archive */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Clean Single-Column ATS Document Preview */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/20 bg-white p-6 text-slate-900 shadow-2xl sm:p-10">
            <div className="text-center">
              <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-950">
                {snap.profile.fullName}
              </h2>
              <div className="mt-1 text-sm font-semibold text-[#1D549F]">
                {snap.profile.headline}
              </div>
              <div className="mt-1.5 text-xs text-slate-600">
                {snap.profile.phone} | {snap.profile.email} | {snap.profile.location} |{" "}
                {snap.profile.githubUrl.replace(/^https?:\/\//, "")} |{" "}
                {snap.profile.linkedinUrl.replace(/^https?:\/\//, "")}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                PROFESSIONAL SUMMARY
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-800">{snap.profile.summary}</p>
            </div>

            <div className="mt-5">
              <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                PROFESSIONAL EXPERIENCE
              </h3>
              <div className="mt-2.5 space-y-4">
                {snap.experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between gap-2 text-xs font-bold text-slate-950">
                      <span>{exp.role}</span>
                      <span className="font-normal text-slate-600">
                        {exp.startDate ? `${exp.startDate} – ${exp.endDate}` : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs italic text-slate-700">
                      {exp.company}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </div>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-slate-800">
                      {exp.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {snap.projects.length > 0 && (
              <div className="mt-5">
                <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                  FEATURED PROJECTS
                </h3>
                <div className="mt-2.5 space-y-3">
                  {snap.projects.map((p) => (
                    <div key={p.id}>
                      <div className="text-xs font-bold text-slate-950">{p.title}</div>
                      <div className="text-[11px] italic text-slate-600">
                        Stack: {p.stack.join(", ")}
                      </div>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-800">
                        {p.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5">
              <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                TECHNICAL SKILLS
              </h3>
              <div className="mt-2 space-y-1 text-xs text-slate-800">
                {snap.skillGroups.map((g) => (
                  <div key={g.category}>
                    <strong>{g.category}:</strong> {g.items.join(", ")}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                EDUCATION
              </h3>
              <div className="mt-2 space-y-1 text-xs text-slate-800">
                {snap.education.map((ed) => (
                  <div key={ed.id}>
                    <strong>
                      {ed.degree} | {ed.institution}
                    </strong>{" "}
                    <span className="text-slate-600">
                      {ed.dates}
                      {ed.gpa ? ` | GPA: ${ed.gpa}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <h3 className="border-b border-[#1D549F] pb-0.5 text-xs font-bold uppercase tracking-wider text-[#1D549F]">
                CERTIFICATIONS
              </h3>
              <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-800">
                {snap.certifications.map((c) => (
                  <li key={c.id}>
                    {c.title} – {c.issuer}
                    {c.location ? `, ${c.location}` : ""} ({c.issueDate})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Version History & ATS Verification Sidebar */}
        <div className="space-y-6 lg:col-span-4">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Layers className="h-4 w-4 text-cyan-300" />
              Version Release History
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Published historical snapshots remain immutable and permanently downloadable.
            </p>

            <div className="mt-4 space-y-3">
              {profileVersions.map((ver) => {
                const selected = ver.version === activeVersion.version;
                return (
                  <div
                    key={ver._id}
                    className={`rounded-2xl border p-4 transition ${
                      selected
                        ? "border-cyan-400/60 bg-cyan-400/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedVersionStr(ver.version)}
                        className="font-mono text-sm font-bold text-white hover:text-cyan-300"
                      >
                        {ver.version}
                      </button>
                      <div className="flex gap-1.5">
                        {ver.isLatest && (
                          <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Latest
                          </span>
                        )}
                        {ver.isOriginalBaseline && (
                          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            Original v1.0
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-xs font-medium text-slate-200">{ver.title}</div>
                    <div className="mt-1 text-[11px] text-slate-400">{ver.releaseNotes}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(ver.publishedAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <a
                          href={`/api/public/resume/download/${encodeURIComponent(ver.version)}/pdf?profile=${selectedProfile}`}
                          download
                          className="text-cyan-300 hover:underline"
                        >
                          PDF
                        </a>
                        <a
                          href={`/api/public/resume/download/${encodeURIComponent(ver.version)}/docx?profile=${selectedProfile}`}
                          download
                          className="text-cyan-300 hover:underline"
                        >
                          DOCX
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ATS Structure Verification Summary */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileCode2 className="h-4 w-4 text-cyan-300" />
              PDF Structure Verification
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Measurable document quality checks on {activeVersion.version}:
            </p>
            <div className="mt-3 space-y-2">
              {(activeVersion.validationReport?.checks || []).slice(0, 6).map((chk) => (
                <div
                  key={chk.code}
                  className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      chk.passed ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-slate-200">{chk.label}</div>
                    <div className="text-[11px] text-slate-400">{chk.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive PDF Page-Turn Modal for Selected Resume Version */}
      {previewInModal && (
        <CertificateReaderModal
          cert={{
            _id: activeVersion._id,
            title: `${snap.profile.fullName} — Resume (${activeVersion.version})`,
            issuer: PROFILE_LABELS[selectedProfile],
            location: snap.profile.location,
            issueDate: new Date(activeVersion.publishedAt).toLocaleDateString(),
            description: activeVersion.releaseNotes,
            documentUrl: `/api/public/resume/download/${encodeURIComponent(activeVersion.version)}/pdf?profile=${selectedProfile}&inline=1`,
            previewImageUrl: "/assets/visuals/hero-environment.webp",
            documentType: "pdf",
            hasOriginalDocument: true,
            order: 1,
            status: "published",
            includeInPortfolio: true,
            includeInResume: true,
            resumeProfiles: [selectedProfile],
            createdAt: activeVersion.createdAt,
            updatedAt: activeVersion.updatedAt,
          }}
          onClose={() => setPreviewInModal(false)}
        />
      )}
    </div>
  );
}
