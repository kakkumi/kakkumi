"use client";

import { useEffect, useRef } from "react";
import { annotate } from "rough-notation";

export default function HeroTitle() {
    const highlightRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!highlightRef.current) return;
        const annotation = annotate(highlightRef.current, {
            type: "highlight",
            color: "rgba(255, 231, 58, 0.6)",
            animationDuration: 800,
            padding: 4,
        });
        annotation.show();
        return () => annotation.remove();
    }, []);

    return (
        <h1
            className="text-[56px] font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: "#333232", textShadow: "0 1px 2px rgba(255,255,255,0.6)", fontFamily: "'SeoulNotice', sans-serif" }}
        >
            <span style={{ position: "relative", display: "inline-block" }}>
                <span ref={highlightRef} style={{ position: "relative", zIndex: 1 }}>나만의 카카오톡 테마,</span>
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
