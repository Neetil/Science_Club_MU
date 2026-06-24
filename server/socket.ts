import type { Server, Socket } from "socket.io";
import {
  createChatSession,
  getRestorableSession,
  getSessionById,
  markSessionDisconnected,
  markSessionOffline,
  saveVisitorMessage,
} from "./lib/session.js";
import {
  sendDisconnectNotification,
  sendNewChatRequestNotification,
  sendOfflineEmailNotification,
  sendVisitorMessageToTelegram,
} from "./lib/telegram.js";
import { prisma } from "./lib/prisma.js";
import { clearOfflineTimer, clearDisconnectTimer, scheduleOfflineTimer, scheduleDisconnectTimer } from "./lib/timers.js";

interface VisitorSocketData {
  sessionId: string;
  visitorId: string;
}

const visitorSockets = new Map<string, string>();

function scheduleOfflineTimeout(io: Server, sessionId: string, visitorId: string): void {
  scheduleOfflineTimer(sessionId, async () => {
    try {
      const session = await getSessionById(sessionId);
      if (!session || session.status !== "WAITING") {
        return;
      }

      io.to(sessionId).emit("offline-timeout", {
        sessionId,
        visitorId,
        message: "No club members are currently available.",
      });
    } catch (error) {
      console.error("Offline timeout error:", error);
    }
  });
}

export function initializeSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("restore-session", async (payload: { sessionId: string }, callback) => {
      try {
        const restored = await getRestorableSession(payload.sessionId);
        if (!restored) {
          callback?.({ success: false });
          return;
        }

        let { session, messages } = restored;
        clearDisconnectTimer(session.id);

        if (session.status === "DISCONNECTED") {
          const reactivated = await prisma.chatSession.update({
            where: { id: session.id },
            data: {
              status: session.connectedAt ? "CONNECTED" : "WAITING",
              disconnectedAt: null,
            },
          });
          session = reactivated;
        }

        socket.join(session.id);
        visitorSockets.set(session.id, socket.id);

        socket.data = {
          sessionId: session.id,
          visitorId: session.visitorId,
        } satisfies VisitorSocketData;

        if (session.status === "WAITING") {
          scheduleOfflineTimeout(io, session.id, session.visitorId);
        }

        callback?.({
          success: true,
          session: {
            id: session.id,
            visitorId: session.visitorId,
            status: session.status,
            connectedAt: session.connectedAt?.toISOString() ?? null,
          },
          messages: messages.map((message) => ({
            id: message.id,
            content: message.content,
            senderType: message.senderType,
            createdAt: message.createdAt.toISOString(),
          })),
        });

        socket.emit("visitor-connected", {
          sessionId: session.id,
          visitorId: session.visitorId,
          restored: true,
        });
      } catch (error) {
        console.error("restore-session error:", error);
        callback?.({ success: false, error: "Failed to restore session" });
      }
    });

    socket.on("connect-session", async (_payload, callback) => {
      try {
        const session = await createChatSession();
        const telegramMessageId = await sendNewChatRequestNotification(session.visitorId);

        if (telegramMessageId) {
          await prisma.chatSession.update({
            where: { id: session.id },
            data: { telegramNotificationMessageId: BigInt(telegramMessageId) },
          });
        }

        socket.join(session.id);
        visitorSockets.set(session.id, socket.id);

        socket.data = {
          sessionId: session.id,
          visitorId: session.visitorId,
        } satisfies VisitorSocketData;

        scheduleOfflineTimeout(io, session.id, session.visitorId);

        callback?.({
          success: true,
          session: {
            id: session.id,
            visitorId: session.visitorId,
            status: session.status,
          },
        });

        socket.emit("visitor-connected", {
          sessionId: session.id,
          visitorId: session.visitorId,
          restored: false,
        });
      } catch (error) {
        console.error("connect-session error:", error);
        callback?.({ success: false, error: "Failed to create chat session" });
      }
    });

    socket.on(
      "visitor-message",
      async (payload: { content: string }, callback) => {
        try {
          const data = socket.data as VisitorSocketData | undefined;
          if (!data?.sessionId) {
            callback?.({ success: false, error: "No active session" });
            return;
          }

          const content = payload.content?.trim();
          if (!content) {
            callback?.({ success: false, error: "Message cannot be empty" });
            return;
          }

          const session = await getSessionById(data.sessionId);
          if (!session || session.status === "DISCONNECTED" || session.status === "OFFLINE") {
            callback?.({ success: false, error: "Session is not active" });
            return;
          }

          if (session.status !== "CONNECTED") {
            callback?.({ success: false, error: "Waiting for a club member to connect" });
            return;
          }

          const savedMessage = await saveVisitorMessage(session.id, content);

          const replyToId = session.telegramNotificationMessageId
            ? Number(session.telegramNotificationMessageId)
            : undefined;

          const telegramMessageId = await sendVisitorMessageToTelegram(
            session.visitorId,
            content,
            replyToId,
          );

          if (telegramMessageId) {
            await prisma.message.update({
              where: { id: savedMessage.id },
              data: { telegramMessageId: BigInt(telegramMessageId) },
            });
          }

          callback?.({
            success: true,
            message: {
              id: savedMessage.id,
              content: savedMessage.content,
              senderType: savedMessage.senderType,
              createdAt: savedMessage.createdAt.toISOString(),
            },
          });
        } catch (error) {
          console.error("visitor-message error:", error);
          callback?.({ success: false, error: "Failed to send message" });
        }
      },
    );

    socket.on("submit-offline-email", async (payload: { email: string }, callback) => {
      try {
        const data = socket.data as VisitorSocketData | undefined;
        if (!data?.sessionId) {
          callback?.({ success: false, error: "No active session" });
          return;
        }

        const email = payload.email?.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          callback?.({ success: false, error: "Invalid email address" });
          return;
        }

        clearOfflineTimer(data.sessionId);
        await markSessionOffline(data.sessionId, email);
        await sendOfflineEmailNotification(data.visitorId, email);

        callback?.({ success: true });
      } catch (error) {
        console.error("submit-offline-email error:", error);
        callback?.({ success: false, error: "Failed to submit email" });
      }
    });

    socket.on("typing", () => {
      const data = socket.data as VisitorSocketData | undefined;
      if (data?.sessionId) {
        socket.to(data.sessionId).emit("typing", { visitorId: data.visitorId });
      }
    });

    socket.on("stop-typing", () => {
      const data = socket.data as VisitorSocketData | undefined;
      if (data?.sessionId) {
        socket.to(data.sessionId).emit("stop-typing", { visitorId: data.visitorId });
      }
    });

    socket.on("disconnect-session", async () => {
      await handleSessionClose(io, socket, false);
    });

    socket.on("disconnect", async () => {
      await handleSessionClose(io, socket, true);
    });
  });
}

