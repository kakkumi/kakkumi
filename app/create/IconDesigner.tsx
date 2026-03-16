"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ColorPaletteRow } from "./ColorPaletteRow";

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
  ctx.fill(new Path2D(BUBBLE_BODY));

  // 3. 말풍선 꼬리
  ctx.fill(new Path2D(BUBBLE_TAIL));
}

// dataURL → objectURL 변환 (동기)
function dataURLtoObjectURL(dataUrl: string): string {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return URL.createObjectURL(new Blob([u8arr], { type: mime }));
}

/** 아이콘 PNG 동기 생성 → objectURL 반환 */
export function drawIconSync(bgColor: string, iconColor: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = ICON_W;
  canvas.height = ICON_H;
  const ctx = canvas.getContext("2d")!;
  drawIconOnCanvas(ctx, bgColor, iconColor);
  return dataURLtoObjectURL(canvas.toDataURL("image/png"));
}

export interface IconDesignOptions {
  bgColor: string;
  iconColor: string;
}

interface IconDesignerProps {
  options: IconDesignOptions;
  onChange: (opts: IconDesignOptions) => void;
  onSvgGenerate: (url: string) => void;
  onModeChange: (mode: "svg" | "image") => void;
  /** 이미지 업로드 탭에서 업로드된 URL */
  uploadedUrl?: string;
  onUpload: (file: File) => void;
  onRemoveUpload: () => void;
  isPro: boolean;
}

export function IconDesigner({
  options,
  onChange,
  onSvgGenerate,
  onModeChange,
  uploadedUrl,
  onUpload,
  onRemoveUpload,
  isPro,
}: IconDesignerProps) {
  const [mode, setMode] = useState<"svg" | "image">("svg");
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);

  // 로컬 색상 (미리보기 원형 즉시 반영용)
  const [localBgColor, setLocalBgColor]     = useState(options.bgColor);
  const [localIconColor, setLocalIconColor] = useState(options.iconColor);

  // 외부 변경 동기화
  useEffect(() => { setLocalBgColor(options.bgColor); },   [options.bgColor]);
  useEffect(() => { setLocalIconColor(options.iconColor); }, [options.iconColor]);

  // rAF 스로틀용 ref
  const rafRef       = useRef<number | null>(null);
  const pendingBg    = useRef(options.bgColor);
  const pendingIcon  = useRef(options.iconColor);

  // 미리보기 캔버스 — 로컬 색상으로 즉시 렌더
  useEffect(() => {
    if (mode !== "svg") return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawIconOnCanvas(ctx, localBgColor, localIconColor);
  }, [localBgColor, localIconColor, mode]);

  // objectURL 생성 + 상위 전파
  const autoGenerate = useCallback(
    (opts: IconDesignOptions) => {
      setStatus("generating");
      try {
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        const url = drawIconSync(opts.bgColor, opts.iconColor);
        prevUrlRef.current = url;
        onSvgGenerate(url);
        setStatus("done");
      } catch {
        setStatus("idle");
      }
    },
    [onSvgGenerate]
  );

  // options 확정 시 objectURL 생성
  useEffect(() => {
    if (mode !== "svg") return;
    autoGenerate(options);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, mode]);

  // rAF 스로틀: 드래그 중 상위 onChange 전파를 1프레임에 1번만
  const scheduleOnChange = useCallback((bg: string, icon: string) => {
    pendingBg.current   = bg;
    pendingIcon.current = icon;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      onChange({ bgColor: pendingBg.current, iconColor: pendingIcon.current });
    });
  }, [onChange]);

  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  const handleModeSwitch = (next: "svg" | "image") => { setMode(next); onModeChange(next); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMode("image"); onModeChange("image"); onUpload(file); e.target.value = "";
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
          <div className="mx-2.5 flex items-center gap-2 py-1.5 px-3 rounded-lg"
            style={{ backgroundColor: status === "done" ? "rgba(34,197,94,0.08)" : "rgba(0,0,0,0.03)" }}>
            <span className="text-[10px]">{status === "done" ? "✅" : "⬜"}</span>
            <span className="text-[11px] font-medium" style={{ color: status === "done" ? "rgb(22,163,74)" : "#9ca3af" }}>
              {status === "done" ? "아이콘 적용됨" : "색상을 변경하면 자동 반영됩니다"}
            </span>
          </div>

          {/* 배경 색상 */}
          <ColorPaletteRow
            label="배경 색상"
            value={localBgColor}
            onChange={(v) => {
              setLocalBgColor(v);
              scheduleOnChange(v, pendingIcon.current);
            }}
            isPro={isPro}
          />

          {/* 아이콘 색상 */}
          <ColorPaletteRow
            label="아이콘 색상"
            value={localIconColor}
            onChange={(v) => {
              setLocalIconColor(v);
              scheduleOnChange(pendingBg.current, v);
            }}
            isPro={isPro}
          />

          {/* 미리보기 */}
          <div className="px-2.5 pb-1">
            <span className="text-[11px] font-medium text-gray-400 block mb-1.5">미리보기</span>
            <canvas ref={previewCanvasRef} width={ICON_W} height={ICON_H}
              className="w-16 h-16 rounded-xl border border-gray-100 shadow-sm" />
          </div>
        </>
      )}

      {mode === "image" && (
        <div className="px-2.5 py-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-gray-500">아이콘 이미지</span>
            {uploadedUrl ? (
              <button type="button" onClick={onRemoveUpload}
                className="text-[10px] text-red-500 px-2 py-0.5 bg-red-50 rounded-md">삭제</button>
            ) : (
              <label className="cursor-pointer flex items-center gap-1 text-[10px] text-orange-500 px-2 py-0.5 bg-orange-50 rounded-md">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                업로드
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
          {uploadedUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={uploadedUrl} alt="아이콘" className="w-16 h-16 object-contain rounded-xl border border-gray-100 shadow-sm" />
          )}
        </div>
      )}
    </div>
  );
}
