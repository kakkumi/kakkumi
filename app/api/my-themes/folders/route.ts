import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/my-themes/folders
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const folders = await prisma.myThemeFolder.findMany({
        where: { userId: session.dbId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ folders });
}

// POST /api/my-themes/folders  { name }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { name } = await req.json() as { name: string };
    if (!name?.trim()) return NextResponse.json({ error: "폴더 이름을 입력해주세요." }, { status: 400 });

    const folder = await prisma.myThemeFolder.create({
        data: { userId: session.dbId, name: name.trim() },
    });

    return NextResponse.json({ folder });
}

// PATCH /api/my-themes/folders  { orderedIds: string[] } — 순서 저장
// sortOrder 컬럼이 없으면 클라이언트 순서만 유지 (localStorage fallback)
export async function PATCH(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { orderedIds } = await req.json() as { orderedIds: string[] };
    if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "orderedIds 필요" }, { status: 400 });

    // sortOrder 컬럼이 있으면 업데이트, 없으면 무시
    try {
        await Promise.all(
            orderedIds.map((id, idx) =>
                prisma.$executeRaw`
                    UPDATE "MyThemeFolder"
                    SET "sortOrder" = ${idx}
                    WHERE id = ${id} AND "userId" = ${session.dbId}
                `
            )
        );
    } catch {
        // sortOrder 컬럼 없으면 무시 (클라이언트 순서 유지)
    }

    return NextResponse.json({ ok: true });
}

