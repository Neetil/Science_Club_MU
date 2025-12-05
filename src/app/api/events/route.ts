import { NextResponse } from "next/server";
import { getEvents } from "@/lib/data";

export async function GET() {
  try {
    const events = await getEvents();
    // Only return published events for public API
    const publishedEvents = events.filter((event) => event.published);
    return NextResponse.json(publishedEvents, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}



