"use client";

import { clearChatSession, getStoredChatSession, touchChatSession } from "@/lib/chat-storage";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  getConnectionDisplayStatus,
  hasClubMemberMessages,
  phaseFromSessionStatus,
  type ChatMessage,
  type ChatPhase,
  type ChatSessionInfo,
} from "./types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

interface UseChatSocketOptions {
  enabled: boolean;
  onClose?: () => void;
}

export function useChatSocket({ enabled, onClose }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseRef = useRef<ChatPhase>("IDLE");

  const [session, setSession] = useState<ChatSessionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ChatPhase>("IDLE");
  const [input, setInput] = useState("");
  const [offlineEmail, setOfflineEmail] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPhaseSafe = useCallback((next: ChatPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const markConnected = useCallback((connectedAt?: string) => {
    setPhaseSafe("CONNECTED");
    setSession((prev) =>
      prev
        ? {
            ...prev,
            status: "CONNECTED",
            connectedAt: connectedAt ?? prev.connectedAt ?? new Date().toISOString(),
          }
        : prev,
    );
  }, [setPhaseSafe]);

  const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }, []);

  useLayoutEffect(() => {
    if (phase !== "CONNECTED" && phase !== "CONNECTING" && phase !== "DISCONNECTED") {
      return;
    }

    if (messages.length > previousMessageCountRef.current) {
      scrollMessagesToBottom(previousMessageCountRef.current === 0 ? "auto" : "auto");
    }

    previousMessageCountRef.current = messages.length;
  }, [messages.length, phase, scrollMessagesToBottom]);

  useEffect(() => {
    if (phase === "CONNECTING" && hasClubMemberMessages(messages)) {
      markConnected();
    }
  }, [messages, phase, markConnected]);

  const attachSocketListeners = useCallback(
    (socket: Socket) => {
      socket.off("visitor-connected");
      socket.off("session-connected");
      socket.off("club-reply");
      socket.off("message-edited");
      socket.off("offline-timeout");
      socket.off("session-closed");
      socket.off("typing");
      socket.off("stop-typing");

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

        if (phaseRef.current !== "CONNECTED") {
          setPhaseSafe("CONNECTING");
        }
      });

      socket.on("session-connected", (payload: { connectedAt: string }) => {
        markConnected(payload.connectedAt);
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
          setMessages((prev) => {
            if (prev.some((message) => message.id === payload.id)) {
              return prev;
            }

            return [
              ...prev,
              {
                id: payload.id,
                content: payload.content,
                senderType: payload.senderType,
                createdAt: payload.createdAt,
              },
            ];
          });

          markConnected(payload.createdAt);
          setIsTyping(false);
        },
      );

      socket.on(
        "message-edited",
        (payload: {
          id: string;
          content: string;
          senderType: ChatMessage["senderType"];
          createdAt: string;
        }) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === payload.id ? { ...message, content: payload.content } : message,
            ),
          );
        },
      );

      socket.on("offline-timeout", () => {
        setPhaseSafe("OFFLINE");
        setSession((prev) => (prev ? { ...prev, status: "OFFLINE" } : prev));
      });

      socket.on("session-closed", () => {
        setPhaseSafe("DISCONNECTED");
        setSession((prev) => (prev ? { ...prev, status: "DISCONNECTED" } : prev));
        clearChatSession();
      });

      socket.on("typing", () => setIsTyping(true));
      socket.on("stop-typing", () => setIsTyping(false));
    },
    [markConnected, setPhaseSafe],
  );

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        socketRef.current.connect();
      }
      return socketRef.current;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      autoConnect: true,
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

    setError(null);
    const socket = connectSocket();

    return new Promise<boolean>((resolve) => {
      socket.emit("restore-session", { sessionId: stored.sessionId }, (response: {
        success: boolean;
        session?: ChatSessionInfo;
        messages?: ChatMessage[];
      }) => {
        if (!response?.success || !response.session) {
          clearChatSession();
          resolve(false);
          return;
        }

        const restoredMessages = response.messages ?? [];
        setSession(response.session);
        setMessages(restoredMessages);

        if (hasClubMemberMessages(restoredMessages) || response.session.status === "CONNECTED") {
          setPhaseSafe("CONNECTED");
        } else {
          setPhaseSafe(phaseFromSessionStatus(response.session.status));
        }

        previousMessageCountRef.current = restoredMessages.length;
        touchChatSession(response.session.id, response.session.visitorId);
        resolve(true);
      });
    });
  }, [connectSocket, setPhaseSafe]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void restoreSession();
  }, [enabled, restoreSession]);

  const handleConnect = useCallback(() => {
    setError(null);
    setPhaseSafe("CONNECTING");

    const socket = connectSocket();

    socket.emit("connect-session", {}, (response: {
      success: boolean;
      session?: ChatSessionInfo;
      error?: string;
    }) => {
      if (!response?.success || !response.session) {
        setError(response?.error ?? "Unable to start chat. Please try again.");
        setPhaseSafe("IDLE");
        return;
      }

      setSession(response.session);
      touchChatSession(response.session.id, response.session.visitorId);
      setPhaseSafe("CONNECTING");
    });
  }, [connectSocket, setPhaseSafe]);

  const handleSendMessage = useCallback(() => {
    const content = input.trim();
    if (!content || !session || isSending || phaseRef.current !== "CONNECTED") {
      if (content && phaseRef.current !== "CONNECTED") {
        setError("Please wait until a club member connects.");
      }
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

      setMessages((prev) => {
        if (prev.some((message) => message.id === response.message!.id)) {
          return prev;
        }
        return [...prev, response.message!];
      });
      setInput("");
      touchChatSession(session.id, session.visitorId);
      socket.emit("stop-typing");
    });
  }, [input, isSending, session]);

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

  const handleSubmitOfflineEmail = useCallback(() => {
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
    setPhaseSafe("IDLE");
    setInput("");
    setOfflineEmail("");
    setError(null);
    setIsTyping(false);
    previousMessageCountRef.current = 0;
    onClose?.();
  }, [onClose, setPhaseSafe]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const connectionStatus = getConnectionDisplayStatus(phase);
  const canSend = phase === "CONNECTED";

  return {
    session,
    messages,
    phase,
    input,
    offlineEmail,
    isTyping,
    isSending,
    error,
    connectionStatus,
    canSend,
    messagesContainerRef,
    setInput: handleInputChange,
    setOfflineEmail,
    handleConnect,
    handleSendMessage,
    handleSubmitOfflineEmail,
    handleClose,
  };
}
