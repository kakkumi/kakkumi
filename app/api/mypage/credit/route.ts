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

    const history = await prisma.$queryRaw<{
        id: string; amount: number; type: string; memo: string | null; createdAt: Date;
    }[]>`
        SELECT id, amount, type, memo, "createdAt"
        FROM "PointHistory"
        WHERE "userId" = ${session.dbId}
        ORDER BY "createdAt" DESC
        LIMIT 50
    `;

    return NextResponse.json({ credit, history });
}
