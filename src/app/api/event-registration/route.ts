import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      "unknown";

    const body = await request.json();
    const { eventId, name, email, phone, studentId, year, transactionId, additionalNotes } = body;

    // Validate all required fields
    if (!eventId || !name || !email || !phone || !studentId || !year) {
      return NextResponse.json(
        { error: "Event ID, name, email, phone, student ID, and year are required." },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    // Check if event exists and is upcoming
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 },
      );
    }

    if (event.eventType !== "upcoming") {
      return NextResponse.json(
        { error: "Registration is only available for upcoming events." },
        { status: 400 },
      );
    }

    // For paid events, transaction ID is required
    if (event.isPaid && !transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required for paid events." },
        { status: 400 },
      );
    }

    // Create registration (unlimited registrations allowed)
    await prisma.eventRegistration.create({
      data: {
        eventId,
        name,
        email,
        phone,
        studentId,
        year,
        transactionId: transactionId || null,
        additionalNotes: additionalNotes || null,
        ip,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! We'll see you at the event.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}

