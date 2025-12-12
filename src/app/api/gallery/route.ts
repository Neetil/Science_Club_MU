import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000"); // Default to large limit to get all images
    const category = searchParams.get("category");

    const allImages = await getGalleryImages();
    
    // Filter by category if provided
    const filteredImages = category && category !== "All" 
      ? allImages.filter(img => img.category === category)
      : allImages;

    // If limit is very large (>= 1000), return all images without pagination
    if (limit >= 1000) {
      return NextResponse.json(
        filteredImages,
        {
          headers: {
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
          },
        }
      );
    }

    // Calculate pagination for smaller limits
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

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
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}



