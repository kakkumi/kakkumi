import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 로그인한 유저가 보유한 테마 DB ID 목록 반환
export async function GET() {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ ownedIds: [] });
    }

    const purchases = await prisma.purchase.findMany({
        where: { buyerId: session.dbId, status: "COMPLETED" },
        select: { themeId: true },
    });

    return NextResponse.json({ ownedIds: purchases.map((p) => p.themeId) });
}
