"use client";

import React, { useRef, useState } from "react";

export function TiltCard3D({
  children,
  className = "",
  maxTilt = 11,
  depth = 18,
  spotlight = true,
  floatIdle = false,
  glowAccent = "cyan",
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  depth?: number;
  spotlight?: boolean;
  floatIdle?: boolean;
  glowAccent?: "cyan" | "violet" | "emerald";
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = outer.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    const px = relX - 0.5;
    const py = relY - 0.5;

    const rx = (-py * maxTilt * 1.45).toFixed(2);
    const ry = (px * maxTilt * 1.45).toFixed(2);

    inner.style.transform = `perspective(1250px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${depth}px) scale3d(1.015, 1.015, 1.015)`;
    inner.style.setProperty("--mx", `${(relX * 100).toFixed(1)}%`);
    inner.style.setProperty("--my", `${(relY * 100).toFixed(1)}%`);
    if (!hovered) setHovered(true);
  };

  const onLeave = () => {
    setHovered(false);
    const inner = innerRef.current;
    if (inner) {
      inner.style.transform =
        "perspective(1250px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)";
    }
  };

  const spotlightColor =
    glowAccent === "violet"
      ? "rgba(139, 92, 246, 0.2)"
      : glowAccent === "emerald"
        ? "rgba(16, 185, 129, 0.18)"
        : "rgba(0, 229, 255, 0.18)";

  return (
    <div
      ref={outerRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`perspective-1200 ${floatIdle && !hovered ? "animate-float-3d" : ""} ${className}`}
    >
      <div
        ref={innerRef}
        className="preserve-3d relative h-full w-full rounded-[inherit] transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform:
            "perspective(1250px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)",
        }}
      >
        {children}

        {spotlight && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(460px circle at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent 68%)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
