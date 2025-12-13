import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

// Initialize S3 client for Cloudflare R2
// R2 is S3-compatible, so we can use AWS SDK
const s3Client = new S3Client({
  region: "auto", // R2 uses "auto" for region
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ""; // Optional: Custom domain (e.g., https://cdn.yourdomain.com)

/**
 * Upload an image to Cloudflare R2
 * @param imageData - Base64 image data (data URL format: "data:image/jpeg;base64,...")
 * @param filename - Optional filename for the blob
 * @returns The URL of the uploaded image
 */
export async function uploadImageToBlob(
  imageData: string,
  filename?: string
): Promise<string> {
  try {
    if (!BUCKET_NAME) {
      throw new Error("R2_BUCKET_NAME environment variable is not set");
    }

    // Convert base64 data URL to buffer
    const base64Data = imageData.split(",")[1]; // Remove data:image/...;base64, prefix
    const buffer = Buffer.from(base64Data, "base64");
    
    // Determine content type from data URL
    const contentType = imageData.match(/data:([^;]+)/)?.[1] || "image/jpeg";
    
    // Generate filename if not provided
    const blobFilename = filename || `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    
    // Upload to R2
    // Note: R2 doesn't use ACLs. Public access is controlled via bucket settings.
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: blobFilename,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    // Return public URL
    if (R2_PUBLIC_URL) {
      // Use custom domain if provided
      return `${R2_PUBLIC_URL}/${blobFilename}`;
    } else {
      // Use R2 public URL format
      return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${BUCKET_NAME}/${blobFilename}`;
    }
  } catch (error) {
    console.error("Error uploading image to R2:", error);
    throw new Error("Failed to upload image to R2 storage");
  }
}

/**
 * Upload multiple image sizes to Cloudflare R2
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

/**
 * Delete images from Cloudflare R2
 * @param urls - Array of image URLs to delete
 */
export async function deleteImagesFromBlob(urls: (string | null | undefined)[]): Promise<void> {
  if (!BUCKET_NAME || urls.length === 0) {
    return;
  }

  try {
    // Extract keys from URLs
    const keys = urls
      .filter((url): url is string => !!url)
      .map((url) => {
        // Extract key from URL
        // Handle both custom domain and R2 public URL formats
        if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
          return url.replace(`${R2_PUBLIC_URL}/`, "");
        } else {
          // Extract from R2 public URL: https://pub-{accountId}.r2.dev/{bucket}/{key}
          const match = url.match(/\/[^/]+\/(.+)$/);
          return match ? match[1] : url.split("/").pop() || "";
        }
      })
      .filter((key) => key.length > 0);

    if (keys.length === 0) {
      return;
    }

    // Delete objects from R2
    const command = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting images from R2:", error);
    // Don't throw - deletion is not critical if it fails
  }
}
