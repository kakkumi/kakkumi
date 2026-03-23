import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { nowKST } from "@/lib/date";
import { SESSION_COOKIE_NAME, WITHDRAW_CONFIRM_TEXT } from "@/lib/constants";

export async function DELETE(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 탈퇴 확인 문구 검증
    const body = await req.json() as { confirm?: string };
    if (body.confirm !== WITHDRAW_CONFIRM_TEXT) {
        return NextResponse.json({ error: "확인 문구가 올바르지 않습니다." }, { status: 400 });
    }

    try {
        const now = nowKST();

        // ① 먼저 현재 적립금 조회 (UPDATE 전에 해야 올바른 값을 얻을 수 있음)
        const creditRows = await prisma.$queryRaw<{ credit: number }[]>`
            SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        const currentCredit = creditRows[0]?.credit ?? 0;

        // ② ACTIVE 구독이 있으면 CANCELLED 처리 — 빌링키를 통한 추가 과금 방지
        await prisma.$executeRaw`
            UPDATE "Subscription"
            SET status = 'CANCELLED'::"SubscriptionStatus",
                "cancelledAt" = ${now},
                "updatedAt"   = ${now}
            WHERE "userId" = ${session.dbId}
              AND status = 'ACTIVE'::"SubscriptionStatus"
        `;

        // ② soft delete: deletedAt 설정 + 적립금 전액 소멸 + 개인정보 익명화
        await prisma.$executeRaw`
            UPDATE "User"
            SET
                "deletedAt"   = ${now},
                credit        = 0,
                nickname      = NULL,
                email         = NULL,
                name          = '탈퇴한 사용자',
                image         = NULL,
                "avatarUrl"   = NULL,
                "referralCode" = NULL,
                "updatedAt"   = ${now}
            WHERE id = ${session.dbId}
        `;

        // ③ UPDATE 전에 조회한 적립금으로 소멸 이력 기록
        if (currentCredit > 0) {
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
                VALUES (
                    ${crypto.randomUUID()},
                    ${session.dbId},
                    ${-currentCredit},
                    'REFUND'::"PointType",
                    ${'회원 탈퇴로 인한 적립금 소멸'},
                    ${now}
                )
            `;
        }

        // 세션 쿠키 삭제
        const res = NextResponse.json({ ok: true });
        res.cookies.set({
            name: SESSION_COOKIE_NAME,
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
        });
        return res;
    } catch (e) {
        console.error("[withdraw DELETE]", e);
        return NextResponse.json({ error: "탈퇴 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
