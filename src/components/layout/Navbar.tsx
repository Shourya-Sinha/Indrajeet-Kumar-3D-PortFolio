"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Download, ArrowUpRight } from "lucide-react";
import type { NavigationItemDoc, SiteSettingsDoc } from "@/lib/db/types";

export function Navbar({
  settings,
  navigation,
  latestResumeVersion,
}: {
  settings: SiteSettingsDoc;
  navigation: NavigationItemDoc[];
  latestResumeVersion?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerItems = navigation.filter((n) => n.zone === "header" && n.isVisible);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#050608]/80 py-3 backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/35 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]" />
          </span>
          <div>
            <div className="font-display text-sm font-bold tracking-[0.14em] text-white">
              {settings.brandName}
            </div>
            <div className="text-[10px] tracking-[0.18em] text-slate-400">
              {settings.alternateName}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary Navigation">
          {headerItems.map((item) =>
            item.isExternal ? (
              <a
                key={item._id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium tracking-wide text-slate-300 transition hover:text-cyan-300"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item._id}
                href={item.href}
                className="text-xs font-medium tracking-wide text-slate-300 transition hover:text-cyan-300"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" />
            Resume {latestResumeVersion || "v1.0"}
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_0_24px_rgba(0,229,255,0.28)] transition hover:brightness-110"
          >
            Hire Me <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-200 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass-panel mx-4 mt-3 rounded-2xl p-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {headerItems.map((item) => (
              <Link
                key={item._id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-cyan-300"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
              <Link
                href="/resume"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-xl border border-white/15 bg-white/5 py-2.5 text-center text-xs font-semibold text-white"
              >
                Download Resume
              </Link>
              <Link
                href="/#contact"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-xl bg-cyan-400 py-2.5 text-center text-xs font-bold text-slate-950"
              >
                Hire Me
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
