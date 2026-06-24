"use client";

import { cn } from "@/lib/utils";
import type { ChatSessionStatus } from "./types";

interface ConnectionStatusProps {
  status: ChatSessionStatus | "connecting";
  className?: string;
}

const statusConfig = {
  connecting: {
    label: "Connecting you with a club member...",
    icon: "⏳",
    color: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
    showSpinner: true,
  },
  WAITING: {
    label: "Connecting you with a club member...",
    icon: "⏳",
    color: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
    showSpinner: true,
  },
  CONNECTED: {
    label: "Connected to a Club Member",
    icon: "🟢",
    color: "text-emerald-300",
    dot: "bg-emerald-400",
    showSpinner: false,
  },
  DISCONNECTED: {
    label: "Disconnected",
    icon: "🔴",
    color: "text-red-300",
    dot: "bg-red-400",
    showSpinner: false,
  },
  OFFLINE: {
    label: "No members available",
    icon: "📧",
    color: "text-zinc-300",
    dot: "bg-zinc-400",
    showSpinner: false,
  },
} as const;

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0 text-base" aria-hidden>
        {config.icon}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
        <p className={cn("truncate text-sm font-medium", config.color)}>{config.label}</p>
      </div>
      {config.showSpinner && (
        <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      )}
    </div>
  );
}
