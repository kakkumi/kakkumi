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

    // 전체 테마 목록
    const allThemes = await prisma.theme.findMany({
        orderBy: { createdAt: "desc" },
    });

    const purchasedThemeIds = new Set(purchases.map((p) => p.themeId));

    return NextResponse.json({
        purchased: purchases.map((p) => ({
            id: p.theme.id,
            name: p.theme.title,
            price: p.theme.price,
            purchasedAt: p.createdAt,
        })),
        all: allThemes.map((t) => ({
            id: t.id,
            name: t.title,
            price: t.price,
            isPurchased: purchasedThemeIds.has(t.id),
        })),
        purchasedCount: purchases.length,
    });
}
