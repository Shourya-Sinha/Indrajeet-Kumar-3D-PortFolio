"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Award,
  Briefcase,
  Compass,
  FileCheck2,
  FolderKanban,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Palette,
  PanelBottom,
  Settings,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/client";

const NAV_ITEMS = [
  { href: "/admin", label: "1. Dashboard", icon: LayoutDashboard },
  { href: "/admin/resume-management", label: "ATS Resume Center", icon: FileCheck2, highlight: true },
  { href: "/admin/hero", label: "2. Hero Editor", icon: Sparkles },
  { href: "/admin/about", label: "3. About Editor", icon: UserCheck },
  { href: "/admin/experience", label: "4. Experience", icon: Briefcase },
  { href: "/admin/services", label: "5. Pinned Services", icon: Layers },
  { href: "/admin/projects", label: "6. Projects", icon: FolderKanban },
  { href: "/admin/certifications", label: "7. Certifications", icon: Award },
  { href: "/admin/education", label: "8. Education", icon: GraduationCap },
  { href: "/admin/skills", label: "9. Skills Matrix", icon: Wrench },
  { href: "/admin/freelance", label: "10. Freelance Tiers", icon: Shield },
  { href: "/admin/media", label: "11. Media Library", icon: ImageIcon },
  { href: "/admin/contact", label: "12. Contact & Profile", icon: Mail },
  { href: "/admin/inquiries", label: "13. Inquiries", icon: MessageSquare },
  { href: "/admin/seo", label: "14. SEO Metadata", icon: Globe },
  { href: "/admin/navigation", label: "15. Navigation", icon: Compass },
  { href: "/admin/theme", label: "16. Theme & 3D", icon: Palette },
  { href: "/admin/footer", label: "17. Footer Editor", icon: PanelBottom },
  { href: "/admin/settings", label: "18. Site Settings", icon: Settings },
  { href: "/admin/users", label: "19. User RBAC", icon: Users },
  { href: "/admin/audit-logs", label: "20. Audit Logs", icon: Activity },
];

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await fetch("/api/admin/auth/me", { credentials: "same-origin" });
      if (!mounted) return;
      if (!res.ok) {
        router.replace("/admin/login");
        return;
      }
      const json = (await res.json()) as {
        user?: { email: string; name: string; role: string };
      };
      setUser(json.user || null);
      setChecking(false);
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await adminFetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void text-sm text-slate-400">
        Verifying administrator session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-[#090b10] lg:flex">
        <div className="border-b border-white/10 p-5">
          <Link href="/" className="font-display text-sm font-bold tracking-[0.14em] text-white">
            INDRAJEET KUMAR CMS
          </Link>
          <div className="mt-1 text-[11px] text-cyan-300">Portfolio + ATS Resume Control</div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "border border-cyan-400/40 bg-cyan-400/15 text-white"
                    : item.highlight
                      ? "border border-violet-400/25 bg-violet-500/10 text-violet-200 hover:border-cyan-400/40"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
            <div className="truncate font-semibold text-white">{user?.name}</div>
            <div className="truncate text-[11px] text-slate-400">
              {user?.email} · {user?.role}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2 text-center text-xs font-semibold text-slate-200 hover:border-cyan-400/40"
            >
              View Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#090b10] px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-bold text-white">INDRAJEET KUMAR CMS</span>
        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-200"
        >
          {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {drawerOpen && (
        <div className="border-b border-white/10 bg-[#090b10] p-3 lg:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  pathname === item.href
                    ? "bg-cyan-400/15 text-cyan-200"
                    : "bg-white/[0.03] text-slate-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            </div>
            <Link
              href="/admin/resume-management"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20"
            >
              <FileCheck2 className="h-4 w-4" />
              ATS Resume Center
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
