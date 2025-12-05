import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { createGalleryImage, deleteGalleryImage, getGalleryImages, updateGalleryImage } from "@/lib/data";

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

    // Check if base64 strings are too large
    if (body.src.length > 10000000 || 
        (body.thumbnail && body.thumbnail.length > 500000) ||
        (body.medium && body.medium.length > 2000000)) {
      return NextResponse.json(
        { error: "Image is too large. Please compress it before uploading." },
        { status: 400 }
      );
    }

    const newImage = await createGalleryImage({
      src: body.src,
      thumbnail: body.thumbnail || null,
      medium: body.medium || null,
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

    // Check if base64 strings are too large
    if (body.src.length > 10000000 || 
        (body.thumbnail && body.thumbnail.length > 500000) ||
        (body.medium && body.medium.length > 2000000)) {
      return NextResponse.json(
        { error: "Image is too large. Please compress it before uploading." },
        { status: 400 }
      );
    }

    const updated = await updateGalleryImage(body.id, {
      src: body.src,
      thumbnail: body.thumbnail || null,
      medium: body.medium || null,
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

    await deleteGalleryImage(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

