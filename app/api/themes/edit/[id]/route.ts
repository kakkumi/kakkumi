import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { nowKST } from "@/lib/date";

// 테마 수정 제출 (관리자 승인 필요)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await params;

    // 본인 테마 확인
    const themeRows = await prisma.$queryRaw<{
        id: string; creatorId: string; status: string; title: string; isPublic: boolean;
    }[]>`
        SELECT id, "creatorId", status, title, "isPublic"
        FROM "Theme" WHERE id = ${themeId} LIMIT 1
    `;
    if (themeRows.length === 0) {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }
    const theme = themeRows[0];
    if (theme.creatorId !== session.dbId) {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    if (theme.status === "DRAFT") {
        return NextResponse.json({ error: "이미 심사 중인 테마입니다." }, { status: 400 });
    }

    try {
        const formData = await req.formData();

        const title = (formData.get("title") as string | null)?.trim() ?? "";
        const description = (formData.get("description") as string | null)?.trim() ?? "";
        const price = (formData.get("price") as string | null) ?? "";
        const categories = formData.getAll("categories") as string[];
        const thumbnailFile = formData.get("thumbnail") as File | null;
        const miniPreviewFiles = formData.getAll("miniPreviews") as File[];
        const richContentRaw = (formData.get("richContent") as string | null) ?? "";
        const richImgCount = parseInt((formData.get("richImgCount") as string | null) ?? "0", 10);
        // 검토 중 공개 설정: "keep" = 기존 공개 유지, "hide" = 검토 중 비공개
        const reviewVisibility = (formData.get("reviewVisibility") as string | null) ?? "keep";

        if (!title) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (!description) return NextResponse.json({ error: "테마 설명을 입력해주세요." }, { status: 400 });

        const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const MAX_THEME_SIZE = 30 * 1024 * 1024;

        const validateImage = (file: File, label: string) => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return NextResponse.json({ error: `${label}은 JPG, PNG, WEBP, GIF만 허용됩니다.` }, { status: 400 });
            }
            if (file.size > MAX_IMAGE_SIZE) {
                return NextResponse.json({ error: `${label}은 5MB 이하여야 합니다.` }, { status: 400 });
            }
            return null;
        };

        const now = nowKST();
        const ext = (f: File) => f.name.split(".").pop() ?? "bin";

        // 썸네일 업로드 (새로 올린 경우만)
        let thumbnailUrl: string | null = null;
        if (thumbnailFile && thumbnailFile.size > 0) {
            const err = validateImage(thumbnailFile, "썸네일 이미지");
            if (err) return err;
            thumbnailUrl = await uploadFile("theme-images", `${themeId}/thumbnail_edit.${ext(thumbnailFile)}`, thumbnailFile);
        }

        // 미니 프리뷰 업로드
        const miniPreviewUrls: string[] = [];
        for (let i = 0; i < miniPreviewFiles.length; i++) {
            const f = miniPreviewFiles[i];
            if (f && f.size > 0) {
                const err = validateImage(f, "미니 프리뷰 이미지");
                if (err) return err;
                const url = await uploadFile("theme-images", `${themeId}/edit_mini_${i}.${ext(f)}`, f);
                miniPreviewUrls.push(url);
            }
        }

        // 리치 컨텐츠 이미지 업로드
        let finalHtml = richContentRaw;
        for (let i = 0; i < richImgCount; i++) {
            const imgFile = formData.get(`richImg_${i}`) as File | null;
            const tempUrl = formData.get(`richImgUrl_${i}`) as string | null;
            if (imgFile && imgFile.size > 0 && tempUrl) {
                const imgExt = ext(imgFile);
                const uploadedUrl = await uploadFile("theme-images", `${themeId}/edit_rich_${i}.${imgExt}`, imgFile);
                finalHtml = finalHtml.split(tempUrl).join(uploadedUrl);
            }
        }

        const priceNum = price === "무료" ? 0 : (parseInt(price.replace(/[^0-9]/g, ""), 10) || 0);

        // 검토 중 비공개 설정
        if (reviewVisibility === "hide") {
            await prisma.$executeRaw`
                UPDATE "Theme" SET "isPublic" = false, "updatedAt" = ${now} WHERE id = ${themeId}
            `;
        }

        // Theme pending 필드 업데이트 (관리자 승인 전까지 현재 내용 유지)
        try {
            await prisma.$executeRaw`
                UPDATE "Theme"
                SET
                    "pendingTitle" = ${title},
                    "pendingDescription" = ${description},
                    "pendingPrice" = ${priceNum},
                    "pendingTags" = ${categories}::text[],
                    "pendingThumbnailUrl" = ${thumbnailUrl},
                    "pendingImages" = ${miniPreviewUrls.length > 0 ? miniPreviewUrls : null}::text[],
                    "pendingContentBlocks" = ${finalHtml || null},
                    "pendingReviewVisibility" = ${reviewVisibility},
                    status = 'DRAFT'::"ThemeStatus",
                    "updatedAt" = ${now}
                WHERE id = ${themeId}
            `;
        } catch {
            // pending 컬럼이 없는 경우 status만 DRAFT로
            await prisma.$executeRaw`
                UPDATE "Theme" SET status = 'DRAFT'::"ThemeStatus", "updatedAt" = ${now} WHERE id = ${themeId}
            `;
        }

        // 옵션 수정사항 pending 처리
        const optionCount = parseInt((formData.get("optionCount") as string | null) ?? "0", 10);
        for (let i = 0; i < optionCount; i++) {
            const optId = formData.get(`optId_${i}`) as string | null;
            const optName = ((formData.get(`optName_${i}`) as string | null) ?? "").trim();
            const optOs = (formData.get(`optOs_${i}`) as string | null) ?? "ios";
            const optFile = formData.get(`optFile_${i}`) as File | null;
            const optMyThemeId = (formData.get(`optMyThemeId_${i}`) as string | null) ?? null;

            if (optId) {
                // 기존 옵션 수정
                let pendingFileUrl: string | null = null;
                let pendingConfigJson: string | null = null;
                let pendingImageData: string | null = null;
                const pendingMyThemeId: string | null = optMyThemeId;

                if (optFile && optFile.size > 0) {
                    if (optFile.size > MAX_THEME_SIZE) {
                        return NextResponse.json({ error: `테마 파일은 30MB 이하여야 합니다.` }, { status: 400 });
                    }
                    const osFolder = optOs === "android" ? "android" : "ios";
                    pendingFileUrl = await uploadFile("theme-files", `${themeId}/${osFolder}/${optId}_edit.${ext(optFile)}`, optFile);
                } else if (optMyThemeId) {
                    const myTheme = await prisma.myTheme.findFirst({
                        where: { id: optMyThemeId, userId: session.dbId, trashed: false },
                    });
                    if (myTheme) {
                        pendingConfigJson = JSON.stringify(myTheme.configJson ?? {});
                        pendingImageData = JSON.stringify(myTheme.imageData ?? {});
                    }
                }

                try {
                    await prisma.$executeRaw`
                        UPDATE "ThemeOption"
                        SET
                            "pendingFileUrl" = ${pendingFileUrl},
                            "pendingConfigJson" = ${pendingConfigJson}::jsonb,
                            "pendingImageData" = ${pendingImageData}::jsonb,
                            "pendingMyThemeId" = ${pendingMyThemeId},
                            status = 'PENDING_UPDATE'::"ThemeOptionStatus",
                            name = ${optName},
                            "updatedAt" = ${now}
                        WHERE id = ${optId} AND "themeId" = ${themeId}
                    `;
                } catch {
                    // PENDING_UPDATE 없으면 PENDING_NEW로 fallback
                    await prisma.$executeRaw`
                        UPDATE "ThemeOption"
                        SET name = ${optName}, "updatedAt" = ${now}
                        WHERE id = ${optId} AND "themeId" = ${themeId}
                    `;
                }
            }
        }

        return NextResponse.json({ ok: true, themeId });
    } catch (e) {
        console.error("[themes/edit POST]", e);
        return NextResponse.json({ error: "수정 제출 중 오류가 발생했습니다." }, { status: 500 });
    }
}

