-- User 테이블에 정산 계좌 필드 추가
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "bankName"       TEXT,
  ADD COLUMN IF NOT EXISTS "accountNumber"  TEXT,
  ADD COLUMN IF NOT EXISTS "accountHolder"  TEXT;
