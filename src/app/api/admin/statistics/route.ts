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
    
    const updated = {
      ...stats,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await saveStatistics(updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update statistics" }, { status: 500 });
  }
}

