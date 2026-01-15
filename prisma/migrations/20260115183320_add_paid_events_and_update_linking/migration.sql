-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qrCodeUrl" TEXT;

-- AlterTable
ALTER TABLE "EventRegistration" ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Update" ADD COLUMN     "eventId" TEXT;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
