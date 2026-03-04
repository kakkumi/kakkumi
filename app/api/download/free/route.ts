import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const session = await getServerSession();

    // 로그인 체크
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = (await request.json()) as { themeId: string };
    const { themeId } = body;

    if (!themeId) {
        return NextResponse.json({ error: "themeId가 필요합니다." }, { status: 400 });
    }

    // DB에서 테마 확인
    const theme = await prisma.theme.findUnique({
        where: { id: themeId },
        include: {
            versions: {
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
    });

    if (!theme) {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }

    // 무료 테마만 이 API 사용 가능
    if (theme.price !== 0) {
        return NextResponse.json({ error: "유료 테마는 결제 후 다운로드 가능합니다." }, { status: 403 });
    }

    // 이미 다운로드(구매) 기록이 있는지 확인
    const existing = await prisma.purchase.findFirst({
        where: {
            buyerId: session.dbId,
            themeId,
            status: "COMPLETED",
        },
    });

    // 없으면 Purchase 기록 생성
    if (!existing) {
        await prisma.purchase.create({
            data: {
                buyerId: session.dbId,
                themeId,
                amount: 0,
                status: "COMPLETED",
            },
        });
    }

    // 최신 버전의 다운로드 URL 반환
    const latestVersion = theme.versions[0];
    const downloadUrl = latestVersion?.kthemeFileUrl ?? latestVersion?.apkFileUrl ?? null;

    return NextResponse.json({
        success: true,
        alreadyOwned: !!existing,
        downloadUrl,
        themeName: theme.title,
    });
}
