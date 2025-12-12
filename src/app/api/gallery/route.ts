import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20"); // Load 20 images at a time
    const category = searchParams.get("category");

    const allImages = await getGalleryImages();
    
    // Filter by category if provided
    const filteredImages = category && category !== "All" 
      ? allImages.filter(img => img.category === category)
      : allImages;

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    // Return only essential data (no base64 images in response for now, but we'll optimize later)
    // For immediate fix: return paginated results
    return NextResponse.json(
      {
        images: paginatedImages,
        pagination: {
          page,
          limit,
          total: filteredImages.length,
          totalPages: Math.ceil(filteredImages.length / limit),
          hasMore: endIndex < filteredImages.length,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200", // 10 min cache, 20 min revalidate
        },
      }
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}



