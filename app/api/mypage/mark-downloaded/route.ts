import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { purchaseId } = await req.json() as { purchaseId: string };
    if (!purchaseId) return NextResponse.json({ error: "purchaseId가 필요합니다." }, { status: 400 });

    // 본인 구매 건인지 확인
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Purchase"
        WHERE id = ${purchaseId} AND "buyerId" = ${session.dbId}
        LIMIT 1
    `;
    if (rows.length === 0) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

    await prisma.$executeRaw`
        UPDATE "Purchase" SET "isDownloaded" = true WHERE id = ${purchaseId}
    `;

    return NextResponse.json({ ok: true });
}
