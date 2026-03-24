import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { getUserPlan } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { nowKST } from "@/lib/date";
import { validateImage, validateThemeFile } from "@/lib/fileValidation";

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
        const richContentRaw = (formData.get("richContent") as string | null) ?? "";
        const richImgCount = parseInt((formData.get("richImgCount") as string | null) ?? "0", 10);

        if (!title) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (!description) return NextResponse.json({ error: "테마 설명을 입력해주세요." }, { status: 400 });
        if (!categories.length) return NextResponse.json({ error: "카테고리를 1개 이상 입력해주세요." }, { status: 400 });
        if (!price) return NextResponse.json({ error: "가격을 선택해주세요." }, { status: 400 });
        if (!thumbnailFile) return NextResponse.json({ error: "미리보기 이미지를 업로드해주세요." }, { status: 400 });
        if (optionCount === 0) return NextResponse.json({ error: "옵션을 1개 이상 추가해주세요." }, { status: 400 });

        // 플랜별 옵션 수 제한
        const plan = await getUserPlan(session.dbId, session.role);
        const isPro = plan === "PRO" || plan === "CREATOR" || plan === "ADMIN";
        const maxOptions = isPro ? 10 : 3;
        if (optionCount > maxOptions) {
            return NextResponse.json({
                error: isPro
                    ? `옵션은 최대 ${maxOptions}개까지 등록할 수 있습니다.`
                    : `무료 플랜은 옵션을 최대 ${maxOptions}개까지 등록할 수 있습니다. PRO 구독 시 최대 10개까지 등록 가능합니다.`,
            }, { status: 403 });
        }

        // USER 역할은 무료(0원)만 등록 가능
        if (session.role === "USER" && price !== "무료") {
            return NextResponse.json({ error: "일반 유저는 무료 테마만 등록할 수 있습니다. 크리에이터 입점 신청 후 유료 테마를 등록할 수 있어요." }, { status: 403 });
        }

        // 파일 검증 (공통 유틸 사용)
        const thumbError = validateImage(thumbnailFile, "썸네일 이미지");
        if (thumbError) return thumbError;

        for (const f of miniPreviewFiles) {
            if (f && f.size > 0) {
                const err = validateImage(f, "미니 프리뷰 이미지");
                if (err) return err;
            }
        }

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

        // richContent: object URL → 실제 스토리지 URL로 치환
        let finalHtml = richContentRaw;
        for (let i = 0; i < richImgCount; i++) {
            const imgFile = formData.get(`richImg_${i}`) as File | null;
            const tempUrl = (formData.get(`richImgUrl_${i}`) as string | null) ?? "";
            if (imgFile && imgFile.size > 0 && tempUrl) {
                const richErr = validateImage(imgFile, "테마 정보 이미지");
                if (richErr) return richErr;
                const imgExt = imgFile.name.split(".").pop() ?? "jpg";
                const uploadedUrl = await uploadFile("theme-images", `${id}/rich-${i}.${imgExt}`, imgFile);
                finalHtml = finalHtml.split(tempUrl).join(uploadedUrl);
            }
        }

        // Theme DB 저장
        await prisma.$executeRaw`
            INSERT INTO "Theme" (id, "creatorId", title, description, price, status, "thumbnailUrl", images, tags, "contentBlocks", "createdAt", "updatedAt")
            VALUES (
                ${id}, ${session.dbId}, ${title}, ${description}, ${priceNum},
                'DRAFT'::"ThemeStatus",
                ${thumbnailUrl},
                ${miniPreviewUrls}::text[],
                ${categories}::text[],
                ${finalHtml},
                ${now}, ${now}
            )
        `;

        try {
            await prisma.$executeRaw`
                UPDATE "Theme" SET "isPublic" = true, "isSelling" = true WHERE id = ${id}
            `;
        } catch { /* 컬럼 없으면 무시 */ }

        // ThemeOption 저장 (옵션별 스냅샷) + ThemeVersion도 함께 생성
        for (let i = 0; i < rawOptions.length; i++) {
            const opt = rawOptions[i];
            const optionId = crypto.randomUUID();
            const versionId = crypto.randomUUID();

            let fileUrl: string | null = null;
            let configJson: string | null = null;
            let imageData: string | null = null;
            let kthemeFileUrl: string | null = null;
            let apkFileUrl: string | null = null;

            if (opt.myThemeId) {
                // MyTheme 스냅샷
                const myTheme = await prisma.myTheme.findFirst({
                    where: { id: opt.myThemeId, userId: session.dbId, trashed: false },
                });
                if (myTheme) {
                    configJson = JSON.stringify(myTheme.configJson ?? {});
                    imageData = JSON.stringify(myTheme.imageData ?? {});
                    // MyTheme 기반 옵션의 경우 previewImageUrl을 파일로 사용 (없으면 null)
                    // 실제 .ktheme/.apk 파일은 없으므로 ThemeVersion은 configJson 표시용으로만 생성
                }
            } else if (opt.file && opt.file.size > 0) {
                // 파일 크기 검증 (공통 유틸)
                const fileErr = validateThemeFile(opt.file);
                if (fileErr) return fileErr;
                // 파일 업로드
                const osFolder = opt.os === "android" ? "android" : "ios";
                fileUrl = await uploadFile("theme-files", `${id}/${osFolder}/${optionId}.${ext(opt.file)}`, opt.file);
                if (opt.os === "android") {
                    apkFileUrl = fileUrl;
                } else {
                    kthemeFileUrl = fileUrl;
                }
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

            // ThemeVersion 생성 - 다운로드 가능한 버전으로 등록
            const versionLabel = `${opt.os === "android" ? "Android" : "iOS"} · ${opt.name}`;
            await prisma.$executeRaw`
                INSERT INTO "ThemeVersion" (id, "themeId", version, "kthemeFileUrl", "apkFileUrl", "buildStatus", "createdAt")
                VALUES (
                    ${versionId}, ${id}, ${versionLabel},
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
