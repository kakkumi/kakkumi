import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CreatorApplyClient from "./CreatorApplyClient";

export default function CreatorApplyPage() {
    return (
        <div className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#f3f3f3",
            }}>
            <Header />
            <div className="flex-1 max-w-[640px] mx-auto w-full px-6 py-10 pb-24">
                <CreatorApplyClient />
            </div>
            <Footer />
        </div>
    );
}
