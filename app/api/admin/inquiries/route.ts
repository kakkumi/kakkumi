import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// 전체 문의 목록 or 상세 조회 (?id=xxx)
export async function GET(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const inquiryId = searchParams.get("id");

    // 상세 조회 (답변 스레드 포함)
    if (inquiryId) {
        try {
            const [inquiry] = await prisma.$queryRaw<{
                id: string; title: string; content: string; category: string;
                images: string[];
                status: string; createdAt: Date;
                userNickname: string | null; userName: string; userId: string;
            }[]>`
                SELECT i.id, i.title, i.content, i.category, i.images, i.status, i."createdAt",
                       i."userId",
                       u.nickname AS "userNickname", u.name AS "userName"
                FROM "Inquiry" i
                JOIN "User" u ON i."userId" = u.id
                WHERE i.id = ${inquiryId}
                LIMIT 1
            `;
            if (!inquiry) return NextResponse.json({ error: "문의를 찾을 수 없습니다." }, { status: 404 });

            const replies = await prisma.$queryRaw<{
                id: string; inquiryId: string; content: string; isAdmin: boolean; createdAt: Date;
                authorName: string; authorNickname: string | null; authorImage: string | null; authorRole: string;
            }[]>`
                SELECT r.id, r."inquiryId", r.content, r."isAdmin", r."createdAt",
                       u.name AS "authorName", u.nickname AS "authorNickname",
                       u.image AS "authorImage", u.role AS "authorRole"
                FROM "InquiryReply" r
                JOIN "User" u ON u.id = r."authorId"
                WHERE r."inquiryId" = ${inquiryId}
                ORDER BY r."createdAt" ASC
            `.catch(() => []);

            return NextResponse.json({
                inquiry: {
                    ...inquiry,
                    replies: replies.map((r) => ({
                        id: r.id,
                        inquiryId: r.inquiryId,
                        content: r.content,
                        isAdmin: r.isAdmin,
                        createdAt: r.createdAt,
                        author: {
                            name: r.authorNickname ?? r.authorName,
                            image: r.authorImage,
                            role: r.authorRole,
                        },
                    })),
                },
            });
        } catch (e) {
            console.error("[admin/inquiries GET detail]", e);
            return NextResponse.json({ error: "조회 실패" }, { status: 500 });
        }
    }

    // 목록 조회
    try {
        const inquiries = await prisma.$queryRaw<{
            id: string; title: string; content: string; category: string;
            images: string[];
            status: string; createdAt: Date;
            userNickname: string | null; userName: string;
            replyCount: bigint;
        }[]>`
            SELECT i.id, i.title, i.content, i.category, i.images, i.status, i."createdAt",
                   u.nickname AS "userNickname", u.name AS "userName",
                   COUNT(r.id) AS "replyCount"
            FROM "Inquiry" i
            JOIN "User" u ON i."userId" = u.id
            LEFT JOIN "InquiryReply" r ON r."inquiryId" = i.id
            GROUP BY i.id, i.title, i.content, i.category, i.status, i."createdAt", u.nickname, u.name
            ORDER BY i."createdAt" DESC
        `;

        // 답변 스레드 내용 검색을 위해 replies도 조회
        const allReplies = inquiries.length > 0
            ? await prisma.$queryRaw<{
                id: string; inquiryId: string; content: string; isAdmin: boolean; createdAt: Date;
                authorName: string; authorNickname: string | null; authorImage: string | null; authorRole: string;
            }[]>`
                SELECT r.id, r."inquiryId", r.content, r."isAdmin", r."createdAt",
                       u.name AS "authorName", u.nickname AS "authorNickname",
                       u.image AS "authorImage", u.role AS "authorRole"
                FROM "InquiryReply" r
                JOIN "User" u ON u.id = r."authorId"
                WHERE r."inquiryId" = ANY(${inquiries.map(i => i.id)}::text[])
                ORDER BY r."createdAt" ASC
            `.catch(() => [])
            : [];

        return NextResponse.json({
            inquiries: inquiries.map((i) => ({
                ...i,
                replyCount: Number(i.replyCount),
                replies: allReplies
                    .filter(r => r.inquiryId === i.id)
                    .map(r => ({
                        id: r.id,
                        inquiryId: r.inquiryId,
                        content: r.content,
                        isAdmin: r.isAdmin,
                        createdAt: r.createdAt,
                        author: { name: r.authorNickname ?? r.authorName, image: r.authorImage, role: r.authorRole },
                    })),
            })),
        });
    } catch (e) {
        console.error("[admin/inquiries GET]", e);
        return NextResponse.json({ inquiries: [] });
    }
}

// 관리자 답변 작성
export async function POST(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    try {
        const { inquiryId, content } = (await req.json()) as { inquiryId: string; content: string };

        await prisma.$executeRaw`
            INSERT INTO "InquiryReply" (id, "inquiryId", "authorId", content, "isAdmin", "createdAt")
            VALUES (gen_random_uuid(), ${inquiryId}, ${session.dbId}, ${content}, true, NOW())
        `;
        await prisma.$executeRaw`
            UPDATE "Inquiry" SET status = 'ANSWERED', "updatedAt" = NOW() WHERE id = ${inquiryId}
        `;
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[admin/inquiries POST]", e);
        return NextResponse.json({ error: "처리 실패" }, { status: 500 });
    }
}
