import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/data";
import { uploadImageSizesToBlob } from "@/lib/blob-utils";

/**
 * Migration endpoint to move existing base64 images to Vercel Blob Storage
 * This should be run once to migrate all existing images
 */
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all gallery images that don't have URLs yet
    const images = await prisma.galleryImage.findMany({
      where: {
        OR: [
          { srcUrl: null },
          { srcUrl: "" },
        ],
      },
    });

    if (images.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No images to migrate. All images already have URLs.",
        migrated: 0,
      });
    }

    const results = {
      total: images.length,
      migrated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Migrate each image
    for (const image of images) {
      try {
        // Skip if image doesn't start with data: (not base64)
        if (!image.src.startsWith("data:")) {
          console.log(`Skipping image ${image.id}: not a base64 image`);
          continue;
        }

        // Upload to blob storage
        const urls = await uploadImageSizesToBlob(
          {
            full: image.src,
            thumbnail: image.thumbnail || undefined,
            medium: image.medium || undefined,
          },
          `${image.category}-${image.id}`
        );

        // Update database with URLs
        await prisma.galleryImage.update({
          where: { id: image.id },
          data: {
            srcUrl: urls.full,
            thumbnailUrl: urls.thumbnail || null,
            mediumUrl: urls.medium || null,
          },
        });

        results.migrated++;
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Image ${image.id} (${image.title}): ${errorMsg}`);
        console.error(`Failed to migrate image ${image.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${results.migrated} images migrated, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get migration status
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [total, migrated, needsMigration] = await Promise.all([
      prisma.galleryImage.count(),
      prisma.galleryImage.count({
        where: {
          srcUrl: { not: null },
        },
      }),
      prisma.galleryImage.count({
        where: {
          OR: [
            { srcUrl: null },
            { srcUrl: "" },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      total,
      migrated,
      needsMigration,
      percentage: total > 0 ? Math.round((migrated / total) * 100) : 0,
    });
  } catch (error) {
    console.error("Error getting migration status:", error);
    return NextResponse.json(
      { error: "Failed to get migration status" },
      { status: 500 }
    );
  }
}

