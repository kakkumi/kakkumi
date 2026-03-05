import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getServerSession } from "@/lib/session";
import WithdrawClient from "@/app/mypage/settings/withdraw/WithdrawClient";
import { prisma } from "@/lib/prisma";

export default async function WithdrawPage() {
    const session = await getServerSession();

    let avatarUrl: string | null = null;
    if (session?.dbId) {
        try {
            const rows = await prisma.$queryRaw<{ avatarUrl: string | null }[]>`
                SELECT "avatarUrl" FROM "User" WHERE id = ${session.dbId} LIMIT 1
            `;
            avatarUrl = rows[0]?.avatarUrl ?? null;
        } catch {
            avatarUrl = null;
        }
    }

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
            <WithdrawClient session={session} avatarUrl={avatarUrl} />
            <Footer />
        </div>
    );
}
