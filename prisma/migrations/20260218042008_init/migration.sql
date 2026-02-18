-- CreateTable
CREATE TABLE "Translation" (
    "storyId" INTEGER NOT NULL,
    "titleJa" TEXT NOT NULL,
    "summaryJa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("storyId")
);
