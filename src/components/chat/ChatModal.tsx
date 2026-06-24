"use client";

import { AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChatModal({ open, onClose }: ChatModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close chat overlay"
          />
          <div className="relative z-10 h-[min(85vh,720px)] w-full max-w-3xl">
            <ChatWindow onClose={onClose} className="h-full" />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
