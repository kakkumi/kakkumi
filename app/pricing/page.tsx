import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PricingClient from "./PricingClient";

export default async function PricingPage() {
    const session = await getServerSession();

    let isSubscribed = false;
    let subscriptionStatus: string | null = null;

    if (session?.dbId) {
        const sub = await prisma.subscription.findUnique({
            where: { userId: session.dbId },
        });
        if (sub && String(sub.status).toUpperCase() === "ACTIVE") {
            isSubscribed = true;
            subscriptionStatus = String(sub.status);
        }
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <PricingClient
                isLoggedIn={!!session}
                isSubscribed={isSubscribed}
                subscriptionStatus={subscriptionStatus}
                role={session?.role ?? null}
            />
            <Footer />
        </div>
    );
}
