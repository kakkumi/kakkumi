import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

// 갤러리 게시글 목록 조회
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sort = searchParams.get("sort") ?? "latest"; // "latest" | "likes"
        const page = parseInt(searchParams.get("page") ?? "1", 10);
        const limit = 20;
        const offset = (page - 1) * limit;

        const session = await getServerSession();
        const myId = session?.dbId ?? null;

        type PostRow = {
            id: string; userId: string; themeName: string; description: string | null;
            images: string[]; storeLink: string | null; themeId: string | null; createdAt: Date;
            userNickname: string | null; userName: string; userAvatar: string | null; userImage: string | null;
            userRole: string;
            likeCount: bigint; commentCount: bigint;
        };

        const posts = sort === "likes"
            ? await prisma.$queryRaw<PostRow[]>`
                SELECT p.id, p."userId", p."themeName", p.description, p.images, p."storeLink", p."themeId", p."createdAt",
                       u.nickname AS "userNickname", u.name AS "userName", u."avatarUrl" AS "userAvatar", u.image AS "userImage",
                       u.role::text AS "userRole",
                       COUNT(DISTINCT l.id) AS "likeCount",
                       COUNT(DISTINCT c.id) FILTER (WHERE c."isDeleted" = false) AS "commentCount"
                FROM "GalleryPost" p
                JOIN "User" u ON p."userId" = u.id
                LEFT JOIN "GalleryLike" l ON l."postId" = p.id
                LEFT JOIN "GalleryComment" c ON c."postId" = p.id
                GROUP BY p.id, u.nickname, u.name, u."avatarUrl", u.image, u.role
                ORDER BY "likeCount" DESC, p."createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            : await prisma.$queryRaw<PostRow[]>`
                SELECT p.id, p."userId", p."themeName", p.description, p.images, p."storeLink", p."themeId", p."createdAt",
                       u.nickname AS "userNickname", u.name AS "userName", u."avatarUrl" AS "userAvatar", u.image AS "userImage",
                       u.role::text AS "userRole",
                       COUNT(DISTINCT l.id) AS "likeCount",
                       COUNT(DISTINCT c.id) FILTER (WHERE c."isDeleted" = false) AS "commentCount"
                FROM "GalleryPost" p
                JOIN "User" u ON p."userId" = u.id
                LEFT JOIN "GalleryLike" l ON l."postId" = p.id
                LEFT JOIN "GalleryComment" c ON c."postId" = p.id
                GROUP BY p.id, u.nickname, u.name, u."avatarUrl", u.image, u.role
                ORDER BY p."createdAt" DESC
                LIMIT ${limit} OFFSET ${offset}
              `;

        // 내 좋아요 여부
        let myLikedIds = new Set<string>();
        if (myId && posts.length > 0) {
            const postIds = posts.map((p) => p.id);
            const myLikes = await prisma.$queryRaw<{ postId: string }[]>`
                SELECT "postId" FROM "GalleryLike" WHERE "userId" = ${myId} AND "postId" = ANY(${postIds}::text[])
            `;
            myLikedIds = new Set(myLikes.map((l) => l.postId));
        }

        // 이모지 반응 집계
        const reactionMap: Record<string, { emoji: string; count: number }[]> = {};
        if (posts.length > 0) {
            const postIds = posts.map((p) => p.id);
            const reactions = await prisma.$queryRaw<{ postId: string; emoji: string; count: bigint }[]>`
                SELECT "postId", emoji, COUNT(*) AS count
                FROM "GalleryReaction"
                WHERE "postId" = ANY(${postIds}::text[])
                GROUP BY "postId", emoji
                ORDER BY count DESC
            `;
            reactions.forEach((r) => {
                if (!reactionMap[r.postId]) reactionMap[r.postId] = [];
                reactionMap[r.postId].push({ emoji: r.emoji, count: Number(r.count) });
            });
        }

        const [{ total }] = await prisma.$queryRaw<[{ total: bigint }]>`SELECT COUNT(*) AS total FROM "GalleryPost"`;

        return NextResponse.json({
            posts: posts.map((p) => ({
                ...p,
                likeCount: Number(p.likeCount),
                commentCount: Number(p.commentCount),
                liked: myLikedIds.has(p.id),
                reactions: reactionMap[p.id] ?? [],
                createdAt: p.createdAt.toISOString(),
            })),
            total: Number(total),
            page,
        });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}

// 게시글 작성
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    try {
        const formData = await req.formData();
        const themeName = (formData.get("themeName") as string | null)?.trim() ?? "";
        const description = (formData.get("description") as string | null)?.trim() ?? "";
        const storeLink = (formData.get("storeLink") as string | null)?.trim() ?? null;
        const themeId = (formData.get("themeId") as string | null)?.trim() ?? null;
        const imageFiles = formData.getAll("images") as File[];

        if (!themeName) return NextResponse.json({ error: "테마 이름을 입력해주세요." }, { status: 400 });
        if (imageFiles.length === 0) return NextResponse.json({ error: "이미지를 1장 이상 업로드해주세요." }, { status: 400 });
        if (imageFiles.length > 3) return NextResponse.json({ error: "이미지는 최대 3장까지 업로드할 수 있습니다." }, { status: 400 });
        if (description.length > 200) return NextResponse.json({ error: "설명은 200자 이하여야 합니다." }, { status: 400 });

        const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        for (const f of imageFiles) {
            if (!ALLOWED_IMAGE_TYPES.includes(f.type)) return NextResponse.json({ error: "JPG, PNG, WEBP, GIF만 업로드 가능합니다." }, { status: 400 });
            if (f.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: "이미지는 5MB 이하여야 합니다." }, { status: 400 });
        }

        const postId = crypto.randomUUID();
        const imageUrls: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const f = imageFiles[i];
            const ext = f.name.split(".").pop() ?? "jpg";
            try {
                const url = await uploadFile("gallery-images", `${postId}/image-${i}.${ext}`, f);
                imageUrls.push(url);
            } catch (uploadErr) {
                console.error("[gallery POST] image upload failed", uploadErr);
                return NextResponse.json(
                    { error: "이미지 업로드에 실패했습니다. Supabase Storage에 gallery-images 버킷이 있는지 확인해주세요." },
                    { status: 500 }
                );
            }
        }

        await prisma.$executeRaw`
            INSERT INTO "GalleryPost" (id, "userId", "themeName", description, images, "storeLink", "themeId", "createdAt", "updatedAt")
            VALUES (${postId}, ${session.dbId}, ${themeName}, ${description || null}, ${imageUrls}::text[], ${storeLink}, ${themeId}, NOW(), NOW())
        `;

        return NextResponse.json({ ok: true, postId }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
