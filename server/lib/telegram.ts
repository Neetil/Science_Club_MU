import type { ChatSession, Message } from "@prisma/client";
import { prisma } from "./prisma.js";
import type { Server } from "socket.io";
import { clearOfflineTimer } from "./timers.js";

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramMessage {
  message_id: number;
  text?: string;
  reply_to_message?: {
    message_id: number;
  };
  edit_date?: number;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

function getChatId(): string {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    throw new Error("TELEGRAM_CHAT_ID is not configured");
  }
  return chatId;
}

export async function sendTelegramMessage(
  text: string,
  replyToMessageId?: number,
): Promise<{ message_id: number } | null> {
  const token = getBotToken();
  const chatId = getChatId();

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  if (replyToMessageId) {
    body.reply_to_message_id = replyToMessageId;
  }

  const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram sendMessage failed:", errorText);
    return null;
  }

  const data = (await response.json()) as { ok: boolean; result?: { message_id: number } };
  return data.ok && data.result ? data.result : null;
}

export async function sendNewChatRequestNotification(
  visitorId: string,
): Promise<number | null> {
  const text = [
    "🔔 <b>New Chat Request</b>",
    "",
    `Visitor: <b>${visitorId}</b>`,
    "",
    "A visitor would like to speak with a club member.",
    "",
    "Reply to this message to start the conversation.",
  ].join("\n");

  const result = await sendTelegramMessage(text);
  return result?.message_id ?? null;
}

export async function sendVisitorMessageToTelegram(
  visitorId: string,
  content: string,
  replyToMessageId?: number,
): Promise<number | null> {
  const text = [`Visitor: <b>${visitorId}</b>`, "", "Message:", content].join("\n");
  const result = await sendTelegramMessage(text, replyToMessageId);
  return result?.message_id ?? null;
}

export async function sendDisconnectNotification(visitorId: string): Promise<void> {
  const text = [
    "🔴 <b>Visitor Disconnected</b>",
    "",
    `Visitor: <b>${visitorId}</b>`,
    "",
    "The visitor has left the conversation.",
  ].join("\n");

  await sendTelegramMessage(text);
}

export async function sendOfflineEmailNotification(
  visitorId: string,
  email: string,
): Promise<void> {
  const text = [
    "📧 <b>Missed Chat Request</b>",
    "",
    `Visitor: <b>${visitorId}</b>`,
    `Email: <b>${email}</b>`,
    "",
    "No club member responded within 60 seconds. Please follow up via email.",
  ].join("\n");

  await sendTelegramMessage(text);
}

async function findSessionForReply(replyToMessageId: number): Promise<ChatSession | null> {
  const sessionByNotification = await prisma.chatSession.findFirst({
    where: { telegramNotificationMessageId: BigInt(replyToMessageId) },
  });

  if (sessionByNotification) {
    return sessionByNotification;
  }

  const originalMessage = await prisma.message.findFirst({
    where: { telegramMessageId: BigInt(replyToMessageId) },
    include: { session: true },
  });

  return originalMessage?.session ?? null;
}

export async function processTelegramReply(
  io: Server,
  message: TelegramMessage,
): Promise<void> {
  const replyToId = message.reply_to_message?.message_id;
  const content = message.text?.trim();

  if (!replyToId || !content) {
    return;
  }

  const session = await findSessionForReply(replyToId);
  if (!session) {
    console.warn(`No session found for Telegram reply to message ${replyToId}`);
    return;
  }

  if (session.status === "DISCONNECTED" || session.status === "OFFLINE") {
    return;
  }

  const wasWaiting = session.status === "WAITING";

  const savedMessage = await prisma.message.create({
    data: {
      sessionId: session.id,
      senderType: "CLUB_MEMBER",
      content,
      telegramMessageId: BigInt(message.message_id),
    },
  });

  if (wasWaiting) {
    clearOfflineTimer(session.id);
    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        status: "CONNECTED",
        connectedAt: new Date(),
      },
    });
  }

  io.to(session.id).emit("club-reply", {
    id: savedMessage.id,
    content: savedMessage.content,
    senderType: "CLUB_MEMBER",
    createdAt: savedMessage.createdAt.toISOString(),
    connected: wasWaiting,
  });

  if (wasWaiting) {
    io.to(session.id).emit("session-connected", {
      sessionId: session.id,
      visitorId: session.visitorId,
      connectedAt: new Date().toISOString(),
    });
  }
}

async function processEditedMessage(io: Server, message: TelegramMessage): Promise<void> {
  const content = message.text?.trim();
  if (!content) {
    return;
  }

  const existing = await prisma.message.findFirst({
    where: { telegramMessageId: BigInt(message.message_id) },
    include: { session: true },
  });

  if (!existing) {
    return;
  }

  const updated = await prisma.message.update({
    where: { id: existing.id },
    data: { content },
  });

  io.to(existing.sessionId).emit("message-edited", {
    id: updated.id,
    content: updated.content,
    senderType: existing.senderType,
    createdAt: updated.createdAt.toISOString(),
  });
}

export async function handleTelegramWebhook(
  io: Server,
  update: TelegramUpdate,
): Promise<void> {
  if (update.message?.reply_to_message) {
    await processTelegramReply(io, update.message);
    return;
  }

  if (update.edited_message) {
    await processEditedMessage(io, update.edited_message);
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  const token = getBotToken();
  const response = await fetch(`${TELEGRAM_API}${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: webhookUrl }),
  });

  if (!response.ok) {
    console.error("Failed to set Telegram webhook:", await response.text());
    return false;
  }

  const data = (await response.json()) as { ok: boolean };
  return data.ok;
}

export type { TelegramUpdate, TelegramMessage };
