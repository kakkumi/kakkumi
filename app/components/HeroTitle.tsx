"use client";

export default function HeroTitle() {
    return (
        <h1
            className="text-[56px] font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: "#333232", textShadow: "0 1px 2px rgba(255,255,255,0.6)", fontFamily: "'JejuStoneWall', sans-serif" }}
        >
            <span style={{ position: "relative", display: "inline-block" }}>
                {/* 수채화 붓 한 획 SVG */}
                <svg
                    aria-hidden
                    style={{
                        position: "absolute",
                        left: "-16px",
                        top: "30%",
                        width: "calc(100% + 32px)",
                        height: "80%",
                        zIndex: 0,
                        pointerEvents: "none",
                        overflow: "visible",
                    }}
                    viewBox="0 0 460 44"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* 울퉁불퉁 가장자리 필터 */}
                        <filter id="brush-rough" x="-5%" y="-60%" width="110%" height="220%" colorInterpolationFilters="sRGB">
                            <feTurbulence type="fractalNoise" baseFrequency="0.055 0.18" numOctaves="5" seed="7" result="turb" />
                            <feDisplacementMap in="SourceGraphic" in2="turb" scale="9" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                            <feGaussianBlur in="displaced" stdDeviation="1.4" result="blurred" />
                        </filter>
                        {/* 내부 명암 그라디언트 — 수채화 불균일 느낌 */}
                        <linearGradient id="brush-inner" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFF5C0" stopOpacity="0.6" />
                            <stop offset="35%" stopColor="#FFFAD8" stopOpacity="0.95" />
                            <stop offset="60%" stopColor="#FFEE90" stopOpacity="1" />
                            <stop offset="100%" stopColor="#FFE060" stopOpacity="0.7" />
                        </linearGradient>
                        {/* 좌우 페이드 마스크 — 양 끝 뾰족하게 */}
                        <linearGradient id="brush-fade" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="3%" stopColor="white" stopOpacity="0.6" />
                            <stop offset="8%" stopColor="white" stopOpacity="1" />
                            <stop offset="88%" stopColor="white" stopOpacity="1" />
                            <stop offset="96%" stopColor="white" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        <mask id="brush-mask">
                            <rect x="0" y="0" width="460" height="44" fill="url(#brush-fade)" />
                        </mask>
                        {/* 내부 밝은 하이라이트 */}
                        <linearGradient id="brush-highlight" x1="10%" y1="0%" x2="85%" y2="0%">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="30%" stopColor="white" stopOpacity="0.28" />
                            <stop offset="65%" stopColor="white" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <g mask="url(#brush-mask)">
                        {/* 메인 스트로크 — path로 양끝 뾰족한 붓 모양 */}
                        <path
                            d="M4,22 C18,14 55,8 120,10 C200,12 300,8 380,11 C420,13 448,18 456,22 C448,26 420,31 380,33 C300,36 200,32 120,34 C55,36 18,30 4,22 Z"
                            fill="url(#brush-inner)"
                            opacity="0.88"
                            filter="url(#brush-rough)"
                        />
                        {/* 내부 밝은 하이라이트 레이어 */}
                        <path
                            d="M20,22 C60,16 160,13 260,14 C340,15 410,17 445,22 C410,25 340,27 260,28 C160,29 60,28 20,22 Z"
                            fill="url(#brush-highlight)"
                            opacity="0.9"
                            filter="url(#brush-rough)"
                        />
                        {/* 어두운 하단 명암 — 수채화 농도 차이 */}
                        <path
                            d="M30,26 C90,24 200,23 310,25 C370,26 420,28 450,28 C420,31 370,32 310,31 C200,30 90,31 30,28 Z"
                            fill="#F0CC00"
                            opacity="0.22"
                            filter="url(#brush-rough)"
                        />
                    </g>
                </svg>
                <span style={{ position: "relative", zIndex: 1 }}>나만의 카카오톡 테마,</span>
            </span>
            <br />
            <span
                style={{
                    color: "#edb0b9",
                    display: "inline-block",
                    textShadow: "0 2px 12px rgba(237,176,185,0.7)",
                    transform: "rotate(-2deg)",
                    fontSize: "62px",
                }}
            >카</span>
            <span
                style={{
                    color: "#a3cee8",
                    display: "inline-block",
                    textShadow: "0 2px 12px rgba(163,206,232,0.7)",
                    fontSize: "68px",
                }}
            >꾸</span>
            <span
                style={{
                    color: "#f3df56",
                    display: "inline-block",
                    textShadow: "0 2px 12px rgba(243,223,86,0.8)",
                    transform: "rotate(2deg)",
                    fontSize: "62px",
                }}
            >미</span>
            <span style={{ color: "#333232" }}>로 쉽게 만들어요</span>
        </h1>
    );
}
