import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";

export async function GET() {
  try {
    const images = await getGalleryImages();
    // Get images marked as hero images (you can add a 'hero' flag later)
    // For now, we'll return the first few images from each category
    const heroImages = images.slice(0, 12); // Adjust as needed
    return NextResponse.json(heroImages);
  } catch (error) {
    console.error("Error fetching hero images:", error);
    return NextResponse.json({ error: "Failed to fetch hero images" }, { status: 500 });
  }
}



