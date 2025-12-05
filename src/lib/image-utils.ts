/**
 * Image optimization utilities
 * Generates thumbnail, medium, and full size versions of images
 */

export interface ImageSizes {
  thumbnail: string; // ~150x150px, ~50KB
  medium: string;    // ~800x600px, ~200KB
  full: string;      // Original size, ~1MB
}

/**
 * Resize image to specific dimensions
 */
function resizeImage(
  base64: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      const resizedBase64 = canvas.toDataURL("image/jpeg", quality);
      resolve(resizedBase64);
    };

    img.onerror = (error) => reject(error);
  });
}

/**
 * Generate all image sizes from a base64 image
 * This runs in the browser (client-side)
 */
export async function generateImageSizes(base64Image: string): Promise<ImageSizes> {
  try {
    // Generate thumbnail (150x150)
    const thumbnail = await resizeImage(base64Image, 150, 150, 0.7);
    
    // Generate medium (800x600)
    const medium = await resizeImage(base64Image, 800, 600, 0.8);
    
    // Full size is the original (already compressed in admin panel)
    const full = base64Image;

    return {
      thumbnail,
      medium,
      full,
    };
  } catch (error) {
    console.error("Error generating image sizes:", error);
    // Fallback: return original for all sizes
    return {
      thumbnail: base64Image,
      medium: base64Image,
      full: base64Image,
    };
  }
}

/**
 * Get appropriate image size based on context
 */
export function getImageForContext(
  sizes: { thumbnail?: string; medium?: string; full?: string },
  context: "thumbnail" | "medium" | "full" = "medium"
): string {
  switch (context) {
    case "thumbnail":
      return sizes.thumbnail || sizes.medium || sizes.full || "";
    case "medium":
      return sizes.medium || sizes.full || "";
    case "full":
      return sizes.full || sizes.medium || sizes.thumbnail || "";
    default:
      return sizes.full || sizes.medium || sizes.thumbnail || "";
  }
}


