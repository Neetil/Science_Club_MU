import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

declare global {
  var feedbackRateLimitStore: Map<string, { count: number; expiresAt: number }>;
}

const rateLimitStore =
  globalThis.feedbackRateLimitStore ?? new Map<string, { count: number; expiresAt: number }>();
globalThis.feedbackRateLimitStore = rateLimitStore;

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
          { error: "Too many feedback requests. Please try again later." },
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
    const stars = Number(body?.stars);
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json({ error: "Please provide a valid rating between 1 and 5." }, { status: 400 });
    }

    try {
      await sendFeedbackEmail(stars, message);
    } catch (error) {
      console.error("Feedback email failed (non-critical):", error);
    }

    return NextResponse.json({ success: true, message: "Thanks for rating your website experience!" }, { status: 200 });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
  }
}

async function sendFeedbackEmail(stars: number, message: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL ?? "science.club@medicaps.ac.in";
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping feedback email.");
    return;
  }

  const subject = "[Physics & Astronomy Club] New Website Rating";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>New Website Feedback</h2>
      <p>A user gave you <strong>${stars} star${stars > 1 ? "s" : ""}</strong> on your website.</p>
      ${
        message
          ? `<p><strong>User note:</strong></p><p style="white-space: pre-wrap;">${message}</p>`
          : "<p><em>No additional note was provided.</em></p>"
      }
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to send feedback email via Resend:", response.status, errorBody);
  }
}
