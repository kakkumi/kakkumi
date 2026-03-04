import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AdminClient from "@/app/admin/AdminClient";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
    const session = await requireAdmin();
    if (!session) redirect("/");

    // 통계 데이터
    const [userCount, themeCount, purchaseCount, inquiryCount] = await Promise.all([
        prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "User"`,
        prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Theme"`,
        prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Purchase" WHERE status = 'COMPLETED'`,
        prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Inquiry"`,
    ]).catch(() => [[{ count: BigInt(0) }], [{ count: BigInt(0) }], [{ count: BigInt(0) }], [{ count: BigInt(0) }]]);

    // 최근 유저 목록
    const recentUsers = await prisma.$queryRaw<{
        id: string;
        name: string;
        nickname: string | null;
        email: string | null;
        role: string;
        createdAt: Date;
    }[]>`
        SELECT id, name, nickname, email, role, "createdAt"
        FROM "User"
        ORDER BY "createdAt" DESC
        LIMIT 10
    `.catch(() => []);

    // 최근 구매 목록
    const recentPurchases = await prisma.$queryRaw<{
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        buyerName: string;
        themeTitle: string;
    }[]>`
        SELECT p.id, p.amount, p.status, p."createdAt",
               u.nickname AS "buyerName",
               t.title AS "themeTitle"
        FROM "Purchase" p
        JOIN "User" u ON p."buyerId" = u.id
        JOIN "Theme" t ON p."themeId" = t.id
        ORDER BY p."createdAt" DESC
        LIMIT 10
    `.catch(() => []);

    const stats = {
        userCount: Number((userCount as { count: bigint }[])[0]?.count ?? 0),
        themeCount: Number((themeCount as { count: bigint }[])[0]?.count ?? 0),
        purchaseCount: Number((purchaseCount as { count: bigint }[])[0]?.count ?? 0),
        inquiryCount: Number((inquiryCount as { count: bigint }[])[0]?.count ?? 0),
    };

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            <Header />
            <AdminClient
                stats={stats}
                recentUsers={recentUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
                recentPurchases={recentPurchases.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
            />
            <Footer />
        </div>
    );
}
