import type { Metadata } from "next";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@fontsource/orbitron/500.css";
import "@fontsource/orbitron/600.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findOne } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    await ensureDatabaseSeeded();
    const [seo, settings] = await Promise.all([
      findOne("seoMetadata", { routeKey: "/" }),
      findOne("siteSettings", { settingsKey: "primary" }),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const title =
      seo?.title ||
      "Indrajeet Kumar (Shourya Sinha) — Full Stack Developer, Mobile Engineer & Cybersecurity Researcher";
    const description =
      seo?.description ||
      "Immersive 3D developer portfolio, freelance IT solutions platform, and cybersecurity research showcase for Indrajeet Kumar (Shourya Sinha).";

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords: seo?.keywords || [
        "Indrajeet Kumar",
        "Shourya Sinha",
        "Full Stack Developer",
        "React Native Engineer",
        "Cybersecurity",
      ],
      icons: {
        icon: "/favicon.svg",
      },
      alternates: {
        canonical: seo?.canonicalUrl || siteUrl,
      },
      openGraph: {
        title: seo?.ogTitle || title,
        description: seo?.ogDescription || description,
        type: "website",
        siteName: settings?.brandName || "INDRAJEET KUMAR",
        images: [
          {
            url: seo?.ogImageUrl || "/assets/visuals/hero-environment.webp",
            width: 1280,
            height: 720,
            alt: "Indrajeet Kumar (Shourya Sinha) 3D Portfolio Environment",
          },
        ],
      },
      twitter: {
        card: seo?.twitterCard || "summary_large_image",
        title: seo?.ogTitle || title,
        description: seo?.ogDescription || description,
        images: [seo?.ogImageUrl || "/assets/visuals/hero-environment.webp"],
      },
      robots: seo?.noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true },
    };
  } catch {
    return {
      title: "Indrajeet Kumar (Shourya Sinha) — 3D Developer Portfolio & IT Solutions",
      description:
        "Full Stack Developer, Mobile App Engineer, AI & Cybersecurity Enthusiast.",
      icons: { icon: "/favicon.svg" },
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    await ensureDatabaseSeeded();
    settings = await findOne("siteSettings", { settingsKey: "primary" });
  } catch {
    settings = null;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Indrajeet Kumar",
    alternateName: "Shourya Sinha",
    jobTitle: "Full Stack Developer, Mobile App Engineer & Cybersecurity Researcher",
    url: siteUrl,
    email: settings?.contactEmail || "Krindrajeet.c@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Patna",
      addressRegion: "Bihar",
      addressCountry: "IN",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Amrita Vishwa Vidyapeetham" },
      { "@type": "CollegeOrUniversity", name: "Sunrise University, Rajasthan" },
    ],
    sameAs: [
      settings?.githubUrl || "https://github.com/Shourya-Sinha",
      settings?.linkedinUrl || "https://linkedin.com/in/indrajeetsinha1",
    ],
  };

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Indrajeet Kumar (Shourya Sinha) — Digital Engineering & IT Solutions",
    url: siteUrl,
    areaServed: "Global",
    serviceType: [
      "Full-Stack Web Development",
      "React Native & Expo Mobile Development",
      "Python & Local LLM Integration",
      "Authorized Application Security & Hardening",
      "Cloud Hosting & DevOps",
    ],
  };

  return (
    <html lang="en" className="dark">
      <body className="bg-void text-slate-100 antialiased selection:bg-cyan-400/30 selection:text-cyan-100">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, serviceJsonLd]),
          }}
        />
        {children}
      </body>
    </html>
  );
}
