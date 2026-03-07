"use client";

export default function HeroTitle() {
    return (
        <div className="mb-4">
            <p
                className="mb-5 text-[12px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: "rgb(74, 123, 247)" }}
            >
                Brand Direction
            </p>
            <h1
                className="text-[46px] font-semibold leading-[1.22] tracking-[-0.045em] md:text-[58px]"
                style={{ color: "#1d2129" }}
            >
                나만의 테마를,
                <br />
                <span style={{ color: "rgb(74, 123, 247)" }}>카꾸미</span>답게 간편하게
            </h1>
        </div>
    );
}
