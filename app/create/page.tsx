"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import Header from "../components/Header";

import { PreviewNewsMockup } from "../../stories/PreviewNewsMockup";
import { PreviewChatRoomMockup } from "../../stories/PreviewChatRoomMockup";
import { PreviewMockup } from "../../stories/PreviewMockup";
import { ChatRoomScreen } from "../../stories/preview/ChatRoomScreen";
import { FriendsScreen } from "../../stories/preview/FriendsScreen";
import { MainScreen } from "../../stories/preview/MainScreen";
import { MoreScreen } from "../../stories/preview/MoreScreen";
import { NewsScreen } from "../../stories/preview/NewsScreen";
import { OpenChatsScreen } from "../../stories/preview/OpenChatsScreen";
import { PasscodeScreen } from "../../stories/preview/PasscodeScreen";
import { ShoppingScreen } from "../../stories/preview/ShoppingScreen";
import { TabBar } from "../../stories/preview/TabBar";
import { frameStyle } from "../../stories/preview/styles";
import { ScreenType, useThemeStore as usePreviewThemeStore } from "../../stories/useThemeStore";

type OS = "ios" | "android";

interface ThemeConfig {
  name: string;
  version: string;
  packageId: string;
  authorName: string;
  darkMode: boolean;
  // ── 공통 ──
  tabBarBg: string;
  tabBarIcon: string;
  tabBarSelectedIcon: string;
  headerBg: string;
  headerText: string;
  bodyBg: string;
  primaryText: string;
  descText: string;
  // ── 친구 탭 ──
  friendsNameText: string;
  friendsBorderColor: string;
  friendsSelectedBg: string;
  // ── 채팅 탭 ──
  chatListNameText: string;
  chatListLastMsgText: string;
  chatListHighlightText: string;
  // ── 오픈채팅 탭 ──
  openchatBg: string;
  openchatText: string;
  // ── 쇼핑 탭 ──
  shoppingBg: string;
  shoppingText: string;
  // ── 더보기 탭 ──
  moreBg: string;
  moreTabText: string;
  // ── 채팅방 ──
  chatBg: string;
  inputBarBg: string;
  sendBtnBg: string;
  sendBtnIcon: string;
  menuBtnColor: string;
  inputFieldBg: string;
  myBubbleBg: string;
  myBubbleText: string;
  otherBubbleBg: string;
  otherBubbleText: string;
  unreadCountColor: string;
  // ── 암호화면 ──
  passcodeBg: string;
  passcodeTitleText: string;
  passcodeKeypadBg: string;
  passcodeKeypadText: string;
  // ── 알림 배너 ──
  notifBannerBg: string;
  notifBannerText: string;
  // Android 전용
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
  // 공통
  tabBarBg: "#FFFFFF",
  tabBarIcon: "#9E9E9E",
  tabBarSelectedIcon: "#3A1D1D",
  headerBg: "#FEE500",
  headerText: "#3A1D1D",
  bodyBg: "#F5F5F5",
  primaryText: "#191919",
  descText: "#9E9E9E",
  // 친구 탭
  friendsNameText: "#191919",
  friendsBorderColor: "#E5E5EA",
  friendsSelectedBg: "#F2F2F7",
  // 채팅 탭
  chatListNameText: "#191919",
  chatListLastMsgText: "#9E9E9E",
  chatListHighlightText: "#3A1D1D",
  // 오픈채팅 탭
  openchatBg: "#F5F5F5",
  openchatText: "#191919",
  // 쇼핑 탭
  shoppingBg: "#F5F5F5",
  shoppingText: "#191919",
  // 더보기 탭
  moreBg: "#F5F5F5",
  moreTabText: "#191919",
  // 채팅방
  chatBg: "#B2C7D9",
  inputBarBg: "#FFFFFF",
  sendBtnBg: "#FEE500",
  sendBtnIcon: "#3A1D1D",
  menuBtnColor: "#9E9E9E",
  inputFieldBg: "#F2F2F7",
  myBubbleBg: "#FEE500",
  myBubbleText: "#191919",
  otherBubbleBg: "#FFFFFF",
  otherBubbleText: "#191919",
  unreadCountColor: "#FF3B30",
  // 암호화면
  passcodeBg: "#F5F5F5",
  passcodeTitleText: "#191919",
  passcodeKeypadBg: "#FFFFFF",
  passcodeKeypadText: "#191919",
  // 알림 배너
  notifBannerBg: "#FFFFFF",
  notifBannerText: "#191919",
  // Android
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
    <div
      data-setting-item="true"
      className="flex items-center justify-between gap-2 py-2.5 px-2 rounded-lg hover:bg-black/[0.03] transition-colors"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[13px] truncate" style={{color:"#706765"}}>{label}</span>
        {tooltip && (
          <div className="group relative">
            <span className="text-[11px] cursor-help" style={{color:"#706765"}}>?</span>
            <div className="absolute left-4 top-0 z-50 hidden group-hover:block text-[11px] rounded-lg px-2.5 py-1.5 w-44 leading-snug glass shadow-xl" style={{color:"#706765"}}>
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
    <div className="text-[12px] font-semibold uppercase tracking-widest mt-6 mb-2 px-2" style={{color:"#706765"}}>
      {children}
    </div>
  );
}

/* ── 이미지 업로드 행 ── */
function ImageUploadRow({ label, tooltip, imgKey, imageUploads, onUpload }: {
  label: string; tooltip: string; imgKey: string;
  imageUploads: Record<string, string>;
  onUpload: (key: string, file: File) => void;
}) {
  return (
    <div data-setting-item="true" className="mb-3 rounded-lg px-2 py-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[13px]" style={{color:"#706765"}}>{label}</span>
        <div className="group relative">
          <span className="text-[11px] cursor-help" style={{color:"#706765"}}>?</span>
          <div className="absolute left-4 top-0 z-50 hidden group-hover:block text-[11px] rounded-lg px-2.5 py-1.5 w-44 leading-snug glass shadow-xl" style={{ color: "#706765" }}>
            {tooltip}
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 glass"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {imageUploads[imgKey]
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={imageUploads[imgKey]} alt={label} className="w-full h-full object-cover" />
            : <span className="text-lg" style={{color:"#706765"}}>+</span>}
        </div>
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(imgKey, f); }} />
        <span className="text-[12px]" style={{color:"#706765"}}>클릭하여 업로드</span>
      </label>
    </div>
  );
}

