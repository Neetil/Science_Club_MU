import { NextResponse } from "next/server";
import { getHeroGalleryImages } from "@/lib/data";

export async function GET() {
  try {
    const images = await getHeroGalleryImages();
    return NextResponse.json(images, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("Error fetching hero gallery:", error);
    return NextResponse.json({ error: "Failed to fetch hero gallery" }, { status: 500 });
  }
}

