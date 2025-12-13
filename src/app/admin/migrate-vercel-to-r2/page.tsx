"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

interface MigrationStatus {
  totalImages: number;
  imagesWithVercelBlob: number;
  imagesWithR2: number;
  needsMigration: boolean;
  imagesToMigrate: Array<{
    id: string;
    title: string;
    category: string;
    hasVercelBlob: {
      srcUrl: boolean;
      thumbnailUrl: boolean;
      mediumUrl: boolean;
    };
  }>;
}

interface MigrationResult {
  success: boolean;
  message: string;
  migrated: number;
  total: number;
  results: Array<{
    success: boolean;
    imageId: string;
    migrated: string[];
    errors: string[];
  }>;
}

export default function MigrateVercelToR2Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/migrate-vercel-to-r2");
      
      if (!response.ok) {
        throw new Error("Failed to check migration status");
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      showToast("Failed to check migration status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    if (!status?.needsMigration) {
      showToast("All images are already using Cloudflare R2", "info");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to migrate ${status.imagesWithVercelBlob} image(s) from Vercel Blob Storage to Cloudflare R2?\n\nThis will:\n- Download images from Vercel Blob\n- Upload them to Cloudflare R2\n- Update the database with new URLs\n\nThis process may take a few minutes.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMigrating(true);
      setError(null);
      setMigrationResult(null);

      const response = await fetch("/api/admin/migrate-vercel-to-r2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ confirmMigration: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Migration failed");
      }

      const result: MigrationResult = await response.json();
      setMigrationResult(result);

      if (result.success) {
        showToast(`Successfully migrated ${result.migrated} image(s) to Cloudflare R2`, "success");
        // Refresh status
        await checkStatus();
      } else {
        showToast(result.message, "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Migrate to Cloudflare R2</h1>
        <p className="text-zinc-400">Migrate all images from Vercel Blob Storage to Cloudflare R2 with one click</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="text-sm font-semibold text-red-200 mb-2">❌ Error</h3>
          <p className="text-sm text-red-100/80">{error}</p>
        </div>
      )}

      {status && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Migration Status</h2>
          <p className="text-sm text-zinc-400 mb-6">Current state of your image storage</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-white/10 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white">{status.totalImages}</div>
              <div className="text-sm text-zinc-400">Total Images</div>
            </div>
            <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/10">
              <div className="text-2xl font-bold text-orange-400">
                {status.imagesWithVercelBlob}
              </div>
              <div className="text-sm text-zinc-400">Vercel Blob URLs</div>
            </div>
            <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-400">
                {status.imagesWithR2}
              </div>
              <div className="text-sm text-zinc-400">Cloudflare R2 URLs</div>
            </div>
          </div>

          {status.needsMigration ? (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6">
              <h3 className="text-sm font-semibold text-yellow-200 mb-2">⚠️ Migration Required</h3>
              <p className="text-sm text-yellow-100/80">
                {status.imagesWithVercelBlob} image(s) are still using Vercel Blob Storage.
                Click the button below to migrate them to Cloudflare R2.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 mb-6">
              <h3 className="text-sm font-semibold text-green-200 mb-2">✅ All Good!</h3>
              <p className="text-sm text-green-100/80">
                All images are already using Cloudflare R2. No migration needed.
              </p>
            </div>
          )}

          {status.imagesToMigrate.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-white mb-2">Images to Migrate:</h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {status.imagesToMigrate.map((img) => (
                  <div key={img.id} className="p-3 border border-white/10 rounded text-sm bg-white/5">
                    <div className="font-medium text-white">{img.title}</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Category: {img.category} • 
                      {img.hasVercelBlob.srcUrl && " Full"}
                      {img.hasVercelBlob.thumbnailUrl && " Thumbnail"}
                      {img.hasVercelBlob.mediumUrl && " Medium"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {migrationResult && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Migration Results</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {migrationResult.success ? (
                <span className="text-green-400">✅</span>
              ) : (
                <span className="text-red-400">❌</span>
              )}
              <span className="font-medium text-white">{migrationResult.message}</span>
            </div>

            {migrationResult.results.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-white mb-2">Detailed Results:</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {migrationResult.results.map((result) => (
                    <div
                      key={result.imageId}
                      className={`p-3 border rounded text-sm ${
                        result.success 
                          ? "border-green-500/30 bg-green-500/10" 
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      <div className="font-medium text-white">Image ID: {result.imageId}</div>
                      {result.migrated.length > 0 && (
                        <div className="text-xs text-green-300 mt-1">
                          Migrated: {result.migrated.join(", ")}
                        </div>
                      )}
                      {result.errors.length > 0 && (
                        <div className="text-xs text-red-300 mt-1">
                          Errors: {result.errors.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleMigration}
          disabled={!status?.needsMigration || migrating}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {migrating ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Migrating...
            </>
          ) : (
            <>
              <span className="mr-2">☁️</span>
              Start Migration
            </>
          )}
        </button>
        <button
          onClick={checkStatus}
          disabled={migrating}
          className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔄 Refresh Status
        </button>
        <button
          onClick={() => router.push("/admin")}
          className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
        >
          ← Back to Admin
        </button>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
        <h3 className="text-sm font-semibold text-blue-200 mb-2">ℹ️ About Migration</h3>
        <ul className="text-sm text-blue-100/80 space-y-1 list-disc list-inside">
          <li>This tool automatically downloads images from Vercel Blob Storage and uploads them to Cloudflare R2</li>
          <li>All image metadata (title, category, description) is preserved</li>
          <li>After migration, you can safely remove Vercel Blob Storage from your Vercel project</li>
          <li>The migration process may take several minutes depending on the number of images</li>
        </ul>
      </div>
    </div>
  );
}
