"use client";

import Link from "next/link";
import { useState } from "react";

type OS = "ios" | "android";

interface ThemeConfig {
  name: string;
  version: string;
  packageId: string;
  authorName: string;
  darkMode: boolean;
  tabBarBg: string;
  tabBarIcon: string;
  tabBarSelectedIcon: string;
  headerBg: string;
  headerText: string;
  bodyBg: string;
  primaryText: string;
  descText: string;
  chatBg: string;
  inputBarBg: string;
  sendBtnBg: string;
  sendBtnIcon: string;
  myBubbleBg: string;
  myBubbleText: string;
  otherBubbleBg: string;
  otherBubbleText: string;
  compileSdk: string;
  targetSdk: string;
  namespace: string;
}

const defaultConfig: ThemeConfig = {
  name: "나의 테마",
  version: "1.0.0",
  packageId: "com.kakao.talk.theme.mytheme",
  authorName: "제작자",
  darkMode: false,
  tabBarBg: "#FFFFFF",
  tabBarIcon: "#9E9E9E",
  tabBarSelectedIcon: "#3A1D1D",
  headerBg: "#FEE500",
  headerText: "#3A1D1D",
  bodyBg: "#F5F5F5",
  primaryText: "#191919",
  descText: "#9E9E9E",
  chatBg: "#B2C7D9",
  inputBarBg: "#FFFFFF",
  sendBtnBg: "#FEE500",
  sendBtnIcon: "#3A1D1D",
  myBubbleBg: "#FEE500",
  myBubbleText: "#191919",
  otherBubbleBg: "#FFFFFF",
  otherBubbleText: "#191919",
  compileSdk: "34",
  targetSdk: "34",
  namespace: "com.kakao.talk.theme.mytheme",
};

/* ── 컬러 행 ── */
interface ColorRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
}

