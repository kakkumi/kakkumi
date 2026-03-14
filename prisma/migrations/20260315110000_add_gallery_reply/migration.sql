-- GalleryComment에 parentId 컬럼 추가 (대댓글 지원)
ALTER TABLE "GalleryComment" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

ALTER TABLE "GalleryComment"
  ADD CONSTRAINT "GalleryComment_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "GalleryComment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
