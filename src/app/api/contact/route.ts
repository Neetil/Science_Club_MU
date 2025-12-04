import { promises as fs } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const SUBMISSIONS_FILE = join(process.cwd(), "data", "contact-submissions.json");

declare global {
  var contactRateLimitStore: Map<string, { count: number; expiresAt: number }>;
}

const rateLimitStore =
  globalThis.contactRateLimitStore ?? new Map<string, { count: number; expiresAt: number }>();
globalThis.contactRateLimitStore = rateLimitStore;

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
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    // Try to save submission (non-blocking - file system is read-only on Vercel)
    saveSubmission({
      id: Date.now().toString(),
      name,
      email,
      subject,
      message,
      ip,
      read: false,
      createdAt: new Date().toISOString(),
    }).catch((error) => {
      // File saving fails on Vercel (read-only file system) - that's okay
      console.warn("Failed to save submission to file (non-critical):", error.code);
    });

    // Send email notification and wait for it to complete so serverless
    // doesn't shut down before the request to Resend finishes.
    try {
      await sendNotificationEmail({
        name,
        email,
        subject,
        message,
      });
    } catch (error) {
      // Log the error but still return success to the user
      console.error("Email notification failed (non-critical):", error);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}

type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
  read: boolean;
  createdAt: string;
};

async function saveSubmission(submission: Submission) {
  // Skip file saving on Vercel (read-only file system)
  // This function only works in local development
  const fileDir = join(process.cwd(), "data");
  
  try {
    await fs.mkdir(fileDir, { recursive: true });
  } catch (error) {
    // If we can't create directory (e.g., on Vercel), skip file saving
    if ((error as NodeJS.ErrnoException).code === "EROFS") {
      return;
    }
    throw error;
  }

  try {
    const contents = await fs.readFile(SUBMISSIONS_FILE, "utf8");
    const parsed = JSON.parse(contents) as Submission[];
    parsed.push(submission);
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(parsed, null, 2), "utf8");
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      // File doesn't exist, create it
      try {
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify([submission], null, 2), "utf8");
      } catch (writeError) {
        // If write fails (e.g., read-only file system on Vercel), just return
        if ((writeError as NodeJS.ErrnoException).code === "EROFS") {
          return;
        }
        throw writeError;
      }
      return;
    }
    // If it's a read-only file system error (Vercel), just return silently
    if (err.code === "EROFS") {
      return;
    }
    throw error;
  }
}

async function sendNotificationEmail({
  name,
  email,
  subject,
  message,
}: Omit<Submission, "id" | "ip" | "read" | "createdAt">) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL ?? "science.club@medicaps.ac.in";
  // Resend requires verified domain - use onboarding@resend.dev for testing or your verified domain
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Skipping email notification.");
    return;
  }

  const emailBody = `
    <div style="font-family: Arial, sans-serif; color: #0f172a;">
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${message}</p>
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
      reply_to: email,
      subject: `[Physics & Astronomy Club] ${subject}`,
      html: emailBody,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to send email via Resend:", response.status, errorBody);
    // Don't throw - just log the error since email is non-critical
    return;
  }

  const result = await response.json();
  console.log("Email sent successfully:", result);
}

