-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('WAITING', 'CONNECTED', 'DISCONNECTED', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('VISITOR', 'CLUB_MEMBER', 'SYSTEM');

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitorNumber" INTEGER NOT NULL,
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'WAITING',
    "telegramNotificationMessageId" BIGINT,
    "offlineEmail" TEXT,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderType" "MessageSenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "telegramMessageId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_visitorId_key" ON "ChatSession"("visitorId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatSession_visitorNumber_key" ON "ChatSession"("visitorNumber");

-- CreateIndex
CREATE INDEX "ChatSession_status_idx" ON "ChatSession"("status");

-- CreateIndex
CREATE INDEX "ChatSession_telegramNotificationMessageId_idx" ON "ChatSession"("telegramNotificationMessageId");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- CreateIndex
CREATE INDEX "Message_telegramMessageId_idx" ON "Message"("telegramMessageId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
