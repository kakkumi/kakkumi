"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export type BubbleSide = "send" | "receive";

export interface BubbleDesignOptions {
  side: BubbleSide;
  bgColor: string;
  characterUrl?: string;
}

export const DEFAULT_SEND: BubbleDesignOptions = {
  side: "send",
  bgColor: "#FEE500",
  characterUrl: undefined,
};

export const DEFAULT_RECEIVE: BubbleDesignOptions = {
  side: "receive",
  bgColor: "#FFFFFF",
  characterUrl: undefined,
};

// ── SVG 틀 좌표 (bubble-send.svg 기준, 200x200)
// 말풍선 작은 원 (왼쪽 하단): cx=43.478, cy=156.522, r=42.029
// 캐릭터 큰 원 (오른쪽 상단): cx=125.507, cy=62.029, r=58.551
const SEND_BUBBLE = { cx: 43.478,  cy: 156.522, r: 42.029 };
const SEND_CHAR   = { cx: 125.507, cy: 62.029,  r: 58.551 };

// receive는 좌우 반전
const RECEIVE_BUBBLE = { cx: 200 - 43.478,  cy: 156.522, r: 42.029 };
const RECEIVE_CHAR   = { cx: 200 - 125.507, cy: 62.029,  r: 58.551 };

const CANVAS_SIZE = 200;

/** SVG 틀 기반으로 Canvas에 그려서 Blob 반환 */
export async function drawBubble(
  opts: BubbleDesignOptions,
  charImg: HTMLImageElement | null
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const bubble = opts.side === "send" ? SEND_BUBBLE : RECEIVE_BUBBLE;
  const charSlot = opts.side === "send" ? SEND_CHAR : RECEIVE_CHAR;

  // 1. 말풍선 원 색상 채우기
  ctx.beginPath();
  ctx.arc(bubble.cx, bubble.cy, bubble.r, 0, Math.PI * 2);
  ctx.fillStyle = opts.bgColor;
  ctx.fill();

  // 2. 캐릭터 이미지 합성 (원형 클리핑)
  if (charImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(charSlot.cx, charSlot.cy, charSlot.r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      charImg,
      charSlot.cx - charSlot.r,
      charSlot.cy - charSlot.r,
      charSlot.r * 2,
      charSlot.r * 2
    );
    ctx.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

// ────────────────────────────────────────────────────────────────
// BubbleDesigner UI
// ────────────────────────────────────────────────────────────────

interface BubbleDesignerProps {
  side: BubbleSide;
  options: BubbleDesignOptions;
  onChange: (opts: BubbleDesignOptions) => void;
  onGenerate: (urls: { bubble1: string; bubble2: string }) => void;
}

export function BubbleDesigner({ side, options, onChange, onGenerate }: BubbleDesignerProps) {
  const charInputRef = useRef<HTMLInputElement>(null);
  const [charImgEl, setCharImgEl] = useState<HTMLImageElement | null>(null);
  const [charPreviewUrl, setCharPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlsRef = useRef<{ bubble1: string; bubble2: string } | null>(null);

  const autoGenerate = useCallback(
    async (opts: BubbleDesignOptions, img: HTMLImageElement | null) => {
      setStatus("generating");
      try {
        if (prevUrlsRef.current) {
          URL.revokeObjectURL(prevUrlsRef.current.bubble1);
          URL.revokeObjectURL(prevUrlsRef.current.bubble2);
        }
        // bubble1(캐릭터 있는 버전), bubble2(말풍선만)
        const blob1 = await drawBubble(opts, img);
        const blob2 = await drawBubble(opts, null);
        const url1 = URL.createObjectURL(blob1);
        const url2 = URL.createObjectURL(blob2);
        prevUrlsRef.current = { bubble1: url1, bubble2: url2 };
        onGenerate({ bubble1: url1, bubble2: url2 });
        setStatus("done");
      } catch {
        setStatus("idle");
      }
    },
    [onGenerate]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void autoGenerate(options, charImgEl);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, charImgEl]);

  const handleCharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCharPreviewUrl(url);
    const img = new Image();
    img.onload = () => setCharImgEl(img);
    img.src = url;
    onChange({ ...options, characterUrl: url });
  };

  const handleRemoveChar = () => {
    setCharPreviewUrl(null);
    setCharImgEl(null);
    if (charInputRef.current) charInputRef.current.value = "";
    onChange({ ...options, characterUrl: undefined });
  };

  const label = side === "send" ? "보낸 메시지" : "받은 메시지";

  return (
    <div className="flex flex-col gap-3 py-2">

      {/* 상태 표시 */}
      <div className="mx-2.5 flex items-center gap-2 py-1.5 px-3 rounded-lg"
        style={{
          backgroundColor: status === "done" ? "rgba(34,197,94,0.08)" : status === "generating" ? "rgba(251,146,60,0.08)" : "rgba(0,0,0,0.03)"
        }}>
        <span className="text-[10px]">
          {status === "generating" ? "⏳" : status === "done" ? "✅" : "⬜"}
        </span>
        <span className="text-[11px] font-medium"
          style={{ color: status === "done" ? "rgb(22,163,74)" : status === "generating" ? "rgb(251,146,60)" : "#9ca3af" }}>
          {status === "generating"
            ? "목업에 반영 중..."
            : status === "done"
            ? `${label} 말풍선 목업에 반영됨`
            : "설정을 변경하면 목업에 자동 반영됩니다"}
        </span>
      </div>

      {/* 말풍선 색상 */}
      <div className="flex items-center justify-between px-2.5 py-1">
        <span className="text-[12px] font-medium text-gray-500">말풍선 색상</span>
        <div className="flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={options.bgColor}
              onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            />
            <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ backgroundColor: options.bgColor }} />
          </label>
          <span className="text-[11px] font-mono text-gray-400 w-[56px] uppercase">{options.bgColor}</span>
        </div>
      </div>

      {/* 캐릭터 이미지 (선택) */}
      <div className="px-2.5 py-1">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500">캐릭터 이미지</span>
            <span className="text-[10px] text-gray-400">선택사항입니다</span>
          </div>
          {charPreviewUrl ? (
            <button type="button" onClick={handleRemoveChar}
              className="text-[10px] text-red-500 px-2 py-0.5 bg-red-50 rounded-md">
              삭제
            </button>
          ) : (
            <label className="cursor-pointer flex items-center gap-1 text-[10px] text-orange-500 px-2 py-0.5 bg-orange-50 rounded-md">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              업로드
              <input ref={charInputRef} type="file" accept="image/*" className="hidden" onChange={handleCharUpload} />
            </label>
          )}
        </div>
        {charPreviewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={charPreviewUrl} alt="캐릭터" className="w-12 h-12 object-contain rounded-lg border border-gray-100" />
        )}
      </div>
    </div>
  );
}
