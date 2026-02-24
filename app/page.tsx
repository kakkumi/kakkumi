import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col mac-scroll"
      style={{
        backgroundImage: "url('/back.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ── 네비게이션 바 ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-0"
        style={{
          background: "rgba(236, 236, 240, 0.72)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
          height: 52,
        }}
      >
        <Image
          src="/카꾸미.png"
          alt="카꾸미"
          width={110}
          height={44}
          quality={100}
          unoptimized
          style={{ objectFit: "contain" }}
        />
        <nav className="flex items-center gap-6">
          <a
            href="#features"
            className="text-[13px] font-medium transition-opacity hover:opacity-60"
            style={{ color: "#3a3a3c" }}
          >
            기능
          </a>
          <a
            href="#how"
            className="text-[13px] font-medium transition-opacity hover:opacity-60"
            style={{ color: "#3a3a3c" }}
          >
            사용 방법
          </a>
          <Link href="/create">
            <button
              className="px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all active:scale-95"
              style={{
                background: "rgba(255,229,0,0.9)",
                color: "#3A1D1D",
                boxShadow:
                  "0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.5) inset",
              }}
            >
              테마 만들기
            </button>
          </Link>
        </nav>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-24">
        <h1
          className="text-[56px] font-extrabold leading-tight tracking-tight mb-6"
          style={{
            color: "#1c1c1e",
            textShadow: "0 1px 2px rgba(255,255,255,0.6)",
          }}
        >
          나만의 카카오톡 테마,
          <br />
          <span style={{ color: "#b8860b" }}>카꾸미</span>로 쉽게 만들어요
        </h1>

        <p
          className="text-[18px] leading-relaxed mb-10 max-w-xl"
          style={{ color: "#48484a" }}
        >
          색상 하나하나 직접 고르고, 실시간 미리보기로 확인하면서
          <br />
          iOS · Android 테마 파일을 바로 다운로드하세요.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/create">
            <button
              className="px-8 py-3.5 rounded-xl text-[16px] font-bold transition-all active:scale-95 hover:brightness-105"
              style={{
                background: "rgba(255,229,0,0.95)",
                color: "#3A1D1D",
                boxShadow:
                  "0 4px 16px rgba(255,200,0,0.4), 0 1px 0 rgba(255,255,255,0.5) inset",
              }}
            >
              무료로 시작하기 →
            </button>
          </Link>
          <a
            href="#how"
            className="px-8 py-3.5 rounded-xl text-[16px] font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.7)",
              color: "#3a3a3c",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            사용 방법 보기
          </a>
        </div>

        {/* 히어로 목업 이미지 힌트 */}
        <div className="mt-16 flex items-end justify-center gap-6 select-none">
          {/* 폰 목업 3개 — 색 블록으로 표현 */}
          {[
            { bg: "#FEE500", rotate: "-6deg", scale: "0.88", label: "옐로우" },
            { bg: "#ffffff", rotate: "0deg", scale: "1", label: "화이트" },
            { bg: "#1c1c1e", rotate: "6deg", scale: "0.88", label: "블랙" },
          ].map(({ bg, rotate, scale, label }) => (
            <div
              key={label}
              style={{
                transform: `rotate(${rotate}) scale(${scale})`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="relative rounded-[32px] border-[5px] border-zinc-800 overflow-hidden"
                style={{
                  width: 180,
                  height: 360,
                  background: bg,
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.1) inset",
                }}
              >
                {/* 다이나믹 아일랜드 */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-full z-10" />
                {/* 헤더 */}
                <div
                  className="absolute top-7 left-0 right-0 h-9 flex items-center px-3"
                  style={{
                    background:
                      bg === "#1c1c1e" ? "#2c2c2e" : "rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    className="text-[9px] font-bold flex-1"
                    style={{
                      color: bg === "#1c1c1e" ? "#ffffff" : "#1c1c1e",
                    }}
                  >
                    친구
                  </span>
                  <span
                    className="text-[8px]"
                    style={{
                      color: bg === "#1c1c1e" ? "#ffffff" : "#1c1c1e",
                    }}
                  >
                    🔍
                  </span>
                </div>
                {/* 프로필 */}
                <div
                  className="absolute flex items-center gap-2 px-3"
                  style={{ top: 56 }}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-400 shrink-0" />
                  <div>
                    <div
                      className="w-12 h-2 rounded-sm mb-1"
                      style={{
                        background:
                          bg === "#1c1c1e"
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(0,0,0,0.15)",
                      }}
                    />
                    <div
                      className="w-16 h-1.5 rounded-sm"
                      style={{
                        background:
                          bg === "#1c1c1e"
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.08)",
                      }}
                    />
                  </div>
                </div>
                {/* 친구 목록 */}
                {[80, 104, 128, 152, 176, 200, 224].map((top) => (
                  <div
                    key={top}
                    className="absolute flex items-center gap-2 px-3"
                    style={{ top }}
                  >
                    <div
                      className="w-6 h-6 rounded-full bg-zinc-300 shrink-0"
                      style={{
                        opacity: bg === "#1c1c1e" ? 0.3 : 0.5,
                      }}
                    />
                    <div
                      className="w-14 h-1.5 rounded-sm"
                      style={{
                        background:
                          bg === "#1c1c1e"
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                ))}
                {/* 탭바 */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-around rounded-b-[26px]"
                  style={{
                    background:
                      bg === "#1c1c1e" ? "#2c2c2e" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {["●", "○", "○", "○", "○"].map((dot, i) => (
                    <span
                      key={i}
                      className="text-[6px]"
                      style={{
                        color:
                          bg === "#1c1c1e"
                            ? i === 0
                              ? "#FEE500"
                              : "#666"
                            : i === 0
                            ? "#3A1D1D"
                            : "#aaa",
                      }}
                    >
                      {dot}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 기능 소개 ── */}
      <section id="features" className="px-8 py-20">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-[32px] font-bold text-center mb-3"
            style={{ color: "#1c1c1e" }}
          >
            왜 카꾸미인가요?
          </h2>
          <p
            className="text-[15px] text-center mb-12"
            style={{ color: "#6b6b6b" }}
          >
            복잡한 코드 없이 누구나 쉽게 테마를 만들 수 있어요.
          </p>

          <div className="grid grid-cols-3 gap-5">
            {[
              {
                icon: "🎨",
                title: "실시간 컬러 편집",
                desc: "탭바, 헤더, 말풍선, 배경 등 모든 색상을\n컬러 피커로 바로 수정하고 즉시 확인해요.",
              },
              {
                icon: "📱",
                title: "실시간 미리보기",
                desc: "iOS · Android 화면을 실제 폰 목업으로\n바로 확인하면서 작업할 수 있어요.",
              },
              {
                icon: "⬇️",
                title: "원클릭 다운로드",
                desc: "iOS용 .ktheme 파일과 Android APK를\n버튼 한 번으로 바로 다운로드해요.",
              },
              {
                icon: "🖼️",
                title: "이미지 업로드",
                desc: "배경 이미지, 말풍선, 탭 아이콘 등\n원하는 이미지를 자유롭게 교체해요.",
              },
              {
                icon: "🌙",
                title: "다크모드 지원",
                desc: "라이트 / 다크 테마를 토글 하나로\n손쉽게 전환해 제작할 수 있어요.",
              },
              {
                icon: "✨",
                title: "무료 · 무설치",
                desc: "별도 프로그램 설치 없이 브라우저에서\n바로 무료로 사용할 수 있어요.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{
                  background: "rgba(255,255,255,0.48)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                <span className="text-[32px]">{icon}</span>
                <h3
                  className="text-[16px] font-bold"
                  style={{ color: "#1c1c1e" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed whitespace-pre-line"
                  style={{ color: "#6b6b6b" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 사용 방법 ── */}
      <section id="how" className="px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-[32px] font-bold text-center mb-3"
            style={{ color: "#1c1c1e" }}
          >
            3단계로 끝나는 테마 제작
          </h2>
          <p
            className="text-[15px] text-center mb-14"
            style={{ color: "#6b6b6b" }}
          >
            어렵지 않아요. 딱 3단계면 내 테마가 완성돼요.
          </p>

          <div className="flex flex-col gap-5">
            {[
              {
                step: "01",
                title: "색상과 이미지를 골라요",
                desc: "왼쪽 패널에서 탭바, 헤더, 말풍선 등 원하는 요소의 색상을 컬러 피커로 변경하고, 배경 이미지도 업로드해요.",
              },
              {
                step: "02",
                title: "실시간으로 미리봐요",
                desc: "화면 중앙의 목업에서 내가 만든 테마가 실제 카카오톡에서 어떻게 보이는지 탭별로 확인해요.",
              },
              {
                step: "03",
                title: "다운로드하고 적용해요",
                desc: "우측 상단 다운로드 버튼을 눌러 .ktheme 파일을 받아 카카오톡 테마 스토어에 등록하거나 바로 적용해요.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex items-start gap-6 rounded-2xl px-7 py-6"
                style={{
                  background: "rgba(255,255,255,0.48)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 20px rgba(0,0,0,0.06)",
                }}
              >
                <span
                  className="text-[28px] font-black shrink-0 leading-none mt-0.5"
                  style={{ color: "rgba(255,200,0,0.8)" }}
                >
                  {step}
                </span>
                <div>
                  <h3
                    className="text-[17px] font-bold mb-1.5"
                    style={{ color: "#1c1c1e" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: "#6b6b6b" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA 섹션 ── */}
      <section className="px-8 py-20 flex flex-col items-center text-center">
        <div
          className="w-full max-w-2xl rounded-3xl px-12 py-14 flex flex-col items-center gap-6"
          style={{
            background: "rgba(255,229,0,0.22)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid rgba(255,210,0,0.45)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.8) inset, 0 16px 48px rgba(255,180,0,0.15)",
          }}
        >
          <h2
            className="text-[32px] font-extrabold leading-tight"
            style={{ color: "#1c1c1e" }}
          >
            지금 바로 나만의 테마를
            <br />
            만들어보세요
          </h2>
          <p className="text-[15px]" style={{ color: "#48484a" }}>
            무료로, 브라우저에서, 설치 없이.
          </p>
          <Link href="/create">
            <button
              className="px-10 py-4 rounded-xl text-[16px] font-bold transition-all active:scale-95 hover:brightness-105"
              style={{
                background: "rgba(255,229,0,0.97)",
                color: "#3A1D1D",
                boxShadow:
                  "0 4px 20px rgba(200,160,0,0.35), 0 1px 0 rgba(255,255,255,0.5) inset",
              }}
            >
              테마 제작 시작하기 →
            </button>
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer
        className="mt-auto px-8 py-6 flex items-center justify-between"
        style={{
          background: "rgba(236,236,240,0.6)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Image
          src="/카꾸미.png"
          alt="카꾸미"
          width={80}
          height={32}
          quality={100}
          unoptimized
          style={{ objectFit: "contain", opacity: 0.6 }}
        />
        <p className="text-[12px]" style={{ color: "#8e8e93" }}>
          © 2026 카꾸미. 카카오톡과 무관한 개인 제작 툴입니다.
        </p>
      </footer>
    </div>
  );
}
