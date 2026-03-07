import Link from "next/link";
import { Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroTitle from "./components/HeroTitle";
import LoginBlockedNotice from "./components/LoginBlockedNotice";

const features = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(255,149,0)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="3.5" /><circle cx="6.5" cy="14.5" r="3.5" /><circle cx="17.5" cy="17.5" r="3.5" />
                <path d="M10 6.5H3M21 6.5h-4M10 17.5H3M21 17.5h-1M16.5 14.5H3M21 14.5h-0.5" strokeWidth="1.4" />
            </svg>
        ),
        title: "실시간 컬러 편집",
        desc: "탭바, 헤더, 말풍선, 배경 등 모든 색상을 컬러 피커로 바로 수정하고 즉시 확인해요.",
        num: "01",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <circle cx="12" cy="18" r="1" fill="rgb(74,123,247)" />
                <path d="M9 6h6M9 9h4" />
            </svg>
        ),
        title: "실시간 미리보기",
        desc: "iOS · Android 화면을 실제 폰 목업으로 바로 확인하면서 작업할 수 있어요.",
        num: "02",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v13M7 11l5 5 5-5" />
                <path d="M5 20h14" />
            </svg>
        ),
        title: "원클릭 다운로드",
        desc: "iOS용 .ktheme 파일과 Android APK를 버튼 한 번으로 바로 다운로드해요.",
        num: "03",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a259f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
            </svg>
        ),
        title: "이미지 업로드",
        desc: "배경 이미지, 말풍선, 탭 아이콘 등 원하는 이미지를 자유롭게 교체해요.",
        num: "04",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
            </svg>
        ),
        title: "다크모드 지원",
        desc: "라이트 / 다크 테마를 토글 하나로 손쉽게 전환해 제작할 수 있어요.",
        num: "05",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M17 3v4h4" />
                <path d="M21 3l-4 4" />
            </svg>
        ),
        title: "무료 · 무설치",
        desc: "별도 프로그램 설치 없이 브라우저에서 바로 무료로 사용할 수 있어요.",
        num: "06",
    },
] as const;

const steps = [
    { step: "01", title: "색상과 이미지를 골라요", desc: "왼쪽 패널에서 탭바, 헤더, 말풍선 등 원하는 요소의 색상을 컬러 피커로 변경하고, 배경 이미지도 업로드해요.", accent: "rgb(255,149,0)" },
    { step: "02", title: "실시간으로 미리봐요", desc: "화면 중앙의 목업에서 내가 만든 테마가 실제 카카오톡에서 어떻게 보이는지 탭별로 확인해요.", accent: "rgb(74,123,247)" },
    { step: "03", title: "다운로드하고 적용해요", desc: "우측 상단 다운로드 버튼을 눌러 .ktheme 파일을 받아 카카오톡 테마 스토어에 등록하거나 바로 적용해요.", accent: "#34c759" },
] as const;

