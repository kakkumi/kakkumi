"use client";

import { useState } from "react";
import Image from "next/image";
import { THEME_COLORS } from "@/app/store/data";

type Props = {
    images: string[];
    previews: string[];
    name: string;
    tag?: string;
    themeId?: number;
};

// 오른쪽 패널에서 미니 프리뷰를 렌더링하기 위한 export
export type PreviewSlot = string;

export function getPreviewSlots(themeId: number | undefined, images: string[], previews: string[]): { slots: PreviewSlot[]; useColor: boolean } {
    const colors = themeId ? THEME_COLORS[themeId] : undefined;
    const realImages = [...(images ?? []), ...(previews ?? [])].filter((s) => s && s !== "/back.jpg");
    const useColor = realImages.length === 0 && !!colors;
    return {
        slots: useColor ? colors!.previews : realImages.slice(0, 5),
        useColor,
    };
}

export default function ThemeImageViewer({ images, previews, name, tag, themeId }: Props) {
    const colors = themeId ? THEME_COLORS[themeId] : undefined;
    const realImages = [...(images ?? []), ...(previews ?? [])].filter((s) => s && s !== "/back.jpg");
    const useColor = realImages.length === 0 && !!colors;
    const [activeIdx, setActiveIdx] = useState(0);

    const mainBg = useColor ? colors!.previews[activeIdx] ?? colors!.main : undefined;
    const mainSrc = useColor ? null : (realImages[activeIdx] ?? null);

    const previewSlots = useColor ? colors!.previews : realImages.slice(0, 5);

    return (
        <div className="flex flex-col gap-0">
            {/* 메인 이미지만 — 미니 프리뷰는 오른쪽 패널로 이동 */}
            <div
                className="rounded-[28px] overflow-hidden relative"
                style={{
                    width: "580px",
                    height: "580px",
                    background: mainBg ?? "rgba(0,0,0,0.06)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    transition: "background 0.25s ease",
                }}
            >
                {mainSrc && (
                    <Image src={mainSrc} alt={name} fill className="object-cover transition-opacity duration-200" />
                )}
                {useColor && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/50 text-[15px] font-semibold tracking-wide">{name}</span>
                    </div>
                )}
                {tag && (
                    <span
                        className="absolute top-5 left-5 text-[12px] font-bold px-3 py-1 rounded-full backdrop-blur-md"
                        style={{
                            background: tag === "무료" ? "rgba(255, 239, 154, 0.92)" : "rgba(170, 189, 232, 0.92)",
                            color: "#1c1c1e",
                        }}
                    >
                        {tag}
                    </span>
                )}
            </div>

            {/* 미니 프리뷰 (왼쪽 하단 — 오른쪽으로 위치 이동은 page.tsx에서 처리) */}
            <div className="hidden" id="preview-slots-data" data-slots={JSON.stringify(previewSlots)} data-use-color={String(useColor)} data-active={activeIdx} />
        </div>
    );
}
