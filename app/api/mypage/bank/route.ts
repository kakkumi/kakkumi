import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ bankInfo: null });
    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
        return NextResponse.json({ bankInfo: null });
    }

    const rows = await prisma.$queryRaw<{
        bankName: string | null;
        accountNumber: string | null;
        accountHolder: string | null;
    }[]>`
        SELECT "bankName", "accountNumber", "accountHolder"
        FROM "User"
        WHERE id = ${session.dbId}
        LIMIT 1
    `;

    return NextResponse.json({ bankInfo: rows[0] ?? null });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (session.role !== "CREATOR" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "크리에이터만 이용 가능합니다." }, { status: 403 });
    }

    const { bankName, accountNumber, accountHolder } = await req.json() as {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };

    if (!bankName?.trim() || !accountNumber?.trim() || !accountHolder?.trim()) {
        return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRaw`
        UPDATE "User"
        SET "bankName" = ${bankName.trim()},
            "accountNumber" = ${accountNumber.trim()},
            "accountHolder" = ${accountHolder.trim()},
            "updatedAt" = ${now}
        WHERE id = ${session.dbId}
    `;

    return NextResponse.json({ ok: true });
}
