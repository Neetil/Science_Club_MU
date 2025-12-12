"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";

export default function MigrateImagesPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<{
    total: number;
    migrated: number;
    needsMigration: number;
    percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/migrate-images");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch migration status:", error);
    }
  };

  const handleMigrate = async () => {
    if (!window.confirm(
      "This will migrate all base64 images to Vercel Blob Storage. This may take a few minutes. Continue?"
    )) {
      return;
    }

    setMigrating(true);
    try {
      const res = await fetch("/api/admin/migrate-images", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          `Migration completed! ${data.results.migrated} images migrated, ${data.results.failed} failed.`,
          "success"
        );
        if (data.results.errors.length > 0) {
          console.error("Migration errors:", data.results.errors);
        }
        await fetchStatus();
      } else {
        const error = await res.json();
        showToast(error.message || "Migration failed", "error");
      }
    } catch (error) {
      showToast("Failed to start migration", "error");
      console.error("Migration error:", error);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Migrate Images to Blob Storage</h1>
        <p className="text-zinc-400">
          Move existing base64 images from database to Vercel Blob Storage to reduce network transfer.
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Migration Status</h2>
        {status ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-zinc-400">Total Images</p>
                <p className="text-2xl font-bold text-white">{status.total}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Migrated</p>
                <p className="text-2xl font-bold text-green-400">{status.migrated}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Needs Migration</p>
                <p className="text-2xl font-bold text-yellow-400">{status.needsMigration}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Progress</p>
                <p className="text-2xl font-bold text-cyan-400">{status.percentage}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${status.percentage}%` }}
              />
            </div>

            {status.needsMigration > 0 && (
              <div className="pt-4">
                <button
                  onClick={handleMigrate}
                  disabled={migrating}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {migrating ? "Migrating..." : `Migrate ${status.needsMigration} Images`}
                </button>
              </div>
            )}

            {status.needsMigration === 0 && (
              <div className="pt-4">
                <p className="text-green-400 font-medium">✅ All images have been migrated!</p>
                <p className="text-zinc-400 text-sm mt-2">
                  Your images are now stored in Vercel Blob Storage, reducing database transfer significantly.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-zinc-400">Loading status...</p>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-6">
        <h3 className="text-lg font-semibold text-cyan-200 mb-2">Why Migrate?</h3>
        <ul className="space-y-2 text-zinc-300 text-sm">
          <li>• <strong>Reduce Database Transfer:</strong> Images served from CDN, not database</li>
          <li>• <strong>Faster Load Times:</strong> Images cached at edge locations worldwide</li>
          <li>• <strong>Cost Savings:</strong> Stay within free tier limits</li>
          <li>• <strong>Better Performance:</strong> Automatic image optimization</li>
        </ul>
      </div>
    </div>
  );
}

