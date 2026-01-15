import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/data";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

declare global {
  var eventRegistrationRateLimitStore: Map<string, { count: number; expiresAt: number }>;
}

const rateLimitStore =
  globalThis.eventRegistrationRateLimitStore ?? new Map<string, { count: number; expiresAt: number }>();
globalThis.eventRegistrationRateLimitStore = rateLimitStore;

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      "unknown";

    const now = Date.now();
    const rateEntry = rateLimitStore.get(ip);

    if (rateEntry && rateEntry.expiresAt > now) {
      if (rateEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return NextResponse.json(
          {
            error: "Too many requests. Please wait a few minutes before trying again.",
          },
          { status: 429 },
        );
      }
      rateEntry.count += 1;
      rateLimitStore.set(ip, rateEntry);
    } else {
      rateLimitStore.set(ip, {
        count: 1,
        expiresAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    const body = await request.json();
    const { eventId, name, email, phone, studentId, year, transactionId, additionalNotes } = body;

    if (!eventId || !name || !email) {
      return NextResponse.json(
        { error: "Event ID, name, and email are required." },
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

    // Check if user already registered for this event (by email)
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        email,
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this event." },
        { status: 400 },
      );
    }

    // Create registration
    await prisma.eventRegistration.create({
      data: {
        eventId,
        name,
        email,
        phone: phone || null,
        studentId: studentId || null,
        year: year || null,
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

