/*
  Warnings:

  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('upcoming', 'past');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "date",
DROP COLUMN "location",
DROP COLUMN "time",
ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'upcoming';