/* ── 아코디언 패널 ── */
function Accordion({ title, badge, children, autoOpenSignal, isSelected = false, settingKey }: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  autoOpenSignal?: string | null;
  isSelected?: boolean;
  settingKey?: string;
}) {
  const storageKey = `accordion_${title}`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [stickyTop, setStickyTop] = useState(0);
  const [stickyZIndex, setStickyZIndex] = useState(10);

  const getStackedTop = () => {
    const node = wrapperRef.current;
    if (!node) return 0;

    const parent = node.parentElement;
    if (!parent) return 0;

    const accordions = Array.from(parent.querySelectorAll('[data-accordion-sticky="true"]')) as HTMLElement[];
    const myIndex = accordions.indexOf(node);
    if (myIndex < 0) return 0;

    let top = 0;
    for (let i = 0; i < myIndex; i += 1) {
      const prevHeader = accordions[i].querySelector('[data-accordion-header="true"]') as HTMLElement | null;
      top += prevHeader?.offsetHeight ?? 46;
    }

    return top;
  };
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) startTransition(() => { setOpen(saved === "true"); });
  }, [storageKey]);

  useEffect(() => {
    if (!autoOpenSignal) return;
    startTransition(() => { setOpen(true); });
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }
  }, [autoOpenSignal, storageKey]);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    const recalcStickyTop = () => {
      const parent = node.parentElement;
      if (!parent) return;

      const accordions = Array.from(parent.querySelectorAll('[data-accordion-sticky="true"]')) as HTMLElement[];
      const myIndex = accordions.indexOf(node);
      if (myIndex < 0) {
        setStickyTop(0);
        setStickyZIndex(10);
        return;
      }

      const top = getStackedTop();

      const z = 100 - myIndex;
      setStickyTop(top);
      setStickyZIndex(z);
    };

    recalcStickyTop();
    window.addEventListener("resize", recalcStickyTop);

    return () => {
      window.removeEventListener("resize", recalcStickyTop);
    };
  }, [open]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      localStorage.setItem(storageKey, String(next));

      if (next) {
        const scrollHost = wrapperRef.current?.closest("aside") as HTMLElement | null;
        const anchorNode = anchorRef.current;

        if (scrollHost && anchorNode) {
          requestAnimationFrame(() => {
            const hostRect = scrollHost.getBoundingClientRect();
            const anchorRect = anchorNode.getBoundingClientRect();
            const desiredTop = getStackedTop();
            const delta = anchorRect.top - hostRect.top - desiredTop;
            const targetTop = Math.max(0, scrollHost.scrollTop + delta);
            scrollHost.scrollTo({ top: targetTop, behavior: "smooth" });
          });
        }
      }

      return next;
    });
  };
  return (
    <div ref={wrapperRef} data-accordion-sticky="true" style={{ display: "contents" }}>
      <div ref={anchorRef} aria-hidden="true" className="h-0" />
      <button
        ref={headerRef}
        data-setting-item="true"
        data-setting-key={settingKey}
        data-accordion-header="true"
        onClick={() => toggle()}
        className="w-full sticky top-0 z-10 flex items-center justify-between px-2 py-3 transition-colors"
        style={{
          position: "sticky",
          top: stickyTop,
          zIndex: stickyZIndex,
          background: isSelected ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.92)",
          boxShadow: isSelected ? "0 0 0 1px rgba(0,0,0,0.12) inset" : "none",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold" style={{color:"#706765"}}>{title}</span>
          {badge && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.06)", color: "#636366" }}>{badge}</span>
          )}
        </div>
        <span className="text-[11px] transition-transform duration-200" style={{ color:"#706765", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {open && <div className="px-2 pb-3 pt-1 mb-1">{children}</div>}
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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold" style={{color:"#706765"}}>
        {label}
        {hint && <span className="ml-1 font-normal" style={{color:"#706765"}}>{hint}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`rounded-lg px-3 py-1.5 text-[13px] glass-input${readOnly ? " opacity-60 cursor-default select-none" : ""}`}
      />
    </div>
  );
}

/* ── 탭바 아이콘 SVG ── */
function TabIcon({ tab, active, color }: { tab: string; active: boolean; color: string }) {
  const s = { width: 22, height: 22, fill: "none" };
  if (tab === "friends") return (
    <svg {...s} viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth={active ? 2 : 1.6} />
      <path d="M2 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth={active ? 1.8 : 1.4} />
      <path d="M17 14c2.21 0 4 1.79 4 4" stroke={color} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  );
  if (tab === "chat") return (
    <svg {...s} viewBox="0 0 24 24">
      <path d="M20 2H4a2 2 0 00-2 2v13a2 2 0 002 2h3l2 3 2-3h9a2 2 0 002-2V4a2 2 0 00-2-2z" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinejoin="round" />
      <path d="M7 9h10M7 13h6" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
    </svg>
  );
  if (tab === "openchat") return (
    <svg {...s} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={active ? 2 : 1.6} />
      <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <path d="M9 15l1.5-1.5M15 15l-1.5-1.5M12 13.5V16" stroke={color} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  );
  if (tab === "shopping") return (
    <svg {...s} viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinejoin="round" />
      <path d="M3 6h18" stroke={color} strokeWidth={active ? 2 : 1.6} />
      <path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
    </svg>
  );
  if (tab === "passcode") return (
    <svg {...s} viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={active ? 2 : 1.6} />
      <path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
  );
  // more
  return (
    <svg {...s} viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="2.5" rx="1.25" fill={color} />
      <rect x="3" y="10.75" width="18" height="2.5" rx="1.25" fill={color} />
      <rect x="3" y="16.5" width="18" height="2.5" rx="1.25" fill={color} />
    </svg>
  );
}

/* ── 친구 목록 공유 컴포넌트 ── */
function IOSMockupFriendsList({ config }: { config: ThemeConfig }) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: `${config.primaryText}10` }}>
        <div className="w-12 h-12 rounded-full bg-zinc-300 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold" style={{ color: config.primaryText }}>나</span>
          <span className="text-[10px]" style={{ color: config.descText }}>상태메시지를 입력해주세요</span>
        </div>
      </div>
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-semibold" style={{ color: config.descText }}>즐겨찾기</span>
      </div>
      <div className="flex gap-4 px-4 pb-3">
        {["친구A", "친구B", "친구C"].map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-zinc-200 shrink-0" />
            <span className="text-[9px]" style={{ color: config.primaryText }}>{n}</span>
          </div>
        ))}
      </div>
      <div className="px-4 pb-1">
        <span className="text-[10px] font-semibold" style={{ color: config.descText }}>친구 12</span>
      </div>
      {["친구 1", "친구 2", "친구 3", "친구 4", "친구 5"].map((name) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-medium" style={{ color: config.friendsNameText }}>{name}</span>
            <span className="text-[9px]" style={{ color: config.descText }}>상태메시지</span>
          </div>
        </div>
      ))}
    </>
  );
}

