"use client";

import { clearChatSession, getStoredChatSession, touchChatSession } from "@/lib/chat-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, ChatSessionInfo, ChatSessionStatus, ChatView } from "./types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

interface UseChatSocketOptions {
  enabled: boolean;
  onClose?: () => void;
}

export function useChatSocket({ enabled, onClose }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [session, setSession] = useState<ChatSessionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [view, setView] = useState<ChatView>("welcome");
  const [input, setInput] = useState("");
  const [offlineEmail, setOfflineEmail] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const attachSocketListeners = useCallback((socket: Socket) => {
    socket.on("visitor-connected", (payload: { sessionId: string; visitorId: string }) => {
      touchChatSession(payload.sessionId, payload.visitorId);
      setSession((prev) =>
        prev
          ? { ...prev, id: payload.sessionId, visitorId: payload.visitorId }
          : {
              id: payload.sessionId,
              visitorId: payload.visitorId,
              status: "WAITING",
            },
      );
      setView("connecting");
      setIsConnecting(false);
    });

    socket.on("session-connected", (payload: { sessionId: string; connectedAt: string }) => {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "CONNECTED",
              connectedAt: payload.connectedAt,
            }
          : prev,
      );
      setView("connected");
    });

    socket.on(
      "club-reply",
      (payload: {
        id: string;
        content: string;
        senderType: "CLUB_MEMBER";
        createdAt: string;
        connected?: boolean;
      }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: payload.id,
            content: payload.content,
            senderType: payload.senderType,
            createdAt: payload.createdAt,
          },
        ]);

        if (payload.connected) {
          setSession((prev) => (prev ? { ...prev, status: "CONNECTED" } : prev));
          setView("connected");
        }

        setIsTyping(false);
      },
    );

    socket.on(
      "message-edited",
      (payload: { id: string; content: string; senderType: ChatMessage["senderType"]; createdAt: string }) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === payload.id ? { ...message, content: payload.content } : message,
          ),
        );
      },
    );

    socket.on("offline-timeout", () => {
      setView("offline");
      setSession((prev) => (prev ? { ...prev, status: "OFFLINE" } : prev));
    });

    socket.on("session-closed", () => {
      setView("closed");
      setSession((prev) => (prev ? { ...prev, status: "DISCONNECTED" } : prev));
      clearChatSession();
    });

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop-typing", () => setIsTyping(false));
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) {
      return socketRef.current;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    attachSocketListeners(socket);
    socketRef.current = socket;
    return socket;
  }, [attachSocketListeners]);

  const restoreSession = useCallback(async () => {
    const stored = getStoredChatSession();
    if (!stored) {
      return false;
    }

    setIsConnecting(true);
    setError(null);

    const socket = connectSocket();

    return new Promise<boolean>((resolve) => {
      socket.emit("restore-session", { sessionId: stored.sessionId }, (response: {
        success: boolean;
        session?: ChatSessionInfo;
        messages?: ChatMessage[];
        error?: string;
      }) => {
        setIsConnecting(false);

        if (!response?.success || !response.session) {
          clearChatSession();
          resolve(false);
          return;
        }

        setSession(response.session);
        setMessages(response.messages ?? []);

        if (response.session.status === "CONNECTED") {
          setView("connected");
        } else if (response.session.status === "OFFLINE") {
          setView("offline");
        } else if (response.session.status === "DISCONNECTED") {
          setView("closed");
        } else {
          setView("connecting");
        }

        touchChatSession(response.session.id, response.session.visitorId);
        resolve(true);
      });
    });
  }, [connectSocket]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void restoreSession();
  }, [enabled, restoreSession]);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setView("connecting");

    const socket = connectSocket();

    socket.emit("connect-session", {}, (response: {
      success: boolean;
      session?: ChatSessionInfo;
      error?: string;
    }) => {
      setIsConnecting(false);

      if (!response?.success || !response.session) {
        setError(response?.error ?? "Unable to start chat. Please try again.");
        setView("welcome");
        return;
      }

      setSession(response.session);
      touchChatSession(response.session.id, response.session.visitorId);
      setView("connecting");
    });
  }, [connectSocket]);

  const handleSendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || !session || isSending) {
      return;
    }

    if (view !== "connected" && session.status !== "CONNECTED") {
      setError("Please wait until a club member connects.");
      return;
    }

    setIsSending(true);
    setError(null);

    const socket = socketRef.current;
    if (!socket) {
      setIsSending(false);
      return;
    }

    socket.emit("visitor-message", { content }, (response: {
      success: boolean;
      message?: ChatMessage;
      error?: string;
    }) => {
      setIsSending(false);

      if (!response?.success || !response.message) {
        setError(response?.error ?? "Failed to send message.");
        return;
      }

      setMessages((prev) => [...prev, response.message!]);
      setInput("");
      touchChatSession(session.id, session.visitorId);
      socket.emit("stop-typing");
    });
  }, [input, isSending, session, view]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      const socket = socketRef.current;
      if (!socket || !session) {
        return;
      }

      socket.emit("typing");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing");
      }, 1200);
    },
    [session],
  );

  const handleSubmitOfflineEmail = useCallback(async () => {
    const email = offlineEmail.trim();
    if (!email || !session) {
      return;
    }

    setIsSending(true);
    setError(null);

    const socket = socketRef.current;
    if (!socket) {
      setIsSending(false);
      return;
    }

    socket.emit("submit-offline-email", { email }, (response: { success: boolean; error?: string }) => {
      setIsSending(false);

      if (!response?.success) {
        setError(response?.error ?? "Failed to submit email.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          content: "Thanks! We'll contact you at the email you provided.",
          senderType: "SYSTEM",
          createdAt: new Date().toISOString(),
        },
      ]);
      clearChatSession();
    });
  }, [offlineEmail, session]);

  const handleClose = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("disconnect-session");
      socket.disconnect();
    }
    socketRef.current = null;
    clearChatSession();
    setSession(null);
    setMessages([]);
    setView("welcome");
    setInput("");
    setOfflineEmail("");
    setError(null);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const connectionStatus: ChatSessionStatus | "connecting" =
    view === "connecting" || isConnecting ? "connecting" : session?.status ?? "WAITING";

  return {
    session,
    messages,
    view,
    input,
    offlineEmail,
    isTyping,
    isConnecting,
    isSending,
    error,
    connectionStatus,
    messagesEndRef,
    setInput: handleInputChange,
    setOfflineEmail,
    handleConnect,
    handleSendMessage,
    handleSubmitOfflineEmail,
    handleClose,
  };
}
