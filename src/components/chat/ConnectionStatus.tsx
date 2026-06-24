"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  },
  WAITING: {
    label: "Connecting you with a club member...",
    icon: "⏳",
    color: "text-amber-300",
    dot: "bg-amber-400 animate-pulse",
  },
  CONNECTED: {
    label: "Connected to a Club Member",
    icon: "🟢",
    color: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  DISCONNECTED: {
    label: "Disconnected",
    icon: "🔴",
    color: "text-red-300",
    dot: "bg-red-400",
  },
  OFFLINE: {
    label: "No members available",
    icon: "📧",
    color: "text-zinc-300",
    dot: "bg-zinc-400",
  },
} as const;

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2",
        className,
      )}
    >
      <span className="text-base" aria-hidden>
        {config.icon}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", config.dot)} />
        <p className={cn("truncate text-sm font-medium", config.color)}>{config.label}</p>
      </div>
      {(status === "connecting" || status === "WAITING") && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
      )}
    </motion.div>
  );
}
