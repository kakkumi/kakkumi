-- Add images column to Inquiry table
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "images" text[] NOT NULL DEFAULT '{}';

-- Add images column to Mailbox table
ALTER TABLE "Mailbox" ADD COLUMN IF NOT EXISTS "images" text[] NOT NULL DEFAULT '{}';

