-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "versionId" TEXT;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ThemeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
