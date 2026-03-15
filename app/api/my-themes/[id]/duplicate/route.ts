import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getUserPlan, canSaveMoreThemes } from "@/lib/subscription";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function generateUniquePackageId(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
        let suffix = "";
        for (let i = 0; i < 8; i++) suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
        const packageId = `com.kakkumi.talk.theme.${suffix}`;
        const existing = await prisma.myTheme.findUnique({ where: { themePackageId: packageId } });
        if (!existing) return packageId;
    }
    throw new Error("패키지 ID 생성 실패");
}

// POST /api/my-themes/[id]/duplicate - 테마 복제 (Pro 전용)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { id } = await params;

    // Pro 전용 기능 확인
    const plan = await getUserPlan(session.dbId, session.role ?? "USER");
    if (plan === "FREE") {
        return NextResponse.json({ error: "테마 복제는 Pro 플랜에서 사용할 수 있어요.", requiresPro: true }, { status: 403 });
    }

    // 슬롯 제한 확인
    const currentCount = await prisma.myTheme.count({ where: { userId: session.dbId, trashed: false } });
    if (!canSaveMoreThemes(currentCount, plan)) {
        return NextResponse.json({ error: "저장 가능한 테마 수를 초과했어요.", limitReached: true }, { status: 403 });
    }

    // 원본 테마 조회
    const original = await prisma.myTheme.findFirst({ where: { id, userId: session.dbId } });
    if (!original) return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });

    const packageId = await generateUniquePackageId();
    const originalConfig = (original.configJson ?? {}) as Record<string, unknown>;
    const mergedConfig = { ...originalConfig, packageId };

    const duplicated = await prisma.myTheme.create({
        data: {
            userId: session.dbId,
            folderId: original.folderId,
            name: `${original.name} (복사본)`,
            os: original.os,
            previewImageUrl: original.previewImageUrl,
            themePackageId: packageId,
            configJson: mergedConfig as Prisma.InputJsonValue,
            imageData: original.imageData ?? Prisma.DbNull,
        },
    });

    return NextResponse.json({ theme: { id: duplicated.id } });
}
