import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();

    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 구매한 테마 목록
    const purchases = await prisma.purchase.findMany({
        where: { buyerId: session.dbId, status: "COMPLETED" },
        include: { theme: true },
        orderBy: { createdAt: "desc" },
    });

    // 내가 만든 테마 목록
    const myThemes = await prisma.theme.findMany({
        where: { creatorId: session.dbId },
        orderBy: { createdAt: "desc" },
    });

    const purchasedList = purchases.map((p) => ({
        id: p.theme.id,
        name: p.theme.title,
        price: p.theme.price,
        purchasedAt: p.createdAt,
    }));

    const mineList = myThemes.map((t) => ({
        id: t.id,
        name: t.title,
        price: t.price,
    }));

    // 전체 = 내 테마 + 구매한 테마 (중복 제거)
    const purchasedIds = new Set(purchasedList.map((p) => p.id));
    const allList = [
        ...mineList.map((t) => ({ ...t, tag: "내 테마" as const })),
        ...purchasedList
            .filter((p) => !mineList.some((m) => m.id === p.id))
            .map((p) => ({ ...p, tag: "구매" as const })),
    ];

    return NextResponse.json({
        mine: mineList,
        purchased: purchasedList,
        all: allList,
        purchasedCount: purchases.length,
        mineCount: myThemes.length,
    });
}
