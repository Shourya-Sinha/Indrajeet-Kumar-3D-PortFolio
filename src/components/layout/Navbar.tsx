"use client";

import React, { useEffect, useRef, useState } from "react";
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

  const handleDockMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = dockRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * 5.5).toFixed(2);
    const ry = (px * 4.5).toFixed(2);
    el.style.transform = `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
  };

  const handleDockLeave = () => {
    if (dockRef.current) {
      dockRef.current.style.transform =
        "perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
  };

  return (
    <header className="perspective-1600 fixed inset-x-0 top-3 z-50 px-3 sm:px-6">
      <div
        ref={dockRef}
        onMouseMove={handleDockMove}
        onMouseLeave={handleDockLeave}
        className={`preserve-3d relative mx-auto max-w-7xl rounded-2xl border transition-all duration-300 ease-out will-change-transform ${
          scrolled
            ? "border-cyan-400/35 bg-[#080b12]/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_9px_0_-2px_rgba(7,10,18,0.96),0_10px_0_-2px_rgba(0,229,255,0.38),0_26px_64px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            : "border-white/15 bg-[#090c14]/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_7px_0_-2px_rgba(7,10,18,0.9),0_8px_0_-2px_rgba(0,229,255,0.24),0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        }`}
        style={{
          transform: "perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
        }}
      >
        {/* Top Specular Edge Glint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
        />

        <div className="preserve-3d flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          {/* Left: 3D Rotating Cube Emblem + Brand */}
          <Link href="/" className="group preserve-3d flex items-center gap-3">
            <span className="preserve-3d flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/45 bg-gradient-to-br from-cyan-400/20 to-violet-500/20 shadow-[0_4px_0_rgba(0,229,255,0.28),0_0_24px_rgba(0,229,255,0.22)] transition-transform duration-300 group-hover:[transform:translateZ(18px)_rotateX(12deg)_rotateY(-12deg)]">
              <span className="cube-3d animate-spin-prism h-3.5 w-3.5">
                <span className="cube-face" style={{ transform: "translateZ(7px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(7px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(7px)" }} />
                <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(7px)" }} />
                <span className="cube-face" style={{ transform: "rotateX(90deg) translateZ(7px)" }} />
                <span className="cube-face" style={{ transform: "rotateX(-90deg) translateZ(7px)" }} />
              </span>
            </span>
            <div className="depth-z-1">
              <div className="font-cyber text-xs font-bold tracking-[0.18em] text-white transition group-hover:text-cyan-200 sm:text-sm">
                {settings.brandName}
              </div>
              <div className="font-mono text-[10px] tracking-[0.16em] text-cyan-300/85">
                ({settings.alternateName})
              </div>
            </div>
          </Link>

          {/* Center: Raised 3D Keycap Nav Items */}
          <nav
            className="preserve-3d hidden items-center gap-1.5 lg:flex"
            aria-label="Primary Navigation"
          >
            {headerItems.map((item) => {
              const isSectionActive =
                activeHash && item.href.endsWith(activeHash);
              const pillClass = `rounded-xl border px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${
                isSectionActive
                  ? "border-cyan-400/55 bg-cyan-400/15 text-cyan-200 shadow-[0_3px_0_rgba(0,229,255,0.32),0_0_18px_rgba(0,229,255,0.22)] [transform:translateZ(12px)]"
                  : "border-white/10 bg-white/[0.03] text-slate-300 shadow-[0_3px_0_rgba(4,7,14,0.85)] hover:-translate-y-0.5 hover:border-cyan-400/45 hover:bg-cyan-400/10 hover:text-cyan-200 hover:shadow-[0_5px_0_rgba(0,229,255,0.25),0_8px_18px_rgba(0,229,255,0.16)]"
              }`;

              return item.isExternal ? (
                <a
                  key={item._id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item._id} href={item.href} className={pillClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: 3D Raised Action Capsules */}
          <div className="preserve-3d hidden items-center gap-2.5 lg:flex">
            <Link
              href="/resume"
              className="depth-z-1 inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-[0_4px_0_rgba(5,8,16,0.9)] transition hover:-translate-y-0.5 hover:border-cyan-400/50 hover:text-cyan-200 hover:shadow-[0_6px_0_rgba(0,229,255,0.28)]"
            >
              <Download className="h-3.5 w-3.5 text-cyan-300" />
              Resume {latestResumeVersion || "v1.0"}
            </Link>
            <Link
              href="/#contact"
              className="depth-z-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_4px_0_rgba(14,116,144,0.85),0_0_24px_rgba(0,229,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_0_rgba(14,116,144,0.95),0_0_32px_rgba(0,229,255,0.45)]"
            >
              Hire Me <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-xl border border-white/15 bg-white/5 p-2 text-slate-200 shadow-[0_3px_0_rgba(4,7,14,0.85)] lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Live 3D Laser Scroll Progress Chamfer */}
        <div className="pointer-events-none mx-4 mb-0.5 h-[2px] overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_12px_rgba(0,229,255,0.85)] transition-[width] duration-100"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-panel mx-auto mt-3 max-w-7xl rounded-2xl p-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {headerItems.map((item) => (
              <Link
                key={item._id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-200 hover:border-cyan-400/40 hover:text-cyan-300"
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
