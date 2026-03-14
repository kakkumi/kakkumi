-- CreateEnum
CREATE TYPE "MailboxType" AS ENUM ('SUGGESTION', 'BUG_REPORT');

-- CreateEnum
CREATE TYPE "MailboxStatus" AS ENUM ('PENDING', 'REVIEWED');

-- CreateTable
CREATE TABLE "Mailbox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MailboxType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "MailboxStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mailbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mailbox" ADD CONSTRAINT "Mailbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
