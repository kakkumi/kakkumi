import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Supabase Storage에 파일을 업로드하고 공개 URL을 반환합니다.
 * @param bucket  버킷 이름 (예: "theme-images", "theme-files")
 * @param path    저장 경로 (예: "thumbnails/uuid.png")
 * @param file    업로드할 File 객체
 */
export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseStorage.storage
        .from(bucket)
        .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
        });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = supabaseStorage.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
