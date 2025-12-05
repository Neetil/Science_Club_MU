import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, createSession } from "@/lib/auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 attempts per 5 minutes
    const identifier = getClientIdentifier(request);
    const rateLimit = checkRateLimit(identifier, 3, 5 * 60 * 1000);

    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(resetSeconds / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": resetSeconds.toString(),
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Invalid credentials",
          remainingAttempts: rateLimit.remaining - 1,
        },
        {
          status: 401,
          headers: {
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": (rateLimit.remaining - 1).toString(),
          },
        }
      );
    }

    // Reset rate limit on successful login
    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

