"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const AmbientSpaceCanvas = dynamic(
  () => import("@/components/three/AmbientSpaceCanvas").then((m) => m.AmbientSpaceCanvas),
  { ssr: false }
);

export function PublicShell({
  children,
  themeConfig,
}: {
  children: React.ReactNode;
  themeConfig?: {
    voidColor?: string;
    graphiteColor?: string;
    cyanAccent?: string;
    blueAccent?: string;
    violetAccent?: string;
    glowIntensity?: number;
    enableReducedMotionByDefault?: boolean;
  };
}) {
  useEffect(() => {
    if (themeConfig) {
      const root = document.documentElement;
      if (themeConfig.voidColor) root.style.setProperty("--bg-void", themeConfig.voidColor);
      if (themeConfig.graphiteColor) root.style.setProperty("--bg-graphite", themeConfig.graphiteColor);
      if (themeConfig.cyanAccent) root.style.setProperty("--accent-cyan", themeConfig.cyanAccent);
      if (themeConfig.blueAccent) root.style.setProperty("--accent-blue", themeConfig.blueAccent);
      if (themeConfig.violetAccent) root.style.setProperty("--accent-violet", themeConfig.violetAccent);
    }

    const reduced =
      themeConfig?.enableReducedMotionByDefault ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [themeConfig]);

  return (
    <div className="relative min-h-screen bg-ambient-grid">
      <AmbientSpaceCanvas />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
