import StoreContent from "./StoreContent";
import Header from "../components/Header";

export default async function StorePage() {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            {/* ── 네비게이션 바 ── */}
            <Header />

            {/* ── 본문 (스크롤 영역) ── */}
            <div id="store-scroll" className="flex-1">
                <StoreContent />
            </div>
        </div>
    );
}
