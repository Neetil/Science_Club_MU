"use client";

import { useState, useEffect } from "react";
import { GalleryImage } from "@/lib/data";
import { useToast } from "@/components/ToastProvider";
import { generateImageSizes } from "@/lib/image-utils";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      fetchImages();
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gallery Management</h1>
          <p className="text-zinc-400">Upload and organize gallery images</p>
        </div>
        <button
          onClick={() => {
            setEditingImage(null);
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
        >
          + Add Image
        </button>
      </div>

      {showForm && (
        <ImageForm
          image={editingImage}
          onClose={() => {
            setShowForm(false);
            setEditingImage(null);
          }}
          onSuccess={() => {
            fetchImages();
            setShowForm(false);
            setEditingImage(null);
          }}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <div className="aspect-square relative">
              <img
                src={(image as any).thumbnail || (image as any).medium || image.src}
                alt={image.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{image.title}</h3>
              <p className="text-xs text-zinc-400 mb-3">{image.category}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingImage(image);
                    setShowForm(true);
                  }}
                  className="flex-1 px-2 py-1 rounded bg-white/5 text-white hover:bg-white/10 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg mb-2">No images yet</p>
          <p className="text-sm">Click "Add Image" to add your first image</p>
        </div>
      )}
    </div>
  );
}

function ImageForm({
  image,
  onClose,
  onSuccess,
}: {
  image: GalleryImage | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: image?.title || "",
    category: image?.category || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(image?.src || "");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  // Compress image before uploading
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (max 1920px on longest side)
          const maxDimension = 1920;
          if (width > height) {
            if (width > maxDimension) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width / height) * maxDimension;
              height = maxDimension;
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

          // Convert to base64 with quality compression (0.8 = 80% quality)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            },
            "image/jpeg",
            0.8
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      return;
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast("Image is large and will be compressed automatically.", "info");
    }

    try {
      setCompressing(true);
      setImageFile(file);
      // Compress and preview
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);
      // Clear any previous errors (no longer needed with toasts)
    } catch (err) {
      console.error("Error processing image:", err);
      showToast("Failed to process image. Please try another image.", "error");
      setImageFile(null);
      setImagePreview("");
    } finally {
      setCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate image is present for new uploads
    if (!image && !imagePreview) {
      showToast("Please select an image", "error");
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      showToast("Please enter a title", "error");
      return;
    }

    if (!formData.category) {
      showToast("Please select a category", "error");
      return;
    }

    setLoading(true);

    try {
      // Generate all image sizes (thumbnail, medium, full)
      setLoading(true);
      showToast("Generating optimized image sizes...", "info");
      
      const imageSizes = await generateImageSizes(imagePreview);

      const url = "/api/admin/gallery";
      const method = image ? "PUT" : "POST";
      const body = image
        ? { 
            ...formData, 
            src: imageSizes.full,
            thumbnail: imageSizes.thumbnail,
            medium: imageSizes.medium,
            id: image.id 
          }
        : { 
            ...formData, 
            src: imageSizes.full,
            thumbnail: imageSizes.thumbnail,
            medium: imageSizes.medium
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(image ? "Image updated successfully!" : "Image added successfully!", "success");
        onSuccess();
      } else {
        const errorMessage = data.error || "Failed to save image";
        showToast(errorMessage, "error");
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error saving image:", error);
      showToast("Failed to save image. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#0a0d14] rounded-2xl border border-white/10 p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {image ? "Edit Image" : "Add Image"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Image *
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-white/20 bg-white/5 hover:border-white/30"
              }`}
            >
              {compressing ? (
                <div className="flex flex-col items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                  <p className="text-zinc-300">Compressing image...</p>
                </div>
              ) : imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg mx-auto"
                  />
                  <div className="flex gap-2 justify-center">
                    <label className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors text-sm">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={compressing}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                      disabled={compressing}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-12 h-12 text-zinc-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-zinc-300 mb-2">
                      Drag and drop an image here, or click to select
                    </p>
                    <p className="text-zinc-500 text-xs mb-2">
                      Max 10MB • Images are automatically compressed
                    </p>
                    <label className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 cursor-pointer transition-colors text-sm inline-block">
                      Select Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={compressing}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option value="">Select category</option>
              <option value="Team">Team</option>
              <option value="Astronomy Night">Astronomy Night</option>
              <option value="Outreach Visits">Outreach Visits</option>
              <option value="Observations">Observations</option>
              <option value="Events">Events</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Image"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

