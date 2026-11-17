"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const json = (await resp.json()) as { ok?: boolean; error?: string };
      if (!resp.ok || !json.ok) {
        setError(json.error || "Sign in failed.");
      } else {
        router.replace("/admin");
      }
    } catch {
      setError("Network error during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ambient-grid px-4 py-12">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-cyan-400/25 p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Public Portfolio
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/35 bg-cyan-400/10 text-cyan-300">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Admin CMS Sign In</h1>
            <p className="text-xs text-slate-400">Indrajeet Kumar (Shourya Sinha) Portfolio & ATS Resume Control</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Krindrajeet.c@gmail.com"
              className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
              className="w-full rounded-xl border border-white/15 bg-[#07090d] px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-400/35 bg-rose-400/10 px-3.5 py-2.5 text-xs text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-xs font-bold text-slate-950 hover:brightness-110 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Access Admin Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
