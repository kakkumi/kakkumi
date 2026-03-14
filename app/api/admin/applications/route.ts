import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendCreatorApproved, sendCreatorRejected } from "@/lib/email";

// 입점 신청 목록 조회 (관리자)
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId || session.role !== "ADMIN") {
        return NextResponse.json({ error: "권한 없음" }, { status: 403 });
    }

    const rows = await prisma.$queryRaw<{
        id: string; status: string; reason: string; portfolio: string | null;
        experience: boolean; tools: string[]; sampleImages: string[];
        adminNote: string | null; createdAt: Date;
        userId: string; userNickname: string | null; userName: string; userEmail: string | null;
    }[]>`
        SELECT a.id, a.status, a.reason, a.portfolio,
               a.experience, a.tools, a."sampleImages",
               a."adminNote", a."createdAt",
               u.id AS "userId", u.nickname AS "userNickname",
               u.name AS "userName", u.email AS "userEmail"
        FROM "CreatorApplication" a
        JOIN "User" u ON a."userId" = u.id
        ORDER BY a."createdAt" DESC
    `;

    return NextResponse.json({
        applications: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
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

    if (action === "REJECTED" && !adminNote?.trim()) {
        return NextResponse.json({ error: "반려 사유를 입력해주세요." }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<{ userId: string }[]>`
        SELECT "userId" FROM "CreatorApplication" WHERE id = ${applicationId} LIMIT 1
    `;
    if (!rows[0]) return NextResponse.json({ error: "신청을 찾을 수 없습니다." }, { status: 404 });

    const userId = rows[0].userId;
    const now = new Date();

    await prisma.$executeRaw`
        UPDATE "CreatorApplication"
        SET status = ${action}::"ApplicationStatus",
            "adminNote" = ${adminNote?.trim() ?? null},
            "updatedAt" = ${now}
        WHERE id = ${applicationId}
    `;

    if (action === "APPROVED") {
        await prisma.$executeRaw`
            UPDATE "User" SET role = 'CREATOR'::"Role", "updatedAt" = ${now}
            WHERE id = ${userId}
        `;
    }

    // 이메일 발송
    const userRows = await prisma.$queryRaw<{ name: string; email: string | null }[]>`
        SELECT name, email FROM "User" WHERE id = ${userId} LIMIT 1
    `;
    const u = userRows[0];
    if (u?.email) {
        if (action === "APPROVED") {
            await sendCreatorApproved({ to: u.email, name: u.name }).catch(() => {});
        } else {
            await sendCreatorRejected({ to: u.email, name: u.name, reason: adminNote ?? "" }).catch(() => {});
        }
    }

    return NextResponse.json({ ok: true });
}
