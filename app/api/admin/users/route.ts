import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 전체 유저 목록
export async function GET() {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const users = await prisma.$queryRaw<{
            id: string; name: string; nickname: string | null; email: string | null;
            role: string; isSuspended: boolean; createdAt: Date; purchaseCount: bigint;
        }[]>`
            SELECT u.id, u.name, u.nickname, u.email, u.role, u."isSuspended", u."createdAt",
                   COUNT(p.id) AS "purchaseCount"
            FROM "User" u
            LEFT JOIN "Purchase" p ON p."buyerId" = u.id AND p.status = 'COMPLETED'
            GROUP BY u.id
            ORDER BY u."createdAt" DESC
        `;
        return NextResponse.json({
            users: users.map((u) => ({ ...u, purchaseCount: Number(u.purchaseCount) })),
        });
    } catch (e) {
        console.error("[admin/users GET]", e);
        return NextResponse.json({ users: [] });
    }
}

// 유저 정지 / 해제 / 탈퇴 처리
export async function PATCH(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { userId, action } = (await req.json()) as {
            userId: string;
            action: "suspend" | "unsuspend" | "delete";
        };

        const ALLOWED_ACTIONS = ["suspend", "unsuspend", "delete"] as const;
        if (!userId || !ALLOWED_ACTIONS.includes(action)) {
            return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
        }

        if (action === "suspend") {
            await prisma.$executeRaw`UPDATE "User" SET "isSuspended" = true, "updatedAt" = NOW() WHERE id = ${userId}`;
        } else if (action === "unsuspend") {
            await prisma.$executeRaw`UPDATE "User" SET "isSuspended" = false, "updatedAt" = NOW() WHERE id = ${userId}`;
        } else if (action === "delete") {
            // 트랜잭션으로 관련 데이터를 모두 삭제 — 중간 실패 시 롤백 보장
            await prisma.$transaction([
                // 관련 데이터 순서대로 삭제 (FK 제약 고려)
                prisma.$executeRaw`DELETE FROM "Review" WHERE "userId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "ThemeLike" WHERE "userId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "Follow" WHERE "followerId" = ${userId} OR "followingId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "Notification" WHERE "userId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "PointHistory" WHERE "userId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "Purchase" WHERE "buyerId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "Purchase" WHERE "themeId" IN (SELECT id FROM "Theme" WHERE "creatorId" = ${userId})`,
                prisma.$executeRaw`DELETE FROM "ThemeLike" WHERE "themeId" IN (SELECT id FROM "Theme" WHERE "creatorId" = ${userId})`,
                prisma.$executeRaw`DELETE FROM "Review" WHERE "themeId" IN (SELECT id FROM "Theme" WHERE "creatorId" = ${userId})`,
                prisma.$executeRaw`DELETE FROM "Theme" WHERE "creatorId" = ${userId}`,
                prisma.$executeRaw`DELETE FROM "User" WHERE id = ${userId}`,
            ]);
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/users PATCH]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}
