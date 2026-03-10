/*
  Warnings:

  - A unique constraint covering the columns `[themePackageId]` on the table `MyTheme` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MyTheme" ADD COLUMN     "themePackageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MyTheme_themePackageId_key" ON "MyTheme"("themePackageId");
