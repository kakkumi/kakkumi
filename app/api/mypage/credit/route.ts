import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ credit: 0, history: [] });
    }

    const rows = await prisma.$queryRaw<{ credit: number }[]>`
        SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const credit = rows[0]?.credit ?? 0;

    let history: { id: string; amount: number; type: string; memo: string | null; createdAt: Date; expiresAt: Date | null; }[];
    try {
        history = await prisma.$queryRaw<{
            id: string; amount: number; type: string; memo: string | null; createdAt: Date; expiresAt: Date | null;
        }[]>`
            SELECT id, amount, type, memo, "createdAt", "expiresAt"
            FROM "PointHistory"
            WHERE "userId" = ${session.dbId}
            ORDER BY "createdAt" DESC
            LIMIT 50
        `;
    } catch {
        // expiresAt 컬럼 없는 경우 (db push 전)
        const rows = await prisma.$queryRaw<{ id: string; amount: number; type: string; memo: string | null; createdAt: Date; }[]>`
            SELECT id, amount, type, memo, "createdAt"
            FROM "PointHistory"
            WHERE "userId" = ${session.dbId}
            ORDER BY "createdAt" DESC
            LIMIT 50
        `;
        history = rows.map(r => ({ ...r, expiresAt: null }));
    }

    return NextResponse.json({ credit, history });
}
