import React from "react";
import { getPublicPortfolioData } from "@/lib/portfolio/public-data";
import { PortfolioPageClient } from "@/components/sections/PortfolioPageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPublicPortfolioData();
  return <PortfolioPageClient data={data} />;
}
