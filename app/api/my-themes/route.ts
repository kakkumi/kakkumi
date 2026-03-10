import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

async function generateUniquePackageId(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = "";
    for (let i = 0; i < 8; i++) {
      suffix += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    const packageId = `com.kakkumi.talk.theme.${suffix}`;
    const existing = await prisma.myTheme.findUnique({ where: { themePackageId: packageId } });
    if (!existing) return packageId;
  }
  throw new Error("패키지 ID 생성 실패");
}

// GET /api/my-themes
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    // 30일 지난 휴지통 항목 자동 삭제
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await prisma.myTheme.deleteMany({
        where: {
            userId: session.dbId,
            trashed: true,
            trashedAt: { lt: thirtyDaysAgo },
        },
    });

    const rawThemes = await prisma.myTheme.findMany({
        where: { userId: session.dbId },
        orderBy: { createdAt: "desc" },
    });

    const themes = rawThemes.map((t) => {
        const cfg = (t.configJson ?? {}) as Record<string, unknown>;
        const imgData = (t.imageData ?? {}) as Record<string, unknown>;
        return {
            id: t.id,
            name: t.name,
            os: t.os,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            trashedAt: t.trashedAt,
            trashed: t.trashed,
            folderId: t.folderId,
            previewImageUrl: t.previewImageUrl,
            themeColors: {
                chatBg: typeof cfg.chatBg === "string" ? cfg.chatBg : null,
                myBubbleBg: typeof cfg.myBubbleBg === "string" ? cfg.myBubbleBg : null,
                otherBubbleBg: typeof cfg.otherBubbleBg === "string" ? cfg.otherBubbleBg : null,
                chatroomBgImage: typeof imgData.chatroomBg === "string" ? imgData.chatroomBg : null,
            },
        };
    });

    return NextResponse.json({ themes });
}

// POST /api/my-themes  { name, os, previewImageUrl?, configJson?, imageData? }
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const { name, os, previewImageUrl, configJson, imageData } = await req.json() as {
        name: string;
        os: string;
        previewImageUrl?: string | null;
        configJson?: Record<string, unknown> | null;
        imageData?: Record<string, string> | null;
    };

    if (!name?.trim()) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });

    const packageId = await generateUniquePackageId();
    const mergedConfig = configJson ? { ...configJson, packageId } : { packageId };

    const theme = await prisma.myTheme.create({
        data: {
            userId: session.dbId,
            name: name.trim(),
            os,
            previewImageUrl: previewImageUrl ?? null,
            themePackageId: packageId,
            configJson: mergedConfig as Prisma.InputJsonValue,
            imageData: imageData === null ? Prisma.DbNull : imageData === undefined ? undefined : (imageData as Prisma.InputJsonValue),
        },
    });

    return NextResponse.json({ theme });
}