/* ── 탭별 바디 콘텐츠 ── */
function MockupBody({ tab, config }: { tab: PreviewTab; config: ThemeConfig }) {
  if (tab === "friends") return (
    <>
      {/* 내 프로필 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: `${config.primaryText}10` }}>
        <div className="w-12 h-12 rounded-full bg-zinc-300 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold" style={{ color: config.primaryText }}>나</span>
          <span className="text-[10px]" style={{ color: config.descText }}>상태메시지를 입력해주세요</span>
        </div>
      </div>
      {/* 즐겨찾기 */}
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-semibold" style={{ color: config.descText }}>즐겨찾기</span>
      </div>
      <div className="flex gap-4 px-4 pb-3">
        {["친구A", "친구B", "친구C"].map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-zinc-200 shrink-0" />
            <span className="text-[9px]" style={{ color: config.primaryText }}>{n}</span>
          </div>
        ))}
      </div>
      {/* 친구 목록 */}
      <div className="px-4 pb-1">
        <span className="text-[10px] font-semibold" style={{ color: config.descText }}>친구 12</span>
      </div>
      {["친구 1", "친구 2", "친구 3", "친구 4", "친구 5"].map((name) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-zinc-200 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-medium" style={{ color: config.friendsNameText }}>{name}</span>
            <span className="text-[9px]" style={{ color: config.descText }}>상태메시지</span>
          </div>
        </div>
      ))}
    </>
  );
  if (tab === "chat") return (
    <>
      {["카카오팀", "친구 1", "친구 2", "단체채팅방", "친구 3"].map((name, i) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b"
          style={{ borderColor: `${config.primaryText}08` }}>
          <div className={`shrink-0 rounded-${i === 3 ? "xl" : "full"} bg-zinc-200`} style={{ width: 42, height: 42 }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold" style={{ color: config.chatListNameText }}>{name}</span>
              <span className="text-[9px]" style={{ color: config.descText }}>오후 {i + 1}:{(i * 7).toString().padStart(2, "0")}</span>
            </div>
            <span className="text-[10px] truncate block" style={{ color: config.chatListLastMsgText }}>마지막 메시지 내용입니다</span>
          </div>
        </div>
      ))}
    </>
  );
  if (tab === "openchat") return (
    <>
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-xl px-3 py-2 text-[11px] font-medium text-center" style={{ backgroundColor: `${config.headerBg}33`, color: config.primaryText }}>
          🔍 관심 주제 오픈채팅 찾기
        </div>
      </div>
      <div className="px-4 pb-1"><span className="text-[10px] font-semibold" style={{ color: config.descText }}>참여중인 오픈채팅</span></div>
      {["카카오톡 테마 모임", "디자인 이야기", "개발자 채널", "일상 수다방"].map((name, i) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ borderColor: `${config.primaryText}08` }}>
          <div className="w-10 h-10 rounded-xl bg-zinc-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold" style={{ color: config.primaryText }}>{name}</span>
              <span className="text-[9px]" style={{ color: config.descText }}>{(i + 1) * 128}명</span>
            </div>
            <span className="text-[10px] truncate block" style={{ color: config.descText }}>최근 대화 내용</span>
          </div>
        </div>
      ))}
    </>
  );
  if (tab === "shopping") return (
    <>
      <div className="px-3 pt-3 pb-2">
        <div className="rounded-xl h-20 flex items-center justify-center text-[11px]" style={{ backgroundColor: `${config.headerBg}44`, color: config.primaryText }}>
          쇼핑 배너
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        {["패션", "뷰티", "식품", "생활"].map((cat) => (
          <div key={cat} className="rounded-xl h-16 flex items-center justify-center text-[11px] font-medium" style={{ backgroundColor: `${config.bodyBg}`, border: `1px solid ${config.primaryText}15`, color: config.primaryText }}>
            {cat}
          </div>
        ))}
      </div>
      <div className="px-3"><span className="text-[10px] font-semibold" style={{ color: config.descText }}>추천 상품</span></div>
      <div className="flex gap-2 px-3 pt-2 overflow-hidden">
        {["상품 1", "상품 2", "상품 3"].map((p) => (
          <div key={p} className="flex flex-col gap-1 shrink-0" style={{ width: 90 }}>
            <div className="rounded-xl h-20 bg-zinc-200" />
            <span className="text-[9px]" style={{ color: config.primaryText }}>{p}</span>
            <span className="text-[9px] font-bold" style={{ color: config.primaryText }}>12,000원</span>
          </div>
        ))}
      </div>
    </>
  );
  // more
  if (tab === "more") return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: `${config.primaryText}10` }}>
        <div className="w-12 h-12 rounded-full bg-zinc-300 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-bold" style={{ color: config.primaryText }}>나</span>
          <span className="text-[10px]" style={{ color: config.descText }}>내 프로필 보기</span>
        </div>
      </div>
      {[
        { icon: "🔔", label: "알림" },
        { icon: "🎵", label: "멜론" },
        { icon: "💳", label: "카카오페이" },
        { icon: "🗓", label: "카카오톡 채널" },
        { icon: "⚙️", label: "설정" },
      ].map(({ icon, label }) => (
        <div key={label} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: `${config.primaryText}08` }}>
          <span className="text-lg w-8 text-center">{icon}</span>
          <span className="text-[12px]" style={{ color: config.primaryText }}>{label}</span>
        </div>
      ))}
    </>
  );
  // passcode
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between py-8"
      style={{ backgroundColor: config.bodyBg }}>
      {/* 타이틀 */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke={config.primaryText} strokeWidth="1.8" />
          <path d="M8 11V7a4 4 0 018 0v4" stroke={config.primaryText} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.5" fill={config.primaryText} />
        </svg>
        <span className="text-[14px] font-semibold mt-1" style={{ color: config.primaryText }}>
          비밀번호를 입력하세요
        </span>
        {/* 불릿 */}
        <div className="flex gap-4 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border-2"
              style={{ borderColor: config.primaryText, backgroundColor: i < 2 ? config.primaryText : "transparent" }} />
          ))}
        </div>
      </div>
      {/* 키패드 */}
      <div className="grid grid-cols-3 gap-3 w-full px-8">
        {["1","2","3","4","5","6","7","8","9","*","0","⌫"].map((k) => (
          <div key={k}
            className="flex items-center justify-center rounded-2xl h-12 text-[16px] font-semibold"
            style={{
              backgroundColor: k === "⌫" || k === "*" ? "transparent" : `${config.primaryText}10`,
              color: config.primaryText,
            }}>
            <span>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── iOS 목업 ── */
function IOSMockup({ config, previewTab }: { config: ThemeConfig; previewTab: PreviewTab }) {
  const tabs: { key: PreviewTab; label: string }[] = [
    { key: "friends", label: "친구" },
    { key: "chat", label: "채팅" },
    { key: "openchat", label: "오픈채팅" },
    { key: "shopping", label: "쇼핑" },
    { key: "more", label: "더보기" },
    { key: "passcode", label: "암호" },
  ];
  const headerLabels: Record<PreviewTab, string> = {
    friends: "친구", chat: "채팅", openchat: "지금", shopping: "쇼핑", more: "더보기", passcode: "암호",
  };

  const isPasscode = previewTab === "passcode";

  return (
    <div className="relative mx-auto select-none" style={{ width: 360, height: 720 }}>
      <div
        className="absolute inset-0 rounded-[40px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}
      >
        {/* 다이나믹 아일랜드 */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-full z-10" />

        {isPasscode ? (
          /* ── 암호 전체화면 ── */
          <div className="absolute inset-0 rounded-[35px] flex flex-col items-center justify-between py-10 pt-16"
            style={{ backgroundColor: config.passcodeBg }}>
            <div className="flex flex-col items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke={config.passcodeTitleText} strokeWidth="1.8" />
                <path d="M8 11V7a4 4 0 018 0v4" stroke={config.passcodeTitleText} strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1.5" fill={config.passcodeTitleText} />
              </svg>
              <span className="text-[15px] font-semibold" style={{ color: config.passcodeTitleText }}>
                비밀번호를 입력하세요
              </span>
              <div className="flex gap-5 mt-2">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="w-4 h-4 rounded-full border-2"
                    style={{ borderColor: config.passcodeTitleText, backgroundColor: i < 2 ? config.passcodeTitleText : "transparent" }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full px-10 mb-4">
              {["1","2","3","4","5","6","7","8","9","*","0","⌫"].map((k) => (
                <div key={k}
                  className="flex items-center justify-center rounded-2xl h-14 text-[18px] font-semibold"
                  style={{
                    backgroundColor: k === "⌫" || k === "*" ? "transparent" : config.passcodeKeypadBg,
                    color: config.passcodeKeypadText,
                  }}>
                  {k}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div
              className="absolute top-9 left-0 right-0 h-12 flex items-center px-5 gap-2"
              style={{ backgroundColor: config.headerBg }}
            >
              <span className="font-bold text-[15px] flex-1" style={{ color: config.headerText }}>
                {headerLabels[previewTab]}
              </span>
              <span className="text-[13px]" style={{ color: config.headerText }}>🔍</span>
              <span className="text-[13px] ml-1" style={{ color: config.headerText }}>⚙︎</span>
            </div>
            {/* 바디 */}
            <div
              className="absolute left-0 right-0 overflow-y-auto overflow-x-hidden"
              style={{ top: 84, bottom: 64, backgroundColor: config.bodyBg }}
            >
              <MockupBody tab={previewTab} config={config} />
            </div>
            {/* 탭바 */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around rounded-b-[35px] border-t"
              style={{ backgroundColor: config.tabBarBg, borderColor: `${config.primaryText}12` }}
            >
              {tabs.filter(t => t.key !== "passcode").map(({ key, label }) => {
                const active = previewTab === key;
                const color = active ? config.tabBarSelectedIcon : config.tabBarIcon;
                return (
                  <div key={key} className="flex flex-col items-center gap-0.5 pt-1">
                    <TabIcon tab={key} active={active} color={color} />
                    <span className="text-[9px]" style={{ color }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="absolute right-[-6px] top-24 w-1 h-12 bg-zinc-700 rounded-r-md" />
      <div className="absolute left-[-6px] top-20 w-1 h-8 bg-zinc-700 rounded-l-md" />
      <div className="absolute left-[-6px] top-32 w-1 h-8 bg-zinc-700 rounded-l-md" />
    </div>
  );
}

/* ── 채팅 탭 전용: 목업 2개 나란히 ── */
/* ── iOS 친구 프로필 목업 (친구 탭 듀얼용 — 오른쪽) ── */
function IOSFriendsProfileMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 360, height: 720 }}>
      <div className="absolute inset-0 rounded-[40px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}>
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-full z-10" />
        <div className="absolute top-9 left-0 right-0 h-12 flex items-center px-5 gap-2"
          style={{ backgroundColor: config.headerBg }}>
          <span className="text-[13px]" style={{ color: config.headerText }}>←</span>
          <span className="font-bold text-[15px] flex-1" style={{ color: config.headerText }}>친구</span>
        </div>
        <div className="absolute left-0 right-0 overflow-y-auto overflow-x-hidden"
          style={{ top: 84, bottom: 64, backgroundColor: config.bodyBg }}>
          <IOSMockupFriendsList config={config} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around rounded-b-[35px] border-t"
          style={{ backgroundColor: config.tabBarBg, borderColor: `${config.primaryText}12` }}>
          {(["friends","chat","openchat","shopping","more"] as PreviewTab[]).map((key) => {
            const active = key === "friends";
            const color = active ? config.tabBarSelectedIcon : config.tabBarIcon;
            return (
              <div key={key} className="flex flex-col items-center gap-0.5 pt-1">
                <TabIcon tab={key} active={active} color={color} />
                <span className="text-[9px]" style={{ color }}>
                  {({"friends":"친구","chat":"채팅","openchat":"오픈채팅","shopping":"쇼핑","more":"더보기"} as Record<string,string>)[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute right-[-6px] top-24 w-1 h-12 bg-zinc-700 rounded-r-md" />
      <div className="absolute left-[-6px] top-20 w-1 h-8 bg-zinc-700 rounded-l-md" />
      <div className="absolute left-[-6px] top-32 w-1 h-8 bg-zinc-700 rounded-l-md" />
    </div>
  );
}

/* ── Android 친구 프로필 목업 (친구 탭 듀얼용 — 오른쪽) ── */
function AndroidFriendsProfileMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 368, height: 699 }}>
      <div className="absolute inset-0 rounded-[28px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-700 z-10" />
        <div className="absolute left-0 right-0"
          style={{ top: 0, bottom: 0 }}>
          <section style={{ ...frameStyle, borderRadius: 23, border: 'none', boxShadow: 'none' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <NewsScreen />
            </div>
            <TabBar disabled />
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

/* ── iOS 채팅방 목업 (채팅 탭 듀얼용) ── */
function IOSChatRoomMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 360, height: 720 }}>
      <div className="absolute inset-0 rounded-[40px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.chatBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}>
        {/* 다이나믹 아일랜드 */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-full z-10" />
        {/* 헤더 */}
        <div className="absolute top-9 left-0 right-0 h-12 flex items-center px-5 gap-2"
          style={{ backgroundColor: config.headerBg }}>
          <span className="text-[14px]" style={{ color: config.headerText }}>←</span>
          <span className="font-bold text-[14px] flex-1" style={{ color: config.headerText }}>친구 1</span>
          <span className="text-[13px]" style={{ color: config.headerText }}>⋯</span>
        </div>
        {/* 메시지 영역 */}
        <div className="absolute left-0 right-0 flex flex-col gap-2.5 px-4 py-3 overflow-hidden"
          style={{ top: 84, bottom: 120, backgroundColor: config.chatBg }}>
          <div className="flex items-end gap-1.5 self-start max-w-[75%]">
            <div className="w-7 h-7 rounded-full bg-zinc-300 shrink-0" />
            <div>
              <span className="text-[9px] block mb-0.5" style={{ color: config.descText }}>친구 1</span>
              <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-snug"
                style={{ backgroundColor: config.otherBubbleBg, color: config.otherBubbleText }}>
                안녕하세요! 👋
              </div>
            </div>
            <span className="text-[8px] self-end mb-0.5" style={{ color: config.descText }}>오후 1:00</span>
          </div>
          <div className="flex items-end gap-1.5 self-end max-w-[75%]">
            <span className="text-[8px] self-end mb-0.5" style={{ color: config.unreadCountColor }}>1</span>
            <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] leading-snug"
              style={{ backgroundColor: config.myBubbleBg, color: config.myBubbleText }}>
              반가워요! 😊
            </div>
          </div>
          <div className="flex items-end gap-1.5 self-start max-w-[75%]">
            <div className="w-7 h-7 rounded-full bg-zinc-300 shrink-0" />
            <div className="rounded-2xl rounded-tl-sm px-3 py-2 text-[11px] leading-snug"
              style={{ backgroundColor: config.otherBubbleBg, color: config.otherBubbleText }}>
              테마 예쁘네요 ✨
            </div>
            <span className="text-[8px] self-end mb-0.5" style={{ color: config.descText }}>오후 1:02</span>
          </div>
          <div className="flex items-end gap-1.5 self-end max-w-[75%]">
            <div className="rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] leading-snug"
              style={{ backgroundColor: config.myBubbleBg, color: config.myBubbleText }}>
              감사합니다! 🎨
            </div>
          </div>
        </div>
        {/* 입력창 */}
        <div className="absolute left-0 right-0 h-14 flex items-center gap-2 px-4"
          style={{ bottom: 64, backgroundColor: config.inputBarBg }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.inputFieldBg }}>
            <span className="text-[13px]" style={{ color: config.menuBtnColor }}>+</span>
          </div>
          <div className="flex-1 h-9 rounded-full px-3 flex items-center"
            style={{ backgroundColor: config.inputFieldBg }}>
            <span className="text-[10px] text-zinc-400">메시지 입력</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.sendBtnBg }}>
            <span className="text-[11px]" style={{ color: config.sendBtnIcon }}>▶</span>
          </div>
        </div>
        {/* 탭바 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around rounded-b-[35px] border-t"
          style={{ backgroundColor: config.tabBarBg, borderColor: `${config.primaryText}12` }}>
          {(["friends","chat","openchat","shopping","more"] as PreviewTab[]).map((key) => {
            const active = key === "chat";
            const color = active ? config.tabBarSelectedIcon : config.tabBarIcon;
            return (
              <div key={key} className="flex flex-col items-center gap-0.5 pt-1">
                <TabIcon tab={key} active={active} color={color} />
                <span className="text-[9px]" style={{ color }}>
                  {({"friends":"친구","chat":"채팅","openchat":"오픈채팅","shopping":"쇼핑","more":"더보기"} as Record<string,string>)[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute right-[-6px] top-24 w-1 h-12 bg-zinc-700 rounded-r-md" />
      <div className="absolute left-[-6px] top-20 w-1 h-8 bg-zinc-700 rounded-l-md" />
      <div className="absolute left-[-6px] top-32 w-1 h-8 bg-zinc-700 rounded-l-md" />
    </div>
  );
}

/* ── Android 채팅방 목업 (채팅 탭 듀얼용) ── */
function AndroidChatRoomMockup({ config }: { config: ThemeConfig }) {
  return (
    <div className="relative mx-auto select-none" style={{ width: 368, height: 699 }}>
      <div className="absolute inset-0 rounded-[28px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.chatBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-700 z-10" />
        <div className="absolute left-0 right-0"
          style={{ top: 0, bottom: 0 }}>
          <section style={{ ...frameStyle, borderRadius: 23, border: 'none', boxShadow: 'none' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <ChatRoomScreen />
            </div>
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

function AndroidMockup({ config, previewTab }: { config: ThemeConfig; previewTab: PreviewTab }) {
  const renderScreen = () => {
    switch (previewTab) {
      case "friends":
        return <FriendsScreen />;
      case "chat":
        return <MainScreen />;
      case "openchat":
        return <OpenChatsScreen />;
      case "shopping":
        return <ShoppingScreen />;
      case "more":
        return <MoreScreen />;
      case "passcode":
        return <PasscodeScreen />;
      default:
        return <MainScreen />;
    }
  };

  const showTabBar = previewTab !== "passcode";

  return (
    <div className="relative mx-auto select-none" style={{ width: 368, height: 699 }}>
      <div
        className="absolute inset-0 rounded-[28px] border-[5px] border-zinc-800"
        style={{
          backgroundColor: config.bodyBg,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset",
        }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-700 z-10" />

        <div className="absolute left-0 right-0"
          style={{ top: 0, bottom: 0 }}>
          <section style={{ ...frameStyle, borderRadius: 23, border: 'none', boxShadow: 'none' }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              {renderScreen()}
            </div>
            {showTabBar ? <TabBar disabled /> : null}
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

type PreviewTab = "friends" | "chat" | "openchat" | "shopping" | "more" | "passcode";

export default function CreatePage() {
  const leftAsideRef = useRef<HTMLElement | null>(null);
  const [os, setOs] = useState<OS>("ios");
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("friends");
  const [imageUploads, setImageUploads] = useState<Record<string, string>>({});
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const setCurrentScreen = usePreviewThemeStore((state) => state.setCurrentScreen);
  const activeElementId = usePreviewThemeStore((state) => state.activeElementId);
  const setActiveElementId = usePreviewThemeStore((state) => state.setActiveElementId);

  useEffect(() => {
    const screenMap: Record<PreviewTab, ScreenType> = {
      friends: "FRIENDS",
      chat: "CHATS",
      openchat: "OPENCHATS",
      shopping: "SHOPPING",
      more: "MORE",
      passcode: "PASSCODE",
    };

    setCurrentScreen(screenMap[previewTab]);
  }, [previewTab, setCurrentScreen]);

  useEffect(() => {
    if (!activeElementId) return;

    const settingMap: Record<string, string> = {
      "header-title-icon": "header-title-icon-color",
      "tabBar-friends": "tab-friends",
      "tabBar-chats": "tab-chat",
      "tabBar-openchats": "tab-openchat",
      "tabBar-shopping": "tab-shopping",
      "tabBar-more": "tab-more",
    };

    startTransition(() => { setSelectedSettingKey(settingMap[activeElementId] ?? null); });
  }, [activeElementId]);

  useEffect(() => {
    if (!selectedSettingKey) return;

    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tryScroll = (attempt: number) => {
      if (cancelled) return;

      const host = leftAsideRef.current;
      const target = host?.querySelector(`[data-setting-key="${selectedSettingKey}"]`) as HTMLElement | null;

      if (host && target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (attempt >= 8) return;
      retryTimer = setTimeout(() => tryScroll(attempt + 1), 60);
    };

    tryScroll(0);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [selectedSettingKey]);

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
   <div
      className="h-screen overflow-hidden flex flex-col"
      onMouseDownCapture={(event) => {
        const target = event.target as HTMLElement | null;

        const activeElementTarget = target?.closest("[data-active-element-id]") as HTMLElement | null;
        if (activeElementTarget) {
          const activeId = activeElementTarget.getAttribute("data-active-element-id");
          if (activeId === "header-title-icon") {
            setActiveElementId("header-title-icon");
            setSelectedSettingKey("header-title-icon-color");

            const currentSelected = document.querySelectorAll('[data-active-element-id][data-active-selected="true"]');
            currentSelected.forEach((item) => item.removeAttribute("data-active-selected"));

            const sameElements = document.querySelectorAll('[data-active-element-id="header-title-icon"]');
            sameElements.forEach((item) => item.setAttribute("data-active-selected", "true"));
            return;
          }
        }

        const settingKey = target?.closest("[data-setting-key]")?.getAttribute("data-setting-key") ?? null;
        if (settingKey) {
          const settingToActiveMap: Record<string, string> = {
            "header-title-icon-color": "header-title-icon",
            "tab-friends": "tabBar-friends",
            "tab-chat": "tabBar-chats",
            "tab-openchat": "tabBar-openchats",
            "tab-shopping": "tabBar-shopping",
            "tab-more": "tabBar-more",
          };

          const mappedActiveId = settingToActiveMap[settingKey] ?? null;
          if (mappedActiveId) {
            setActiveElementId(mappedActiveId as Parameters<typeof setActiveElementId>[0]);
          } else if (activeElementId !== null) {
            setActiveElementId(null);
          }

          const currentSelected = document.querySelectorAll('[data-active-element-id][data-active-selected="true"]');
          currentSelected.forEach((item) => item.removeAttribute("data-active-selected"));

          if (mappedActiveId === "header-title-icon") {
            const sameElements = document.querySelectorAll('[data-active-element-id="header-title-icon"]');
            sameElements.forEach((item) => item.setAttribute("data-active-selected", "true"));
          }

          setSelectedSettingKey(settingKey);
          return;
        }

        if (target?.closest('[data-keep-active-element="true"]')) return;
        if (activeElementId !== null) {
          setActiveElementId(null);
        }
        const currentSelected = document.querySelectorAll('[data-active-element-id][data-active-selected="true"]');
        currentSelected.forEach((item) => item.removeAttribute("data-active-selected"));
        setSelectedSettingKey(null);
      }}
      style={{ backgroundImage: "url('/back.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}
    >
      {/* ── 공통 헤더 ── */}
      <Header />

      <div className="flex flex-1" style={{ height: "calc(100vh - 48px)" }}>

        {/* ── 좌측 사이드바 ── */}
        <aside ref={leftAsideRef} className="w-80 overflow-y-auto mac-scroll shrink-0" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRight: "1px solid rgba(255,255,255,0.35)" }}>
          <div className="p-4 pt-4">

            {/* ══ 공통 설정 — 항상 표시 ══ */}
            <div className="text-[12px] font-bold uppercase tracking-widest mb-3 px-2" style={{color:"#000000"}}>공통 설정</div>

            <Accordion title="배경 · 바디" badge="MainViewStyle">
              <ColorRow label="배경색" value={config.bodyBg} onChange={set("bodyBg")} tooltip="background-color — MainViewStyle" />
              <ImageUploadRow label="배경 이미지" tooltip="mainBgImage.png (상단/센터 크롭)" imgKey="mainBg" imageUploads={imageUploads} onUpload={handleImageUpload} />
            </Accordion>

            <Accordion
              title="헤더"
              badge="HeaderStyle"
              autoOpenSignal={activeElementId === "header-title-icon" ? activeElementId : null}
              isSelected={false}
            >
              <div data-setting-key="header-title-icon-color">
                <ColorRow label="타이틀 · 아이콘 색" value={config.headerText} onChange={set("headerText")} tooltip="-ios-text-color (타이틀, 검색, 설정 아이콘)" />
              </div>
            </Accordion>

            <Accordion
              title="하단 탭바"
              badge="TabBarStyle"
              autoOpenSignal={activeElementId?.startsWith("tabBar-") ? activeElementId : null}
              isSelected={(activeElementId?.startsWith("tabBar-") ?? false) || (selectedSettingKey?.startsWith("tab-") ?? false)}
            >
              <ColorRow label="탭바 배경색" value={config.tabBarBg} onChange={set("tabBarBg")} tooltip="background-color — TabBarStyle" />
              <ColorRow label="일반 아이콘" value={config.tabBarIcon} onChange={set("tabBarIcon")} tooltip="각 탭 -normal 아이콘 컬러" />
              <ColorRow label="선택 아이콘" value={config.tabBarSelectedIcon} onChange={set("tabBarSelectedIcon")} tooltip="각 탭 -selected 아이콘 컬러" />
              <ImageUploadRow label="탭바 배경 이미지" tooltip="maintabBgImage.png" imgKey="tabBg" imageUploads={imageUploads} onUpload={handleImageUpload} />
              <div className="mt-3 mb-1 text-[11px] font-semibold px-1" style={{ color: "#706765" }}>
                탭 아이콘 이미지 (전체)
              </div>
              {[
                {
                  label: "친구",
                  settingKey: "tab-friends",
                  normalKey: "tabFriendsNormal",
                  selectedKey: "tabFriendsSelected",
                  normalTooltip: "-ios-friends-normal-icon-image",
                  selectedTooltip: "-ios-friends-selected-icon-image",
                },
                {
                  label: "채팅",
                  settingKey: "tab-chat",
                  normalKey: "tabChatNormal",
                  selectedKey: "tabChatSelected",
                  normalTooltip: "-ios-chats-normal-icon-image",
                  selectedTooltip: "-ios-chats-selected-icon-image",
                },
                {
                  label: "오픈채팅",
                  settingKey: "tab-openchat",
                  normalKey: "tabOpenNormal",
                  selectedKey: "tabOpenSelected",
                  normalTooltip: "-ios-openchats-normal-icon-image",
                  selectedTooltip: "-ios-openchats-selected-icon-image",
                },
                {
                  label: "쇼핑",
                  settingKey: "tab-shopping",
                  normalKey: "tabShopNormal",
                  selectedKey: "tabShopSelected",
                  normalTooltip: "-ios-shopping-normal-icon-image",
                  selectedTooltip: "-ios-shopping-selected-icon-image",
                },
                {
                  label: "더보기",
                  settingKey: "tab-more",
                  normalKey: "tabMoreNormal",
                  selectedKey: "tabMoreSelected",
                  normalTooltip: "-ios-more-normal-icon-image",
                  selectedTooltip: "-ios-more-selected-icon-image",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  data-setting-key={item.settingKey}
                  className="rounded-lg px-2 py-2 mb-2 transition-colors"
                  style={{
                    background: selectedSettingKey === item.settingKey ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.45)",
                    border: selectedSettingKey === item.settingKey ? "1px solid rgba(0,0,0,0.14)" : "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="text-[12px] font-semibold mb-1" style={{ color: "#706765" }}>{item.label}</div>
                  <ImageUploadRow
                    label={`${item.label} 탭 일반`}
                    tooltip={item.normalTooltip}
                    imgKey={item.normalKey}
                    imageUploads={imageUploads}
                    onUpload={handleImageUpload}
                  />
                  <ImageUploadRow
                    label={`${item.label} 탭 선택`}
                    tooltip={item.selectedTooltip}
                    imgKey={item.selectedKey}
                    imageUploads={imageUploads}
                    onUpload={handleImageUpload}
                  />
                </div>
              ))}
            </Accordion>

            <Accordion title="기본 프로필" badge="DefaultProfileStyle">
              <ImageUploadRow label="기본 프로필 이미지" tooltip="profileImg01.png" imgKey="defaultProfile" imageUploads={imageUploads} onUpload={handleImageUpload} />
              <ImageUploadRow label="앱 아이콘 (162×162)" tooltip="commonIcoTheme.png — 테마 목록 아이콘" imgKey="icon" imageUploads={imageUploads} onUpload={handleImageUpload} />
            </Accordion>

            {/* ══ 탭별 전용 설정 ══ */}
            {previewTab !== "passcode" && (
              <div className="text-[12px] font-bold uppercase tracking-widest mt-6 mb-3 px-2" style={{color:"#000000"}}>
                {previewTab === "friends" && "친구 탭 설정"}
                {previewTab === "chat" && "채팅 탭 설정"}
                {previewTab === "openchat" && "오픈채팅 탭 설정"}
                {previewTab === "shopping" && "쇼핑 탭 설정"}
                {previewTab === "more" && "더보기 탭 설정"}
              </div>
            )}

            {/* 친구 탭 */}
            {previewTab === "friends" && (
              <>
                <Accordion title="친구 목록" badge="FriendsStyle">
                  <ColorRow label="이름 텍스트" value={config.friendsNameText} onChange={set("friendsNameText")} tooltip="-ios-text-color (친구 이름)" />
                  <ColorRow label="상태메시지 텍스트" value={config.descText} onChange={set("descText")} tooltip="-ios-description-text-color (상태 메시지, 생일 섹션)" />
                  <ColorRow label="구분선 색" value={config.friendsBorderColor} onChange={set("friendsBorderColor")} tooltip="border-color (리스트 구분선)" />
                  <ColorRow label="선택 시 배경" value={config.friendsSelectedBg} onChange={set("friendsSelectedBg")} tooltip="-ios-selected-background-color (친구 클릭 시)" />
                </Accordion>
              </>
            )}

            {/* 채팅 탭 */}
            {previewTab === "chat" && (
              <>
                <Accordion title="채팅 목록" badge="ChatsStyle">
                  <ColorRow label="채팅방 이름" value={config.chatListNameText} onChange={set("chatListNameText")} tooltip="-ios-text-color (채팅방 이름)" />
                  <ColorRow label="마지막 메시지" value={config.chatListLastMsgText} onChange={set("chatListLastMsgText")} tooltip="-ios-paragraph-text-color (마지막 메시지)" />
                  <ColorRow label="클릭 시 이름 색" value={config.chatListHighlightText} onChange={set("chatListHighlightText")} tooltip="-ios-highlighted-text-color (채팅방 이름 클릭 시)" />
                </Accordion>
                <Accordion title="채팅방 배경" badge="ChatRoomStyle">
                  <ColorRow label="배경색" value={config.chatBg} onChange={set("chatBg")} tooltip="background-color — ChatRoomStyle" />
                  <ImageUploadRow label="배경 이미지" tooltip="chatroomBgImage.png" imgKey="chatroomBg" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
                <Accordion title="입력창" badge="InputBar">
                  <ColorRow label="인풋바 배경" value={config.inputBarBg} onChange={set("inputBarBg")} tooltip="background-color (인풋바)" />
                  <ColorRow label="보내기 버튼 배경" value={config.sendBtnBg} onChange={set("sendBtnBg")} tooltip="-ios-send-normal-background-color" />
                  <ColorRow label="보내기 아이콘 색" value={config.sendBtnIcon} onChange={set("sendBtnIcon")} tooltip="-ios-send-normal-foreground-color" />
                  <ColorRow label="메뉴(+) 아이콘 색" value={config.menuBtnColor} onChange={set("menuBtnColor")} tooltip="-ios-button-normal-foreground-color" />
                  <ColorRow label="입력 필드 배경" value={config.inputFieldBg} onChange={set("inputFieldBg")} tooltip="-ios-button-normal-background-color" />
                </Accordion>
                <Accordion title="말풍선" badge="MessageStyle">
                  <div className="text-[12px] px-1 mb-1" style={{color:"#706765"}}>보낸 메시지 (Send)</div>
                  <ColorRow label="배경색" value={config.myBubbleBg} onChange={set("myBubbleBg")} tooltip="BubbleSend01/02.png 대체색" />
                  <ColorRow label="텍스트" value={config.myBubbleText} onChange={set("myBubbleText")} tooltip="-ios-text-color (send)" />
                  <ImageUploadRow label="말풍선 이미지 1" tooltip="BubbleSend01.png" imgKey="bubbleSend1" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="말풍선 이미지 2" tooltip="BubbleSend02.png (연속)" imgKey="bubbleSend2" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <div className="text-[12px] px-1 mt-2 mb-1" style={{color:"#706765"}}>받은 메시지 (Receive)</div>
                  <ColorRow label="배경색" value={config.otherBubbleBg} onChange={set("otherBubbleBg")} tooltip="BubbleReceive01/02.png 대체색" />
                  <ColorRow label="텍스트" value={config.otherBubbleText} onChange={set("otherBubbleText")} tooltip="-ios-text-color (receive)" />
                  <ImageUploadRow label="말풍선 이미지 1" tooltip="BubbleReceive01.png" imgKey="bubbleReceive1" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="말풍선 이미지 2" tooltip="BubbleReceive02.png (연속)" imgKey="bubbleReceive2" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <div className="text-[12px] px-1 mt-2 mb-1" style={{color:"#706765"}}>공통</div>
                  <ColorRow label="안읽은 숫자 색" value={config.unreadCountColor} onChange={set("unreadCountColor")} tooltip="-ios-unread-text-color" />
                </Accordion>
              </>
            )}

            {/* 오픈채팅 탭 */}
            {previewTab === "openchat" && (
              <>
                <Accordion title="오픈채팅 스타일" badge="OpenChatStyle">
                  <ColorRow label="바디 배경색" value={config.openchatBg} onChange={set("openchatBg")} tooltip="background-color (오픈채팅 바디)" />
                  <ColorRow label="타이틀 · 본문 텍스트" value={config.openchatText} onChange={set("openchatText")} tooltip="-ios-text-color (커뮤니티 타이틀, 피드 본문)" />
                </Accordion>
              </>
            )}

            {/* 쇼핑 탭 */}
            {previewTab === "shopping" && (
              <>
                <Accordion title="쇼핑 스타일" badge="ShoppingStyle">
                  <ColorRow label="배경색" value={config.shoppingBg} onChange={set("shoppingBg")} tooltip="background-color (쇼핑 메인)" />
                  <ColorRow label="상품명 · 정보 텍스트" value={config.shoppingText} onChange={set("shoppingText")} tooltip="-ios-text-color (상품명, 정보)" />
                </Accordion>
              </>
            )}

            {/* 더보기 탭 */}
            {previewTab === "more" && (
              <>
                <Accordion title="더보기 스타일" badge="MoreStyle">
                  <ColorRow label="상단 영역 배경" value={config.moreBg} onChange={set("moreBg")} tooltip="background-color (더보기 상단)" />
                  <ColorRow label="그리드 라벨 텍스트" value={config.moreTabText} onChange={set("moreTabText")} tooltip="-ios-tab-text-color (그리드 아이콘 하단 라벨)" />
                  <ColorRow label="기본 텍스트" value={config.primaryText} onChange={set("primaryText")} tooltip="-ios-text-color (기본 텍스트)" />
                </Accordion>
                <Accordion title="알림 배너" badge="NotificationBar">
                  <ColorRow label="알림 배경" value={config.notifBannerBg} onChange={set("notifBannerBg")} tooltip="background-color — MessageNotificationBar" />
                  <ColorRow label="알림 텍스트" value={config.notifBannerText} onChange={set("notifBannerText")} tooltip="-ios-text-color (알림 배너)" />
                </Accordion>
              </>
            )}

            {/* ══ 암호 설정 — passcode 탭일 때만 표시 ══ */}
            {previewTab === "passcode" && (
              <>
                <div className="text-[12px] font-bold uppercase tracking-widest mt-6 mb-3 px-2" style={{color:"#000000"}}>암호 설정</div>

                <Accordion title="암호화면 스타일" badge="PasscodeStyle">
                  <ColorRow label="배경색" value={config.passcodeBg} onChange={set("passcodeBg")} tooltip="background-color — PasscodeStyle" />
                  <ColorRow label="안내 텍스트 색" value={config.passcodeTitleText} onChange={set("passcodeTitleText")} tooltip="-ios-text-color (비밀번호 입력 안내)" />
                  <ColorRow label="키패드 배경" value={config.passcodeKeypadBg} onChange={set("passcodeKeypadBg")} tooltip="-ios-keypad-background-color" />
                  <ColorRow label="키패드 텍스트" value={config.passcodeKeypadText} onChange={set("passcodeKeypadText")} tooltip="-ios-keypad-text-normal-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="passcodeBgImage.png" imgKey="passcodeBgImg" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>

                <Accordion title="불릿 이미지" badge="Bullet (8종)">
                  <div className="text-[12px] px-1 mb-1" style={{color:"#706765"}}>미입력 (4종)</div>
                  {["bullet1Empty","bullet2Empty","bullet3Empty","bullet4Empty"].map((k, i) => (
                    <ImageUploadRow key={k} label={`불릿 ${i+1} (미입력)`} tooltip={`-ios-bullet-${["first","second","third","fourth"][i]}-image`} imgKey={k} imageUploads={imageUploads} onUpload={handleImageUpload} />
                  ))}
                  <div className="text-[12px] px-1 mt-2 mb-1" style={{color:"#706765"}}>입력 시 (4종)</div>
                  {["bullet1Fill","bullet2Fill","bullet3Fill","bullet4Fill"].map((k, i) => (
                    <ImageUploadRow key={k} label={`불릿 ${i+1} (입력)`} tooltip={`-ios-bullet-${["first","second","third","fourth"][i]}-selected-image`} imgKey={k} imageUploads={imageUploads} onUpload={handleImageUpload} />
                  ))}
                </Accordion>
              </>
            )}

          </div>
        </aside>

        {/* ── 중앙 프리뷰 ── */}
          <main className="flex-1 flex flex-row items-start justify-center gap-4 overflow-hidden pt-2 pb-8">
          {/* 프리뷰 콘텐츠 */}
          <div className="flex flex-col items-center gap-4">
          {/* OS 토글 */}
          <div className="flex items-center border-b border-black/10">
            {(["ios", "android"] as OS[]).map((o) => (
              <button
                key={o}
                onClick={() => setOs(o)}
                className="px-6 py-2 text-[13px] font-medium transition-all relative"
                style={{
                  color: os === o ? "#1c1c1e" : "#8e8e93",
                  borderBottom: os === o ? "2px solid #1c1c1e" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {o === "ios" ? "iOS" : "Android"}
              </button>
            ))}
          </div>

          {/* 목업 */}
          <div className="transition-all duration-300 ease-out mt-2">
            {os === "ios" && previewTab === "friends" ? (
              <div className="flex items-start gap-6">
                <div>
                  <PreviewMockup disableTabNavigation />
                </div>
                <div>
                  <PreviewNewsMockup disableTabNavigation />
                </div>
              </div>
            ) : os === "ios" && previewTab === "chat" ? (
              <div className="flex items-start gap-6">
                <div>
                  <PreviewMockup disableTabNavigation />
                </div>
                <div>
                  <PreviewChatRoomMockup />
                </div>
              </div>
            ) : os === "ios" ? (
              <PreviewMockup disableTabNavigation />
            ) : previewTab === "friends" ? (
              <div className="flex items-start gap-8">
                <div className="flex flex-col items-center">
                  <AndroidMockup config={config} previewTab="friends" />
                </div>
                <div className="flex flex-col items-center">
                  <AndroidFriendsProfileMockup config={config} />
                </div>
              </div>
            ) : previewTab === "chat" ? (
              <div className="flex items-start gap-8">
                <div className="flex flex-col items-center">
                  <AndroidMockup config={config} previewTab="chat" />
                </div>
                <div className="flex flex-col items-center">
                  <AndroidChatRoomMockup config={config} />
                </div>
              </div>
            ) : (
              <AndroidMockup config={config} previewTab={previewTab} />
            )}
          </div>

          {/* 프리뷰 탭 */}
          <div className="flex items-center border-b border-black/10">
            {(["friends", "chat", "openchat", "shopping", "more"] as PreviewTab[]).map((tab) => {
              const labels: Record<PreviewTab, string> = {
                friends: "친구",
                chat: "채팅",
                openchat: "오픈채팅",
                shopping: "쇼핑",
                more: "더보기",
                passcode: "암호",
              };
              return (
                <button
                  key={tab}
                  onClick={() => { setPreviewTab(tab); }}
                  className="px-7 py-2 text-[13px] font-semibold transition-all"
                  style={{
                    color: previewTab === tab ? "#1c1c1e" : "#6b6b6b",
                    borderBottom: previewTab === tab ? "2px solid #1c1c1e" : "2px solid transparent",
                    marginBottom: "-1px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
            <div className="w-px h-4 mx-1 self-center" style={{ backgroundColor: "rgba(0,0,0,0.12)" }} />
            <button
              onClick={() => { setPreviewTab(previewTab === "passcode" ? "friends" : "passcode"); }}
              className="px-7 py-2 text-[13px] font-semibold transition-all"
              style={{
                color: previewTab === "passcode" ? "#1c1c1e" : "#6b6b6b",
                borderBottom: previewTab === "passcode" ? "2px solid #1c1c1e" : "2px solid transparent",
                marginBottom: "-1px",
                whiteSpace: "nowrap",
              }}
            >
              암호
            </button>
          </div>
          </div>{/* end 프리뷰 콘텐츠 */}

          {/* 오른쪽 버튼 패널 */}
          <div className="flex flex-row gap-2 pt-10 shrink-0 ml-16">
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
            {/* 설정 버튼 */}
            <button
              onClick={() => setRightSidebarOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95"
              style={{
                background: rightSidebarOpen ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.06)",
                color: "#3a3a3c",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              ⚙ 설정
            </button>
          </div>
        </main>

        {/* ── 우측 사이드바 ── */}
        {rightSidebarOpen && (
        <aside
          className="w-80 overflow-y-auto mac-scroll shrink-0"
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
              readOnly={true}
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


          </div>
        </aside>
        )}
      </div>
      <style jsx global>{`
        [data-active-element-id][data-active-selected="true"] {
          background: rgba(0, 0, 0, 0.05);
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
          border-radius: 10px;
        }
      `}</style>
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

