import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

// 입점 신청 조회
export async function GET() {
    const session = await getServerSession();
    if (!session?.dbId) return NextResponse.json({ application: null, role: null });

    const rows = await prisma.$queryRaw<{
        id: string; status: string; reason: string;
        portfolio: string | null; adminNote: string | null; createdAt: Date;
        experience: boolean; tools: string[]; sampleImages: string[];
    }[]>`
        SELECT id, status, reason, portfolio, "adminNote", "createdAt",
               experience, tools, "sampleImages"
        FROM "CreatorApplication"
        WHERE "userId" = ${session.dbId}
        ORDER BY "createdAt" DESC
        LIMIT 1
    `;

    const role = session.role ?? "USER";

    if (!rows[0]) return NextResponse.json({ application: null, role });
    return NextResponse.json({
        application: { ...rows[0], createdAt: rows[0].createdAt.toISOString() },
        role,
    });
}

// 입점 신청 제출 (multipart/form-data)
export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    if (session.role === "CREATOR" || session.role === "ADMIN") {
        return NextResponse.json({ error: "이미 판매 권한이 있습니다." }, { status: 400 });
    }

    const existing = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "CreatorApplication"
        WHERE "userId" = ${session.dbId} AND status = 'PENDING'::"ApplicationStatus"
        LIMIT 1
    `;
    if (existing.length > 0) {
        return NextResponse.json({ error: "이미 검토 중인 신청이 있습니다." }, { status: 409 });
    }

    try {
        const fd = await req.formData();
        const reason = (fd.get("reason") as string | null)?.trim() ?? "";
        const portfolio = (fd.get("portfolio") as string | null)?.trim() ?? "";
        const experience = fd.get("experience") === "true";
        const tools = fd.getAll("tools") as string[];
        const imageFiles = fd.getAll("sampleImages") as File[];

        if (!reason || reason.length < 10) {
            return NextResponse.json({ error: "자기소개를 10자 이상 입력해주세요." }, { status: 400 });
        }
        if (imageFiles.length === 0) {
            return NextResponse.json({ error: "샘플 이미지를 1개 이상 업로드해주세요." }, { status: 400 });
        }

        const appId = crypto.randomUUID();
        const sampleImages: string[] = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const f = imageFiles[i];
            const ext = f.name.split(".").pop() ?? "jpg";
            try {
                const url = await uploadFile("creator-samples", `${appId}/sample-${i}.${ext}`, f);
                sampleImages.push(url);
            } catch {
                return NextResponse.json({ error: "이미지 업로드에 실패했습니다." }, { status: 500 });
            }
        }

        const now = new Date();
        await prisma.$executeRaw`
            INSERT INTO "CreatorApplication"
              (id, "userId", reason, portfolio, experience, tools, "sampleImages", status, "createdAt", "updatedAt")
            VALUES (
              ${appId}, ${session.dbId}, ${reason},
              ${portfolio || null}, ${experience}, ${tools}::text[], ${sampleImages}::text[],
              'PENDING'::"ApplicationStatus", ${now}, ${now}
            )
        `;

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
