"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { ChatWindow } from "./ChatWindow";

interface ChatWidgetProps {
  variant?: "hero" | "button";
  className?: string;
}

export function ChatWidget({ variant = "button", className }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "button") {
    return (
      <>
        <Button
          onClick={() => setIsOpen(true)}
          className={cn("gap-2", className)}
          variant="primary"
        >
          <MessageCircle className="h-4 w-4" />
          Talk to a Club Member
        </Button>
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat overlay"
              />
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 h-[min(85vh,720px)] w-full max-w-3xl"
              >
                <ChatWindow onClose={() => setIsOpen(false)} className="h-full" />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.section
            key="hero"
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 sm:p-8 md:p-12"
          >
            <div className="relative z-10 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Medicaps University</p>
              <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                Physics & Astronomy Club
              </h1>
              <p className="mt-4 text-sm sm:text-base max-w-prose text-zinc-300">
                Exploring the cosmos through curiosity, discussions, experiments, collaboration and teamwork. Join us for expert talks, night sky observations, competitions, and hands-on research projects.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#updates"
                  className="rounded-md bg-cyan-500/20 px-4 py-2 text-sm sm:text-base text-cyan-200 ring-1 ring-cyan-500/40 hover:bg-cyan-500/30 active:bg-cyan-500/40 transition-colors"
                >
                  See Updates
                </a>
                <a
                  href="/events"
                  className="rounded-md bg-white/5 px-4 py-2 text-sm sm:text-base text-white ring-1 ring-white/10 hover:bg-white/10 active:bg-white/15 transition-colors"
                >
                  Upcoming Events
                </a>
                <Button onClick={() => setIsOpen(true)} className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Talk to a Club Member
                </Button>
              </div>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(60%_40%_at_50%_120%,rgba(0,255,255,0.35),transparent)]" />
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="chat"
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[420px] sm:min-h-[480px] md:min-h-[520px]"
          >
            <ChatWindow onClose={() => setIsOpen(false)} className="h-full min-h-[inherit]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
