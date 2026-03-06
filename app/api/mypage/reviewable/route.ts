import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 구매했지만 리뷰를 아직 안 쓴 테마 목록
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ items: [] });
    }

    try {
        const items = await prisma.$queryRaw<{
            purchaseId: string;
            themeId: string;
            themeTitle: string;
            thumbnailUrl: string | null;
            amount: number;
            purchasedAt: Date;
        }[]>`
            SELECT
                p.id AS "purchaseId",
                t.id AS "themeId",
                t.title AS "themeTitle",
                t."thumbnailUrl",
                p.amount,
                p."createdAt" AS "purchasedAt"
            FROM "Purchase" p
            JOIN "Theme" t ON t.id = p."themeId"
            WHERE p."buyerId" = ${session.dbId}
              AND p.status = 'COMPLETED'
              AND NOT EXISTS (
                  SELECT 1 FROM "Review" r
                  WHERE r."userId" = ${session.dbId} AND r."themeId" = p."themeId"
              )
            ORDER BY p."createdAt" DESC
        `;
        return NextResponse.json({ items });
    } catch (e) {
        console.error("[mypage/reviewable GET]", e);
        return NextResponse.json({ items: [], error: "서버 오류" }, { status: 500 });
    }
}
