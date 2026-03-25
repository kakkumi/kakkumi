import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { notifyNewReview } from "@/lib/notification";
import { REVIEW_REWARD_AMOUNT, REVIEW_MIN_LENGTH, CREDIT_EXPIRY_DAYS, DAY_MS } from "@/lib/constants";

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

    // 최소 글자 수 검증
    if (!content || content.trim().length < REVIEW_MIN_LENGTH) {
        return NextResponse.json({ error: `리뷰 내용은 ${REVIEW_MIN_LENGTH}자 이상 작성해주세요.` }, { status: 400 });
    }

    if (content.length > 200) {
        return NextResponse.json({ error: "리뷰 내용은 200자 이하로 작성해주세요." }, { status: 400 });
    }

    const safeImages = Array.isArray(images) ? images.slice(0, 5) : [];

    // 기존 리뷰 확인
    const existing = await prisma.$queryRaw<{ id: string; rewarded: boolean }[]>`
        SELECT id, rewarded FROM "Review"
        WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
        LIMIT 1
    `;

    if (existing.length > 0) {
        // 기존 리뷰 수정 - 적립금 추가 지급 없음
        await prisma.$executeRaw`
            UPDATE "Review"
            SET rating = ${rating}, content = ${content}, images = ${safeImages}::text[], "updatedAt" = NOW()
            WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
        `;
        return NextResponse.json({ ok: true });
    }

    // 신규 리뷰 - 구매 여부 확인 (1구매 1적립)
    const purchase = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Purchase"
        WHERE "buyerId" = ${session.dbId}
          AND "themeId" = ${themeId}
          AND status = 'COMPLETED'::"PurchaseStatus"
        LIMIT 1
    `;

    const hasPurchased = purchase.length > 0;

    // 리뷰 등록
    await prisma.$executeRaw`
        INSERT INTO "Review" (id, "userId", "themeId", rating, content, images, rewarded, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${session.dbId}, ${themeId}, ${rating}, ${content}, ${safeImages}::text[], ${hasPurchased}, NOW(), NOW())
    `;

    // 구매자에게만 적립금 자동 지급
    if (hasPurchased) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + CREDIT_EXPIRY_DAYS * DAY_MS);

        await prisma.$executeRaw`
            UPDATE "User" SET credit = credit + ${REVIEW_REWARD_AMOUNT}, "updatedAt" = NOW()
            WHERE id = ${session.dbId}
        `;
        await prisma.$executeRaw`
            INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
            VALUES (gen_random_uuid(), ${session.dbId}, ${REVIEW_REWARD_AMOUNT}, 'REVIEW_REWARD'::"PointType", '리뷰 작성 적립', ${expiresAt}, ${now})
        `;
    }

    // 크리에이터에게 알림
    const themeRows = await prisma.$queryRaw<{ creatorId: string; title: string }[]>`
        SELECT "creatorId", title FROM "Theme" WHERE id = ${themeId} LIMIT 1
    `;
    if (themeRows[0] && themeRows[0].creatorId !== session.dbId) {
        await notifyNewReview(themeRows[0].creatorId, themeRows[0].title, themeId);
    }

    return NextResponse.json({
        ok: true,
        rewarded: hasPurchased,
        rewardAmount: hasPurchased ? REVIEW_REWARD_AMOUNT : 0,
    });
}

// DELETE /api/themes/:id/review - 리뷰 삭제 + 적립금 회수
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await props.params;

    // 삭제 전 rewarded 여부 확인
    const review = await prisma.$queryRaw<{ id: string; rewarded: boolean }[]>`
        SELECT id, rewarded FROM "Review"
        WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
        LIMIT 1
    `;

    if (review.length === 0) {
        return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 });
    }

    // 리뷰 삭제
    await prisma.$executeRaw`
        DELETE FROM "Review" WHERE "userId" = ${session.dbId} AND "themeId" = ${themeId}
    `;

    // 적립금을 받은 리뷰라면 회수
    if (review[0].rewarded) {
        const userRows = await prisma.$queryRaw<{ credit: number }[]>`
            SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        const currentCredit = userRows[0]?.credit ?? 0;
        const deduct = Math.min(REVIEW_REWARD_AMOUNT, currentCredit); // 잔액 초과 차감 방지

        if (deduct > 0) {
            const negativeDeduct = -deduct;
            await prisma.$executeRaw`
                UPDATE "User" SET credit = credit - ${deduct}, "updatedAt" = NOW()
                WHERE id = ${session.dbId}
            `;
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "expiresAt", "createdAt")
                VALUES (gen_random_uuid(), ${session.dbId}, ${negativeDeduct}, 'REVIEW_REWARD'::"PointType", '리뷰 삭제로 인한 적립금 회수', NULL, NOW())
            `;
        }
    }

    return NextResponse.json({ ok: true });
}
