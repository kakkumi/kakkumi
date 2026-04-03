import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json() as { discountPrice: number | null };

    // 본인 테마인지 확인
    const rows = await prisma.$queryRaw<{ creatorId: string; price: number }[]>`
        SELECT "creatorId", price FROM "Theme" WHERE id = ${id} LIMIT 1
    `;
    const theme = rows[0];
    if (!theme) return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    if (theme.creatorId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const discountPrice = body.discountPrice;

    // 유효성 검사
    if (discountPrice !== null) {
        if (discountPrice < 0) return NextResponse.json({ error: "할인가는 0 이상이어야 합니다." }, { status: 400 });
        if (discountPrice >= theme.price) return NextResponse.json({ error: "할인가는 원가보다 낮아야 합니다." }, { status: 400 });
    }

    if (discountPrice === null) {
        await prisma.$executeRaw`UPDATE "Theme" SET "discountPrice" = NULL WHERE id = ${id}`;
    } else {
        await prisma.$executeRaw`UPDATE "Theme" SET "discountPrice" = ${discountPrice} WHERE id = ${id}`;
    }

    return NextResponse.json({ ok: true });
}


