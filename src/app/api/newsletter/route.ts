import { NextRequest, NextResponse } from "next/server";
import { createSubscriber } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    try {
      await createSubscriber({ email: trimmedEmail });
    } catch (error) {
      const prismaError = error as { code?: string };
      // Unique constraint violation (already subscribed)
      if (prismaError.code === "P2002") {
        return NextResponse.json(
          { error: "This email is already subscribed to updates." },
          { status: 400 },
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: "You have been subscribed to event updates.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}


