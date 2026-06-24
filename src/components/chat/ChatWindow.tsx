"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { ConnectionStatus } from "./ConnectionStatus";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useChatSocket } from "./useChatSocket";

interface ChatWindowProps {
  onClose: () => void;
  className?: string;
}

export function ChatWindow({ onClose, className }: ChatWindowProps) {
  const chat = useChatSocket({ enabled: true, onClose });

  const canSend =
    chat.view === "connected" ||
    chat.session?.status === "CONNECTED";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/10 via-[#0a0d14]/95 to-[#0a0d14] shadow-2xl shadow-cyan-950/20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Live Support</p>
          <h2 className="text-lg font-semibold text-white">
            {chat.session?.visitorId ? `Visitor ${chat.session.visitorId}` : "Science Club Chat"}
          </h2>
        </div>
        <button
          type="button"
          onClick={chat.handleClose}
          className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {chat.view === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Medicaps University</p>
              <h3 className="mt-3 text-2xl font-bold text-white">Hi! Welcome to Science Club.</h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
                Should I connect you to one of our club members?
              </p>
              <Button
                size="lg"
                className="mt-8 min-w-[140px]"
                onClick={chat.handleConnect}
                disabled={chat.isConnecting}
              >
                {chat.isConnecting ? "Connecting..." : "Connect"}
              </Button>
              {chat.error && <p className="mt-4 text-sm text-red-300">{chat.error}</p>}
            </motion.div>
          )}

          {(chat.view === "connecting" || chat.view === "connected" || chat.view === "closed") && (
            <motion.div
              key="conversation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-white/10 px-4 py-3 sm:px-6">
                <ConnectionStatus status={chat.connectionStatus} />
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
                {chat.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {chat.isTyping && <TypingIndicator />}
                <div ref={chat.messagesEndRef} />
              </div>

              {chat.view === "closed" ? (
                <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-zinc-400 sm:px-6">
                  This conversation has ended.
                </div>
              ) : (
                <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                  {chat.error && <p className="mb-2 text-sm text-red-300">{chat.error}</p>}
                  <div className="flex items-end gap-2">
                    <Input
                      value={chat.input}
                      onChange={(event) => chat.setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void chat.handleSendMessage();
                        }
                      }}
                      placeholder={
                        canSend
                          ? "Type your message..."
                          : "Waiting for a club member to connect..."
                      }
                      disabled={!canSend || chat.isSending}
                      className="min-h-[44px] flex-1"
                    />
                    <Button
                      onClick={() => void chat.handleSendMessage()}
                      disabled={!canSend || !chat.input.trim() || chat.isSending}
                      className="h-10 w-10 shrink-0 p-0"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {chat.view === "offline" && (
            <motion.div
              key="offline"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-1 flex-col px-6 py-8"
            >
              <ConnectionStatus status="OFFLINE" className="mb-6" />
              <p className="text-center text-sm leading-relaxed text-zinc-300">
                No club members are currently available.
                <br />
                Please leave your email and we will contact you.
              </p>
              <div className="mt-6 space-y-3">
                <Input
                  type="email"
                  value={chat.offlineEmail}
                  onChange={(event) => chat.setOfflineEmail(event.target.value)}
                  placeholder="your.email@example.com"
                />
                <Button
                  className="w-full"
                  onClick={() => void chat.handleSubmitOfflineEmail()}
                  disabled={!chat.offlineEmail.trim() || chat.isSending}
                >
                  {chat.isSending ? "Submitting..." : "Submit Email"}
                </Button>
                {chat.error && <p className="text-sm text-red-300">{chat.error}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
