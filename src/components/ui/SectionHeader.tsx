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
        className={`mb-4 inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-300/90 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        <span className="chrome-text">{title}</span>
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const palette: Record<string, string> = {
    Production: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    Completed: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    "In Development": "border-blue-400/30 bg-blue-400/10 text-blue-300",
    Experimental: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    Research: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    Planned: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${
        palette[status] || palette.Completed
      }`}
    >
      {status}
    </span>
  );
}
