import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 입점 신청 목록 조회 (관리자)
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId || session.role !== "ADMIN") {
        return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<{
        id: string; status: string; reason: string; portfolio: string | null;
        adminNote: string | null; createdAt: Date;
        userId: string; userNickname: string | null; userName: string; userEmail: string | null;
    }[]>`
        SELECT a.id, a.status, a.reason, a.portfolio, a."adminNote", a."createdAt",
               u.id AS "userId", u.nickname AS "userNickname", u.name AS "userName", u.email AS "userEmail"
        FROM "CreatorApplication" a
        JOIN "User" u ON a."userId" = u.id
        ORDER BY a."createdAt" DESC
    `;

    return NextResponse.json({ applications: rows });
}

// 신청 승인/반려 (관리자)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId || session.role !== "ADMIN") {
        return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const { applicationId, action, adminNote } = (await req.json()) as {
        applicationId: string;
        action: "APPROVED" | "REJECTED";
        adminNote?: string;
    };

    if (!applicationId || !["APPROVED", "REJECTED"].includes(action)) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    // 신청 정보 조회
    const rows = await prisma.$queryRaw<{ userId: string }[]>`
        SELECT "userId" FROM "CreatorApplication" WHERE id = ${applicationId} LIMIT 1
    `;
    if (!rows[0]) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });

    const now = new Date();

    // 신청 상태 업데이트
    await prisma.$executeRaw`
        UPDATE "CreatorApplication"
        SET status = ${action}::"ApplicationStatus",
            "adminNote" = ${adminNote ?? null},
            "updatedAt" = ${now}
        WHERE id = ${applicationId}
    `;

    // 승인 시 유저 role을 CREATOR로 변경
    if (action === "APPROVED") {
        await prisma.$executeRaw`
            UPDATE "User" SET role = 'CREATOR'::"Role", "updatedAt" = ${now}
            WHERE id = ${rows[0].userId}
        `;
    }

    return NextResponse.json({ ok: true });
}
