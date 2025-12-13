-- CreateTable
CREATE TABLE "HeroGallery" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "srcUrl" TEXT,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroGallery_pkey" PRIMARY KEY ("id")
);
