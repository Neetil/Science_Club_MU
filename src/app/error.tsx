"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white">500</h1>
          <h2 className="text-3xl font-bold text-white">Something Went Wrong</h2>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
          >
            Go Home
          </Link>
        </div>

        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-zinc-500">
            Error ID: {error.digest || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}

