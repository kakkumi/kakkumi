import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AdminClient from "@/app/admin/AdminClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const session = await requireAdmin();
    if (!session) redirect("/");

    // 대시보드용 대기/접수 카운트
    const [
        themesPending,
        applicationsPending,
        reportsPending,
        inquiriesOpen,
        mailboxPending,
        galleryReportsPending,
        refundsPending,
    ] = await Promise.all([
        // 테마 관리: 승인 대기 (DRAFT 상태 옵션)
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "ThemeOption"
            WHERE status IN ('PENDING_NEW', 'PENDING_UPDATE')
        `,
        // 입점 신청: 대기
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "CreatorApplication"
            WHERE status = 'PENDING'
        `,
        // 신고 관리: 처리 대기
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Report"
            WHERE status = 'PENDING'
        `,
        // 1:1 문의: 답변 대기
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Inquiry"
            WHERE status = 'OPEN'
        `,
        // 우체통: 미처리
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Mailbox"
            WHERE status = 'PENDING'
        `,
        // 갤러리 신고: 미처리
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "GalleryCommentReport"
            WHERE "isHandled" = false
        `,
        // 환불 요청 대기
        prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM "Purchase"
            WHERE status = 'REFUND_REQUESTED'
        `,
    ]).catch(() => Array(7).fill([{ count: BigInt(0) }]));

    const dashboardCounts = {
        themesPending:         Number((themesPending as { count: bigint }[])[0]?.count ?? 0),
        applicationsPending:   Number((applicationsPending as { count: bigint }[])[0]?.count ?? 0),
        reportsPending:        Number((reportsPending as { count: bigint }[])[0]?.count ?? 0),
        inquiriesOpen:         Number((inquiriesOpen as { count: bigint }[])[0]?.count ?? 0),
        mailboxPending:        Number((mailboxPending as { count: bigint }[])[0]?.count ?? 0),
        galleryReportsPending: Number((galleryReportsPending as { count: bigint }[])[0]?.count ?? 0),
        refundsPending:        Number((refundsPending as { count: bigint }[])[0]?.count ?? 0),
    };

    return (
        <div className="h-screen overflow-hidden bg-[#f8fafc]">
            <AdminClient dashboardCounts={dashboardCounts} />
        </div>
    );
}
