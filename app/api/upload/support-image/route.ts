import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { uploadFile } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
        }
        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: `이미지는 최대 ${MAX_FILES}장까지 첨부할 수 있습니다.` }, { status: 400 });
        }

        const urls: string[] = [];

        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json({ error: "JPG, PNG, GIF, WEBP 형식만 업로드할 수 있습니다." }, { status: 400 });
            }
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
            }

            const ext = file.type.split("/")[1] ?? "jpg";
            const fileName = `${crypto.randomUUID()}.${ext}`;
            const path = `support/${session.dbId}/${fileName}`;

            const url = await uploadFile("support-images", path, file);
            urls.push(url);
        }

        return NextResponse.json({ urls });
    } catch (e) {
        console.error("[upload/support-image]", e);
        return NextResponse.json({ error: "업로드에 실패했습니다." }, { status: 500 });
    }
}

