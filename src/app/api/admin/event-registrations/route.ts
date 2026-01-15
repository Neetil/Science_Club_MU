import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  deleteEventRegistration,
  getEventRegistrations,
} from "@/lib/data";

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const registrations = await getEventRegistrations(eventId || undefined);
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Registration ID required" }, { status: 400 });
    }

    await deleteEventRegistration(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}

