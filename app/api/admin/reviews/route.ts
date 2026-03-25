import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const reviews = await prisma.$queryRaw<{
            id: string; rating: number; content: string | null;
            images: string[]; rewarded: boolean; createdAt: Date;
            userNickname: string | null; userName: string;
            themeTitle: string; themeId: string;
        }[]>`
            SELECT r.id, r.rating, r.content, r.images, r.rewarded, r."createdAt",
                   u.nickname AS "userNickname", u.name AS "userName",
                   t.title AS "themeTitle", t.id AS "themeId"
            FROM "Review" r
            JOIN "User" u ON r."userId" = u.id
            JOIN "Theme" t ON r."themeId" = t.id
            ORDER BY r."createdAt" DESC
        `;
        return NextResponse.json({
            reviews: reviews.map(r => ({
                ...r,
                createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
            })),
        });
    } catch (e) {
        console.error("[admin/reviews GET]", e);
        return NextResponse.json({ reviews: [] });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { reviewId, action } = await req.json() as { reviewId: string; action: "delete" };
        if (action === "delete") {
            await prisma.$executeRaw`DELETE FROM "Review" WHERE id = ${reviewId}`;
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/reviews PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}

