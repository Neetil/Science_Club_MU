import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { handleTelegramWebhook, setTelegramWebhook, type TelegramUpdate } from "./lib/telegram.js";
import { prisma } from "./lib/prisma.js";
import { initializeSocketHandlers } from "./socket.js";
import { getRestorableSession } from "./lib/session.js";

const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

function getAllowedOrigins(): string[] {
  const origins = [FRONTEND_URL, "http://localhost:3000", "https://scienceclub.neetil.in"];
  if (process.env.FRONTEND_URLS) {
    origins.push(...process.env.FRONTEND_URLS.split(",").map((url) => url.trim()));
  }
  return [...new Set(origins.filter(Boolean))];
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60_000,
  pingInterval: 25_000,
});

initializeSocketHandlers(io);

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/sessions/:sessionId", async (req, res) => {
  try {
    const restored = await getRestorableSession(req.params.sessionId);
    if (!restored) {
      res.status(404).json({ error: "Session not found or expired" });
      return;
    }

    res.json({
      session: {
        id: restored.session.id,
        visitorId: restored.session.visitorId,
        status: restored.session.status,
        connectedAt: restored.session.connectedAt?.toISOString() ?? null,
      },
      messages: restored.messages.map((message) => ({
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        createdAt: message.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /sessions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/telegram/webhook", async (req, res) => {
  try {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secret && req.headers["x-telegram-bot-api-secret-token"] !== secret) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await handleTelegramWebhook(io, req.body as TelegramUpdate);
    res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.sendStatus(200);
  }
});

async function bootstrap(): Promise<void> {
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
  if (webhookUrl && process.env.NODE_ENV === "production") {
    const success = await setTelegramWebhook(webhookUrl);
    console.log(success ? "Telegram webhook registered" : "Failed to register Telegram webhook");
  }

  httpServer.listen(PORT, () => {
    console.log(`Chat server listening on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, io, httpServer };
