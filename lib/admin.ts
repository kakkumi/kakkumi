import { getServerSession } from "@/lib/session";

/**
 * 어드민 권한 확인 유틸
 * - ADMIN이 아니면 null 반환
 * - 사용 예: const session = await requireAdmin(); if (!session) return redirect("/");
 */
export async function requireAdmin() {
    const session = await getServerSession();
    if (!session?.dbId || session.role !== "ADMIN") {
        return null;
    }
    return session;
}
