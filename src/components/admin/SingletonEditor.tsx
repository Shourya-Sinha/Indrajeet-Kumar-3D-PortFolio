"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { adminFetch } from "@/lib/admin/client";

export interface SingletonField {
  path: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "array" | "color";
}

function getNested(obj: Record<string, unknown>, pathStr: string): unknown {
  return pathStr.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, obj);
}

function setNested(obj: Record<string, unknown>, pathStr: string, val: unknown): Record<string, unknown> {
  const parts = pathStr.split(".");
  const clone = structuredClone(obj);
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = val;
  return clone;
}

export function SingletonEditor({
  collection,
  fields,
  saveLabel = "Save Changes",
}: {
  collection: string;
  fields: SingletonField[];
  saveLabel?: string;
}) {
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await adminFetch<Array<Record<string, unknown>>>(
        `/api/admin/content/${collection}`
      );
      if (res.ok && Array.isArray(res.data) && res.data[0]) {
        setDoc(res.data[0]);
      }
    })();
  }, [collection]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc?._id) return;
    setSaving(true);
    setStatusMsg(null);
    const payload = { ...doc };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const res = await adminFetch(`/api/admin/content/${collection}/${String(doc._id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setStatusMsg({ type: "ok", text: "Saved and synced successfully." });
    } else {
      setStatusMsg({ type: "err", text: res.error || "Save failed." });
    }
    setSaving(false);
  };

  if (!doc) {
    return <div className="glass-panel rounded-2xl p-6 text-sm text-slate-400">Loading...</div>;
  }

  return (
    <form onSubmit={handleSave} className="glass-panel space-y-5 rounded-3xl p-6 sm:p-8">
      {statusMsg && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            statusMsg.type === "ok"
              ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/35 bg-rose-400/10 text-rose-200"
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const val = getNested(doc, f.path);
          const wide = f.type === "textarea" || f.type === "array";
          return (
            <div key={f.path} className={wide ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {f.label}
              </label>
              {f.type === "text" && (
                <input
                  value={String(val ?? "")}
                  onChange={(e) => setDoc((d) => (d ? setNested(d, f.path, e.target.value) : d))}
                  className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              )}
              {f.type === "color" && (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={String(val ?? "#00E5FF")}
                    onChange={(e) => setDoc((d) => (d ? setNested(d, f.path, e.target.value) : d))}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-white/15 bg-transparent"
                  />
                  <input
                    value={String(val ?? "")}
                    onChange={(e) => setDoc((d) => (d ? setNested(d, f.path, e.target.value) : d))}
                    className="flex-1 rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 font-mono text-xs text-white"
                  />
                </div>
              )}
              {f.type === "number" && (
                <input
                  type="number"
                  step="0.05"
                  value={Number(val ?? 0)}
                  onChange={(e) =>
                    setDoc((d) => (d ? setNested(d, f.path, Number(e.target.value)) : d))
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  rows={4}
                  value={String(val ?? "")}
                  onChange={(e) => setDoc((d) => (d ? setNested(d, f.path, e.target.value) : d))}
                  className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                />
              )}
              {f.type === "array" && (
                <textarea
                  rows={4}
                  value={Array.isArray(val) ? val.join("\n") : ""}
                  onChange={(e) =>
                    setDoc((d) =>
                      d
                        ? setNested(
                            d,
                            f.path,
                            e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          )
                        : d
                    )
                  }
                  className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400"
                />
              )}
              {f.type === "boolean" && (
                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => setDoc((d) => (d ? setNested(d, f.path, e.target.checked) : d))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  <span>Enabled</span>
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-white/10 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {saving ? "Saving..." : saveLabel}
        </button>
      </div>
    </form>
  );
}
