import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getGalleryImages, updateGalleryImage } from "@/lib/data";
import { uploadImageToBlob } from "@/lib/blob-utils";

export const maxDuration = 300; // 5 minutes for migration
export const runtime = 'nodejs';

/**
 * Check if a URL is from Vercel Blob Storage
 */
function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("blob.vercel-storage.com") || 
         url.includes("public.blob.vercel-storage.com") ||
         url.includes("blob.vercel");
}

/**
 * Download an image from a URL and convert to base64
 */
async function downloadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    
    // Convert to base64 data URL
    const base64 = buffer.toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    throw error;
  }
}

/**
 * Migrate a single image from Vercel Blob to Cloudflare R2
 */
async function migrateImage(image: {
  id: string;
  srcUrl: string | null;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  category: string;
  title: string;
}): Promise<{
  success: boolean;
  imageId: string;
  migrated: string[];
  errors: string[];
}> {
  const result = {
    success: true,
    imageId: image.id,
    migrated: [] as string[],
    errors: [] as string[],
  };

  try {
    const newUrls: {
      srcUrl?: string;
      thumbnailUrl?: string;
      mediumUrl?: string;
    } = {};

    // Migrate full size image
    if (isVercelBlobUrl(image.srcUrl)) {
      try {
        const base64 = await downloadImageAsBase64(image.srcUrl!);
        const newUrl = await uploadImageToBlob(
          base64,
          `${image.category}-${image.id}-full.jpg`
        );
        newUrls.srcUrl = newUrl;
        result.migrated.push("srcUrl");
      } catch (error) {
        result.errors.push(`Failed to migrate srcUrl: ${error instanceof Error ? error.message : "Unknown error"}`);
        result.success = false;
      }
    }

    // Migrate thumbnail
    if (isVercelBlobUrl(image.thumbnailUrl)) {
      try {
        const base64 = await downloadImageAsBase64(image.thumbnailUrl!);
        const newUrl = await uploadImageToBlob(
          base64,
          `${image.category}-${image.id}-thumb.jpg`
        );
        newUrls.thumbnailUrl = newUrl;
        result.migrated.push("thumbnailUrl");
      } catch (error) {
        result.errors.push(`Failed to migrate thumbnailUrl: ${error instanceof Error ? error.message : "Unknown error"}`);
        result.success = false;
      }
    }

    // Migrate medium size
    if (isVercelBlobUrl(image.mediumUrl)) {
      try {
        const base64 = await downloadImageAsBase64(image.mediumUrl!);
        const newUrl = await uploadImageToBlob(
          base64,
          `${image.category}-${image.id}-medium.jpg`
        );
        newUrls.mediumUrl = newUrl;
        result.migrated.push("mediumUrl");
      } catch (error) {
        result.errors.push(`Failed to migrate mediumUrl: ${error instanceof Error ? error.message : "Unknown error"}`);
        result.success = false;
      }
    }

    // Update database if any URLs were migrated
    if (Object.keys(newUrls).length > 0) {
      await updateGalleryImage(image.id, newUrls);
    }

    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return result;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { confirmMigration } = body;

    if (!confirmMigration) {
      return NextResponse.json(
        { error: "Please confirm migration by setting confirmMigration to true" },
        { status: 400 }
      );
    }

    // Get all gallery images
    const allImages = await getGalleryImages();

    // Filter images that have Vercel Blob URLs
    const imagesToMigrate = allImages.filter(
      (img) =>
        isVercelBlobUrl(img.srcUrl) ||
        isVercelBlobUrl(img.thumbnailUrl) ||
        isVercelBlobUrl(img.mediumUrl)
    );

    if (imagesToMigrate.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No images found with Vercel Blob URLs. Migration not needed.",
        migrated: 0,
        total: allImages.length,
        results: [],
      });
    }

    // Migrate each image
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const image of imagesToMigrate) {
      const result = await migrateImage(image);
      results.push(result);
      
      if (result.success && result.migrated.length > 0) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    return NextResponse.json({
      success: errorCount === 0,
      message: `Migration completed. ${successCount} images migrated successfully, ${errorCount} failed.`,
      migrated: successCount,
      total: imagesToMigrate.length,
      results,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Failed to migrate images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allImages = await getGalleryImages();
    
    const imagesWithVercelBlob = allImages.filter(
      (img) =>
        isVercelBlobUrl(img.srcUrl) ||
        isVercelBlobUrl(img.thumbnailUrl) ||
        isVercelBlobUrl(img.mediumUrl)
    );

    const imagesWithR2 = allImages.filter(
      (img) =>
        (img.srcUrl && !isVercelBlobUrl(img.srcUrl)) ||
        (img.thumbnailUrl && !isVercelBlobUrl(img.thumbnailUrl)) ||
        (img.mediumUrl && !isVercelBlobUrl(img.mediumUrl))
    );

    return NextResponse.json({
      totalImages: allImages.length,
      imagesWithVercelBlob: imagesWithVercelBlob.length,
      imagesWithR2: imagesWithR2.length,
      needsMigration: imagesWithVercelBlob.length > 0,
      imagesToMigrate: imagesWithVercelBlob.map((img) => ({
        id: img.id,
        title: img.title,
        category: img.category,
        hasVercelBlob: {
          srcUrl: isVercelBlobUrl(img.srcUrl),
          thumbnailUrl: isVercelBlobUrl(img.thumbnailUrl),
          mediumUrl: isVercelBlobUrl(img.mediumUrl),
        },
      })),
    });
  } catch (error) {
    console.error("Error checking migration status:", error);
    return NextResponse.json(
      { error: "Failed to check migration status" },
      { status: 500 }
    );
  }
}

