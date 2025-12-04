import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getGalleryImages, saveGalleryImages, GalleryImage } from "@/lib/data";

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
    const images = await getGalleryImages();
    
    const newImage: GalleryImage = {
      id: Date.now().toString(),
      src: body.src,
      category: body.category,
      title: body.title,
      description: body.description,
      createdAt: new Date().toISOString(),
    };

    images.push(newImage);
    await saveGalleryImages(images);

    return NextResponse.json(newImage);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const images = await getGalleryImages();
    
    const index = images.findIndex((img) => img.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    images[index] = { ...images[index], ...body };
    await saveGalleryImages(images);

    return NextResponse.json(images[index]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
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

    const images = await getGalleryImages();
    const filtered = images.filter((img) => img.id !== id);
    await saveGalleryImages(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

