"use client";

import React, { useRef } from "react";
import Link from "next/link";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  download?: boolean;
  target?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  download,
  target,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const dx = px * 16;
    const dy = py * 12;
    const rx = (-py * 16).toFixed(2);
    const ry = (px * 18).toFixed(2);
    el.style.transform = `perspective(700px) translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 12px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform =
        "perspective(700px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)";
    }
  };

  const baseStyles =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 will-change-transform select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-[0_6px_0_rgba(14,116,144,0.65),0_12px_32px_rgba(0,229,255,0.34)] hover:shadow-[0_8px_0_rgba(14,116,144,0.8),0_16px_44px_rgba(0,229,255,0.52)]",
    secondary:
      "glass-panel text-slate-100 hover:border-cyan-400/50 hover:text-cyan-200",
    ghost:
      "border border-white/15 bg-white/[0.04] text-slate-200 shadow-[0_4px_0_rgba(15,23,42,0.7)] hover:bg-white/[0.09] hover:border-cyan-400/40",
  };

  const merged = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    if (download || target === "_blank" || href.startsWith("/api/")) {
      return (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          download={download}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className={merged}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={merged}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={merged}
    >
      {children}
    </button>
  );
}
