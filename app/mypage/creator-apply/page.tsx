import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CreatorApplyClient from "./CreatorApplyClient";

export default function CreatorApplyPage() {
    return (
        <div className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}>
            <Header />
            <div className="flex-1 max-w-[640px] mx-auto w-full px-6 py-10 pb-24">
                <CreatorApplyClient />
            </div>
            <Footer />
        </div>
    );
}
