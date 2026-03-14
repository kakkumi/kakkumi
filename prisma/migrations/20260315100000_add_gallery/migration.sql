-- CreateTable GalleryPost
CREATE TABLE "GalleryPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeName" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "storeLink" TEXT,
    "themeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GalleryPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable GalleryLike
CREATE TABLE "GalleryLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable GalleryReaction
CREATE TABLE "GalleryReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable GalleryComment
CREATE TABLE "GalleryComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable GalleryCommentReport
CREATE TABLE "GalleryCommentReport" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "isHandled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GalleryCommentReport_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "GalleryLike_userId_postId_key" ON "GalleryLike"("userId", "postId");
CREATE UNIQUE INDEX "GalleryReaction_userId_postId_emoji_key" ON "GalleryReaction"("userId", "postId", "emoji");
CREATE UNIQUE INDEX "GalleryCommentReport_commentId_reporterId_key" ON "GalleryCommentReport"("commentId", "reporterId");

-- Foreign Keys
ALTER TABLE "GalleryPost" ADD CONSTRAINT "GalleryPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryLike" ADD CONSTRAINT "GalleryLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryLike" ADD CONSTRAINT "GalleryLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "GalleryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryReaction" ADD CONSTRAINT "GalleryReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryReaction" ADD CONSTRAINT "GalleryReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "GalleryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryComment" ADD CONSTRAINT "GalleryComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "GalleryPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryComment" ADD CONSTRAINT "GalleryComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryCommentReport" ADD CONSTRAINT "GalleryCommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "GalleryComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryCommentReport" ADD CONSTRAINT "GalleryCommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
