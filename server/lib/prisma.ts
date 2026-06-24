import { PrismaClient } from "@prisma/client";

declare global {
  var chatPrisma: PrismaClient | undefined;
}

export const prisma = global.chatPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.chatPrisma = prisma;
}
