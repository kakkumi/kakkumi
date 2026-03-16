"use client";

import { memo, useState, useEffect, useRef } from "react";
import React from "react";

/* ── Pro 전용 프리셋 팔레트 색상 (21색, 7열 × 3행) ── */
export const PALETTE_PRESETS: { hex: string; name: string }[] = [
  { hex: "#FFFFFF", name: "흰색" },
  { hex: "#F5F5F5", name: "밝은 회색" },
  { hex: "#9E9E9E", name: "중간 회색" },
  { hex: "#424242", name: "어두운 회색" },
  { hex: "#212121", name: "부드러운 검정" },
  { hex: "#007BFF", name: "트러스트 블루" },
  { hex: "#28A745", name: "활기찬 그린" },
  { hex: "#FFC107", name: "옐로우 골드" },
  { hex: "#DC3545", name: "데인저 레드" },
  { hex: "#6F42C1", name: "딥 퍼플" },
  { hex: "#FD7E14", name: "에너제틱 오렌지" },
  { hex: "#0D6EFD", name: "로열 블루" },
  { hex: "#052C65", name: "미드나잇 네이비" },
  { hex: "#795548", name: "초콜릿 브라운" },
  { hex: "#FFD9EB", name: "파스텔 핑크" },
  { hex: "#FFF3CD", name: "크림 옐로우" },
  { hex: "#D1E7DD", name: "에어리 민트" },
  { hex: "#CFE2FF", name: "소프트 스카이" },
  { hex: "#E2D9F3", name: "라벤더 미스트" },
  { hex: "#FFE5D9", name: "피치 푸딩" },
  { hex: "#F8F9FA", name: "샌드 베이지" },
];

export interface ColorPaletteRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
  disabled?: boolean;
  isPro: boolean;
}

export const ColorPaletteRow = memo(function ColorPaletteRow({
  label, value, onChange, tooltip, disabled = false, isPro,
}: ColorPaletteRowProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hexInput, setHexInput] = useState((value ?? "#FFFFFF").toUpperCase());
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingColorRef = useRef(value ?? "#FFFFFF");

  // 외부 클릭 시 팝업 닫기
  useEffect(() => {
    if (!paletteOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        !(btnRef.current?.contains(e.target as Node)) &&
        !(popupRef.current?.contains(e.target as Node))
      ) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [paletteOpen]);

  useEffect(() => {
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  // 팔레트 열기 – 이벤트 핸들러에서 hexInput 초기화
  const handleOpenPalette = () => {
    if (disabled) return;
    if (!paletteOpen) {
      setHexInput((value ?? "#FFFFFF").toUpperCase());
      pendingColorRef.current = value ?? "#FFFFFF";

      // position:fixed 좌표 계산 → 사이드바 overflow:hidden 무시
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const POPUP_H = 360;
        const rightEdge = window.innerWidth - rect.right;
        const safeRight = Math.max(8, rightEdge - 4);
        const spaceBelow = window.innerHeight - rect.bottom - 8;

        if (spaceBelow >= POPUP_H) {
          setPopupStyle({ top: rect.bottom + 8, right: safeRight });
        } else {
          setPopupStyle({ bottom: window.innerHeight - rect.top + 8, right: safeRight });
        }
      }
    }
    setPaletteOpen((prev) => !prev);
  };

  const scheduleLiveUpdate = (color: string) => {
    pendingColorRef.current = color;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      onChange(pendingColorRef.current);
    });
  };

  const applyHex = () => {
    const raw = hexInput.trim();
    const v = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
      onChange(v.toUpperCase());
      setPaletteOpen(false);
    }
  };

  const handlePresetClick = (hex: string) => {
    if (!isPro) return;
    onChange(hex);
    setHexInput(hex);
  };

  return (
    <div
      data-setting-item="true"
      className="flex items-center justify-between gap-3 py-1.5 px-2.5 group transition-all duration-200 hover:bg-gray-50 rounded-lg w-full"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {/* 라벨 */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">{label}</span>
          {tooltip && (
            <div className="group/tip relative flex items-center">
              <svg
                width="11" height="11" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="text-gray-300"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="absolute left-0 bottom-6 z-50 hidden group-hover/tip:block text-[11px] rounded-lg px-3 py-2 w-max max-w-[200px] leading-snug shadow-xl ring-1 ring-black/5 bg-white text-gray-800">
                {tooltip}
                <div className="absolute left-1.5 -bottom-1 w-2 h-2 bg-white rotate-45 transform border-b border-r border-gray-100" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 색상 버튼 + hex 값 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={handleOpenPalette}
          className="group/picker focus:outline-none"
        >
          <div
            className="w-5 h-5 rounded-full shadow-sm transition-all duration-200 group-hover/picker:scale-110 ring-1 ring-black/5"
            style={{ backgroundColor: value }}
          />
        </button>
        <div className="text-[11px] font-mono text-gray-400 w-[56px] text-right uppercase tracking-wide">
          {value}
        </div>
      </div>

      {/* 팔레트 팝업 – position:fixed 로 overflow 클리핑 완전 탈출 */}
      {paletteOpen && !disabled && (
        <div
          ref={popupRef}
          style={{ position: "fixed", zIndex: 9999, width: 236, ...popupStyle }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12px] font-bold text-gray-700">색상 선택</span>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* 프리셋 팔레트 – Pro 전용, 7열 × 3행 */}
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-semibold text-gray-500">프리셋 팔레트</span>
              <span
                className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,#f97316,#f59e0b)" }}
              >
                PRO
              </span>
            </div>
            <div className="relative">
              <div className={`grid grid-cols-7 gap-1.5 ${!isPro ? "pointer-events-none" : ""}`}>
                {PALETTE_PRESETS.map(({ hex, name }) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => handlePresetClick(hex)}
                    title={`${name}\n${hex}`}
                    className="w-[24px] h-[24px] rounded-full transition-all duration-150 hover:scale-110 hover:ring-2 hover:ring-orange-400 hover:ring-offset-1 focus:outline-none"
                    style={{
                      backgroundColor: hex,
                      boxShadow: value.toUpperCase() === hex
                        ? "0 0 0 2px #f97316"
                        : "0 0 0 1px rgba(0,0,0,0.12)",
                    }}
                  />
                ))}
              </div>
              {/* 비 Pro 잠금 오버레이 */}
              {!isPro && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-1.5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="text-[10px] font-semibold text-gray-400">Pro 전용 기능</span>
                  <a
                    href="/pricing"
                    className="text-[9px] text-orange-400 font-semibold hover:underline"
                    onClick={() => setPaletteOpen(false)}
                  >
                    업그레이드 →
                  </a>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-2.5" />

          {/* 직접 입력 – 모든 사용자 */}
          <div>
            <span className="text-[10px] font-semibold text-gray-500 mb-2 block">직접 입력</span>
            <div className="flex items-center gap-2">
              {/* 네이티브 컬러 피커 */}
              <label className="relative cursor-pointer shrink-0">
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(hexInput) ? hexInput : "#000000"}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setHexInput(v);
                    scheduleLiveUpdate(v);
                  }}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                />
                <div
                  className="w-[26px] h-[26px] rounded-full ring-1 ring-black/10 shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(hexInput) ? hexInput : "#000000" }}
                />
              </label>
              {/* Hex 입력 */}
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") applyHex(); }}
                placeholder="#FFFFFF"
                maxLength={7}
                className="flex-1 text-[11px] font-mono border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={applyHex}
              className="mt-2 w-full text-[11px] font-semibold text-white rounded-lg py-1.5 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg,#f97316,#f59e0b)" }}
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
});



