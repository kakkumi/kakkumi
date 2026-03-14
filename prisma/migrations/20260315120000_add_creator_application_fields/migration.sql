-- CreatorApplication에 새 필드 추가
ALTER TABLE "CreatorApplication"
  ADD COLUMN IF NOT EXISTS "experience"   BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tools"        TEXT[]    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "sampleImages" TEXT[]    NOT NULL DEFAULT '{}';
