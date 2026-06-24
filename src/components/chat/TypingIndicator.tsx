"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-2 w-2 rounded-full bg-cyan-400/70"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.15,
          }}
        />
      ))}
      <span className="ml-2 text-xs text-zinc-400">Club member is typing...</span>
    </div>
  );
}
