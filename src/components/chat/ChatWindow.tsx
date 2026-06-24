"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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

  const showConversation =
    chat.phase === "CONNECTING" || chat.phase === "CONNECTED" || chat.phase === "DISCONNECTED";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-cyan-500/10 via-[#0a0d14]/95 to-[#0a0d14] shadow-2xl shadow-cyan-950/20",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-300/10 blur-3xl" />
      </div>

      <header className="relative z-10 shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">Live Support</p>
            <h2 className="truncate text-lg font-semibold text-white">
              {chat.session?.visitorId ? `Visitor ${chat.session.visitorId}` : "Science Club Chat"}
            </h2>
          </div>
          <button
            type="button"
            onClick={chat.handleClose}
            className="shrink-0 rounded-md p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {chat.phase === "IDLE" && (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Medicaps University</p>
            <h3 className="mt-3 text-2xl font-bold text-white">Hi! Welcome to Science Club.</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-300">
              Should I connect you to one of our club members?
            </p>
            <Button size="lg" className="mt-8 min-w-[140px]" onClick={chat.handleConnect}>
              Connect
            </Button>
            {chat.error && <p className="mt-4 text-sm text-red-300">{chat.error}</p>}
          </div>
        )}

        {showConversation && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {chat.connectionStatus && (
              <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
                <ConnectionStatus status={chat.connectionStatus} />
              </div>
            )}

            <div
              ref={chat.messagesContainerRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6"
            >
              {chat.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {chat.isTyping && <TypingIndicator />}
            </div>

            <footer className="shrink-0 border-t border-white/10 px-4 py-4 sm:px-6">
              {chat.phase === "DISCONNECTED" ? (
                <p className="text-center text-sm text-zinc-400">This conversation has ended.</p>
              ) : (
                <>
                  <div className="min-h-[20px]">
                    {chat.error && <p className="mb-2 text-sm text-red-300">{chat.error}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={chat.input}
                      onChange={(event) => chat.setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          chat.handleSendMessage();
                        }
                      }}
                      placeholder={
                        chat.canSend
                          ? "Type your message..."
                          : "Waiting for a club member to connect..."
                      }
                      disabled={!chat.canSend || chat.isSending}
                      className="h-11 flex-1"
                    />
                    <Button
                      onClick={chat.handleSendMessage}
                      disabled={!chat.canSend || !chat.input.trim() || chat.isSending}
                      className="h-11 w-11 shrink-0 p-0"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </footer>
          </div>
        )}

        {chat.phase === "OFFLINE" && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-8">
            <ConnectionStatus status="OFFLINE" className="mb-6 shrink-0" />
            <p className="shrink-0 text-center text-sm leading-relaxed text-zinc-300">
              No club members are currently available.
              <br />
              Please leave your email and we will contact you.
            </p>
            <div className="mt-6 shrink-0 space-y-3">
              <Input
                type="email"
                value={chat.offlineEmail}
                onChange={(event) => chat.setOfflineEmail(event.target.value)}
                placeholder="your.email@example.com"
              />
              <Button
                className="w-full"
                onClick={chat.handleSubmitOfflineEmail}
                disabled={!chat.offlineEmail.trim() || chat.isSending}
              >
                {chat.isSending ? "Submitting..." : "Submit Email"}
              </Button>
              {chat.error && <p className="text-sm text-red-300">{chat.error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
