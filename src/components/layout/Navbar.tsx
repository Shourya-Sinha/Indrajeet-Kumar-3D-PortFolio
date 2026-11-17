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
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setScrollPct(Math.min(Math.max((window.scrollY / max) * 100, 0), 100));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerItems = navigation.filter((n) => n.zone === "header" && n.isVisible);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-cyan-400/20 bg-[#050608]/85 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group perspective-1200 flex items-center gap-3">
          <span className="preserve-3d flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-[0_4px_0_rgba(0,229,255,0.22),0_0_24px_rgba(0,229,255,0.22)] transition-transform duration-300 group-hover:[transform:rotateX(14deg)_rotateY(-14deg)_translateZ(8px)]">
            <span className="cube-3d animate-spin-prism h-3.5 w-3.5">
              <span className="cube-face" style={{ transform: "translateZ(7px)" }} />
              <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(7px)" }} />
              <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(7px)" }} />
              <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(7px)" }} />
              <span className="cube-face" style={{ transform: "rotateX(90deg) translateZ(7px)" }} />
              <span className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(7px)" }} />
            </span>
          </span>
          <div>
            <div className="font-display text-sm font-bold tracking-[0.14em] text-white transition group-hover:text-cyan-200">
              {settings.brandName}
            </div>
            <div className="text-[10px] tracking-[0.16em] text-cyan-300/80">
              ({settings.alternateName})
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary Navigation">
          {headerItems.map((item) =>
            item.isExternal ? (
              <a
                key={item._id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-2.5 py-1 text-xs font-medium tracking-wide text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:text-cyan-300"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item._id}
                href={item.href}
                className="rounded-full px-2.5 py-1 text-xs font-medium tracking-wide text-slate-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:text-cyan-300"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/resume"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-200 shadow-[0_3px_0_rgba(15,23,42,0.75)] transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:text-cyan-200"
          >
            <Download className="h-3.5 w-3.5 text-cyan-300" />
            Resume {latestResumeVersion || "v1.0"}
          </Link>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_4px_0_rgba(14,116,144,0.7),0_0_24px_rgba(0,229,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
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

      {/* Live 3D Scroll Progress Laser Ribbon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(0,229,255,0.8)] transition-[width] duration-100"
          style={{ width: `${scrollPct}%` }}
        />
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
