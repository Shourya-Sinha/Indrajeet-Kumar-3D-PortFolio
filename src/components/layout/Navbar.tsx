"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, Download, ArrowUpRight } from "lucide-react";
import type { NavigationItemDoc, SiteSettingsDoc } from "@/lib/db/types";
import { FontStyleSwitcher } from "@/components/ui/FontStyleSwitcher";

export function Navbar({
  settings,
  navigation,
  latestResumeVersion,
}: {
  settings: SiteSettingsDoc;
  navigation: NavigationItemDoc[];
  latestResumeVersion?: string;
}) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [activeHash, setActiveHash] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerItems = navigation.filter((n) => n.zone === "header" && n.isVisible);

  useEffect(() => {
    const sectionIds = headerItems
      .map((item) => {
        const idx = item.href.indexOf("#");
        return idx >= 0 ? item.href.slice(idx + 1) : "";
      })
      .filter(Boolean);

    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      setScrollPct(Math.min(Math.max((window.scrollY / max) * 100, 0), 100));

      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 180) {
          current = `#${id}`;
        }
      }
      setActiveHash(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headerItems]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:px-6">
      <div
        ref={dockRef}
        className={`relative mx-auto max-w-7xl rounded-2xl border transition-all duration-300 ${
          scrolled
            ? "border-white/15 bg-[#06080d]/88 shadow-[0_20px_50px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
            : "border-white/10 bg-[#06080d]/65 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-5 xl:gap-4">
          {/* Left: Subtle 3D Cube Mark + Brand */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="preserve-3d flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] transition-transform duration-300 group-hover:scale-105">
              <span className="cube-3d animate-spin-prism h-3 w-3">
                <span className="cube-face" style={{ transform: "translateZ(6px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(6px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(6px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(6px)" }} />
                <span className="cube-face" style={{ transform: "rotateX(90deg) translateZ(6px)" }} />
                <span className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(6px)" }} />
              </span>
            </span>
            <div className="whitespace-nowrap">
              <div className="font-cyber text-xs font-bold tracking-[0.14em] text-white transition group-hover:text-cyan-200 xl:text-sm xl:tracking-[0.18em]">
                {settings.brandName}
              </div>
              <div className="font-mono text-[10px] tracking-[0.14em] text-slate-400">
                ({settings.alternateName})
              </div>
            </div>
          </Link>

          {/* Center: Clean Editorial Nav Links */}
          <nav
            className="hidden items-center gap-1 lg:flex xl:gap-1.5"
            aria-label="Primary Navigation"
          >
            {headerItems.map((item) => {
              const isSectionActive =
                activeHash && item.href.endsWith(activeHash);
              const linkClass = `whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-medium tracking-wide transition-colors duration-200 xl:px-2.5 xl:text-xs ${
                isSectionActive
                  ? "bg-white/[0.08] text-cyan-300"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`;

              return item.isExternal ? (
                <a
                  key={item._id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item._id} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Font Style Switcher + Clean Action Pills */}
          <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex">
            <FontStyleSwitcher />
            <Link
              href="/resume"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-2 text-[11px] font-medium text-slate-200 transition hover:border-white/30 hover:text-white xl:px-3 xl:text-xs"
            >
              <Download className="h-3.5 w-3.5 text-cyan-300" />
              <span>Resume {latestResumeVersion || "v1.0"}</span>
            </Link>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-slate-950 transition hover:bg-cyan-300 xl:px-3.5 xl:text-xs"
            >
              Hire Me <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-white/15 bg-white/5 p-2 text-slate-200 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Hairline 1px Scroll Progress */}
        <div className="pointer-events-none mx-4 h-px overflow-hidden bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-white/70 via-cyan-300 to-cyan-400 transition-[width] duration-100"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-panel mx-auto mt-2 max-w-7xl rounded-2xl p-4 lg:hidden">
          <div className="flex flex-col gap-1.5">
            {headerItems.map((item) => (
              <Link
                key={item._id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 space-y-2 border-t border-white/10 pt-3">
              <FontStyleSwitcher compact />
              <div className="flex gap-2">
                <Link
                  href="/resume"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-white/15 bg-white/5 py-2.5 text-center text-xs font-semibold text-white"
                >
                  Download Resume
                </Link>
                <Link
                  href="/#contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-white py-2.5 text-center text-xs font-bold text-slate-950"
                >
                  Hire Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
