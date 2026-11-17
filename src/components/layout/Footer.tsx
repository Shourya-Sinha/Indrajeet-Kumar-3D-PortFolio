import React from "react";
import Link from "next/link";
import type { NavigationItemDoc, SiteSettingsDoc } from "@/lib/db/types";

export function Footer({
  settings,
  navigation,
}: {
  settings: SiteSettingsDoc;
  navigation: NavigationItemDoc[];
}) {
  const footerLinks = navigation.filter((n) => n.zone === "footer" && n.isVisible);

  return (
    <footer className="relative border-t border-white/10 bg-[#040507] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <div className="font-display text-lg font-bold tracking-[0.14em] text-white">
              {settings.brandName}{" "}
              <span className="text-sm font-normal text-slate-400">
                ({settings.alternateName})
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm text-slate-400">{settings.tagline}</p>
            <p className="mt-3 text-xs font-medium text-cyan-300/90">
              {settings.footerCredit}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {footerLinks.map((item) =>
              item.isExternal ? (
                <a
                  key={item._id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-slate-300 transition hover:text-cyan-300"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item._id}
                  href={item.href}
                  className="text-xs font-medium text-slate-300 transition hover:text-cyan-300"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <span>
            {settings.location} · {settings.contactEmail}
          </span>
          <span>© {new Date().getFullYear()} Shourya Sinha (Kumar Indrajeet). All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
