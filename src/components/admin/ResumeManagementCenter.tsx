"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GitCompare,
  RefreshCw,
  Rocket,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/client";
import type {
  AtsValidationReport,
  ResumeChangeSummary,
  ResumeDraftDoc,
  ResumeProfileType,
  ResumeSettingsDoc,
  ResumeVersionDoc,
} from "@/lib/db/types";

const PROFILE_OPTIONS: Array<{ key: ResumeProfileType; label: string }> = [
  { key: "general", label: "General Resume" },
  { key: "fullstack", label: "Full Stack Dev" },
  { key: "mobile", label: "React Native / Mobile" },
  { key: "python-ai", label: "Python & AI" },
  { key: "cybersecurity", label: "Cybersecurity" },
  { key: "it-support", label: "IT Support / SysAdmin" },
];

export function ResumeManagementCenter() {
  const [profileType, setProfileType] = useState<ResumeProfileType>("general");
  const [currentData, setCurrentData] = useState<{
    latestPublished: ResumeVersionDoc | null;
    activeDraft: ResumeDraftDoc | null;
    isOutdated: boolean;
    pendingDiff: ResumeChangeSummary;
    versionCount: number;
    totalDownloads: number;
    settings: ResumeSettingsDoc | null;
  } | null>(null);
  const [versions, setVersions] = useState<
    Array<ResumeVersionDoc & { downloads?: { pdf: number; docx: number } }>
  >([]);
  const [validation, setValidation] = useState<AtsValidationReport | null>(null);
  const [compareFrom, setCompareFrom] = useState("v1.0");
  const [compareTo, setCompareTo] = useState("live");
  const [compareDiff, setCompareDiff] = useState<ResumeChangeSummary | null>(null);

  const [releaseVersion, setReleaseVersion] = useState("");
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadAll = useCallback(async () => {
    const [currRes, verRes, valRes] = await Promise.all([
      adminFetch<typeof currentData>(`/api/admin/resume/current?profile=${profileType}`),
      adminFetch<typeof versions>(`/api/admin/resume/versions?profile=${profileType}`),
      adminFetch<AtsValidationReport>(`/api/admin/resume/validation?profile=${profileType}`),
    ]);
    if (currRes.ok && currRes.data) {
      setCurrentData(currRes.data);
      const suggested = currRes.data.activeDraft?.suggestedVersion || "";
      setReleaseVersion(suggested);
      if (currRes.data.latestPublished) {
        setCompareFrom(currRes.data.latestPublished.version);
      }
    }
    if (verRes.ok && Array.isArray(verRes.data)) setVersions(verRes.data);
    if (valRes.ok && valRes.data) setValidation(valRes.data);
  }, [profileType]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleGenerateDraft = async () => {
    setBusy(true);
    setFeedback(null);
    const res = await adminFetch<{ status: string }>("/api/admin/resume/generate", {
      method: "POST",
      body: JSON.stringify({ profileType }),
    });
    if (res.ok) {
      setFeedback({
        type: "ok",
        text: `Draft status: ${res.data?.status || "generated"}. Preview and validation updated.`,
      });
      await loadAll();
    } else {
      setFeedback({ type: "err", text: res.error || "Failed to generate draft." });
    }
    setBusy(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    const res = await adminFetch<ResumeVersionDoc>("/api/admin/resume/publish", {
      method: "POST",
      body: JSON.stringify({
        profileType,
        version: releaseVersion || undefined,
        title: releaseTitle || undefined,
        releaseNotes: releaseNotes || undefined,
      }),
    });
    if (res.ok && res.data) {
      setFeedback({
        type: "ok",
        text: `Published immutable release ${res.data.version} for ${profileType}.`,
      });
      setReleaseTitle("");
      setReleaseNotes("");
      await loadAll();
    } else {
      setFeedback({ type: "err", text: res.error || "Publish failed." });
    }
    setBusy(false);
  };

  const handleRollback = async (sourceVersion: string) => {
    if (!confirm(`Restore snapshot from ${sourceVersion} into a new published version?`)) return;
    setBusy(true);
    const res = await adminFetch<ResumeVersionDoc>("/api/admin/resume/rollback", {
      method: "POST",
      body: JSON.stringify({ profileType, sourceVersion }),
    });
    if (res.ok && res.data) {
      setFeedback({
        type: "ok",
        text: `Created new version ${res.data.version} restoring snapshot from ${sourceVersion}.`,
      });
      await loadAll();
    } else {
      setFeedback({ type: "err", text: res.error || "Rollback failed." });
    }
    setBusy(false);
  };

  const handleToggleAutoPublish = async () => {
    if (!currentData?.settings) return;
    const nextMode =
      currentData.settings.publishingMode === "manual" ? "automatic" : "manual";
    const res = await adminFetch("/api/admin/resume/settings", {
      method: "PUT",
      body: JSON.stringify({
        publishingMode: nextMode,
        activeTemplateKey: currentData.settings.activeTemplateKey,
        autoGenerateDraftOnProfileChange: currentData.settings.autoGenerateDraftOnProfileChange,
        enabledRoleProfiles: currentData.settings.enabledRoleProfiles,
      }),
    });
    if (res.ok) {
      setFeedback({
        type: "ok",
        text: `Publishing mode switched to ${nextMode.toUpperCase()}.`,
      });
      await loadAll();
    }
  };

  const handleCompare = async () => {
    const res = await adminFetch<{ diff: ResumeChangeSummary }>("/api/admin/resume/compare", {
      method: "POST",
      body: JSON.stringify({ profileType, fromVersion: compareFrom, toVersion: compareTo }),
    });
    if (res.ok && res.data) {
      setCompareDiff(res.data.diff);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Profile Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {PROFILE_OPTIONS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setProfileType(p.key)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
              profileType === p.key
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                : "border-white/15 bg-white/[0.03] text-slate-300 hover:border-white/30"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            feedback.type === "ok"
              ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/35 bg-rose-400/10 text-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Current Published Version</div>
          <div className="mt-1 font-mono text-2xl font-bold text-cyan-300">
            {currentData?.latestPublished?.version || "None"}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {currentData?.latestPublished
              ? `Published ${new Date(currentData.latestPublished.publishedAt).toLocaleDateString()}`
              : ""}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Sync & Draft Status</div>
          <div className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
            {currentData?.isOutdated ? (
              <span className="text-amber-300">OUTDATED · Draft Ready</span>
            ) : (
              <span className="text-emerald-300">UP TO DATE</span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {currentData?.activeDraft
              ? `Suggested Next: ${currentData.activeDraft.suggestedVersion}`
              : "Matches latest published snapshot"}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Historical Versions & Downloads</div>
          <div className="mt-1 font-mono text-2xl font-bold text-white">
            {currentData?.versionCount ?? 0}{" "}
            <span className="text-sm font-normal text-slate-400">
              ({currentData?.totalDownloads ?? 0} downloads)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Original v1.0 permanently archived</div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="text-xs text-slate-400">Publication Mode</div>
          <div className="mt-1 font-display text-lg font-bold uppercase text-white">
            {currentData?.settings?.publishingMode || "manual"}
          </div>
          <button
            type="button"
            onClick={handleToggleAutoPublish}
            className="mt-2 inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-cyan-300 hover:border-cyan-400/40"
          >
            <Settings2 className="h-3 w-3" />
            Switch to{" "}
            {currentData?.settings?.publishingMode === "manual" ? "Automatic" : "Manual Approval"}
          </button>
        </div>
      </div>

      {/* Actions Bar + Preview Toggle */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleGenerateDraft}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/25"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Detect Changes & Generate Draft
          </button>

          <button
            type="button"
            onClick={() => setShowLivePreview((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:border-cyan-400/40"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-300" />
            {showLivePreview ? "Hide PDF Preview" : "Preview Live PDF"}
          </button>

          <a
            href={`/api/admin/resume/preview?profile=${profileType}&format=pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            Download Draft PDF
          </a>

          <a
            href={`/api/admin/resume/preview?profile=${profileType}&format=docx`}
            download
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            <FileText className="h-3.5 w-3.5" />
            Download Draft DOCX
          </a>
        </div>
      </div>

      {showLivePreview && (
        <div className="glass-panel overflow-hidden rounded-3xl p-4">
          <iframe
            src={`/api/admin/resume/preview?profile=${profileType}&format=pdf`}
            className="h-[580px] w-full rounded-2xl border border-white/15 bg-white"
            title="Live Resume PDF Preview"
          />
        </div>
      )}

      {/* Pending Diff + Publish New Version Form */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="glass-panel rounded-3xl p-6 lg:col-span-6">
          <h3 className="font-display text-lg font-bold text-white">
            Change Detection & Comparison
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <select
              value={compareFrom}
              onChange={(e) => setCompareFrom(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#07090d] px-3 py-1.5 font-mono text-white"
            >
              {versions.map((v) => (
                <option key={v._id} value={v.version}>
                  {v.version}
                </option>
              ))}
            </select>
            <span className="text-slate-400">→</span>
            <select
              value={compareTo}
              onChange={(e) => setCompareTo(e.target.value)}
              className="rounded-xl border border-white/15 bg-[#07090d] px-3 py-1.5 font-mono text-white"
            >
              <option value="live">Current Live Profile</option>
              {versions.map((v) => (
                <option key={v._id} value={v.version}>
                  {v.version}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCompare}
              className="inline-flex items-center gap-1 rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-3 py-1.5 font-semibold text-cyan-200"
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare
            </button>
          </div>

          {(() => {
            const diff = compareDiff || currentData?.pendingDiff;
            if (!diff || diff.totalChanges === 0) {
              return (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
                  No structural changes detected between selected states.
                </div>
              );
            }
            return (
              <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                {diff.added.length > 0 && (
                  <div>
                    <div className="font-bold text-emerald-300">ADDED:</div>
                    <ul className="mt-1 space-y-1 text-slate-200">
                      {diff.added.map((a, i) => (
                        <li key={i}>+ {a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {diff.modified.length > 0 && (
                  <div>
                    <div className="font-bold text-amber-300">MODIFIED:</div>
                    <ul className="mt-1 space-y-1 text-slate-200">
                      {diff.modified.map((m, i) => (
                        <li key={i}>~ {m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {diff.removed.length > 0 && (
                  <div>
                    <div className="font-bold text-rose-300">REMOVED:</div>
                    <ul className="mt-1 space-y-1 text-slate-200">
                      {diff.removed.map((r, i) => (
                        <li key={i}>- {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Publish New Version */}
        <form onSubmit={handlePublish} className="glass-panel space-y-4 rounded-3xl p-6 lg:col-span-6">
          <h3 className="font-display text-lg font-bold text-white">
            Publish New Immutable Version
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Semantic Version Tag
              </label>
              <input
                value={releaseVersion}
                onChange={(e) => setReleaseVersion(e.target.value)}
                placeholder="e.g. v1.1"
                className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 font-mono text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300">
                Release Title
              </label>
              <input
                value={releaseTitle}
                onChange={(e) => setReleaseTitle(e.target.value)}
                placeholder="e.g. Updated Skills & Projects"
                className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Release Notes
            </label>
            <textarea
              rows={3}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Summary of added experience, skills, or certifications..."
              className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110"
          >
            <Rocket className="h-4 w-4" />
            Approve & Publish Version
          </button>
        </form>
      </div>

      {/* ATS Validation Checklist & Parsing Preview */}
      {validation && (
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                ATS Document Structure Validation & Text Extraction Preview
              </h3>
              <p className="text-xs text-slate-400">
                Measures selectable text, reading order, headings, contact integrity, and font embedding without claiming fabricated universal ATS percentage scores.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                validation.isValid
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-rose-400/15 text-rose-300"
              }`}
            >
              {validation.isValid ? "All Structural Checks Passed" : "Attention Needed"} ·{" "}
              {validation.pageCount} page(s) · {validation.extractedWordCount} words
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {validation.checks.map((chk) => (
              <div
                key={chk.code}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs"
              >
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  {chk.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  )}
                  <span>{chk.label}</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{chk.detail}</p>
              </div>
            ))}
          </div>

          <details className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
            <summary className="cursor-pointer font-semibold text-cyan-300">
              Inspect Raw PDF Text Extraction Reading Order
            </summary>
            <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-slate-300">
              {validation.extractedTextPreview}
            </pre>
          </details>
        </div>
      )}

      {/* Version Archive & Snapshot Rollback */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="font-display text-lg font-bold text-white">
          Immutable Version History ({profileType})
        </h3>
        <div className="mt-4 space-y-3">
          {versions.map((v) => (
            <div
              key={v._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-300">{v.version}</span>
                  <span className="font-semibold text-white">{v.title}</span>
                  {v.isLatest && (
                    <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Latest
                    </span>
                  )}
                  {v.isOriginalBaseline && (
                    <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                      Original Baseline PDF
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-400">{v.releaseNotes}</div>
                <div className="mt-1 font-mono text-[11px] text-slate-500">
                  Published {new Date(v.publishedAt).toLocaleString()} · PDF Downloads:{" "}
                  {v.downloads?.pdf ?? 0} · DOCX Downloads: {v.downloads?.docx ?? 0}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/api/public/resume/download/${encodeURIComponent(v.version)}/pdf?profile=${profileType}`}
                  download
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-cyan-400/40"
                >
                  PDF
                </a>
                <a
                  href={`/api/public/resume/download/${encodeURIComponent(v.version)}/docx?profile=${profileType}`}
                  download
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-cyan-400/40"
                >
                  DOCX
                </a>
                {!v.isLatest && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRollback(v.version)}
                    className="inline-flex items-center gap-1 rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/25"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore as New Version
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
