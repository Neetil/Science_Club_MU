export type ChatSessionStatus = "WAITING" | "CONNECTED" | "DISCONNECTED" | "OFFLINE";

export type MessageSenderType = "VISITOR" | "CLUB_MEMBER" | "SYSTEM";

export type ChatPhase = "IDLE" | "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "OFFLINE";

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

export interface StoredChatSession {
  sessionId: string;
  visitorId: string;
  lastActive: number;
}

export function getConnectionDisplayStatus(
  phase: ChatPhase,
): ChatSessionStatus | "connecting" | null {
  switch (phase) {
    case "IDLE":
      return null;
    case "CONNECTING":
      return "connecting";
    case "CONNECTED":
      return "CONNECTED";
    case "DISCONNECTED":
      return "DISCONNECTED";
    case "OFFLINE":
      return "OFFLINE";
  }
}

export function phaseFromSessionStatus(status: ChatSessionStatus): ChatPhase {
  switch (status) {
    case "CONNECTED":
      return "CONNECTED";
    case "DISCONNECTED":
      return "DISCONNECTED";
    case "OFFLINE":
      return "OFFLINE";
    case "WAITING":
      return "CONNECTING";
  }
}

export function hasClubMemberMessages(messages: ChatMessage[]): boolean {
  return messages.some((message) => message.senderType === "CLUB_MEMBER");
}
