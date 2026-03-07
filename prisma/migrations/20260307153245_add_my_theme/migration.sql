-- CreateTable
CREATE TABLE "MyThemeFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MyThemeFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MyTheme" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "previewImageUrl" TEXT,
    "trashed" BOOLEAN NOT NULL DEFAULT false,
    "trashedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MyTheme_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MyThemeFolder" ADD CONSTRAINT "MyThemeFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyTheme" ADD CONSTRAINT "MyTheme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MyTheme" ADD CONSTRAINT "MyTheme_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MyThemeFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
