import { NextResponse } from "next/server";
import { getStatistics } from "@/lib/data";

export async function GET() {
  try {
    const stats = await getStatistics();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}



