-- CreateEnum
CREATE TYPE "ThemeOptionStatus" AS ENUM ('ACTIVE', 'PENDING_UPDATE', 'PENDING_NEW');

-- CreateTable
CREATE TABLE "ThemeOption" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ThemeOptionStatus" NOT NULL DEFAULT 'PENDING_NEW',
    "adminNote" TEXT,
    "fileUrl" TEXT,
    "configJson" JSONB,
    "imageData" JSONB,
    "myThemeId" TEXT,
    "pendingFileUrl" TEXT,
    "pendingConfigJson" JSONB,
    "pendingImageData" JSONB,
    "pendingMyThemeId" TEXT,
    "pendingAdminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThemeOption" ADD CONSTRAINT "ThemeOption_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
