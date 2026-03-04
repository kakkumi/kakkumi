import { getServerSession } from "@/lib/session";
import RegisterForm from "./RegisterForm";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

export default async function RegisterPage() {
    const session = await getServerSession();

    const bgStyle = {
        backgroundColor: "#fdfcfc",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
    };

    const cardStyle = {
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    };

    // 비로그인
    if (!session) {
        return (
            <div className="min-h-screen flex flex-col" style={bgStyle}>
                <Header />
                <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-6 p-12 rounded-[28px]" style={cardStyle}>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#f5f5f5" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                            <h2 className="text-[18px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                            <p className="text-[13px]" style={{ color: "#8e8e93" }}>테마를 등록하려면 카카오 로그인을 해주세요.</p>
                        </div>
                        <a href="/api/auth/kakao">
                            <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.3)" }}>
                                카카오 로그인
                            </button>
                        </a>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // 로그인은 했지만 일반 USER (크리에이터 아님)
    if (session.role === "USER") {
        return (
            <div className="min-h-screen flex flex-col" style={bgStyle}>
                <Header />
                <div className="flex-1 max-w-[760px] mx-auto w-full px-6 pt-16 pb-20 flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-7 p-12 rounded-[28px] text-center" style={cardStyle}>
                        {/* 아이콘 */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,149,0,0.12)" }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[22px] font-extrabold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                크리에이터 입점이 필요해요
                            </h2>
                            <p className="text-[14px] leading-relaxed" style={{ color: "#8e8e93" }}>
                                카꾸미 스토어는 검증된 크리에이터만 테마를 등록할 수 있어요.<br />
                                입점 신청을 통해 크리에이터로 활동을 시작해보세요!
                            </p>
                        </div>

                        {/* 혜택 안내 */}
                        <div className="w-full flex flex-col gap-2.5 text-left">
                            {[
                                { icon: "💰", title: "수익 창출", desc: "판매 금액의 70%를 수익으로 받아가세요." },
                                { icon: "🎨", title: "나만의 스토어", desc: "내 테마를 스토어에 올리고 많은 사람들과 공유해요." },
                                { icon: "📊", title: "판매 통계", desc: "내 테마의 판매 현황을 실시간으로 확인하세요." },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3 px-4 py-3 rounded-[14px]" style={{ background: "rgba(0,0,0,0.03)" }}>
                                    <span className="text-[18px] shrink-0">{item.icon}</span>
                                    <div>
                                        <p className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{item.title}</p>
                                        <p className="text-[12px] mt-0.5" style={{ color: "#8e8e93" }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <Link href="/mypage/creator-apply">
                                <button className="w-full py-3.5 rounded-[14px] text-[15px] font-bold transition-all active:scale-[0.98] hover:brightness-105"
                                    style={{ background: "#FF9500", color: "#fff", boxShadow: "0 4px 20px rgba(255,149,0,0.3)" }}>
                                    크리에이터 입점 신청하기
                                </button>
                            </Link>
                            <Link href="/store">
                                <button className="w-full py-3 rounded-[14px] text-[14px] font-medium transition-all hover:opacity-70"
                                    style={{ background: "rgba(0,0,0,0.05)", color: "#3a3a3c" }}>
                                    스토어 둘러보기
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // CREATOR 또는 ADMIN — 테마 등록 폼 표시
    return (
        <div className="min-h-screen flex flex-col" style={bgStyle}>
            <Header />
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">
                <RegisterForm
                    authorName={session.nickname ?? session.name ?? "사용자"}
                    headerSlot={
                        <div className="flex flex-col items-start gap-2">
                            <h1 className="text-[32px] font-extrabold leading-tight text-[#1c1c1e]" style={{ fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                테마 등록하기
                            </h1>
                            <p className="text-[14px] text-[#8e8e93]">
                                직접 만든 테마를 스토어에 등록하고 다른 사용자와 공유해보세요.
                            </p>
                        </div>
                    }
                />
            </div>
            <Footer />
        </div>
    );
}