export default function Home() {
    return (
        <div
            className="min-h-screen flex flex-col mac-scroll"
            style={{ backgroundColor: "#f3f3f3" }}
        >
            <Header />
            <Suspense fallback={null}><LoginBlockedNotice /></Suspense>

            <main className="flex-1">
                <section className="relative overflow-hidden px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28">

                    <div className="relative z-10 mx-auto flex w-full max-w-[1240px] flex-col gap-16 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center lg:gap-10">
                        <div className="max-w-[620px]">
                            <div className="mb-8 flex flex-wrap items-center gap-3 text-left">
                                <span
                                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                    style={{ color: "#6a6a6a", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.48)", backdropFilter: "blur(12px)" }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: "999px", background: "rgb(255,149,0)", display: "inline-block" }} />
                                    무료로 사용 가능
                                </span>
                                <span
                                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase"
                                    style={{ color: "#6a6a6a", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.48)", backdropFilter: "blur(12px)" }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: "999px", background: "rgb(74,123,247)", display: "inline-block" }} />
                                    설치 불필요
                                </span>
                            </div>

                            <div className="text-left">
                                <HeroTitle />
                            </div>

                            <div className="mt-10 max-w-[560px] space-y-4">
                                <p className="text-[17px] leading-[1.9] md:text-[18px]" style={{ color: "#5f6672" }}>
                                    색상 하나하나 직접 고르고, 실시간 미리보기로 확인하면서
                                    iOS · Android 테마 파일을 바로 다운로드하세요.
                                </p>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium" style={{ color: "#7b818c" }}>
                                    <span className="inline-flex items-center gap-2">
                                        <span style={{ width: 18, height: 1, background: "rgba(255,149,0,0.45)" }} />
                                        편집부터 적용까지 한 흐름으로
                                    </span>
                                    <span className="inline-flex items-center gap-2">
                                        <span style={{ width: 18, height: 1, background: "rgba(74,123,247,0.45)" }} />
                                        실제 서비스처럼 정돈된 경험
                                    </span>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-wrap items-center gap-5">
                                <Link href="/create">
                                    <button
                                        className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                                        style={{ background: "rgb(255,149,0)", color: "#fff", boxShadow: "0 14px 36px rgba(255,149,0,0.28)" }}
                                    >
                                        무료로 시작하기
                                        <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                                    </button>
                                </Link>
                                <div className="text-[13px] leading-6" style={{ color: "#7f848d" }}>
                                    가입 없이도 미리 체험 가능해요.
                                    <br />
                                    지금 바로 화면에서 분위기를 확인해보세요.
                                </div>
                            </div>
                        </div>

                        <div className="relative mx-auto flex w-full max-w-[520px] justify-center lg:justify-end">
                            <div className="relative h-[540px] w-full max-w-[520px]">
                                <div className="mt-20 relative select-none mx-auto" style={{ width: 480, height: 420 }}>
                                    <div
                                        className="absolute rounded-2xl overflow-hidden"
                                        style={{ width: 255, height: 320, background: "#fff", top: 30, left: 10, boxShadow: "0 12px 48px rgba(0,0,0,0.09)", border: "1px solid rgba(0,0,0,0.05)", transform: "rotate(-4deg)" }}
                                    >
                                        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "#fafafa", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                            </div>
                                            <span className="text-[11px] font-medium ml-2" style={{ color: "#aaa" }}>기본 테마</span>
                                        </div>
                                        <div className="px-4 py-3 flex flex-col gap-3">
                                            {[
                                                { nameW: "w-14", msgW: "w-20" },
                                                { nameW: "w-10", msgW: "w-24" },
                                                { nameW: "w-16", msgW: "w-16" },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-200 shrink-0" />
                                                    <div className="flex flex-col gap-1">
                                                        <div className={`h-2 rounded-sm ${item.nameW}`} style={{ background: "rgba(0,0,0,0.1)" }} />
                                                        <div className={`h-1.5 rounded-sm ${item.msgW}`} style={{ background: "rgba(0,0,0,0.06)" }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        className="absolute rounded-2xl overflow-hidden"
                                        style={{ width: 278, height: 378, background: "#fff", top: 12, left: 182, boxShadow: "0 14px 38px rgba(74,123,247,0.07)", border: "1px solid rgba(74,123,247,0.06)", transform: "rotate(2.5deg)" }}
                                    >
                                        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "rgba(74,123,247,0.03)", borderBottom: "1px solid rgba(74,123,247,0.06)" }}>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                            </div>
                                            <span className="text-[11px] font-bold ml-2" style={{ color: "rgba(74,123,247,0.78)" }}>내가 만든 테마</span>
                                        </div>
                                        <div className="px-4 py-3 flex flex-col gap-3">
                                            {[
                                                { nameW: "w-14", msgW: "w-20" },
                                                { nameW: "w-10", msgW: "w-24" },
                                                { nameW: "w-16", msgW: "w-16" },
                                                { nameW: "w-12", msgW: "w-20" },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "rgba(74,123,247,0.07)" }} />
                                                    <div className="flex flex-col gap-1">
                                                        <div className={`h-2 rounded-sm ${item.nameW}`} style={{ background: "rgba(74,123,247,0.09)" }} />
                                                        <div className={`h-1.5 rounded-sm ${item.msgW}`} style={{ background: "rgba(74,123,247,0.045)" }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                <section id="features" className="px-6 py-20 md:px-10 md:py-24">
                    <div className="mx-auto w-full max-w-[1240px]">
                        {/* 섹션 헤더 */}
                        <div className="mb-16 flex flex-col gap-3">
                            <span className="text-[11px] font-bold tracking-[0.24em] uppercase" style={{ color: "rgb(74,123,247)" }}>Features</span>
                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <h2 className="text-[36px] font-semibold leading-[1.28] tracking-tight md:text-[44px]" style={{ color: "#17191f" }}>
                                    왜 카꾸미인가요?
                                </h2>
                                <p className="text-[15px] leading-[1.9] break-keep md:text-right md:max-w-[360px]" style={{ color: "#69707b" }}>
                                    복잡한 코드 없이 누구나 쉽게 테마를 만들 수 있어요.
                                    모든 요소를 한곳에서, 실시간으로 확인하며 작업하세요.
                                </p>
                            </div>
                        </div>

                        {/* 피처 그리드 */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2">
                            {features.map((feature, index) => (
                                <div
                                    key={feature.num}
                                    className="flex gap-6 py-8"
                                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                                >
                                    <div className="flex flex-col items-center gap-3 pt-1 shrink-0">
                                        <span className="text-[11px] font-medium tabular-nums" style={{ color: "#c4c8cf" }}>{feature.num}</span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: index % 2 === 0 ? "rgba(255,149,0,0.07)" : "rgba(74,123,247,0.07)" }}>
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-1">
                                        <h3 className="text-[17px] font-semibold leading-[1.5]" style={{ color: "#16181e" }}>{feature.title}</h3>
                                        <p className="text-[14px] leading-[1.95] break-keep" style={{ color: "#7a8290" }}>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="how" className="px-6 py-20 md:px-10 md:py-24">
                    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-14 border-t pt-16" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                            <div>
                                <span className="block text-[11px] font-bold tracking-[0.24em] uppercase" style={{ color: "rgb(255,149,0)" }}>How it works</span>
                                <h2 className="mt-4 text-[38px] font-semibold leading-[1.28] tracking-tight md:text-[46px]" style={{ color: "#17191f", fontFamily: "'ChosunIlboMyungjo', serif" }}>
                                    3단계로 끝나는
                                    <br />
                                    테마 제작 흐름
                                </h2>
                            </div>
                            <p className="max-w-[560px] text-[15px] leading-[2] break-keep justify-self-end" style={{ color: "#69707b" }}>
                                설명을 읽는 순간 바로 과정을 상상할 수 있도록, 단계별 정보를 세로 리듬으로 재배치했습니다.
                            </p>
                        </div>

                        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
                            {steps.map(({ step, title, desc, accent }) => (
                                <div key={step} className="flex flex-col gap-6 border-t pt-6" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                                    <div className="flex items-end justify-between gap-4">
                                        <span className="text-[54px] font-black leading-none" style={{ color: accent, opacity: 0.22, fontVariantNumeric: "tabular-nums" }}>{step}</span>
                                        <div style={{ width: 44, height: 2, background: accent, borderRadius: 999 }} />
                                    </div>
                                    <div>
                                        <h3 className="text-[20px] font-semibold leading-[1.6]" style={{ color: "#17191f" }}>{title}</h3>
                                        <p className="mt-3 text-[15px] leading-[1.95] break-keep" style={{ color: "#727986" }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-start justify-between gap-6 border-t pt-8 md:flex-row md:items-center" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                            <p className="text-[15px] leading-[1.9]" style={{ color: "#6f7682" }}>지금 바로 시작해보세요. 가입 없이도 미리 체험 가능해요.</p>
                            <Link href="/create">
                                <button
                                    className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                                    style={{ background: "rgb(255,149,0)", color: "#fff", boxShadow: "0 14px 34px rgba(255,149,0,0.24)" }}
                                >
                                    테마 만들러 가기
                                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
