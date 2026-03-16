import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ session: null }, { status: 200 });

    // DB에서 최신 avatarUrl 조회 (쿠키 크기 초과 방지로 쿠키에는 미포함)
    let avatarUrl: string | null = null;
    try {
        const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
            SELECT "avatarUrl" FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        avatarUrl = rows[0]?.avatarUrl ?? null;
    } catch { /* ignore */ }

    return NextResponse.json({ session: { ...session, avatarUrl } }, { status: 200 });
}
