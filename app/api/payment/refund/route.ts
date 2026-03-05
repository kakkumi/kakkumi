import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { nowKST } from "@/lib/date";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { purchaseId, reason } = (await req.json()) as { purchaseId: string; reason?: string };
    if (!purchaseId) {
        return NextResponse.json({ error: "purchaseId 필요" }, { status: 400 });
    }

    try {
        // 구매 내역 확인
        const purchases = await prisma.$queryRaw<{
            id: string;
            buyerId: string;
            amount: number;
            pgTransactionId: string | null;
            status: string;
            createdAt: Date;
            themeTitle: string;
        }[]>`
            SELECT p.id, p."buyerId", p.amount, p."pgTransactionId", p.status, p."createdAt", t.title AS "themeTitle"
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE p.id = ${purchaseId} AND p."buyerId" = ${session.dbId}
            LIMIT 1
        `;

        if (purchases.length === 0) {
            return NextResponse.json({ error: "구매 내역을 찾을 수 없습니다." }, { status: 404 });
        }

        const purchase = purchases[0];

        if (purchase.status !== "COMPLETED") {
            return NextResponse.json({ error: "환불 가능한 구매 내역이 아닙니다." }, { status: 400 });
        }

        // 구매 후 7일 이내만 환불 가능
        const daysSincePurchase = (Date.now() - new Date(purchase.createdAt).getTime()) / 86400000;
        if (daysSincePurchase > 7) {
            return NextResponse.json({ error: "구매 후 7일이 지나 환불이 불가합니다." }, { status: 400 });
        }

        const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
        if (!secretKey) {
            return NextResponse.json({ error: "결제 설정 오류입니다." }, { status: 500 });
        }

        // 토스페이먼츠 환불 요청 (pgTransactionId가 있는 경우)
        if (purchase.pgTransactionId) {
            const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString("base64");
            const cancelResponse = await fetch(
                `https://api.tosspayments.com/v1/payments/${purchase.pgTransactionId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${encryptedSecretKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cancelReason: reason ?? "고객 요청 환불" }),
                }
            );

            if (!cancelResponse.ok) {
                const err = (await cancelResponse.json()) as { message?: string };
                return NextResponse.json(
                    { error: err.message ?? "환불 처리에 실패했습니다." },
                    { status: 400 }
                );
            }
        }

        const now = nowKST();

        // 구매 상태 REFUNDED로 변경
        try {
            await prisma.$executeRaw`
                UPDATE "Purchase"
                SET status = 'REFUNDED'::"PurchaseStatus", "refundReason" = ${reason ?? "고객 요청"}, "refundedAt" = ${now}
                WHERE id = ${purchaseId}
            `;
        } catch {
            // refundReason/refundedAt 컬럼 없는 경우 (db push 전)
            await prisma.$executeRaw`
                UPDATE "Purchase"
                SET status = 'REFUNDED'::"PurchaseStatus"
                WHERE id = ${purchaseId}
            `;
        }

        // 적립금 환불 지급
        if (purchase.amount > 0) {
            const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
            await prisma.$executeRaw`
                UPDATE "User" SET credit = credit + ${purchase.amount}, "updatedAt" = NOW() WHERE id = ${session.dbId}
            `;
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
                VALUES (${crypto.randomUUID()}, ${session.dbId}, ${purchase.amount}, 'REFUND'::"PointType", ${`환불 적립금: ${purchase.themeTitle}`}, ${expiresAt}, ${now})
            `;
        }

        // 환불 완료 알림
        await prisma.$executeRaw`
            INSERT INTO "Notification" (id, "userId", type, title, body, "linkUrl", "createdAt")
            VALUES (
                ${crypto.randomUUID()},
                ${session.dbId},
                'REFUND_COMPLETE'::"NotificationType",
                ${'환불 완료'},
                ${`"${purchase.themeTitle}" 환불이 완료되었습니다. ${purchase.amount.toLocaleString()}원이 적립금으로 지급됩니다.`},
                ${'/mypage'},
                ${now}
            )
        `;

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[refund POST]", e);
        return NextResponse.json({ error: "환불 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
