import { NextResponse } from "next/server";
import { getUpdates } from "@/lib/data";

export async function GET() {
  try {
    const updates = await getUpdates();
    // Only return published updates (default to true if null/undefined), sorted by date (newest first)
    const publishedUpdates = updates
      .filter((update) => update.published !== false) // Include if published is true or null/undefined
      .sort((a, b) => {
        // Parse dates (assuming format DD/MM/YY)
        const dateA = parseDate(a.date);
        const dateB = parseDate(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    return NextResponse.json(publishedUpdates, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching updates:", error);
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
  }
}

function parseDate(dateStr: string): Date {
  // Try to parse DD/MM/YY format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = 2000 + parseInt(parts[2], 10); // Assuming YY means 20YY
    return new Date(year, month, day);
  }
  // Fallback to current date if parsing fails
  return new Date();
}



