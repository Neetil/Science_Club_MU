import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/data";
import type { Event, GalleryImage, TeamMember, Update, ContactSubmission, Statistics } from "@prisma/client";

// Increase body size limit for large backup files (up to 50MB)
export const maxDuration = 300; // 5 minutes for large imports
export const runtime = 'nodejs';

/**
 * Export all database data as JSON backup
 */
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all data from all tables
    const [events, galleryImages, teamMembers, updates, statistics, contactSubmissions] = await Promise.all([
      prisma.event.findMany(),
      prisma.galleryImage.findMany(),
      prisma.teamMember.findMany(),
      prisma.update.findMany(),
      prisma.statistics.findUnique({ where: { id: 1 } }),
      prisma.contactSubmission.findMany(),
    ]);

    const backup = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: {
        events,
        galleryImages,
        teamMembers,
        updates,
        statistics: statistics || null,
        contactSubmissions,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: "Failed to export backup" },
      { status: 500 }
    );
  }
}

/**
 * Import/restore data from JSON backup
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body. The backup file may be too large or corrupted." },
        { status: 400 }
      );
    }
    
    const { data, confirmOverwrite } = body;

    if (!data) {
      return NextResponse.json(
        { error: "Backup data is required" },
        { status: 400 }
      );
    }

    if (!confirmOverwrite) {
      return NextResponse.json(
        { error: "Please confirm overwrite by setting confirmOverwrite to true" },
        { status: 400 }
      );
    }

    // Start transaction-like operations
    // Note: Prisma doesn't support transactions across multiple models in serverless
    // So we'll do sequential operations with error handling

    const results = {
      events: 0,
      galleryImages: 0,
      teamMembers: 0,
      updates: 0,
      statistics: false,
      contactSubmissions: 0,
    };

    // Restore Events
    if (data.events && Array.isArray(data.events)) {
      // Delete existing events
      await prisma.event.deleteMany();
      // Create new events
      if (data.events.length > 0) {
        await prisma.event.createMany({
          data: data.events.map((e: Event) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            category: e.category,
            eventType: e.eventType,
            image: e.image,
            published: e.published ?? true,
            createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
            updatedAt: e.updatedAt ? new Date(e.updatedAt) : new Date(),
          })),
        });
        results.events = data.events.length;
      }
    }

    // Restore Gallery Images
    if (data.galleryImages && Array.isArray(data.galleryImages)) {
      await prisma.galleryImage.deleteMany();
      if (data.galleryImages.length > 0) {
        await prisma.galleryImage.createMany({
          data: data.galleryImages.map((img: GalleryImage) => ({
            id: img.id,
            src: img.src,
            thumbnail: img.thumbnail || null,
            medium: img.medium || null,
            category: img.category,
            title: img.title,
            description: img.description || null,
            createdAt: img.createdAt ? new Date(img.createdAt) : new Date(),
          })),
        });
        results.galleryImages = data.galleryImages.length;
      }
    }

    // Restore Team Members
    if (data.teamMembers && Array.isArray(data.teamMembers)) {
      await prisma.teamMember.deleteMany();
      if (data.teamMembers.length > 0) {
        await prisma.teamMember.createMany({
          data: data.teamMembers.map((member: TeamMember) => ({
            id: member.id,
            name: member.name,
            role: member.role,
            focus: member.focus,
            category: member.category,
            image: member.image || null,
            order: member.order,
          })),
        });
        results.teamMembers = data.teamMembers.length;
      }
    }

    // Restore Updates
    if (data.updates && Array.isArray(data.updates)) {
      await prisma.update.deleteMany();
      if (data.updates.length > 0) {
        await prisma.update.createMany({
          data: data.updates.map((update: Update) => ({
            id: update.id,
            date: update.date,
            title: update.title,
            shortDescription: update.shortDescription,
            fullDescription: update.fullDescription,
            published: update.published ?? true,
            createdAt: update.createdAt ? new Date(update.createdAt) : new Date(),
            updatedAt: update.updatedAt ? new Date(update.updatedAt) : new Date(),
          })),
        });
        results.updates = data.updates.length;
      }
    }

    // Restore Statistics
    if (data.statistics) {
      await prisma.statistics.upsert({
        where: { id: 1 },
        update: {
          eventsConducted: data.statistics.eventsConducted || 0,
          activeMembers: data.statistics.activeMembers || 0,
          outreachTrips: data.statistics.outreachTrips || 0,
          updatedAt: new Date(),
        },
        create: {
          id: 1,
          eventsConducted: data.statistics.eventsConducted || 0,
          activeMembers: data.statistics.activeMembers || 0,
          outreachTrips: data.statistics.outreachTrips || 0,
          updatedAt: new Date(),
        },
      });
      results.statistics = true;
    }

    // Restore Contact Submissions (optional - usually you might not want to restore these)
    if (data.contactSubmissions && Array.isArray(data.contactSubmissions)) {
      await prisma.contactSubmission.deleteMany();
      if (data.contactSubmissions.length > 0) {
        await prisma.contactSubmission.createMany({
          data: data.contactSubmissions.map((sub: ContactSubmission) => ({
            id: sub.id,
            name: sub.name,
            email: sub.email,
            subject: sub.subject,
            message: sub.message,
            ip: sub.ip,
            read: sub.read ?? false,
            createdAt: sub.createdAt ? new Date(sub.createdAt) : new Date(),
          })),
        });
        results.contactSubmissions = data.contactSubmissions.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      results,
    });
  } catch (error) {
    console.error("Backup restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore backup. Please check the backup file format." },
      { status: 500 }
    );
  }
}


