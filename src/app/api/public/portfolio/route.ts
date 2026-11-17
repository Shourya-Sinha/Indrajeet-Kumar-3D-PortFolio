import { NextResponse } from "next/server";
import { getPublicPortfolioData } from "@/lib/portfolio/public-data";

export async function GET() {
  try {
    const data = await getPublicPortfolioData();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
