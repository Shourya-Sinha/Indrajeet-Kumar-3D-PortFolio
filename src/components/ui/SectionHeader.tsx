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
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div
        className={`mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
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
