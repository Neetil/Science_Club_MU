import type { StoredChatSession } from "@/components/chat/types";

const STORAGE_KEY = "science_club_chat_session";
const RECONNECT_WINDOW_MS = 10 * 60 * 1000;

export function saveChatSession(session: StoredChatSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

export function getStoredChatSession(): StoredChatSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredChatSession;
    if (!parsed.sessionId || !parsed.visitorId || !parsed.lastActive) {
      return null;
    }

    if (Date.now() - parsed.lastActive > RECONNECT_WINDOW_MS) {
      clearChatSession();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function touchChatSession(sessionId: string, visitorId: string): void {
  saveChatSession({
    sessionId,
    visitorId,
    lastActive: Date.now(),
  });
}

export function clearChatSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
