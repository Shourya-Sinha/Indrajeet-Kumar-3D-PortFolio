"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit3,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/client";

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "array" | "multiselect" | "file";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  fileFolder?: string;
  fileTargetMimeHint?: string;
}

interface GenericCollectionManagerProps {
  collection: string;
  itemLabel: string;
  fields: FieldConfig[];
  titleField: string;
  subtitleField?: string;
  allowCreate?: boolean;
  allowDelete?: boolean;
  allowReorder?: boolean;
  defaultItem: Record<string, unknown>;
}

export function GenericCollectionManager({
  collection,
  itemLabel,
  fields,
  titleField,
  subtitleField,
  allowCreate = true,
  allowDelete = true,
  allowReorder = true,
  defaultItem,
}: GenericCollectionManagerProps) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Record<string, unknown>>(defaultItem);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch<Array<Record<string, unknown>>>(
      `/api/admin/content/${collection}`
    );
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data);
    }
    setLoading(false);
  }, [collection]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const startCreate = () => {
    setEditingId(null);
    setFormState({ ...defaultItem, order: items.length + 1 });
    setShowForm(true);
    setMessage(null);
  };

  const startEdit = (item: Record<string, unknown>) => {
    setEditingId(String(item._id));
    setFormState({ ...item });
    setShowForm(true);
    setMessage(null);
  };

  const handleFileUpload = async (field: FieldConfig, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", field.fileFolder || collection);
    fd.append("altText", String(formState[titleField] || file.name));

    const res = await adminFetch<{ secureUrl: string; resourceType: string; format: string }>(
      "/api/admin/media",
      { method: "POST", body: fd }
    );
    if (!res.ok || !res.data) {
      setMessage({ type: "err", text: res.error || "File upload failed." });
      return;
    }
    setFormState((prev) => ({
      ...prev,
      [field.key]: res.data!.secureUrl,
      ...(collection === "certifications"
        ? {
            documentType: res.data!.format === "pdf" ? "pdf" : "image",
            hasOriginalDocument: true,
          }
        : {}),
    }));
    setMessage({ type: "ok", text: `Uploaded ${file.name} cleanly.` });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = { ...formState };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;

    const url = editingId
      ? `/api/admin/content/${collection}/${editingId}`
      : `/api/admin/content/${collection}`;
    const method = editingId ? "PATCH" : "POST";

    const res = await adminFetch(url, {
      method,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setMessage({ type: "err", text: res.error || "Failed to save changes." });
    } else {
      setMessage({
        type: "ok",
        text: `${itemLabel} ${editingId ? "updated" : "created"} successfully.`,
      });
      setShowForm(false);
      setEditingId(null);
      await loadItems();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete this ${itemLabel}?`)) return;
    const res = await adminFetch(`/api/admin/content/${collection}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMessage({ type: "ok", text: `${itemLabel} deleted.` });
      await loadItems();
    } else {
      setMessage({ type: "err", text: res.error || "Delete failed." });
    }
  };

  const handleToggleStatus = async (item: Record<string, unknown>) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    const res = await adminFetch(`/api/admin/content/${collection}/${String(item._id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) {
      await loadItems();
    }
  };

  const handleMove = async (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setItems(copy);
    await adminFetch(`/api/admin/content/${collection}`, {
      method: "POST",
      body: JSON.stringify({
        action: "reorder",
        orderedIds: copy.map((i) => String(i._id)),
      }),
    });
    await loadItems();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Total {itemLabel} records: <strong className="text-white">{items.length}</strong>
        </div>
        {allowCreate && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Add {itemLabel}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            message.type === "ok"
              ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/35 bg-rose-400/10 text-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSave}
          className="glass-panel space-y-4 rounded-3xl border border-cyan-400/30 p-6"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-display text-lg font-bold text-white">
              {editingId ? `Edit ${itemLabel}` : `Create ${itemLabel}`}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const val = formState[field.key];
              const isWide =
                field.type === "textarea" ||
                field.type === "array" ||
                field.type === "multiselect" ||
                field.type === "file";

              return (
                <div key={field.key} className={isWide ? "sm:col-span-2" : ""}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>

                  {field.type === "text" && (
                    <input
                      required={field.required}
                      value={String(val ?? "")}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      required={field.required}
                      value={Number(val ?? 0)}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, [field.key]: Number(e.target.value) }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows={3}
                      required={field.required}
                      value={String(val ?? "")}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={String(val ?? field.options?.[0] ?? "")}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, [field.key]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    >
                      {(field.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "boolean" && (
                    <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) =>
                          setFormState((p) => ({ ...p, [field.key]: e.target.checked }))
                        }
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <span>Enabled</span>
                    </label>
                  )}

                  {field.type === "array" && (
                    <textarea
                      rows={3}
                      value={Array.isArray(val) ? val.join("\n") : ""}
                      placeholder="One entry per line"
                      onChange={(e) =>
                        setFormState((p) => ({
                          ...p,
                          [field.key]: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-cyan-400"
                    />
                  )}

                  {field.type === "multiselect" && (
                    <div className="flex flex-wrap gap-2">
                      {(field.options || []).map((opt) => {
                        const arr = Array.isArray(val) ? (val as string[]) : [];
                        const active = arr.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const next = active
                                ? arr.filter((x) => x !== opt)
                                : [...arr, opt];
                              setFormState((p) => ({ ...p, [field.key]: next }));
                            }}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              active
                                ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                                : "border-white/15 bg-white/5 text-slate-400"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {field.type === "file" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={String(val ?? "")}
                        placeholder="Document or media URL"
                        onChange={(e) =>
                          setFormState((p) => ({ ...p, [field.key]: e.target.value }))
                        }
                        className="flex-1 rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white outline-none focus:border-cyan-400"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20">
                        <Upload className="h-3.5 w-3.5" />
                        Upload File
                        <input
                          type="file"
                          className="hidden"
                          accept={field.fileTargetMimeHint || "image/*,application/pdf,video/*"}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(field, f);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-6 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving..." : `Save ${itemLabel}`}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-6 text-sm text-slate-400">
          Loading {itemLabel} records...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-sm text-slate-400">
          No {itemLabel.toLowerCase()} records found.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={String(item._id)}
              className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-base font-bold text-white">
                    {String(item[titleField] ?? "Untitled")}
                  </span>
                  {item.status !== undefined && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                        item.status === "published"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-amber-400/15 text-amber-300"
                      }`}
                    >
                      {String(item.status)}
                    </span>
                  )}
                  {item.includeInResume === true && (
                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-200">
                      Resume Sync
                    </span>
                  )}
                </div>
                {subtitleField && item[subtitleField] !== undefined && (
                  <div className="mt-0.5 truncate text-xs text-slate-400">
                    {String(item[subtitleField] ?? "")}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {allowReorder && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === items.length - 1}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}

                {item.status !== undefined && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-cyan-400/40"
                  >
                    {item.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-lg border border-cyan-400/35 bg-cyan-400/10 p-1.5 text-cyan-200 hover:bg-cyan-400/20"
                  title="Edit"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                {allowDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(String(item._id))}
                    className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
