import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { REFUND_ALLOWED_DAYS, DAY_MS } from "@/lib/constants";

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
            isDownloaded: boolean;
        }[]>`
            SELECT
                p.id,
                p."themeId",
                t.title AS "themeTitle",
                p.amount,
                p.status,
                p."createdAt",
                p."refundedAt",
                p."refundReason",
                COALESCE(p."isDownloaded", false) AS "isDownloaded"
            FROM "Purchase" p
            JOIN "Theme" t ON p."themeId" = t.id
            WHERE p."buyerId" = ${session.dbId}
            ORDER BY p."createdAt" DESC
        `;

        const now = Date.now();
        const purchases = rows.map(p => ({
            ...p,
            canRefund:
                p.status === "COMPLETED" &&
                p.amount > 0 &&
                !p.isDownloaded &&
                (now - new Date(p.createdAt).getTime()) / DAY_MS <= REFUND_ALLOWED_DAYS,
        }));

        return NextResponse.json({ purchases });
    } catch (e) {
        console.error("[mypage/purchases GET]", e);
        try {
            const rows2 = await prisma.$queryRaw<{
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
            const now2 = Date.now();
            const purchases = rows2.map(p => ({
                ...p,
                refundedAt: null,
                refundReason: null,
                isDownloaded: false,
                canRefund:
                    p.status === "COMPLETED" &&
                    p.amount > 0 &&
                    (now2 - new Date(p.createdAt).getTime()) / DAY_MS <= REFUND_ALLOWED_DAYS,
            }));
            return NextResponse.json({ purchases });
        } catch (e2) {
            console.error("[mypage/purchases fallback]", e2);
            return NextResponse.json({ purchases: [] });
        }
    }
}
