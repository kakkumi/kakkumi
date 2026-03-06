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
                backgroundColor: "#f3f3f3",
            }}
        >
            <Header />
            <WithdrawClient session={session} avatarUrl={avatarUrl} />
            <Footer />
        </div>
    );
}
