import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSubscribers } from "@/lib/data";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, message, subscriberIds } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Get SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      return NextResponse.json(
        {
          error:
            "Email configuration is missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and optionally SMTP_PORT and SMTP_FROM environment variables.",
        },
        { status: 500 }
      );
    }

    // Get subscribers
    const allSubscribers = await getSubscribers();
    let subscribersToEmail = allSubscribers;

    // If specific subscriber IDs are provided, filter to only those
    if (subscriberIds && Array.isArray(subscriberIds) && subscriberIds.length > 0) {
      subscribersToEmail = allSubscribers.filter((s) => subscriberIds.includes(s.id));
    }

    if (subscribersToEmail.length === 0) {
      return NextResponse.json(
        { error: "No subscribers selected" },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send emails
    const emailPromises = subscribersToEmail.map((subscriber) => {
      return transporter.sendMail({
        from: smtpFrom,
        to: subscriber.email,
        subject: subject,
        text: message,
        html: message.replace(/\n/g, "<br>"),
      });
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${subscribersToEmail.length} subscriber(s)`,
      sentCount: subscribersToEmail.length,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      {
        error: "Failed to send emails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

