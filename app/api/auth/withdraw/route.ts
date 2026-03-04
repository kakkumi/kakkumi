import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "kakkumi_session";

export async function DELETE(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 탈퇴 확인 문구 검증
    const body = await req.json() as { confirm?: string };
    if (body.confirm !== "탈퇴하겠습니다") {
        return NextResponse.json({ error: "확인 문구가 올바르지 않습니다." }, { status: 400 });
    }

    try {
        // Purchase, Theme(관계) → User 순서로 삭제
        // Purchase는 onDelete가 없으므로 직접 삭제
        await prisma.$executeRaw`DELETE FROM "Purchase" WHERE "buyerId" = ${session.dbId}`;

        // 내가 만든 테마의 구매 기록도 삭제 (테마 삭제 전)
        await prisma.$executeRaw`
            DELETE FROM "Purchase" WHERE "themeId" IN (
                SELECT id FROM "Theme" WHERE "creatorId" = ${session.dbId}
            )
        `;

        // 내 테마 삭제 (ThemeVersion은 Cascade)
        await prisma.$executeRaw`DELETE FROM "Theme" WHERE "creatorId" = ${session.dbId}`;

        // 유저 삭제
        await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${session.dbId}`;

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
    } catch {
        return NextResponse.json({ error: "탈퇴 처리 중 오류가 발생했습니다." }, { status: 500 });
    }
}
