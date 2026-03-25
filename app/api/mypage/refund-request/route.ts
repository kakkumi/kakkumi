import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

    try {
        const { purchaseId, reason } = await req.json() as { purchaseId: string; reason: string };
        if (!reason?.trim()) return NextResponse.json({ error: "환불 사유를 입력하세요." }, { status: 400 });

        const rows = await prisma.$queryRaw<{ id: string; status: string }[]>`
            SELECT id, status FROM "Purchase"
            WHERE id = ${purchaseId} AND "buyerId" = ${session.dbId}
            LIMIT 1
        `;
        if (rows.length === 0) return NextResponse.json({ error: "구매 내역을 찾을 수 없습니다." }, { status: 404 });
        if (rows[0].status !== "COMPLETED") {
            return NextResponse.json({ error: "환불 요청이 불가능한 상태입니다." }, { status: 400 });
        }

        await prisma.$executeRaw`
            UPDATE "Purchase"
            SET status = 'REFUND_REQUESTED'::"PurchaseStatus",
                "refundReason" = ${reason.trim()}
            WHERE id = ${purchaseId}
        `;
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[mypage/refund-request POST]", e);
        return NextResponse.json({ error: "요청 실패" }, { status: 500 });
    }
}
