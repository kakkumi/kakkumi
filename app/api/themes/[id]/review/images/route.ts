import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { uploadFile } from "@/lib/storage";

const MAX_COUNT = 5;
const MAX_SIZE_MB = 5;

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { id: themeId } = await props.params;
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files.length) {
        return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }
    if (files.length > MAX_COUNT) {
        return NextResponse.json({ error: `최대 ${MAX_COUNT}개까지 업로드 가능합니다.` }, { status: 400 });
    }

    const urls: string[] = [];
    for (const file of files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            return NextResponse.json({ error: `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.` }, { status: 400 });
        }
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
        }
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `reviews/${session.dbId}/${themeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const url = await uploadFile("theme-images", path, file);
        urls.push(url);
    }

    return NextResponse.json({ urls });
}
