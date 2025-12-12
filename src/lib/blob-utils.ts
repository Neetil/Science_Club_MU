import { put } from "@vercel/blob";

/**
 * Upload an image to Vercel Blob Storage
 * @param imageData - Base64 image data (data URL format: "data:image/jpeg;base64,...")
 * @param filename - Optional filename for the blob
 * @returns The URL of the uploaded image
 */
export async function uploadImageToBlob(
  imageData: string,
  filename?: string
): Promise<string> {
  try {
    // Convert base64 data URL to blob
    const base64Data = imageData.split(",")[1]; // Remove data:image/...;base64, prefix
    const buffer = Buffer.from(base64Data, "base64");
    
    // Determine content type from data URL
    const contentType = imageData.match(/data:([^;]+)/)?.[1] || "image/jpeg";
    
    // Generate filename if not provided
    const blobFilename = filename || `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    // Upload to Vercel Blob
    const blob = await put(blobFilename, buffer, {
      access: "public",
      contentType,
    });
    
    return blob.url;
  } catch (error) {
    console.error("Error uploading image to blob storage:", error);
    throw new Error("Failed to upload image to blob storage");
  }
}

/**
 * Upload multiple image sizes to Vercel Blob Storage
 * @param images - Object with full, thumbnail, and medium base64 images
 * @param baseFilename - Base filename (without extension)
 * @returns Object with URLs for full, thumbnail, and medium images
 */
export async function uploadImageSizesToBlob(
  images: {
    full: string;
    thumbnail?: string;
    medium?: string;
  },
  baseFilename?: string
): Promise<{
  full: string;
  thumbnail?: string;
  medium?: string;
}> {
  const filename = baseFilename || `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const [fullUrl, thumbnailUrl, mediumUrl] = await Promise.all([
    uploadImageToBlob(images.full, `${filename}-full.jpg`),
    images.thumbnail ? uploadImageToBlob(images.thumbnail, `${filename}-thumb.jpg`) : Promise.resolve(undefined),
    images.medium ? uploadImageToBlob(images.medium, `${filename}-medium.jpg`) : Promise.resolve(undefined),
  ]);
  
  return {
    full: fullUrl,
    thumbnail: thumbnailUrl,
    medium: mediumUrl,
  };
}

