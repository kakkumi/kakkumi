import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ purchases: [] });
    }

    try {
        const rows = await prisma.$queryRaw<{
            id: string;
            themeId: string;
            themeTitle: string;
            amount: number;
            status: string;
            createdAt: Date;
            refundedAt: Date | null;
            refundReason: string | null;
        }[]>`
            SELECT
                p.id,
                p."themeId",
                t.title AS "themeTitle",
                p.amount,
                p.status,
                p."createdAt",
                p."refundedAt",
                p."refundReason"
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE p."buyerId" = ${session.dbId}
            ORDER BY p."createdAt" DESC
        `;

        const now = Date.now();
        const purchases = rows.map(p => ({
            ...p,
            // 구매 후 7일 이내 & 유료 & COMPLETED 상태만 환불 가능
            canRefund:
                p.status === "COMPLETED" &&
                p.amount > 0 &&
                (now - new Date(p.createdAt).getTime()) / 86400000 <= 7,
        }));

        return NextResponse.json({ purchases });
    } catch (e) {
        console.error("[mypage/purchases GET]", e);
        // refundedAt/refundReason 컬럼 없는 경우 (db push 전) fallback
        try {
            const rows = await prisma.$queryRaw<{
                id: string;
                themeId: string;
                themeTitle: string;
                amount: number;
                status: string;
                createdAt: Date;
            }[]>`
                SELECT p.id, p."themeId", t.title AS "themeTitle", p.amount, p.status, p."createdAt"
                FROM "Purchase" p
                JOIN "Theme" t ON p."themeId" = t.id
                WHERE p."buyerId" = ${session.dbId}
                ORDER BY p."createdAt" DESC
            `;
            const now = Date.now();
            const purchases = rows.map(p => ({
                ...p,
                refundedAt: null,
                refundReason: null,
                canRefund:
                    p.status === "COMPLETED" &&
                    p.amount > 0 &&
                    (now - new Date(p.createdAt).getTime()) / 86400000 <= 7,
            }));
            return NextResponse.json({ purchases });
        } catch (e2) {
            console.error("[mypage/purchases fallback]", e2);
            return NextResponse.json({ purchases: [] });
        }
    }
}
