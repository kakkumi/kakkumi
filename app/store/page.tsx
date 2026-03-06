import StoreContent from "./StoreContent";
import Header from "../components/Header";

export default async function StorePage() {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundColor: "#f3f3f3",
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
