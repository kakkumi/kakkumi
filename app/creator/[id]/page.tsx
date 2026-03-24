import CreatorProfileClient from "./CreatorProfileClient";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f3f3f3" }}>
            <Header />
            <div className="flex-1">
                <CreatorProfileClient creatorId={id} />
            </div>
            <Footer />
        </div>
    );
}
