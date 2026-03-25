import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const refunds = await prisma.$queryRaw<{
            id: string; amount: number; status: string; createdAt: Date;
            refundReason: string | null; refundedAt: Date | null;
            buyerNickname: string | null; buyerName: string; buyerId: string;
            themeTitle: string; creatorNickname: string | null; creatorName: string;
        }[]>`
            SELECT p.id, p.amount, p.status, p."createdAt",
                   p."refundReason", p."refundedAt",
                   buyer.id AS "buyerId",
                   buyer.nickname AS "buyerNickname", buyer.name AS "buyerName",
                   t.title AS "themeTitle",
                   creator.nickname AS "creatorNickname", creator.name AS "creatorName"
            FROM "Purchase" p
            JOIN "User" buyer ON p."buyerId" = buyer.id
            JOIN "Theme" t ON p."themeId" = t.id
            JOIN "User" creator ON t."creatorId" = creator.id
            WHERE p.status IN ('REFUND_REQUESTED', 'REFUNDED')
            ORDER BY p."createdAt" DESC
        `;
        return NextResponse.json({
            refunds: refunds.map(r => ({
                ...r,
                createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
                refundedAt: r.refundedAt instanceof Date ? r.refundedAt.toISOString() : (r.refundedAt ? String(r.refundedAt) : null),
            })),
        });
    } catch (e) {
        console.error("[admin/refunds GET]", e);
        return NextResponse.json({ refunds: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { purchaseId, action } = await req.json() as {
            purchaseId: string;
            action: "approve" | "reject";
        };

        const rows = await prisma.$queryRaw<{ buyerId: string; themeTitle: string }[]>`
            SELECT p."buyerId", t.title AS "themeTitle"
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE p.id = ${purchaseId} LIMIT 1
        `;
        const purchase = rows[0];

        if (action === "approve") {
            await prisma.$executeRaw`
                UPDATE "Purchase"
                SET status = 'REFUNDED'::"PurchaseStatus",
                    "refundedAt" = NOW()
                WHERE id = ${purchaseId}
            `;
            if (purchase) {
                await createNotification({
                    userId: purchase.buyerId,
                    type: "REFUND_COMPLETE",
                    title: "환불이 완료되었습니다",
                    body: `${purchase.themeTitle} 환불 처리가 완료되었습니다.`,
                    force: true,
                }).catch(() => null);
            }
        } else if (action === "reject") {
            await prisma.$executeRaw`
                UPDATE "Purchase"
                SET status = 'COMPLETED'::"PurchaseStatus",
                    "refundReason" = NULL
                WHERE id = ${purchaseId}
            `;
            if (purchase) {
                await createNotification({
                    userId: purchase.buyerId,
                    type: "SYSTEM",
                    title: "환불 요청이 거절되었습니다",
                    body: `${purchase.themeTitle}의 환불 요청이 거절되었습니다. 자세한 내용은 1:1 문의를 이용해 주세요.`,
                    force: true,
                }).catch(() => null);
            }
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/refunds PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

