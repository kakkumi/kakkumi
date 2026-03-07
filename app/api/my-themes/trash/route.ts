import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// DELETE /api/my-themes/trash  (휴지통 전체 비우기)
export async function DELETE() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    await prisma.myTheme.deleteMany({
        where: { userId: session.dbId, trashed: true },
    });

    return NextResponse.json({ ok: true });
}
