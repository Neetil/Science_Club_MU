"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "shimmer";
}

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "shimmer",
}: SkeletonProps) {
  const baseClasses = "rounded";
  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded",
  };
  
  const animationClasses = {
    pulse: "bg-zinc-800/50 animate-pulse",
    shimmer: "animate-shimmer",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function UpdateCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <Skeleton variant="text" width="30%" height={12} />
      <Skeleton variant="text" width="80%" height={20} />
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width="70%" height={16} />
      <Skeleton variant="text" width="25%" height={14} />
    </div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-teal-950/10 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <Skeleton variant="rectangular" width={100} height={24} className="rounded-full" />
            <Skeleton variant="text" width="90%" height={24} />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="95%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </div>
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-blue-900/10 p-6">
      <div className="relative space-y-3">
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="100%" height={16} />
        <Skeleton variant="text" width="85%" height={16} />
      </div>
    </div>
  );
}

export function StatisticsSkeleton() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center space-y-2">
      <Skeleton variant="text" width="60%" height={12} className="mx-auto" />
      <Skeleton variant="text" width="40%" height={32} className="mx-auto" />
    </div>
  );
}

export function GalleryImageSkeleton() {
  return (
    <div className="flex-shrink-0 w-64 md:w-72 aspect-[3/2] rounded-2xl border border-indigo-500/20 bg-indigo-950/40 overflow-hidden">
      <Skeleton variant="rectangular" width="100%" height="100%" />
    </div>
  );
}

