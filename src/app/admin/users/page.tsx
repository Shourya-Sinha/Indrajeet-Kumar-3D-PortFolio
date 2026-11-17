"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, UserPlus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin/client";
import type { UserRole } from "@/lib/db/types";

interface SafeAdminUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeAdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await adminFetch<SafeAdminUser[]>("/api/admin/users");
    if (res.ok && Array.isArray(res.data)) setUsers(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await adminFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ email, name, role, password }),
    });
    if (res.ok) {
      setEmail("");
      setName("");
      setPassword("");
      setMsg("Admin account created.");
      await load();
    } else {
      setMsg(res.error || "Creation failed (super_admin required).");
    }
  };

  const toggleActive = async (u: SafeAdminUser) => {
    await adminFetch(`/api/admin/users/${u._id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    await load();
  };

  return (
    <AdminShell
      title="Admin Users & RBAC Permissions"
      subtitle="Role-based access control: super_admin (full security & RBAC), editor (CMS & resume publishing), viewer (read-only audit)."
    >
      <form onSubmit={createUser} className="glass-panel space-y-4 rounded-3xl p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <UserPlus className="h-4 w-4 text-cyan-300" />
          Provision Admin Account (super_admin only)
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          >
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
            <option value="super_admin">super_admin</option>
          </select>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#07090d] px-3.5 py-2 text-sm text-white"
          />
        </div>
        {msg && <div className="text-xs text-cyan-300">{msg}</div>}
        <button
          type="submit"
          className="rounded-full bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950"
        >
          Create Account
        </button>
      </form>

      <div className="space-y-3">
        {users.map((u) => (
          <div
            key={u._id}
            className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4"
          >
            <div>
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldAlert className="h-4 w-4 text-cyan-300" />
                {u.name}
                <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 font-mono text-[10px] text-cyan-200">
                  {u.role}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {u.email} · Last login:{" "}
                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(u)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                u.isActive
                  ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-400/35 bg-rose-400/10 text-rose-200"
              }`}
            >
              {u.isActive ? "Active" : "Suspended"}
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
