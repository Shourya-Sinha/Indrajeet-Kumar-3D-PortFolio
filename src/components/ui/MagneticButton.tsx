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
      "bg-white text-slate-950 shadow-[0_14px_32px_rgba(0,0,0,0.45)] hover:bg-cyan-300",
    secondary:
      "border border-white/20 bg-white/[0.04] text-white hover:border-white/45 hover:bg-white/[0.08]",
    ghost:
      "border border-white/12 bg-transparent text-slate-300 hover:border-white/35 hover:text-white",
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
