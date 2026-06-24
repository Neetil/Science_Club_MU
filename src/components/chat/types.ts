export type ChatSessionStatus = "WAITING" | "CONNECTED" | "DISCONNECTED" | "OFFLINE";

export type MessageSenderType = "VISITOR" | "CLUB_MEMBER" | "SYSTEM";

export interface ChatMessage {
  id: string;
  content: string;
  senderType: MessageSenderType;
  createdAt: string;
}

export interface ChatSessionInfo {
  id: string;
  visitorId: string;
  status: ChatSessionStatus;
  connectedAt?: string | null;
}

export type ChatView = "welcome" | "connecting" | "connected" | "offline" | "closed";

export interface StoredChatSession {
  sessionId: string;
  visitorId: string;
  lastActive: number;
}
