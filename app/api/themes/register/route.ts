import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

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
        const themeFile = formData.get("themeFile") as File | null;
        const androidFile = formData.get("androidFile") as File | null;

        if (!title) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (!description) return NextResponse.json({ error: "테마 설명을 입력해주세요." }, { status: 400 });
        if (!categories.length) return NextResponse.json({ error: "카테고리를 1개 이상 입력해주세요." }, { status: 400 });
        if (!price) return NextResponse.json({ error: "가격을 선택해주세요." }, { status: 400 });
        if (!thumbnailFile) return NextResponse.json({ error: "미리보기 이미지를 업로드해주세요." }, { status: 400 });
        if (!themeFile && !androidFile) return NextResponse.json({ error: "테마 파일을 업로드해주세요." }, { status: 400 });

        // 이름 중복 확인
        const dup = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Theme" WHERE title = ${title} LIMIT 1
        `;
        if (dup.length > 0) {
            return NextResponse.json({ error: "이미 사용 중인 테마 이름입니다." }, { status: 409 });
        }

        const priceNum = price === "무료" ? 0 : (parseInt(price.replace(/[^0-9]/g, ""), 10) || 0);
        const id = crypto.randomUUID();
        const now = new Date();

        // ── 이미지 업로드 (theme-images 버킷) ──
        const ext = (f: File) => f.name.split(".").pop() ?? "bin";

        const thumbnailUrl = await uploadFile(
            "theme-images",
            `${id}/thumbnail.${ext(thumbnailFile)}`,
            thumbnailFile,
        );

        const miniPreviewUrls: string[] = [];
        for (let i = 0; i < miniPreviewFiles.length; i++) {
            const f = miniPreviewFiles[i];
            if (f && f.size > 0) {
                const url = await uploadFile(
                    "theme-images",
                    `${id}/preview-${i + 1}.${ext(f)}`,
                    f,
                );
                miniPreviewUrls.push(url);
            }
        }

        // ── 테마 파일 업로드 (theme-files 버킷) ──
        let kthemeFileUrl: string | null = null;
        let apkFileUrl: string | null = null;

        if (themeFile) {
            kthemeFileUrl = await uploadFile(
                "theme-files",
                `${id}/theme.${ext(themeFile)}`,
                themeFile,
            );
        }
        if (androidFile) {
            apkFileUrl = await uploadFile(
                "theme-files",
                `${id}/android.${ext(androidFile)}`,
                androidFile,
            );
        }

        // ── DB 저장 ──
        await prisma.$executeRaw`
            INSERT INTO "Theme" (id, "creatorId", title, description, price, status, "thumbnailUrl", images, tags, "createdAt", "updatedAt")
            VALUES (
                ${id},
                ${session.dbId},
                ${title},
                ${description},
                ${priceNum},
                'DRAFT'::"ThemeStatus",
                ${thumbnailUrl},
                ${miniPreviewUrls}::text[],
                ${categories}::text[],
                ${now},
                ${now}
            )
        `;

        if (kthemeFileUrl || apkFileUrl) {
            const versionId = crypto.randomUUID();
            await prisma.$executeRaw`
                INSERT INTO "ThemeVersion" (id, "themeId", version, "configJson", "kthemeFileUrl", "apkFileUrl", "buildStatus", "createdAt")
                VALUES (
                    ${versionId},
                    ${id},
                    ${"1.0.0"},
                    ${"{}"}::jsonb,
                    ${kthemeFileUrl},
                    ${apkFileUrl},
                    'PENDING'::"BuildStatus",
                    ${now}
                )
            `;
        }

        return NextResponse.json({ ok: true, themeId: id });
    } catch (e) {
        console.error("[themes/register POST]", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
