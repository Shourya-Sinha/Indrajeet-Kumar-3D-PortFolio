"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin/client";
import type { AuditLogDoc } from "@/lib/db/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDoc[]>([]);

  useEffect(() => {
    (async () => {
      const res = await adminFetch<AuditLogDoc[]>("/api/admin/audit-logs");
      if (res.ok && Array.isArray(res.data)) setLogs(res.data);
    })();
  }, []);

  return (
    <AdminShell
      title="Security & CMS Audit Trail"
      subtitle="Chronological log of authentication events, CMS mutations, media uploads, and resume version publications/rollbacks."
    >
      <div className="space-y-2.5">
        {logs.map((log) => (
          <div key={log._id} className="glass-panel rounded-2xl px-5 py-3.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-cyan-400/15 px-2 py-0.5 font-mono font-bold text-cyan-300">
                  {log.action}
                </span>
                <span className="font-mono text-slate-400">{log.collectionName}</span>
                <span className="text-slate-300">by {log.actorEmail}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {new Date(log.createdAt).toLocaleString()} · {log.ipAddress}
              </span>
            </div>
            <div className="mt-1.5 text-slate-200">{log.summary}</div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
