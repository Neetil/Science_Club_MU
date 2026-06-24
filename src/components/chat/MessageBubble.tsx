"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ChatMessage } from "./types";

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getSenderLabel(senderType: ChatMessage["senderType"]): string {
  switch (senderType) {
    case "VISITOR":
      return "You";
    case "CLUB_MEMBER":
      return "Science Club Team";
    case "SYSTEM":
      return "System";
  }
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isVisitor = message.senderType === "VISITOR";
  const isSystem = message.senderType === "SYSTEM";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn("flex w-full", isVisitor ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
          isVisitor &&
            "rounded-br-md bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-500/30",
          !isVisitor &&
            !isSystem &&
            "rounded-bl-md border border-white/10 bg-white/[0.04] text-zinc-100",
          isSystem && "mx-auto max-w-full border border-white/5 bg-white/[0.02] text-zinc-400",
        )}
      >
        {!isSystem && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            {getSenderLabel(message.senderType)}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        {!isSystem && (
          <p className="mt-2 text-[10px] text-zinc-500">{formatTime(message.createdAt)}</p>
        )}
      </div>
    </motion.div>
  );
}
