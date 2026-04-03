import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 전체 우체통 목록 조회
export async function GET(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const typeFilter = searchParams.get("type"); // "SUGGESTION" | "BUG_REPORT" | null

        type MailboxRow = {
            id: string; type: string; title: string; content: string;
            images: string[];
            status: string; adminNote: string | null; createdAt: Date;
            userNickname: string | null; userName: string;
        };

        let mailboxes: MailboxRow[];
        if (typeFilter === "SUGGESTION" || typeFilter === "BUG_REPORT") {
            mailboxes = await prisma.$queryRaw<MailboxRow[]>`
                SELECT m.id, m.type::text, m.title, m.content, m.images, m.status::text,
                       m."adminNote", m."createdAt",
                       u.nickname AS "userNickname", u.name AS "userName"
                FROM "Mailbox" m
                JOIN "User" u ON m."userId" = u.id
                WHERE m.type = ${typeFilter}::"MailboxType"
                ORDER BY m."createdAt" DESC
            `;
        } else {
            mailboxes = await prisma.$queryRaw<MailboxRow[]>`
                SELECT m.id, m.type::text, m.title, m.content, m.images, m.status::text,
                       m."adminNote", m."createdAt",
                       u.nickname AS "userNickname", u.name AS "userName"
                FROM "Mailbox" m
                JOIN "User" u ON m."userId" = u.id
                ORDER BY m."createdAt" DESC
            `;
        }

        return NextResponse.json({
            mailboxes: mailboxes.map((m) => ({
                ...m,
                createdAt: m.createdAt.toISOString(),
            })),
        });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 우체통 상태 업데이트
export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { mailboxId, status, adminNote } = await req.json() as {
            mailboxId: string;
            status: "PENDING" | "REVIEWED";
            adminNote?: string;
        };

        if (!mailboxId || !status) {
            return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
        }

        await prisma.$executeRaw`
            UPDATE "Mailbox"
            SET status = ${status}::"MailboxStatus",
                "adminNote" = ${adminNote ?? null},
                "updatedAt" = NOW()
            WHERE id = ${mailboxId}
        `;

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