function ColorRow({ label, value, onChange, tooltip }: ColorRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-1 rounded-lg hover:bg-black/[0.03] transition-colors">
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-[11px] text-[#3a3a3c] truncate">{label}</span>
        {tooltip && (
          <div className="group relative">
            <span className="text-[10px] text-[#8e8e93] cursor-help">?</span>
            <div className="absolute left-4 top-0 z-50 hidden group-hover:block text-[10px] rounded-lg px-2.5 py-1.5 w-44 leading-snug glass shadow-xl" style={{color:"#3a3a3c"}}>
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
          <div
            className="w-6 h-6 rounded-md border border-black/10 shadow-sm"
            style={{ backgroundColor: value }}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-[72px] text-[11px] rounded-md px-1.5 py-1 font-mono glass-input"
          maxLength={7}
        />
      </div>
    </div>
  );
}

/* ── 섹션 타이틀 ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-widest mt-5 mb-1 px-1">
      {children}
    </div>
  );
}

/* ── macOS 스타일 인풋 ── */
function MacInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-[#3a3a3c]">
        {label}
        {hint && <span className="ml-1 font-normal text-[#8e8e93]">{hint}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg px-3 py-1.5 text-[13px] glass-input"
      />
    </div>
  );
}

/* ── iOS 목업 ── */
function IOSMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 300, height: 600 }}>
      <div
        className="absolute inset-0 rounded-[40px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}
      >
        {/* 다이나믹 아일랜드 */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-10" />
        {/* 헤더 */}
        <div
          className="absolute top-8 left-0 right-0 h-11 flex items-center px-4 gap-2"
          style={{ backgroundColor: config.headerBg }}
        >
          <span className="font-bold text-sm truncate flex-1" style={{ color: config.headerText }}>친구</span>
          <span className="text-xs" style={{ color: config.headerText }}>⚙︎</span>
        </div>
        {/* 바디 */}
        <div
          className="absolute top-[76px] left-0 right-0 bottom-12 overflow-hidden"
          style={{ backgroundColor: config.bodyBg }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className="w-10 h-10 rounded-full bg-zinc-300 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold" style={{ color: config.primaryText }}>나</span>
              <span className="text-[10px]" style={{ color: config.descText }}>상태메시지</span>
            </div>
          </div>
          <div className="h-px mx-3" style={{ backgroundColor: `${config.primaryText}18` }} />
          {["친구 1", "친구 2", "친구 3"].map((name) => (
            <div key={name} className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-200 shrink-0" />
              <span className="text-[11px]" style={{ color: config.primaryText }}>{name}</span>
            </div>
          ))}
        </div>
        {/* 탭바 */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 flex items-center justify-around rounded-b-[35px] border-t"
          style={{ backgroundColor: config.tabBarBg, borderColor: `${config.primaryText}12` }}
        >
          {["👥", "💬", "🔍", "🛒", "☰"].map((icon, i) => (
            <span key={i} className="text-base" style={{ color: i === 0 ? config.tabBarSelectedIcon : config.tabBarIcon }}>
              {icon}
            </span>
          ))}
        </div>
      </div>
      {/* 사이드 버튼 */}
      <div className="absolute right-[-6px] top-24 w-1 h-12 bg-zinc-700 rounded-r-md" />
      <div className="absolute left-[-6px] top-20 w-1 h-8 bg-zinc-700 rounded-l-md" />
      <div className="absolute left-[-6px] top-32 w-1 h-8 bg-zinc-700 rounded-l-md" />
    </div>
  );
}

/* ── Android 목업 ── */
function AndroidMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 300, height: 600 }}>
      <div
        className="absolute inset-0 rounded-[28px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-700 z-10" />
        <div
          className="absolute top-7 left-0 right-0 h-11 flex items-center px-4 gap-2"
          style={{ backgroundColor: config.headerBg }}
        >
          <span className="font-bold text-sm truncate flex-1" style={{ color: config.headerText }}>카카오톡</span>
          <span className="text-xs" style={{ color: config.headerText }}>⋮</span>
        </div>
        <div
          className="absolute top-[72px] left-0 right-0 h-8 flex items-center"
          style={{ backgroundColor: config.headerBg }}
        >
          {["친구", "채팅", "더보기"].map((tab, i) => (
            <div
              key={tab}
              className="flex-1 text-center text-[10px] font-semibold pb-1"
              style={{
                color: config.headerText,
                borderBottom: i === 0 ? `2px solid ${config.headerText}` : "2px solid transparent",
              }}
            >
              {tab}
            </div>
          ))}
        </div>
        <div
          className="absolute top-[104px] left-0 right-0 bottom-10 overflow-hidden"
          style={{ backgroundColor: config.bodyBg }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div className="w-10 h-10 rounded-full bg-zinc-300 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold" style={{ color: config.primaryText }}>나</span>
              <span className="text-[10px]" style={{ color: config.descText }}>상태메시지</span>
            </div>
          </div>
          <div className="h-px mx-3" style={{ backgroundColor: `${config.primaryText}18` }} />
          {["친구 1", "친구 2", "친구 3"].map((name) => (
            <div key={name} className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-8 h-8 rounded-full bg-zinc-200 shrink-0" />
              <span className="text-[11px]" style={{ color: config.primaryText }}>{name}</span>
            </div>
          ))}
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-around rounded-b-[23px]"
          style={{ backgroundColor: config.tabBarBg }}
        >
          {["◁", "○", "□"].map((icon, i) => (
            <span key={i} className="text-base" style={{ color: config.tabBarIcon }}>{icon}</span>
          ))}
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

/* ── 채팅방 목업 ── */
function ChatMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 300, height: 600 }}>
      <div
        className="absolute inset-0 rounded-[40px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.chatBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}
      >
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-full z-10" />
        <div
          className="absolute top-8 left-0 right-0 h-10 flex items-center px-3 gap-2"
          style={{ backgroundColor: config.headerBg }}
        >
          <span className="text-sm" style={{ color: config.headerText }}>←</span>
          <span className="font-bold text-xs flex-1" style={{ color: config.headerText }}>채팅방</span>
        </div>
        <div className="absolute top-[74px] left-0 right-0 bottom-14 flex flex-col gap-2 px-3 py-2 overflow-hidden">
          <div className="flex items-end gap-1.5 self-start max-w-[75%]">
            <div className="w-6 h-6 rounded-full bg-zinc-300 shrink-0" />
            <div
              className="rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-[10px] leading-snug shadow-sm"
              style={{ backgroundColor: config.otherBubbleBg, color: config.otherBubbleText }}
            >
              안녕하세요! 👋
            </div>
          </div>
          <div className="flex items-end gap-1.5 self-end max-w-[75%]">
            <div
              className="rounded-2xl rounded-tr-sm px-2.5 py-1.5 text-[10px] leading-snug shadow-sm"
              style={{ backgroundColor: config.myBubbleBg, color: config.myBubbleText }}
            >
              반가워요! 😊
            </div>
          </div>
          <div className="flex items-end gap-1.5 self-start max-w-[75%]">
            <div className="w-6 h-6 rounded-full bg-zinc-300 shrink-0" />
            <div
              className="rounded-2xl rounded-tl-sm px-2.5 py-1.5 text-[10px] leading-snug shadow-sm"
              style={{ backgroundColor: config.otherBubbleBg, color: config.otherBubbleText }}
            >
              테마 예쁘네요 ✨
            </div>
          </div>
          <div className="flex items-end gap-1.5 self-end max-w-[75%]">
            <div
              className="rounded-2xl rounded-tr-sm px-2.5 py-1.5 text-[10px] leading-snug shadow-sm"
              style={{ backgroundColor: config.myBubbleBg, color: config.myBubbleText }}
            >
              감사합니다! 🎨
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-14 flex items-center gap-2 px-3 rounded-b-[35px]"
          style={{ backgroundColor: config.inputBarBg }}
        >
          <div
            className="flex-1 h-8 rounded-full flex items-center px-3"
            style={{ backgroundColor: config.bodyBg }}
          >
            <span className="text-[10px] text-zinc-400">메시지 입력</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md"
            style={{ backgroundColor: config.sendBtnBg }}
          >
            <span className="text-xs" style={{ color: config.sendBtnIcon }}>▶</span>
          </div>
        </div>
        <div className="absolute right-[-6px] top-24 w-1 h-12 bg-zinc-700 rounded-r-md" />
        <div className="absolute left-[-6px] top-20 w-1 h-8 bg-zinc-700 rounded-l-md" />
        <div className="absolute left-[-6px] top-32 w-1 h-8 bg-zinc-700 rounded-l-md" />
      </div>
    </div>
  );
}

