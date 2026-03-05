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

        // soft delete: deletedAt 설정 + 적립금 전액 소멸 + 닉네임/개인정보 익명화
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

        // 적립금 소멸 내역 기록
        const hadCredit = await prisma.$queryRaw<{ credit: number }[]>`
            SELECT credit FROM "User" WHERE id = ${session.dbId} LIMIT 1
        `;
        if ((hadCredit[0]?.credit ?? 0) > 0) {
            await prisma.$executeRaw`
                INSERT INTO "PointHistory" (id, "userId", amount, type, memo, "createdAt")
                VALUES (
                    ${crypto.randomUUID()},
                    ${session.dbId},
                    ${-(hadCredit[0].credit)},
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
