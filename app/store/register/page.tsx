import { getServerSession } from "@/lib/session";
import { getUserPlan } from "@/lib/subscription";
import RegisterForm from "./RegisterForm";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default async function RegisterPage() {
    const session = await getServerSession();

    const bgStyle = {
        backgroundColor: "#f3f3f3",
    };

    // 비로그인
    if (!session) {
        return (
            <div className="min-h-screen flex flex-col" style={bgStyle}>
                <Header />
                <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-6 py-24 text-center">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,149,0,0.08)" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col gap-1.5 text-center">
                            <h2 className="text-[20px] font-bold" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>로그인이 필요해요</h2>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>테마를 등록하려면 카카오 로그인을 해주세요.</p>
                        </div>
                        <a href="/api/auth/kakao">
                            <button className="px-7 py-3 rounded-xl text-[14px] font-bold transition-all active:scale-95 hover:brightness-105"
                                style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.25)" }}>
                                카카오 로그인
                            </button>
                        </a>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // 로그인은 했지만 일반 USER — 무료 테마만 등록 가능
    // (CREATOR, ADMIN은 유료 포함 전체 가능)

    // CREATOR, ADMIN, USER 모두 등록 폼 표시 (가격 제한은 RegisterForm 내부에서)
    const plan = await getUserPlan(session.dbId, session.role);
    const isPro = plan === "PRO" || plan === "CREATOR" || plan === "ADMIN";

    return (
        <div className="min-h-screen flex flex-col" style={bgStyle}>
            <Header />
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 pt-10 pb-20 flex flex-col gap-6">
                <RegisterForm
                    role={session.role}
                    isPro={isPro}
                    authorName={session.nickname ?? session.name ?? "사용자"}
                    headerSlot={
                        <div className="flex flex-col items-start gap-2">
                            <h1 className="text-[30px] font-extrabold leading-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                테마 등록하기
                            </h1>
                            <p className="text-[14px]" style={{ color: "#8e8e93" }}>
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