type PreviewTab = "friends" | "chat";

export default function CreatePage() {
  const [os, setOs] = useState<OS>("ios");
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("friends");
  const [imageUploads, setImageUploads] = useState<Record<string, string>>({});

  const set = (key: keyof ThemeConfig) => (value: string | boolean) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (key: string, file: File) => {
    const url = URL.createObjectURL(file);
    setImageUploads((prev) => ({ ...prev, [key]: url }));
  };

  const handleDownload = () => {
    const filename =
      os === "ios"
        ? `${config.name.replace(/\s/g, "_")}.ktheme`
        : `${config.name.replace(/\s/g, "_")}.apk`;
    const content =
      os === "ios"
        ? generateCSS(config)
        : `// Android APK 빌드 시뮬레이션\n// namespace: ${config.namespace}\n// compileSdk: ${config.compileSdk}\n// targetSdk: ${config.targetSdk}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f0ed" }}>
      {/* ── macOS 타이틀바 ── */}
      <header
        className="flex items-center px-5 py-2.5 sticky top-0 z-50 shrink-0"
        style={{
          background: "rgba(236, 236, 240, 0.72)",
          backdropFilter: "blur(40px) saturate(200%)",
          WebkitBackdropFilter: "blur(40px) saturate(200%)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset",
        }}
      >
        {/* 타이틀 */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-[14px] font-semibold tracking-tight transition-opacity hover:opacity-60 select-none"
            style={{ color: "#1c1c1e" }}
          >
            카꾸미
          </Link>
          <span className="text-[#8e8e93] text-[13px] select-none">—</span>
          <span className="text-[13px] text-[#3a3a3c] select-none">{config.name}</span>
        </div>

        <div className="flex-1" />

        {/* 다운로드 버튼 */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95"
          style={{
            background: "rgba(255,229,0,0.9)",
            color: "#3A1D1D",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.5) inset",
          }}
        >
          {os === "ios" ? "⬇ .ktheme" : "⬇ APK 빌드"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 45px)" }}>

        {/* ── 좌측 사이드바 ── */}
        <aside className="w-60 glass-sidebar overflow-y-auto mac-scroll shrink-0">
          <div className="p-3 pt-2">
            {/* 이미지 업로드 */}
            <SectionTitle>이미지 리소스</SectionTitle>
            {[
              { key: "icon", label: "앱 아이콘 (162×162)", tooltip: "commonIcoTheme.png — 테마 목록 아이콘" },
              { key: "splash", label: "스플래시 이미지", tooltip: "2배수 기준 이미지 사용 권장" },
              { key: "myBubble", label: "내 말풍선 이미지", tooltip: "-ios-background-image (send)" },
              { key: "otherBubble", label: "상대 말풍선 이미지", tooltip: "-ios-background-image (receive)" },
              { key: "tabBg", label: "탭바 배경 이미지", tooltip: "-ios-background-image (TabBar)" },
            ].map(({ key, label, tooltip }) => (
              <div key={key} className="mb-2">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[11px] text-[#3a3a3c]">{label}</span>
                  <div className="group relative">
                    <span className="text-[10px] text-[#8e8e93] cursor-help">?</span>
                    <div className="absolute left-4 top-0 z-50 hidden group-hover:block text-[10px] rounded-lg px-2.5 py-1.5 w-44 leading-snug glass shadow-xl" style={{color:"#3a3a3c"}}>
                      {tooltip}
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 glass"
                    style={{ border: "1px solid rgba(0,0,0,0.08)" }}
                  >
                    {imageUploads[key] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUploads[key]} alt={label} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#8e8e93] text-lg">+</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(key, file);
                    }}
                  />
                  <span className="text-[10px] text-[#8e8e93]">클릭하여 업로드</span>
                </label>
              </div>
            ))}

            <SectionTitle>탭바 (TabBar)</SectionTitle>
            <ColorRow label="배경색" value={config.tabBarBg} onChange={set("tabBarBg")} tooltip="background-color" />
            <ColorRow label="아이콘" value={config.tabBarIcon} onChange={set("tabBarIcon")} tooltip="-normal 아이콘 컬러" />
            <ColorRow label="선택 아이콘" value={config.tabBarSelectedIcon} onChange={set("tabBarSelectedIcon")} tooltip="-selected 아이콘 컬러" />

            <SectionTitle>헤더 (Header)</SectionTitle>
            <ColorRow label="배경색" value={config.headerBg} onChange={set("headerBg")} tooltip="background-color" />
            <ColorRow label="텍스트/아이콘" value={config.headerText} onChange={set("headerText")} tooltip="-ios-text-color" />

            <SectionTitle>바디 (MainView)</SectionTitle>
            <ColorRow label="배경색" value={config.bodyBg} onChange={set("bodyBg")} tooltip="background-color" />
            <ColorRow label="기본 텍스트" value={config.primaryText} onChange={set("primaryText")} tooltip="Primary text color" />
            <ColorRow label="부가 텍스트" value={config.descText} onChange={set("descText")} tooltip="Description text color" />

            <SectionTitle>채팅방 (ChatRoom)</SectionTitle>
            <ColorRow label="채팅 배경" value={config.chatBg} onChange={set("chatBg")} tooltip="background-color" />
            <ColorRow label="입력창 배경" value={config.inputBarBg} onChange={set("inputBarBg")} tooltip="InputBar background-color" />
            <ColorRow label="보내기 버튼 배경" value={config.sendBtnBg} onChange={set("sendBtnBg")} tooltip="-ios-send-normal-background-color" />
            <ColorRow label="보내기 버튼 아이콘" value={config.sendBtnIcon} onChange={set("sendBtnIcon")} tooltip="-ios-send-normal-foreground-color" />

            <SectionTitle>말풍선 (Message)</SectionTitle>
            <ColorRow label="내 말풍선 배경" value={config.myBubbleBg} onChange={set("myBubbleBg")} tooltip="Send 말풍선 배경색" />
            <ColorRow label="내 말풍선 텍스트" value={config.myBubbleText} onChange={set("myBubbleText")} tooltip="-ios-text-color (send)" />
            <ColorRow label="상대 말풍선 배경" value={config.otherBubbleBg} onChange={set("otherBubbleBg")} tooltip="Receive 말풍선 배경색" />
            <ColorRow label="상대 말풍선 텍스트" value={config.otherBubbleText} onChange={set("otherBubbleText")} tooltip="-ios-text-color (receive)" />
          </div>
        </aside>

        {/* ── 중앙 프리뷰 ── */}
        <main className="flex-1 flex flex-col items-center justify-start gap-4 overflow-y-auto pt-5 pb-8 mac-scroll">
          {/* OS 토글 */}
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{
              background: "rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08) inset",
            }}
          >
            {(["ios", "android"] as OS[]).map((o) => (
              <button
                key={o}
                onClick={() => setOs(o)}
                className="px-5 py-1.5 rounded-lg text-[13px] font-medium transition-all"
                style={
                  os === o
                    ? {
                        background: "rgba(255,255,255,0.85)",
                        color: "#1c1c1e",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
                      }
                    : { color: "#8e8e93" }
                }
              >
                {o === "ios" ? "🍎 iOS" : "🤖 Android"}
              </button>
            ))}
          </div>

          {/* 프리뷰 탭 */}
          <div
            className="flex items-center gap-0.5 p-1 rounded-xl"
            style={{
              background: "rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08) inset",
            }}
          >
            {(["friends", "chat"] as PreviewTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className="px-4 py-1 rounded-lg text-[12px] font-medium transition-all"
                style={
                  previewTab === tab
                    ? {
                        background: "rgba(255,255,255,0.85)",
                        color: "#1c1c1e",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset",
                      }
                    : { color: "#8e8e93" }
                }
              >
                {tab === "friends" ? "👥 친구 화면" : "💬 채팅방"}
              </button>
            ))}
          </div>

          {/* 목업 */}
          <div className="transition-all duration-300 ease-out">
            {previewTab === "friends"
              ? os === "ios"
                ? <IOSMockup config={config} />
                : <AndroidMockup config={config} />
              : <ChatMockup config={config} />
            }
          </div>

          {/* 가이드 배지 */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
            {os === "ios" ? (
              <>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#3a78c9"}}>2배수 이미지 권장</span>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#a57800"}}>.zip → .ktheme 변환</span>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#636366"}}>이미지 우선 적용</span>
              </>
            ) : (
              <>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#28a745"}}>xhdpi / xxhdpi 대응</span>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#e07000"}}>targetSdk: {config.targetSdk}</span>
                <span className="text-[10px] rounded-full px-2.5 py-0.5 glass" style={{color:"#636366"}}>레이아웃 변경 불가</span>
              </>
            )}
          </div>
        </main>

        {/* ── 우측 사이드바 ── */}
        <aside
          className="w-60 overflow-y-auto mac-scroll shrink-0"
          style={{
            background: "rgba(248, 248, 250, 0.78)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            borderLeft: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "-1px 0 0 rgba(255,255,255,0.6) inset",
          }}
        >
          <div className="p-3.5 flex flex-col gap-3">
            <SectionTitle>기본 정보</SectionTitle>

            <MacInput label="테마 이름" value={config.name} onChange={set("name")} placeholder="나의 테마" />
            <MacInput
              label="버전"
              hint={os === "ios" ? "(-kakaotalk-theme-version)" : "(versionName)"}
              value={config.version}
              onChange={set("version")}
              placeholder="1.0.0"
            />
            <MacInput
              label="패키지 ID"
              hint={os === "ios" ? "(-kakaotalk-theme-id)" : "(namespace)"}
              value={config.packageId}
              onChange={set("packageId")}
              placeholder="com.kakao.talk.theme.id"
            />
            <MacInput
              label="제작자 이름"
              hint="(-kakaotalk-author-name)"
              value={config.authorName}
              onChange={set("authorName")}
              placeholder="제작자"
            />

            {/* 다크모드 토글 */}
            <div
              className="flex items-center justify-between rounded-xl px-3 py-2.5 glass"
            >
              <div>
                <div className="text-[12px] font-semibold text-[#1c1c1e]">다크모드</div>
                <div className="text-[10px] text-[#8e8e93] mt-0.5">
                  {os === "ios" ? "-kakaotalk-theme-style: dark" : "theme_style: dark"}
                </div>
              </div>
              <button
                onClick={() => set("darkMode")(!config.darkMode)}
                className="w-[38px] h-[22px] rounded-full relative transition-all duration-200 shrink-0"
                style={{
                  backgroundColor: config.darkMode ? "#34c759" : "rgba(0,0,0,0.15)",
                  boxShadow: config.darkMode
                    ? "0 0 0 1px rgba(52,199,89,0.4), 0 1px 3px rgba(0,0,0,0.2)"
                    : "0 0 0 1px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  className="absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-md transition-all duration-200"
                  style={{ left: config.darkMode ? "18px" : "2px" }}
                />
              </button>
            </div>

            {/* Android 전용 */}
            {os === "android" && (
              <>
                <SectionTitle>Android 빌드 설정</SectionTitle>
                <MacInput
                  label="namespace"
                  hint="(build.gradle)"
                  value={config.namespace}
                  onChange={set("namespace")}
                />
                <div className="flex gap-2">
                  <MacInput label="compileSdk" hint="(권장: 34)" value={config.compileSdk} onChange={set("compileSdk")} type="number" />
                  <MacInput label="targetSdk" hint="(권장: 34)" value={config.targetSdk} onChange={set("targetSdk")} type="number" />
                </div>
                <div className="flex gap-1.5 flex-wrap mt-1">
                  {["ldpi", "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"].map((dpi) => (
                    <span
                      key={dpi}
                      className="text-[10px] rounded-full px-2 py-0.5"
                      style={{
                        background: "rgba(52,199,89,0.12)",
                        color: "#1a7a32",
                        border: "1px solid rgba(52,199,89,0.2)",
                      }}
                    >
                      {dpi}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[#8e8e93] leading-relaxed">
                  각 해상도 폴더에 대응하는 이미지를 업로드하세요. xhdpi 기준 제작 권장.
                </p>
              </>
            )}

            {/* iOS 가이드 */}
            {os === "ios" && (
              <>
                <SectionTitle>iOS 가이드</SectionTitle>
                <div
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{
                    background: "rgba(255,229,0,0.12)",
                    border: "1px solid rgba(255,210,0,0.3)",
                  }}
                >
                  {[
                    "📦 Images 폴더 + CSS를 ZIP 압축 후 확장자를 .ktheme로 변경",
                    "🖼 이미지는 2배수(@2x) 기준으로 제작",
                    "⚠️ 이미지가 컬러보다 우선 적용됩니다",
                    "📐 인셋(Inset)은 1배수 기준 수치 사용",
                  ].map((text, i) => (
                    <p key={i} className="text-[10px] leading-relaxed" style={{ color: "#7a5800" }}>
                      {text}
                    </p>
                  ))}
                </div>
              </>
            )}

            {/* 코드 미리보기 */}
            <SectionTitle>{os === "ios" ? "CSS 미리보기" : "colors.xml 미리보기"}</SectionTitle>
            <pre
              className="text-[8.5px] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all mac-scroll"
              style={{
                background: "rgba(28,28,30,0.88)",
                color: "#a8ff78",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                maxHeight: 260,
                overflowY: "auto",
              }}
            >
              {os === "ios" ? generateCSS(config) : generateColorsXml(config)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}

function generateCSS(config: ThemeConfig): string {
  return `/* KakaoTalkTheme.css */
-kakaotalk-theme-name: '${config.name}';
-kakaotalk-theme-version: '${config.version}';
-kakaotalk-theme-id: '${config.packageId}';
-kakaotalk-author-name: '${config.authorName}';
-kakaotalk-theme-url: 'http://www.kakao.com';
${config.darkMode ? "-kakaotalk-theme-style: 'dark';" : "/* light mode */"}

TabBarStyle {
  background-color: ${config.tabBarBg};
  -ios-icon-normal-color: ${config.tabBarIcon};
  -ios-icon-selected-color: ${config.tabBarSelectedIcon};
}
HeaderStyle {
  background-color: ${config.headerBg};
  -ios-text-color: ${config.headerText};
}
MainViewStyle {
  background-color: ${config.bodyBg};
  -ios-primary-text-color: ${config.primaryText};
  -ios-description-text-color: ${config.descText};
}
ChatRoomStyle {
  background-color: ${config.chatBg};
}
InputBarStyle {
  background-color: ${config.inputBarBg};
  -ios-send-normal-background-color: ${config.sendBtnBg};
  -ios-send-normal-foreground-color: ${config.sendBtnIcon};
}
MessageSendStyle {
  -ios-background-color: ${config.myBubbleBg};
  -ios-text-color: ${config.myBubbleText};
}
MessageReceiveStyle {
  -ios-background-color: ${config.otherBubbleBg};
  -ios-text-color: ${config.otherBubbleText};
}`;
}

function generateColorsXml(config: ThemeConfig): string {
  return `<!-- colors.xml -->
<!-- namespace: ${config.namespace} -->
<!-- compileSdk: ${config.compileSdk} / targetSdk: ${config.targetSdk} -->
<resources>
  <color name="theme_tab_bar_bg">${config.tabBarBg}</color>
  <color name="theme_tab_icon">${config.tabBarIcon}</color>
  <color name="theme_tab_selected">${config.tabBarSelectedIcon}</color>
  <color name="theme_header_bg">${config.headerBg}</color>
  <color name="theme_header_text">${config.headerText}</color>
  <color name="theme_body_bg">${config.bodyBg}</color>
  <color name="theme_primary_text">${config.primaryText}</color>
  <color name="theme_desc_text">${config.descText}</color>
  <color name="theme_chat_bg">${config.chatBg}</color>
  <color name="theme_input_bar_bg">${config.inputBarBg}</color>
  <color name="theme_send_btn_bg">${config.sendBtnBg}</color>
  <color name="theme_send_btn_icon">${config.sendBtnIcon}</color>
  <color name="theme_my_bubble_bg">${config.myBubbleBg}</color>
  <color name="theme_my_bubble_text">${config.myBubbleText}</color>
  <color name="theme_other_bubble_bg">${config.otherBubbleBg}</color>
  <color name="theme_other_bubble_text">${config.otherBubbleText}</color>
</resources>`;
}
