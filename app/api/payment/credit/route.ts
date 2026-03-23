import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendPurchaseReceipt } from "@/lib/email";
import { nowKST } from "@/lib/date";
import { validateVersionId, checkAlreadyPurchased, grantPurchaseCredit } from "@/lib/purchase";
import { notifyPurchaseComplete } from "@/lib/notification";

// 적립금으로 테마 구매
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { themeId, versionId: rawVersionId } = (await req.json()) as { themeId: string; versionId?: string };
    if (!themeId) {
        return NextResponse.json({ error: "테마 정보가 없습니다." }, { status: 400 });
    }

    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme || theme.status !== "PUBLISHED") {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }
    if (theme.price === 0) {
        return NextResponse.json({ error: "무료 테마는 적립금 결제가 필요하지 않습니다." }, { status: 400 });
    }

    // versionId 검증 (공통 유틸)
    const versionId = await validateVersionId(rawVersionId);

    // 중복 구매 확인 (공통 유틸)
    if (await checkAlreadyPurchased(session.dbId, themeId)) {
        return NextResponse.json({ error: "이미 구매한 옵션입니다." }, { status: 409 });
    }

    // 적립금 조회
    const rows = await prisma.$queryRaw<{ credit: number }[]>`
        SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const credit = rows[0]?.credit ?? 0;

    if (credit < theme.price) {
        return NextResponse.json({ error: `적립금이 부족합니다. (보유: ${credit}원, 필요: ${theme.price}원)` }, { status: 400 });
    }

    const now = nowKST();
    const purchaseId = crypto.randomUUID();
    const historyId = crypto.randomUUID();

    // 적립금 차감 + 구매 기록 + 포인트 차감 내역
    await prisma.$executeRaw`
        UPDATE "User" SET credit = credit - ${theme.price}, "updatedAt" = NOW() WHERE id = ${session.dbId}
    `;
    await prisma.$executeRaw`
        INSERT INTO "Purchase" (id, "buyerId", "themeId", "versionId", amount, status, "isDownloaded", "createdAt")
        VALUES (${purchaseId}, ${session.dbId}, ${themeId}, ${versionId ?? null}, ${theme.price}, 'COMPLETED'::"PurchaseStatus", false, ${now})
    `;
    await prisma.$executeRaw`
        INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
        VALUES (${historyId}, ${session.dbId}, ${-theme.price}, 'PURCHASE_USE'::"PointType", ${`${theme.title} 구매 (-${theme.price}원)`}, ${now})
    `;

    // 구매 적립금 지급 (공통 유틸)
    await grantPurchaseCredit(session.dbId, theme.price, now);

    // 구매 완료 알림 (공통 유틸 — 알림 설정 체크 포함)
    await notifyPurchaseComplete(session.dbId, theme.title, themeId);

    // 영수증 이메일 발송
    const userRows = await prisma.$queryRaw<{ email: string | null; name: string; nickname: string | null }[]>`
        SELECT email, name, nickname FROM "User" WHERE id = ${session.dbId} LIMIT 1
    `;
    const user = userRows[0];
    if (user?.email && theme.price > 0) {
        await sendPurchaseReceipt({
            to: user.email,
            name: user.nickname ?? user.name,
            themeTitle: theme.title,
            amount: theme.price,
            purchaseDate: now,
        }).catch(e => console.error("[receipt email credit]", e));
    }

    return NextResponse.json({ success: true });
}
