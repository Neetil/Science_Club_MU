import type { ChatSession, Message } from "@prisma/client";
import { prisma } from "./prisma.js";

const VISITOR_ID_START = 104;
const RECONNECT_WINDOW_MS = 10 * 60 * 1000;

export async function generateVisitorSession(): Promise<{ visitorId: string; visitorNumber: number }> {
  const lastSession = await prisma.chatSession.findFirst({
    orderBy: { visitorNumber: "desc" },
    select: { visitorNumber: true },
  });

  const visitorNumber = Math.max(VISITOR_ID_START, (lastSession?.visitorNumber ?? VISITOR_ID_START - 1) + 1);
  const visitorId = `SC-${visitorNumber}`;

  return { visitorId, visitorNumber };
}

export async function createChatSession(): Promise<ChatSession> {
  const { visitorId, visitorNumber } = await generateVisitorSession();

  return prisma.chatSession.create({
    data: {
      visitorId,
      visitorNumber,
      status: "WAITING",
    },
  });
}

export async function getSessionById(sessionId: string): Promise<ChatSession | null> {
  return prisma.chatSession.findUnique({ where: { id: sessionId } });
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });
}

export async function getRestorableSession(sessionId: string): Promise<{
  session: ChatSession;
  messages: Message[];
} | null> {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    return null;
  }

  if (session.status === "OFFLINE") {
    const referenceTime = session.disconnectedAt ?? session.updatedAt;
    if (Date.now() - referenceTime.getTime() > RECONNECT_WINDOW_MS) {
      return null;
    }
  }

  if (session.status === "DISCONNECTED") {
    const referenceTime = session.disconnectedAt ?? session.updatedAt;
    if (Date.now() - referenceTime.getTime() > RECONNECT_WINDOW_MS) {
      return null;
    }
  }

  const messages = await getSessionMessages(sessionId);
  return { session, messages };
}

export async function markSessionConnected(sessionId: string): Promise<ChatSession> {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status: "CONNECTED",
      connectedAt: new Date(),
    },
  });
}

export async function markSessionDisconnected(sessionId: string): Promise<ChatSession> {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status: "DISCONNECTED",
      disconnectedAt: new Date(),
    },
  });
}

export async function markSessionOffline(sessionId: string, email: string): Promise<ChatSession> {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status: "OFFLINE",
      offlineEmail: email,
      disconnectedAt: new Date(),
    },
  });
}

export async function saveVisitorMessage(
  sessionId: string,
  content: string,
  telegramMessageId?: number,
): Promise<Message> {
  return prisma.message.create({
    data: {
      sessionId,
      senderType: "VISITOR",
      content,
      telegramMessageId: telegramMessageId ? BigInt(telegramMessageId) : null,
    },
  });
}

export async function saveSystemMessage(sessionId: string, content: string): Promise<Message> {
  return prisma.message.create({
    data: {
      sessionId,
      senderType: "SYSTEM",
      content,
    },
  });
}

export { RECONNECT_WINDOW_MS };