async function handleSessionClose(io: Server, socket: Socket, isDisconnect: boolean): Promise<void> {
  const data = socket.data as VisitorSocketData | undefined;
  if (!data?.sessionId) {
    return;
  }

  const currentSocketId = visitorSockets.get(data.sessionId);
  if (currentSocketId && currentSocketId !== socket.id) {
    return;
  }

  visitorSockets.delete(data.sessionId);
  clearOfflineTimer(data.sessionId);

  if (!isDisconnect) {
    await finalizeSessionClose(io, data.sessionId, data.visitorId);
    return;
  }

  scheduleDisconnectTimer(data.sessionId, async () => {
    if (visitorSockets.has(data.sessionId)) {
      return;
    }
    await finalizeSessionClose(io, data.sessionId, data.visitorId);
  });
}

async function finalizeSessionClose(
  io: Server,
  sessionId: string,
  visitorId: string,
): Promise<void> {
  try {
    const session = await getSessionById(sessionId);
    if (!session || session.status === "DISCONNECTED" || session.status === "OFFLINE") {
      return;
    }

    await markSessionDisconnected(sessionId);
    await sendDisconnectNotification(visitorId);

    io.to(sessionId).emit("session-closed", {
      sessionId,
      visitorId,
      reason: "disconnect",
    });
  } catch (error) {
    console.error("Session close error:", error);
  }
}