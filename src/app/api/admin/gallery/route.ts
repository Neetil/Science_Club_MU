import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createGalleryImage, deleteGalleryImage, getGalleryImages, updateGalleryImage } from "@/lib/data";
import { uploadImageSizesToBlob, deleteImagesFromBlob } from "@/lib/blob-utils";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await getGalleryImages();
  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.category || !body.src) {
      return NextResponse.json(
        { error: "Title, category, and image are required" },
        { status: 400 }
      );
    }

    // Upload images to Cloudflare R2
    let imageUrls;
    try {
      imageUrls = await uploadImageSizesToBlob({
        full: body.src,
        thumbnail: body.thumbnail,
        medium: body.medium,
      }, `${body.category}-${Date.now()}`);
    } catch (error) {
      console.error("Error uploading to R2 storage:", error);
      return NextResponse.json(
        { error: "Failed to upload image to storage. Please try again." },
        { status: 500 }
      );
    }

    // Store URLs in database (keep base64 for backward compatibility during migration)
    const newImage = await createGalleryImage({
      src: body.src, // Keep base64 for now (will be removed after migration)
      thumbnail: body.thumbnail || null,
      medium: body.medium || null,
      srcUrl: imageUrls.full,
      thumbnailUrl: imageUrls.thumbnail || null,
      mediumUrl: imageUrls.medium || null,
      category: body.category,
      title: body.title,
      description: null,
    });

    return NextResponse.json(newImage);
  } catch (error) {
    console.error("Error creating gallery image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to add image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
    }

    // Validate required fields
    if (!body.title || !body.category || !body.src) {
      return NextResponse.json(
        { error: "Title, category, and image are required" },
        { status: 400 }
      );
    }

    // Get existing image to delete old files from R2
    const existingImage = await getGalleryImages().then(images => images.find(img => img.id === body.id));
    
    // Upload new images to Cloudflare R2
    let imageUrls;
    try {
      imageUrls = await uploadImageSizesToBlob({
        full: body.src,
        thumbnail: body.thumbnail,
        medium: body.medium,
      }, `${body.category}-${Date.now()}`);
    } catch (error) {
      console.error("Error uploading to R2 storage:", error);
      return NextResponse.json(
        { error: "Failed to upload image to storage. Please try again." },
        { status: 500 }
      );
    }

    // Delete old images from R2 if they exist
    if (existingImage) {
      await deleteImagesFromBlob([
        existingImage.srcUrl,
        existingImage.thumbnailUrl,
        existingImage.mediumUrl,
      ]);
    }

    // Store URLs in database (keep base64 for backward compatibility during migration)
    const updated = await updateGalleryImage(body.id, {
      src: body.src, // Keep base64 for now (will be removed after migration)
      thumbnail: body.thumbnail || null,
      medium: body.medium || null,
      srcUrl: imageUrls.full,
      thumbnailUrl: imageUrls.thumbnail || null,
      mediumUrl: imageUrls.medium || null,
      category: body.category,
      title: body.title,
      description: null,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update image";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    // Get image before deleting to remove files from R2
    const images = await getGalleryImages();
    const imageToDelete = images.find(img => img.id === id);

    // Delete from database
    await deleteGalleryImage(id);

    // Delete images from R2
    if (imageToDelete) {
      await deleteImagesFromBlob([
        imageToDelete.srcUrl,
        imageToDelete.thumbnailUrl,
        imageToDelete.mediumUrl,
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

