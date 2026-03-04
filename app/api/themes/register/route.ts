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
        const iosCount = parseInt((formData.get("iosCount") as string | null) ?? "1", 10);
        const androidCount = parseInt((formData.get("androidCount") as string | null) ?? "1", 10);

        if (!title) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (!description) return NextResponse.json({ error: "테마 설명을 입력해주세요." }, { status: 400 });
        if (!categories.length) return NextResponse.json({ error: "카테고리를 1개 이상 입력해주세요." }, { status: 400 });
        if (!price) return NextResponse.json({ error: "가격을 선택해주세요." }, { status: 400 });
        if (!thumbnailFile) return NextResponse.json({ error: "미리보기 이미지를 업로드해주세요." }, { status: 400 });

        // iOS 옵션 파싱
        type FileOpt = { name: string; file: File | null };
        const iosOpts: FileOpt[] = [];
        for (let i = 0; i < iosCount; i++) {
            iosOpts.push({
                name: (formData.get(`iosName_${i}`) as string | null) ?? `iOS 옵션 ${i + 1}`,
                file: formData.get(`iosFile_${i}`) as File | null,
            });
        }

        // Android 옵션 파싱
        const androidOpts: FileOpt[] = [];
        for (let i = 0; i < androidCount; i++) {
            androidOpts.push({
                name: (formData.get(`androidName_${i}`) as string | null) ?? `Android 옵션 ${i + 1}`,
                file: formData.get(`androidFile_${i}`) as File | null,
            });
        }

        const hasAnyFile =
            iosOpts.some(o => o.file && o.file.size > 0) ||
            androidOpts.some(o => o.file && o.file.size > 0);
        if (!hasAnyFile) return NextResponse.json({ error: "테마 파일을 최소 1개 업로드해주세요." }, { status: 400 });

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

        // DB 저장
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

        // iOS 옵션별 ThemeVersion 저장
        for (const opt of iosOpts) {
            if (!opt.file || opt.file.size === 0) continue;
            const versionId = crypto.randomUUID();
            const safeName = opt.name.replace(/[^a-zA-Z0-9가-힣_\- ]/g, "").trim() || versionId.slice(0, 8);
            const kthemeFileUrl = await uploadFile("theme-files", `${id}/ios/${safeName}.${ext(opt.file)}`, opt.file);
            await prisma.$executeRaw`
                INSERT INTO "ThemeVersion" (id, "themeId", version, "configJson", "kthemeFileUrl", "apkFileUrl", "buildStatus", "createdAt")
                VALUES (${versionId}, ${id}, ${`iOS · ${opt.name}`}, ${"{}"}::jsonb, ${kthemeFileUrl}, ${null}, 'PENDING'::"BuildStatus", ${now})
            `;
        }

        // Android 옵션별 ThemeVersion 저장
        for (const opt of androidOpts) {
            if (!opt.file || opt.file.size === 0) continue;
            const versionId = crypto.randomUUID();
            const safeName = opt.name.replace(/[^a-zA-Z0-9가-힣_\- ]/g, "").trim() || versionId.slice(0, 8);
            const apkFileUrl = await uploadFile("theme-files", `${id}/android/${safeName}.${ext(opt.file)}`, opt.file);
            await prisma.$executeRaw`
                INSERT INTO "ThemeVersion" (id, "themeId", version, "configJson", "kthemeFileUrl", "apkFileUrl", "buildStatus", "createdAt")
                VALUES (${versionId}, ${id}, ${`Android · ${opt.name}`}, ${"{}"}::jsonb, ${null}, ${apkFileUrl}, 'PENDING'::"BuildStatus", ${now})
            `;
        }

        return NextResponse.json({ ok: true, themeId: id });
    } catch (e) {
        console.error("[themes/register POST]", e);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
