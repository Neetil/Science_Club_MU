import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStatistics, saveStatistics } from "@/lib/data";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getStatistics();
  return NextResponse.json(stats);
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const stats = await getStatistics();
    
    const updated = await saveStatistics({
      eventsConducted: body.eventsConducted ?? stats.eventsConducted,
      activeMembers: body.activeMembers ?? stats.activeMembers,
      outreachTrips: body.outreachTrips ?? stats.outreachTrips,
      updatedAt: new Date(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update statistics" }, { status: 500 });
  }
}

