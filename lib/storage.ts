import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 경로에서 한글 및 특수문자를 제거해 Supabase Storage에서 허용하는 안전한 경로로 변환
 */
function sanitizePath(path: string): string {
    const parts = path.split("/");
    const sanitized = parts.map((part, idx) => {
        // 마지막 파트(파일명)만 변환
        if (idx === parts.length - 1) {
            const dotIdx = part.lastIndexOf(".");
            const ext = dotIdx !== -1 ? part.slice(dotIdx + 1).replace(/[^a-zA-Z0-9]/g, "") : "bin";
            const name = dotIdx !== -1 ? part.slice(0, dotIdx) : part;
            // 영문/숫자/하이픈/언더스코어만 허용, 나머지는 제거
            const safeName = name.replace(/[^a-zA-Z0-9\-_]/g, "") || crypto.randomUUID().slice(0, 8);
            return `${safeName}.${ext}`;
        }
        return part;
    });
    return sanitized.join("/");
}

/**
 * Supabase Storage에 파일을 업로드하고 공개 URL을 반환합니다.
 * @param bucket  버킷 이름 (예: "theme-images", "theme-files")
 * @param path    저장 경로 (예: "thumbnails/uuid.png")
 * @param file    업로드할 File 객체
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const safePath = sanitizePath(path);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseStorage.storage
        .from(bucket)
        .upload(safePath, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
        });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = supabaseStorage.storage.from(bucket).getPublicUrl(safePath);
    return data.publicUrl;
}


