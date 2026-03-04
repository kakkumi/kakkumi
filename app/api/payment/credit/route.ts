import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 적립금으로 테마 구매
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { themeId } = (await req.json()) as { themeId: string };
    if (!themeId) {
        return NextResponse.json({ error: "테마 정보가 없습니다." }, { status: 400 });
    }

    // 테마 조회
    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme || theme.status !== "PUBLISHED") {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }
    if (theme.price === 0) {
        return NextResponse.json({ error: "무료 테마는 적립금 결제가 필요하지 않습니다." }, { status: 400 });
    }

    // 이미 구매 여부
    const existing = await prisma.purchase.findFirst({
        where: { buyerId: session.dbId, themeId, status: "COMPLETED" },
    });
    if (existing) {
        return NextResponse.json({ error: "이미 구매한 테마입니다." }, { status: 409 });
    }

    // 적립금 조회
    const rows = await prisma.$queryRaw<{ credit: number }[]>`
        SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const credit = rows[0]?.credit ?? 0;

    if (credit < theme.price) {
        return NextResponse.json({ error: `적립금이 부족합니다. (보유: ${credit}원, 필요: ${theme.price}원)` }, { status: 400 });
    }

    const now = new Date();
    const purchaseId = crypto.randomUUID();
    const historyId = crypto.randomUUID();

    // 적립금 차감 + 구매 기록 + 포인트 차감 내역
    await prisma.$executeRaw`
        UPDATE "User" SET credit = credit - ${theme.price}, "updatedAt" = NOW() WHERE id = ${session.dbId}
    `;
    await prisma.$executeRaw`
        INSERT INTO "Purchase" (id, "buyerId", "themeId", amount, status, "createdAt")
        VALUES (${purchaseId}, ${session.dbId}, ${themeId}, ${theme.price}, 'COMPLETED'::"PurchaseStatus", ${now})
    `;
    await prisma.$executeRaw`
        INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
        VALUES (${historyId}, ${session.dbId}, ${-theme.price}, 'PURCHASE_USE'::"PointType", ${`${theme.title} 구매 (-${theme.price}원)`}, ${now})
    `;

    // 구매 적립금 지급
    function getPurchaseCredit(price: number): number {
        if (price === 0) return 0;
        if (price <= 500) return 10;
        if (price <= 1000) return 20;
        if (price <= 1500) return 30;
        return 50;
    }
    const reward = getPurchaseCredit(theme.price);
    if (reward > 0) {
        await prisma.$executeRaw`
            UPDATE "User" SET credit = credit + ${reward}, "updatedAt" = NOW() WHERE id = ${session.dbId}
        `;
        await prisma.$executeRaw`
            INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
            VALUES (${crypto.randomUUID()}, ${session.dbId}, ${reward}, 'ADMIN_GRANT'::"PointType", ${`구매 적립 (+${reward}원)`}, ${now})
        `;
    }

    return NextResponse.json({ success: true });
}
