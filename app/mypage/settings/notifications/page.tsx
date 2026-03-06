import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { getServerSession } from "@/lib/session";
import NotificationsClient from "./NotificationsClient";

export default async function NotificationsPage() {
    const session = await getServerSession();

    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#f3f3f3",
            }}
        >
            <Header />
            <NotificationsClient session={session} />
            <Footer />
        </div>
    );
}
