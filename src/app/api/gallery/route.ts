import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";

export async function GET() {
  try {
    const images = await getGalleryImages();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}



