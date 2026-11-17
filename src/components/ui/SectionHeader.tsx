import React from "react";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      data-3d-header
      className={`preserve-3d ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}
    >
      <div
        className={`mb-3 inline-flex items-center gap-2.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 shadow-[0_8px_24px_rgba(0,229,255,0.16)] backdrop-blur-md ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        <span className="cube-3d animate-spin-prism inline-block h-2.5 w-2.5">
          <span className="cube-face" style={{ transform: "translateZ(5px)" }} />
          <span className="cube-face" style={{ transform: "rotateY(180deg) translateZ(5px)" }} />
          <span className="cube-face" style={{ transform: "rotateY(90deg) translateZ(5px)" }} />
          <span className="cube-face" style={{ transform: "rotateY(-90deg) translateZ(5px)" }} />
        </span>
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        <span className="chrome-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-300/85 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    Production: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
    Completed: "border-cyan-400/35 bg-cyan-400/10 text-cyan-300",
    "In Development": "border-blue-400/35 bg-blue-400/10 text-blue-300",
    Experimental: "border-amber-400/35 bg-amber-400/10 text-amber-300",
    Research: "border-violet-400/35 bg-violet-400/10 text-violet-300",
    Planned: "border-slate-400/35 bg-slate-400/10 text-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${
        palette[status] || palette.Completed
      }`}
    >
      {status}
    </span>
  );
}
