import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { notifyNewReview } from "@/lib/notification";

// GET /api/themes/:id/review - 리뷰 목록 + 내 리뷰 조회
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    const { id: themeId } = await props.params;

    const reviews = await prisma.$queryRaw<{
        id: string;
        userId: string;
        rating: number;
        content: string | null;
        images: string[];
        createdAt: Date;
        nickname: string | null;
        name: string;
        avatarUrl: string | null;
    }[]>`
        SELECT r.id, r."userId", r.rating, r.content, r.images, r."createdAt",
               u.nickname, u.name, u."avatarUrl"
        FROM "Review" r
        JOIN "User" u ON u.id = r."userId"
        WHERE r."themeId" = ${themeId}
        ORDER BY r."createdAt" DESC
    `;

    const myReview = session?.dbId
        ? reviews.find(r => r.userId === session.dbId) ?? null
        : null;

    const avgRating = reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, myReview, avgRating, reviewCount: reviews.length });
}

// POST /api/themes/:id/review - 리뷰 작성/수정
export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await props.params;
    const { rating, content, images } = await req.json() as { rating: number; content?: string; images?: string[] };

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "별점은 1~5 사이여야 합니다." }, { status: 400 });
    }

    if (content && content.length > 200) {
        return NextResponse.json({ error: "리뷰 내용은 200자 이하로 작성해주세요." }, { status: 400 });
    }

    const safeImages = Array.isArray(images) ? images.slice(0, 5) : [];

    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Review" WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId} LIMIT 1
    `;

    if (existing.length > 0) {
        await prisma.$executeRaw`
            UPDATE "Review" SET rating = ${rating}, content = ${content ?? null}, images = ${safeImages}::text[], "updatedAt" = NOW()
            WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
        `;
    } else {
        await prisma.$executeRaw`
            INSERT INTO "Review" (id, "userId", "themeId", rating, content, images, "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${session.dbId}, ${themeId}, ${rating}, ${content ?? null}, ${safeImages}::text[], NOW(), NOW())
        `;
        // 신규 리뷰 등록 시 크리에이터에게 알림 (알림 설정 체크)
        const themeRows = await prisma.$queryRaw<{ creatorId: string; title: string }[]>`
            SELECT "creatorId", title FROM "Theme" WHERE id = ${themeId} LIMIT 1
        `;
        if (themeRows[0] && themeRows[0].creatorId !== session.dbId) {
            await notifyNewReview(themeRows[0].creatorId, themeRows[0].title, themeId);
        }
    }

    return NextResponse.json({ ok: true });
}

// DELETE /api/themes/:id/review - 리뷰 삭제
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await props.params;

    await prisma.$executeRaw`
        DELETE FROM "Review" WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
    `;

    return NextResponse.json({ ok: true });
}
