import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{
                backgroundColor: "#fdfcfc",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
            }}
        >
            {/* ── 네비게이션 바 ── */}
            <header
                className="sticky top-0 z-50 flex items-center justify-between px-6 py-0"
                style={{
                    background: "rgba(236, 236, 240, 0.72)",
                    backdropFilter: "blur(40px) saturate(200%)",
                    WebkitBackdropFilter: "blur(40px) saturate(200%)",
                    borderBottom: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
                    height: 48,
                }}
            >
                <Image src="/카꾸미.png" alt="카꾸미" width={110} height={44} quality={100} unoptimized style={{ objectFit: "contain" }} />
                <nav className="flex items-center gap-6">
                    <a href="#features" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>기능</a>
                    <a href="#how" className="text-[13px] font-medium transition-opacity hover:opacity-60" style={{ color: "#3a3a3c" }}>사용 방법</a>
                    <Link href="/create">
                        <button
                            className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95"
                            style={{ background: "rgba(255,229,0,0.9)", color: "#3A1D1D", boxShadow: "0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.5) inset" }}
                        >
                            테마 만들기
                        </button>
                    </Link>
                </nav>
            </header>

            {/* ── 히어로 섹션 ── */}
            <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-24">
                <h1
                    className="text-[56px] font-extrabold leading-tight tracking-tight mb-4"
                    style={{ color: "#333232", textShadow: "0 1px 2px rgba(255,255,255,0.6)", fontFamily: "'ReperepointSpecialItalic', sans-serif" }}
                >
                    나만의 카카오톡 테마,<br />
                    <span style={{ color: "#edb0b9" }}>카</span>
                    <span style={{ color: "#a3cee8" }}>꾸</span>
                    <span style={{ color: "#f3df56" }}>미</span>로 쉽게 만들어요
                </h1>

                <p className="text-[18px] leading-relaxed mb-10 max-w-xl" style={{ color: "#48484a" }}>
                    색상 하나하나 직접 고르고, 실시간 미리보기로 확인하면서<br />
                    iOS · Android 테마 파일을 바로 다운로드하세요.
                </p>

                <div className="flex items-center gap-4">
                    <Link href="/create">
                        <button
                            className="px-8 py-3.5 rounded-xl text-[16px] font-bold transition-all active:scale-95 hover:brightness-105"
                            style={{ background: "rgba(255,231,58,0.95)", color: "#3A1D1D", boxShadow: "0 4px 16px rgba(255,200,0,0.4), 0 1px 0 rgba(255,255,255,0.5) inset" }}
                        >
                            무료로 시작하기 →
                        </button>
                    </Link>
                    <a
                        href="#how"
                        className="px-8 py-3.5 rounded-xl text-[16px] font-semibold transition-all hover:opacity-80"
                        style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", color: "#3a3a3c", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                    >
                        사용 방법 보기
                    </a>
                </div>

                {/* 히어로 목업 — macOS 스타일 카드 2장 */}
                <div className="mt-16 relative select-none" style={{ width: 420, height: 420 }}>
                    {/* 뒤 카드 — 기본 테마 */}
                    <div
                        className="absolute rounded-2xl overflow-hidden"
                        style={{ width: 260, height: 340, background: "#f5f5f5", top: 20, left: 0, boxShadow: "0 8px 40px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <span className="text-[11px] font-medium ml-2" style={{ color: "#888" }}>기본 테마</span>
                        </div>
                        <div className="px-4 py-3 flex flex-col gap-3">
                            {[
                                { nameW: "w-14", msgW: "w-20" },
                                { nameW: "w-10", msgW: "w-24" },
                                { nameW: "w-16", msgW: "w-16" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-zinc-300 shrink-0" />
                                    <div className="flex flex-col gap-1">
                                        <div className={`h-2 rounded-sm ${item.nameW}`} style={{ background: "rgba(0,0,0,0.15)" }} />
                                        <div className={`h-1.5 rounded-sm ${item.msgW}`} style={{ background: "rgba(0,0,0,0.08)" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 앞 카드 — 내가 만든 테마 */}
                    <div
                        className="absolute rounded-2xl overflow-hidden"
                        style={{ width: 260, height: 360, background: "#eaeaea", top: 60, left: 120, boxShadow: "0 12px 48px rgba(180,160,0,0.18)", border: "1px solid rgba(255,255,255,0.5)" }}
                    >
                        <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                            <span className="text-[11px] font-bold ml-2" style={{ color: "#3a3200" }}>내가 만든 테마</span>
                        </div>
                        <div className="px-4 py-3 flex flex-col gap-3">
                            {[
                                { nameW: "w-14", msgW: "w-20" },
                                { nameW: "w-10", msgW: "w-24" },
                                { nameW: "w-16", msgW: "w-16" },
                                { nameW: "w-12", msgW: "w-20" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "rgba(0,0,0,0.14)" }} />
                                    <div className="flex flex-col gap-1">
                                        <div className={`h-2 rounded-sm ${item.nameW}`} style={{ background: "rgba(0,0,0,0.2)" }} />
                                        <div className={`h-1.5 rounded-sm ${item.msgW}`} style={{ background: "rgba(0,0,0,0.1)" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 기능 소개 ── */}
            <section id="features" className="px-4 md:px-10 py-10">
                <div
                    className="max-w-[1400px] mx-auto rounded-[40px] p-6 md:p-10 flex flex-col gap-7"
                    style={{ backgroundColor: "#FFEF9A", boxShadow: "0 24px 80px rgba(0,0,0,0.03)" }}
                >
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <span className="text-[12px] font-bold tracking-[0.2em] text-black/50 uppercase">특징</span>
                        <h2 className="text-[38px] font-bold leading-[1.05] tracking-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                            왜 카꾸미인가요?<br />
                            <span className="opacity-50 text-[26px]">코드 없이 가볍게</span>
                        </h2>
                        <p className="text-[15px] leading-relaxed break-keep max-w-xl" style={{ color: "#48484a" }}>
                            복잡한 코드 없이 누구나 쉽게 테마를 만들 수 있어요.
                            카꾸미는 요소들을 한곳에 모아, 생각이 분산되지 않고
                            실시간으로 결과를 확인하며 효율적으로 작업할 수 있게 도와줍니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                        {[
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="13.5" cy="6.5" r="3.5" /><circle cx="6.5" cy="14.5" r="3.5" /><circle cx="17.5" cy="17.5" r="3.5" />
                                        <path d="M10 6.5H3M21 6.5h-4M10 17.5H3M21 17.5h-1M16.5 14.5H3M21 14.5h-0.5" strokeWidth="1.4" />
                                    </svg>
                                ),
                                title: "실시간 컬러 편집",
                                desc: "탭바, 헤더, 말풍선, 배경 등 모든 색상을 컬러 피커로 바로 수정하고 즉시 확인해요.",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="5" y="2" width="14" height="20" rx="3" />
                                        <circle cx="12" cy="18" r="1" fill="#4a90d9" />
                                        <path d="M9 6h6M9 9h4" />
                                    </svg>
                                ),
                                title: "실시간 미리보기",
                                desc: "iOS · Android 화면을 실제 폰 목업으로 바로 확인하면서 작업할 수 있어요.",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3v13M7 11l5 5 5-5" />
                                        <path d="M5 20h14" />
                                    </svg>
                                ),
                                title: "원클릭 다운로드",
                                desc: "iOS용 .ktheme 파일과 Android APK를 버튼 한 번으로 바로 다운로드해요.",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a259f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                ),
                                title: "이미지 업로드",
                                desc: "배경 이미지, 말풍선, 탭 아이콘 등 원하는 이미지를 자유롭게 교체해요.",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                                    </svg>
                                ),
                                title: "다크모드 지원",
                                desc: "라이트 / 다크 테마를 토글 하나로 손쉽게 전환해 제작할 수 있어요.",
                            },
                            {
                                icon: (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2a10 10 0 1 0 10 10" />
                                        <path d="M17 3v4h4" />
                                        <path d="M21 3l-4 4" />
                                    </svg>
                                ),
                                title: "무료 · 무설치",
                                desc: "별도 프로그램 설치 없이 브라우저에서 바로 무료로 사용할 수 있어요.",
                            },
                        ].map((f, i) => (
                            <div key={i} className="bg-white rounded-[28px] p-7 flex flex-col gap-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl" style={{ minHeight: "180px" }}>
                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shadow-inner">
                                    {f.icon}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-[18px] font-bold" style={{ color: "#1c1c1e" }}>{f.title}</h3>
                                    <p className="text-[13px] leading-relaxed text-gray-500 break-keep">{f.desc}</p>
                                </div>
                                <div className="mt-auto flex items-center gap-2 pt-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <div className="h-[2px] w-10 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 사용 방법 ── */}
            <section id="how" className="px-4 md:px-10 py-10">
                <div
                    className="max-w-[1400px] mx-auto rounded-[40px] p-6 md:p-10 flex flex-col gap-7"
                    style={{ backgroundColor: "#aabde8", boxShadow: "0 24px 80px rgba(0,0,0,0.03)" }}
                >
                    <div className="flex flex-col gap-4 max-w-2xl">
                        <span className="text-[12px] font-bold tracking-[0.2em] text-black/40 uppercase">사용 방법</span>
                        <h2 className="text-[38px] font-bold leading-[1.05] tracking-tight" style={{ color: "#1c1c1e", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                            3단계로 끝나는 테마 제작<br />
                            <span className="opacity-50 text-[26px]">어렵지 않아요</span>
                        </h2>
                        <p className="text-[15px] leading-relaxed break-keep max-w-xl" style={{ color: "#2a2a2a" }}>
                            딱 3단계면 내 테마가 완성돼요. 카꾸미와 함께라면
                            누구나 쉽고 빠르게 나만의 카카오톡 테마를 만들 수 있어요.
                        </p>
                    </div>

                    <div className="flex flex-col gap-5">
                        {[
                            { step: "01", title: "색상과 이미지를 골라요", desc: "왼쪽 패널에서 탭바, 헤더, 말풍선 등 원하는 요소의 색상을 컬러 피커로 변경하고, 배경 이미지도 업로드해요." },
                            { step: "02", title: "실시간으로 미리봐요", desc: "화면 중앙의 목업에서 내가 만든 테마가 실제 카카오톡에서 어떻게 보이는지 탭별로 확인해요." },
                            { step: "03", title: "다운로드하고 적용해요", desc: "우측 상단 다운로드 버튼을 눌러 .ktheme 파일을 받아 카카오톡 테마 스토어에 등록하거나 바로 적용해요." },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="bg-white rounded-[28px] p-7 flex items-start gap-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                                <span className="text-[28px] font-black shrink-0 leading-none mt-0.5" style={{ color: "#aabde8" }}>{step}</span>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-[17px] font-bold" style={{ color: "#1c1c1e" }}>{title}</h3>
                                    <p className="text-[13px] leading-relaxed text-gray-500 break-keep">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 푸터 ── */}
            <footer
                className="mt-auto px-8 py-5 flex flex-col gap-2"
                style={{ background: "rgba(236,236,240,0.6)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(0,0,0,0.07)" }}
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-[12px]" style={{ color: "#3a3a3c" }}>
                            주식회사 카꾸미 · 대표자 장환희 · 이메일 <a href="mailto:aaa@kakkumi.com" className="hover:underline" style={{ color: "#3a3a3c" }}>aaa@kakkumi.com</a>
                        </p>
                        <p className="text-[11px]" style={{ color: "#8e8e93" }}>© 2026 카꾸미. 카카오톡과 무관한 개인 제작 툴입니다.</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>이용약관</a>
                        <a href="#" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>개인정보처리방침</a>
                        <a href="mailto:aaa@kakkumi.com" className="text-[12px] hover:underline" style={{ color: "#6b6b6b" }}>문의</a>
                        <a href="https://instagram.com/kakkumi" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="1" fill="#6b6b6b" stroke="none" />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}