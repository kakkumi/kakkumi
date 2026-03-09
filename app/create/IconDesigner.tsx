"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

// theme-icon.svg 크기
const ICON_W = 162;
const ICON_H = 162;

// SVG path 데이터 (theme-icon.svg에서 추출)
const BUBBLE_BODY = "M83.30357,26.2723C50.62004,26.2723 29.82142,48.17498 29.82142,75.40535C29.82142,102.63571 50.62004,120.98661 83.30357,120.98661C98.15972,120.98661 111.82738,116.25089 121.92957,107.9634C130.84326,100.26787 136.78572,88.42857 136.78572,75.40535C136.78572,48.17498 115.9871,26.2723 83.30357,26.2723Z";
const BUBBLE_TAIL = "M82.05448,111.11523L48.18209,138.09307L58.13492,95.94946L82.05448,111.11523Z";

function drawIconOnCanvas(
  ctx: CanvasRenderingContext2D,
  bgColor: string,
  iconColor: string
) {
  ctx.clearRect(0, 0, ICON_W, ICON_H);

  // 1. 배경색
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, ICON_W, ICON_H);

  // 2. 말풍선 본체
  ctx.fillStyle = iconColor;
  const bodyPath = new Path2D(BUBBLE_BODY);
  ctx.fill(bodyPath);

  // 3. 말풍선 꼬리
  const tailPath = new Path2D(BUBBLE_TAIL);
  ctx.fill(tailPath);
}

export async function drawIcon(bgColor: string, iconColor: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = ICON_W;
  canvas.height = ICON_H;
  const ctx = canvas.getContext("2d")!;
  drawIconOnCanvas(ctx, bgColor, iconColor);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

export interface IconDesignOptions {
  bgColor: string;
  iconColor: string;
}

export const DEFAULT_ICON: IconDesignOptions = {
  bgColor: "#FFFFFF",
  iconColor: "#FEE500",
};

interface IconDesignerProps {
  options: IconDesignOptions;
  onChange: (opts: IconDesignOptions) => void;
  onGenerate: (url: string) => void;
  uploadedUrl?: string;
  onUpload: (file: File) => void;
  onRemoveUpload: () => void;
}

export function IconDesigner({
  options,
  onChange,
  onGenerate,
  uploadedUrl,
  onUpload,
  onRemoveUpload,
}: IconDesignerProps) {
  const [mode, setMode] = useState<"svg" | "image">(uploadedUrl ? "image" : "svg");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // 미리보기 캔버스 실시간 렌더링
  useEffect(() => {
    if (mode !== "svg") return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawIconOnCanvas(ctx, options.bgColor, options.iconColor);
  }, [options, mode]);

  const autoGenerate = useCallback(
    async (opts: IconDesignOptions) => {
      setStatus("generating");
      try {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        const blob = await drawIcon(opts.bgColor, opts.iconColor);
        const url = URL.createObjectURL(blob);
        prevUrlRef.current = url;
        onGenerate(url);
        setStatus("done");
      } catch {
        setStatus("idle");
      }
    },
    [onGenerate]
  );

  useEffect(() => {
    if (mode !== "svg") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void autoGenerate(options);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, mode]);

  const handleModeSwitch = (next: "svg" | "image") => {
    setMode(next);
    setStatus("idle");
    if (next === "svg") onRemoveUpload();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3 py-2">

      {/* 모드 탭 */}
      <div className="mx-2.5 flex rounded-lg overflow-hidden border border-gray-200">
        <button type="button" onClick={() => handleModeSwitch("svg")}
          className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
          style={{ backgroundColor: mode === "svg" ? "rgb(251,146,60)" : "#fff", color: mode === "svg" ? "#fff" : "#9ca3af" }}>
          색상으로 제작
        </button>
        <button type="button" onClick={() => handleModeSwitch("image")}
          className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
          style={{ backgroundColor: mode === "image" ? "rgb(251,146,60)" : "#fff", color: mode === "image" ? "#fff" : "#9ca3af" }}>
          이미지 업로드
        </button>
      </div>

      {mode === "svg" && (
        <>
          {/* 상태 표시 */}
          <div className="mx-2.5 flex items-center gap-2 py-1.5 px-3 rounded-lg"
            style={{ backgroundColor: status === "done" ? "rgba(34,197,94,0.08)" : "rgba(0,0,0,0.03)" }}>
            <span className="text-[10px]">{status === "done" ? "✅" : "⬜"}</span>
            <span className="text-[11px] font-medium"
              style={{ color: status === "done" ? "rgb(22,163,74)" : "#9ca3af" }}>
              {status === "done" ? "아이콘 적용됨" : "색상을 변경하면 자동 반영됩니다"}
            </span>
          </div>

          {/* 배경 색상 */}
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="text-[12px] font-medium text-gray-500">배경 색상</span>
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer">
                <input type="color" value={options.bgColor}
                  onChange={(e) => onChange({ ...options, bgColor: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ backgroundColor: options.bgColor }} />
              </label>
              <span className="text-[11px] font-mono text-gray-400 w-[56px] uppercase">{options.bgColor}</span>
            </div>
          </div>

          {/* 아이콘 색상 */}
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="text-[12px] font-medium text-gray-500">아이콘 색상</span>
            <div className="flex items-center gap-2">
              <label className="relative cursor-pointer">
                <input type="color" value={options.iconColor}
                  onChange={(e) => onChange({ ...options, iconColor: e.target.value })}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ backgroundColor: options.iconColor }} />
              </label>
              <span className="text-[11px] font-mono text-gray-400 w-[56px] uppercase">{options.iconColor}</span>
            </div>
          </div>

          {/* 미리보기 */}
          <div className="px-2.5 pb-1">
            <span className="text-[11px] font-medium text-gray-400 block mb-1.5">미리보기</span>
            <canvas
              ref={previewCanvasRef}
              width={ICON_W}
              height={ICON_H}
              style={{ width: 54, height: 54, borderRadius: 12, border: "1px solid #eee", display: "block" }}
            />
          </div>
        </>
      )}

      {mode === "image" && (
        <div className="px-2.5 py-1">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-gray-500">이미지 업로드</span>
            <div className="flex items-center gap-2">
              {uploadedUrl && (
                <button type="button" onClick={onRemoveUpload}
                  className="text-[10px] text-red-500 px-2 py-0.5 bg-red-50 rounded-md">
                  삭제
                </button>
              )}
              <label className="cursor-pointer flex items-center gap-1 text-[10px] text-orange-500 px-2 py-0.5 bg-orange-50 rounded-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                업로드
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          {uploadedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadedUrl} alt="아이콘" className="w-14 h-14 object-contain rounded-xl border border-gray-100 mt-2" />
          )}
        </div>
      )}
    </div>
  );
}
