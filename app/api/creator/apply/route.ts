import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// 입점 신청 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ application: null });

    const rows = await prisma.$queryRaw<{
        id: string; status: string; reason: string;
        portfolio: string | null; adminNote: string | null; createdAt: Date;
    }[]>`
        SELECT id, status, reason, portfolio, "adminNote", "createdAt"
        FROM "CreatorApplication"
        WHERE "userId" = ${session.dbId}
        ORDER BY "createdAt" DESC
        LIMIT 1
    `;

    return NextResponse.json({ application: rows[0] ?? null });
}

// 입점 신청 제출
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    // 이미 CREATOR/ADMIN이면 신청 불필요
    if (session.role === "CREATOR" || session.role === "ADMIN") {
        return NextResponse.json({ error: "이미 판매 권한이 있습니다." }, { status: 400 });
    }

    // 이미 대기 중인 신청 있는지 확인
    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "CreatorApplication"
        WHERE "userId" = ${session.dbId} AND status = 'PENDING'::"ApplicationStatus"
        LIMIT 1
    `;
    if (existing.length > 0) {
        return NextResponse.json({ error: "이미 검토 중인 신청이 있습니다." }, { status: 409 });
    }

    const { reason, portfolio } = (await req.json()) as { reason: string; portfolio?: string };
    if (!reason?.trim() || reason.trim().length < 10) {
        return NextResponse.json({ error: "신청 사유를 10자 이상 입력해주세요." }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRaw`
        INSERT INTO "CreatorApplication" (id, "userId", reason, portfolio, status, "createdAt", "updatedAt")
        VALUES (${crypto.randomUUID()}, ${session.dbId}, ${reason.trim()}, ${portfolio?.trim() ?? null},
                'PENDING'::"ApplicationStatus", ${now}, ${now})
    `;

    return NextResponse.json({ ok: true });
}
