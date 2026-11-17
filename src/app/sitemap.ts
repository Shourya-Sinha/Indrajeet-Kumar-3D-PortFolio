import type { MetadataRoute } from "next";
import { ensureDatabaseSeeded } from "@/lib/db/seed";
import { findMany } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  try {
    await ensureDatabaseSeeded();
    const projects = await findMany("projects", { status: "published", includeInPortfolio: true });
    for (const project of projects) {
      routes.push({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: new Date(project.updatedAt || Date.now()),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // base routes preserved
  }

  return routes;
}
