import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createHeroGalleryImage, deleteHeroGalleryImage, getHeroGalleryImages, updateHeroGalleryImage } from "@/lib/data";
import { uploadImageToBlob, deleteImagesFromBlob } from "@/lib/blob-utils";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await getHeroGalleryImages();
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

    // Upload image to Cloudflare R2
    let imageUrl;
    try {
      imageUrl = await uploadImageToBlob(
        body.src,
        `hero-${body.category}-${Date.now()}.jpg`
      );
    } catch (error) {
      console.error("Error uploading to R2 storage:", error);
      return NextResponse.json(
        { error: "Failed to upload image to storage. Please try again." },
        { status: 500 }
      );
    }

    // Store URL in database (keep base64 for backward compatibility during migration)
    const newImage = await createHeroGalleryImage({
      src: body.src, // Keep base64 for now
      srcUrl: imageUrl,
      category: body.category,
      title: body.title,
      description: body.description || null,
      order: body.order || 0,
    });

    return NextResponse.json(newImage);
  } catch (error) {
    console.error("Error creating hero gallery image:", error);
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

    // Get existing image to delete old file from R2
    const existingImage = await getHeroGalleryImages().then(images => images.find(img => img.id === body.id));
    
    // Upload new image to Cloudflare R2
    let imageUrl;
    try {
      imageUrl = await uploadImageToBlob(
        body.src,
        `hero-${body.category}-${Date.now()}.jpg`
      );
    } catch (error) {
      console.error("Error uploading to R2 storage:", error);
      return NextResponse.json(
        { error: "Failed to upload image to storage. Please try again." },
        { status: 500 }
      );
    }

    // Delete old image from R2 if it exists
    if (existingImage?.srcUrl) {
      await deleteImagesFromBlob([existingImage.srcUrl]);
    }

    // Store URL in database (keep base64 for backward compatibility during migration)
    const updated = await updateHeroGalleryImage(body.id, {
      src: body.src, // Keep base64 for now
      srcUrl: imageUrl,
      category: body.category,
      title: body.title,
      description: body.description || null,
      order: body.order ?? existingImage?.order ?? 0,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating hero gallery image:", error);
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

    // Get image before deleting to remove file from R2
    const images = await getHeroGalleryImages();
    const imageToDelete = images.find(img => img.id === id);

    // Delete from database
    await deleteHeroGalleryImage(id);

    // Delete image from R2
    if (imageToDelete?.srcUrl) {
      await deleteImagesFromBlob([imageToDelete.srcUrl]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

