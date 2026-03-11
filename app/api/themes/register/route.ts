import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { nowKST } from "@/lib/date";

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const title = (formData.get("title") as string | null)?.trim() ?? "";
        const description = (formData.get("description") as string | null)?.trim() ?? "";
        const price = (formData.get("price") as string | null) ?? "";
        const categories = formData.getAll("categories") as string[];
        const thumbnailFile = formData.get("thumbnail") as File | null;
        const miniPreviewFiles = formData.getAll("miniPreviews") as File[];
        const optionCount = parseInt((formData.get("optionCount") as string | null) ?? "0", 10);

        if (!title) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (!description) return NextResponse.json({ error: "테마 설명을 입력해주세요." }, { status: 400 });
        if (!categories.length) return NextResponse.json({ error: "카테고리를 1개 이상 입력해주세요." }, { status: 400 });
        if (!price) return NextResponse.json({ error: "가격을 선택해주세요." }, { status: 400 });
        if (!thumbnailFile) return NextResponse.json({ error: "미리보기 이미지를 업로드해주세요." }, { status: 400 });
        if (optionCount === 0) return NextResponse.json({ error: "옵션을 1개 이상 추가해주세요." }, { status: 400 });

        // 세션 유저 확인
        const userCheck = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "User" WHERE id = ${session.dbId} AND "deletedAt" IS NULL LIMIT 1
        `;
        if (userCheck.length === 0) {
            return NextResponse.json({ error: "세션이 만료되었습니다. 다시 로그인해주세요." }, { status: 401 });
        }

        // 옵션 파싱
        type RawOption = {
            name: string;
            os: string;
            // 파일 업로드 방식
            file: File | null;
            // MyTheme 선택 방식
            myThemeId: string | null;
        };

        const rawOptions: RawOption[] = [];
        for (let i = 0; i < optionCount; i++) {
            rawOptions.push({
                name: ((formData.get(`optName_${i}`) as string | null) ?? `옵션 ${i + 1}`).trim(),
                os: (formData.get(`optOs_${i}`) as string | null) ?? "ios",
                file: formData.get(`optFile_${i}`) as File | null,
                myThemeId: (formData.get(`optMyThemeId_${i}`) as string | null) ?? null,
            });
        }

        // 최소 1개 옵션에 파일 or myThemeId가 있어야 함
        const hasAnyData = rawOptions.some(o =>
            (o.file && o.file.size > 0) || o.myThemeId
        );
        if (!hasAnyData) {
            return NextResponse.json({ error: "각 옵션에 파일 또는 내 테마를 지정해주세요." }, { status: 400 });
        }

        // 이름 중복 확인
        const dup = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Theme" WHERE title = ${title} LIMIT 1
        `;
        if (dup.length > 0) {
            return NextResponse.json({ error: "이미 사용 중인 테마 이름입니다." }, { status: 409 });
        }

        const priceNum = price === "무료" ? 0 : (parseInt(price.replace(/[^0-9]/g, ""), 10) || 0);
        const id = crypto.randomUUID();
        const now = nowKST();
        const ext = (f: File) => f.name.split(".").pop() ?? "bin";

        // 대표 이미지 업로드
        const thumbnailUrl = await uploadFile("theme-images", `${id}/thumbnail.${ext(thumbnailFile)}`, thumbnailFile);

        // 미니 프리뷰 업로드
        const miniPreviewUrls: string[] = [];
        for (let i = 0; i < miniPreviewFiles.length; i++) {
            const f = miniPreviewFiles[i];
            if (f && f.size > 0) {
                miniPreviewUrls.push(await uploadFile("theme-images", `${id}/preview-${i + 1}.${ext(f)}`, f));
            }
        }

        // Theme DB 저장
        await prisma.$executeRaw`
            INSERT INTO "Theme" (id, "creatorId", title, description, price, status, "thumbnailUrl", images, tags, "createdAt", "updatedAt")
            VALUES (
                ${id}, ${session.dbId}, ${title}, ${description}, ${priceNum},
                'DRAFT'::"ThemeStatus",
                ${thumbnailUrl},
                ${miniPreviewUrls}::text[],
                ${categories}::text[],
                ${now}, ${now}
            )
        `;

        try {
            await prisma.$executeRaw`
                UPDATE "Theme" SET "isPublic" = true, "isSelling" = true WHERE id = ${id}
            `;
        } catch { /* 컬럼 없으면 무시 */ }

        // ThemeOption 저장 (옵션별 스냅샷)
        for (let i = 0; i < rawOptions.length; i++) {
            const opt = rawOptions[i];
            const optionId = crypto.randomUUID();

            let fileUrl: string | null = null;
            let configJson: string | null = null;
            let imageData: string | null = null;

            if (opt.myThemeId) {
                // MyTheme 스냅샷
                const myTheme = await prisma.myTheme.findFirst({
                    where: { id: opt.myThemeId, userId: session.dbId, trashed: false },
                });
                if (myTheme) {
                    configJson = JSON.stringify(myTheme.configJson ?? {});
                    imageData = JSON.stringify(myTheme.imageData ?? {});
                }
            } else if (opt.file && opt.file.size > 0) {
                // 파일 업로드
                const osFolder = opt.os === "android" ? "android" : "ios";
                fileUrl = await uploadFile("theme-files", `${id}/${osFolder}/${optionId}.${ext(opt.file)}`, opt.file);
            }

            await prisma.$executeRaw`
                INSERT INTO "ThemeOption" (id, "themeId", os, name, status, "fileUrl", "configJson", "imageData", "myThemeId", "createdAt", "updatedAt")
                VALUES (
                    ${optionId}, ${id}, ${opt.os}, ${opt.name},
                    'PENDING_NEW'::"ThemeOptionStatus",
                    ${fileUrl},
                    ${configJson}::jsonb,
                    ${imageData}::jsonb,
                    ${opt.myThemeId ?? null},
                    ${now}, ${now}
                )
            `;
        }

        return NextResponse.json({ ok: true, themeId: id });
    } catch (e) {
        console.error("[themes/register POST]", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