// 현재 테마 데이터 조회 (수정 폼 초기값)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await params;

    const rows = await prisma.$queryRaw<{
        id: string; creatorId: string; title: string; description: string | null;
        price: number; status: string; thumbnailUrl: string | null; images: string[];
        tags: string[]; contentBlocks: unknown; isPublic: boolean;
    }[]>`
        SELECT id, "creatorId", title, description, price, status,
               "thumbnailUrl", images, tags, "contentBlocks", "isPublic"
        FROM "Theme" WHERE id = ${themeId} LIMIT 1
    `;

    if (rows.length === 0) {
        return NextResponse.json({ error: "테마를 찾을 수 없습니다." }, { status: 404 });
    }
    const theme = rows[0];
    if (theme.creatorId !== session.dbId && session.role !== "ADMIN") {
        return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // 옵션 조회
    const options = await prisma.$queryRaw<{
        id: string; name: string; os: string; fileUrl: string | null;
        configJson: unknown; imageData: unknown; myThemeId: string | null; status: string;
    }[]>`
        SELECT id, name, os, "fileUrl", "configJson", "imageData", "myThemeId", status
        FROM "ThemeOption"
        WHERE "themeId" = ${themeId}
        ORDER BY "createdAt" ASC
    `;

    return NextResponse.json({ theme, options });
}
