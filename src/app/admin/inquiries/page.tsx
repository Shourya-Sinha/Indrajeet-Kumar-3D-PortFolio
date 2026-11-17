"use client";

import React, { useEffect, useState } from "react";
import { Mail, MessageSquare, Phone, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin/client";
import type { ContactInquiryDoc } from "@/lib/db/types";

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<ContactInquiryDoc[]>([]);
  const [filter, setFilter] = useState("all");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});

  const load = async () => {
    const res = await adminFetch<ContactInquiryDoc[]>("/api/admin/content/contactInquiries");
    if (res.ok && Array.isArray(res.data)) {
      setItems(res.data);
      const map: Record<string, string> = {};
      for (const item of res.data) map[item._id] = item.adminNotes || "";
      setNotesDraft(map);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateInquiry = async (id: string, patch: Partial<ContactInquiryDoc>) => {
    await adminFetch(`/api/admin/content/contactInquiries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    await load();
  };

  const removeInquiry = async (id: string) => {
    if (!confirm("Delete this inquiry permanently?")) return;
    await adminFetch(`/api/admin/content/contactInquiries/${id}`, { method: "DELETE" });
    await load();
  };

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);

  return (
    <AdminShell
      title="Client Inquiry Manager"
      subtitle="Review freelance inquiries, update workflow statuses, record internal notes, and verify automated notification delivery."
    >
      <div className="flex flex-wrap gap-2">
        {["all", "new", "reviewed", "replied", "archived"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase ${
              filter === st
                ? "border-cyan-400 bg-cyan-400/15 text-cyan-200"
                : "border-white/15 bg-white/5 text-slate-300"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center text-sm text-slate-400">
          No inquiries in this status view.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((inq) => (
            <div key={inq._id} className="glass-panel space-y-3 rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-cyan-300" />
                    <span className="font-display text-base font-bold text-white">
                      {inq.fullName}
                    </span>
                    <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-cyan-200">
                      {inq.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {inq.email}
                    </span>
                    {inq.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {inq.phone}
                      </span>
                    )}
                    <span>Track: {inq.serviceCategory}</span>
                    {inq.budget && <span>Budget: {inq.budget}</span>}
                    <span>Preferred: {inq.preferredContactMethod}</span>
                    <span>Email Status: {inq.emailDeliveryStatus}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={inq.status}
                    onChange={(e) =>
                      updateInquiry(inq._id, {
                        status: e.target.value as ContactInquiryDoc["status"],
                      })
                    }
                    className="rounded-xl border border-white/15 bg-[#07090d] px-3 py-1.5 text-xs text-white"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeInquiry(inq._id)}
                    className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-sm text-slate-200">
                {inq.description}
              </div>

              <div className="flex gap-2">
                <input
                  value={notesDraft[inq._id] ?? ""}
                  onChange={(e) =>
                    setNotesDraft((prev) => ({ ...prev, [inq._id]: e.target.value }))
                  }
                  placeholder="Add internal review notes..."
                  className="flex-1 rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateInquiry(inq._id, { adminNotes: notesDraft[inq._id] || "" })
                  }
                  className="rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200"
                >
                  Save Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
