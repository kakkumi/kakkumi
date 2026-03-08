"use client";

import { useEffect, useRef, useState, startTransition, useMemo, memo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import Header from "../components/Header";
import { useAutoSave } from "./useAutoSave";

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
  themeUrl: string;
  darkMode: boolean;
  selectedBgAlpha: string;
  borderAlpha: string;
  inputBarText: string;
  moreServiceText: string;
  weatherText: string;
  weatherDescText: string;
  weatherIconColor: string;
  gameText: string;
  gameDescText: string;
  // ── 헤더 ──
  headerTabText: string;
  headerTabHighlightText: string;
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
  friendsNormalBgColor: string;
  friendsNormalBgAlpha: string;
  descHighlightText: string;
  sectionTitleTextAlpha: string;
  featurePrimaryText: string;
  // ── 채팅 탭 ──
  chatListNameText: string;
  chatListLastMsgText: string;
  chatListHighlightText: string;
  chatListLastMsgHighlightText: string;
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
  menuBtnHighlightColor: string;
  menuBtnNormalBgAlpha: string;
  inputFieldBg: string;
  myBubbleBg: string;
  myBubbleText: string;
  myBubbleSelectedText: string;
  myBubbleUnreadText: string;
  otherBubbleBg: string;
  otherBubbleText: string;
  otherBubbleSelectedText: string;
  otherBubbleUnreadText: string;
  unreadCountColor: string;
  sendBtnHighlightBg: string;
  sendBtnHighlightIcon: string;
  // ── 암호화면 ──
  passcodeBg: string;
  passcodeTitleText: string;
  passcodeKeypadBg: string;
  passcodeKeypadText: string;
  // ── 알림 배너 ──
  notifBannerBg: string;
  notifBannerNameText: string;
  notifBannerMsgText: string;
  // ── 다이렉트 쉐어 ──
  directShareBg: string;
  directShareNameText: string;
  directShareMsgText: string;
  // ── 하단 배너 ──
  notifBannerText: string;
  bottomBannerBg: string;
  bottomBannerLightBg: string;
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
  themeUrl: "http://www.kakao.com",
  darkMode: false,
  selectedBgAlpha: "1.0",
  borderAlpha: "1.0",
  inputBarText: "#8E8E93",
  moreServiceText: "#191919",
  weatherText: "#191919",
  weatherDescText: "#9E9E9E",
  weatherIconColor: "#191919",
  gameText: "#191919",
  gameDescText: "#9E9E9E",
  // 헤더
  headerTabText: "#9E9E9E",
  headerTabHighlightText: "#3A1D1D",
  // 공통 "#FFFFFF",
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
  friendsNormalBgColor: "#F5F5F5",
  friendsNormalBgAlpha: "0.0",
  descHighlightText: "#3A1D1D",
  sectionTitleTextAlpha: "1.0",
  featurePrimaryText: "#9E9E9E",
  // 채팅 탭
  chatListNameText: "#191919",
  chatListLastMsgText: "#9E9E9E",
  chatListHighlightText: "#3A1D1D",
  chatListLastMsgHighlightText: "#9E9E9E",
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
  menuBtnHighlightColor: "#6E6E73",
  menuBtnNormalBgAlpha: "0.04",
  inputFieldBg: "#F2F2F7",
  myBubbleBg: "#FEE500",
  myBubbleText: "#191919",
  myBubbleSelectedText: "#191919",
  myBubbleUnreadText: "#FF3B30",
  otherBubbleBg: "#FFFFFF",
  otherBubbleText: "#191919",
  otherBubbleSelectedText: "#191919",
  otherBubbleUnreadText: "#FF3B30",
  unreadCountColor: "#FF3B30",
  sendBtnHighlightBg: "#E6CE00",
  sendBtnHighlightIcon: "#3A1D1D",
  // 암호화면
  passcodeBg: "#F5F5F5",
  passcodeTitleText: "#191919",
  passcodeKeypadBg: "#FFFFFF",
  passcodeKeypadText: "#191919",
  // 알림 배너
  notifBannerBg: "#FFFFFF",
  notifBannerNameText: "#191919",
  notifBannerMsgText: "#9E9E9E",
  // 다이렉트 쉐어
  directShareBg: "#FFFFFF",
  directShareNameText: "#191919",
  directShareMsgText: "#9E9E9E",
  // 하단 배너
  notifBannerText: "#191919",
  bottomBannerBg: "#FFFFFF",
  bottomBannerLightBg: "#FFFFFF",
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
  disabled?: boolean;
}

const ColorRow = memo(function ColorRow({ label, value, onChange, tooltip, disabled = false }: ColorRowProps) {
  const [draftValue, setDraftValue] = useState(value ?? '#000000');
  const frameRef = useRef<number | null>(null);
  const pendingValueRef = useRef(value ?? '#000000');

  useEffect(() => {
    startTransition(() => {
      setDraftValue(value ?? '#000000');
    });
    pendingValueRef.current = value ?? '#000000';
  }, [value]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const scheduleColorCommit = (nextValue: string) => {
    pendingValueRef.current = nextValue;
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      onChange(pendingValueRef.current);
    });
  };

  const commitColorNow = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    onChange(pendingValueRef.current);
  };

  return (
    <div
      data-setting-item="true"
      className="flex items-center justify-between gap-3 py-1.5 px-2.5 group transition-all duration-200 hover:bg-gray-50 rounded-lg w-full"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-gray-500">{label}</span>
          {tooltip && (
            <div className="group/tip relative flex items-center">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <div className="absolute left-0 bottom-6 z-50 hidden group-hover/tip:block text-[11px] rounded-lg px-3 py-2 w-max max-w-[200px] leading-snug shadow-xl ring-1 ring-black/5 bg-white text-gray-800">
                {tooltip}
                <div className="absolute left-1.5 -bottom-1 w-2 h-2 bg-white rotate-45 transform border-b border-r border-gray-100"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <label className="relative cursor-pointer group/picker">
          <input
            type="color"
            value={draftValue}
            onChange={(e) => {
              const nextValue = e.target.value;
              setDraftValue(nextValue);
              scheduleColorCommit(nextValue);
            }}
            onBlur={commitColorNow}
            disabled={disabled}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
          />
          <div
            className="w-5 h-5 rounded-full shadow-sm transition-all duration-200 group-hover/picker:scale-110 ring-1 ring-black/5"
            style={{ backgroundColor: draftValue }}
          />
        </label>
        <div className="text-[11px] font-mono text-gray-400 w-[56px] text-right uppercase tracking-wide">
          {draftValue}
        </div>
      </div>
    </div>
  );
});

/* ── 이미지 업로드 행 ── */
const ImageUploadRow = memo(function ImageUploadRow({ label, tooltip, imgKey, imageUploads, onUpload, onRemove }: {
  label: string; tooltip: string; imgKey: string;
  imageUploads: Record<string, string>;
  onUpload: (key: string, file: File) => void;
  onRemove?: (key: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    onRemove?.(imgKey);
  };

  return (
    <div data-setting-item="true" className="py-1.5 px-2.5 transition-all duration-200 hover:bg-gray-50 rounded-lg w-full group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-gray-500">{label}</span>
          </div>
          <span className="text-[9px] text-gray-400 font-mono tracking-tight">{tooltip.replace('.png', '')}</span>
        </div>

        <div className="flex items-center gap-3">
          {imageUploads[imgKey] && onRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-[9px] text-red-500 hover:text-red-600 font-medium px-2 py-0.5 bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
              삭제
            </button>
          )}
          <label className="flex items-center cursor-pointer relative">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0 transition-all duration-200 bg-gray-100 border border-transparent hover:border-orange-200 hover:bg-white hover:shadow-sm">
              {imageUploads[imgKey]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={imageUploads[imgKey]} alt={label} className="w-full h-full object-cover" />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(200, 200, 200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors hover:stroke-orange-400">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(imgKey, f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
});

/* ── 섹션 패널 ── */
function Accordion({
  title,
  children,
  badge,
  settingKey,
}: {
  title: string;
  children: React.ReactNode;
  badge?: string;
  settingKey?: string;
}) {
  return (
    <div
      className="flex flex-col mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full"
      data-setting-key={settingKey}
    >
      <div className="pb-1.5 px-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-gray-800 tracking-tight leading-none">{title}</span>
        {badge && (
          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 tracking-wide">
            {badge.split('-')[0]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

/* ── 인풋 ── */
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
    <div className="flex flex-col px-2.5 py-0.5 group mb-1.5 w-full">
      <label className="text-[11px] font-medium text-gray-500 mb-0.5 transition-colors group-focus-within:text-orange-500 flex items-center justify-between">
        {label}
        {hint && <span className="text-[9px] font-mono text-gray-400 font-normal">{hint}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full bg-transparent border-b border-gray-200 py-1.5 text-[12.5px] transition-all
          ${readOnly ? "text-gray-400 cursor-default" : "text-gray-800 focus:border-orange-500 focus:bg-orange-50/10"}
          placeholder-gray-300 outline-none rounded-t-sm`}
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
          style={{ top: 84, bottom: 0, backgroundColor: config.bodyBg }}>
          <IOSMockupFriendsList config={config} />
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
              <NewsScreen config={{ bodyBg: config.bodyBg, headerBg: config.headerBg, headerText: config.headerText, primaryText: config.primaryText, descText: config.descText, tabBarBg: config.tabBarBg, tabBarIcon: config.tabBarIcon, tabBarSelectedIcon: config.tabBarSelectedIcon, friendsSelectedBg: config.friendsSelectedBg, chatBg: config.chatBg, otherBubbleBg: config.otherBubbleBg, myBubbleBg: config.myBubbleBg, inputBarBg: config.inputBarBg, sendBtnBg: config.sendBtnBg, passcodeBg: config.passcodeBg, passcodeTitleText: config.passcodeTitleText, passcodeKeypadText: config.passcodeKeypadText, unreadCountColor: config.unreadCountColor, openchatBg: config.openchatBg, mainBgImageUrl: undefined }} />
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
              <ChatRoomScreen config={{ bodyBg: config.bodyBg, headerBg: config.headerBg, headerText: config.headerText, primaryText: config.primaryText, descText: config.descText, tabBarBg: config.tabBarBg, tabBarIcon: config.tabBarIcon, tabBarSelectedIcon: config.tabBarSelectedIcon, friendsSelectedBg: config.friendsSelectedBg, chatBg: config.chatBg, otherBubbleBg: config.otherBubbleBg, myBubbleBg: config.myBubbleBg, inputBarBg: config.inputBarBg, sendBtnBg: config.sendBtnBg, passcodeBg: config.passcodeBg, passcodeTitleText: config.passcodeTitleText, passcodeKeypadText: config.passcodeKeypadText, unreadCountColor: config.unreadCountColor, openchatBg: config.openchatBg, mainBgImageUrl: undefined }} />
            </div>
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

function AndroidMockup({ config, previewTab }: { config: ThemeConfig; previewTab: PreviewTab }) {
  const screenConfig = useMemo(() => ({
    bodyBg: config.bodyBg,
    headerBg: config.headerBg,
    headerText: config.headerText,
    primaryText: config.primaryText,
    descText: config.descText,
    tabBarBg: config.tabBarBg,
    tabBarIcon: config.tabBarIcon,
    tabBarSelectedIcon: config.tabBarSelectedIcon,
    friendsSelectedBg: config.friendsSelectedBg,
    chatBg: config.chatBg,
    otherBubbleBg: config.otherBubbleBg,
    myBubbleBg: config.myBubbleBg,
    inputBarBg: config.inputBarBg,
    sendBtnBg: config.sendBtnBg,
    passcodeBg: config.passcodeBg,
    passcodeTitleText: config.passcodeTitleText,
    passcodeKeypadText: config.passcodeKeypadText,
    unreadCountColor: config.unreadCountColor,
    openchatBg: config.openchatBg,
    mainBgImageUrl: undefined,
    chatListLastMsgText: config.chatListLastMsgText,
    chatListNamePressColor: config.chatListHighlightText,
    chatListLastMsgPressColor: config.chatListLastMsgHighlightText,
    chatListSelectedBg: config.friendsSelectedBg,
    chatListSelectedBgAlpha: config.selectedBgAlpha,
  }), [
    config.bodyBg, config.headerBg, config.headerText, config.primaryText, config.descText,
    config.tabBarBg, config.tabBarIcon, config.tabBarSelectedIcon, config.friendsSelectedBg,
    config.chatBg, config.otherBubbleBg, config.myBubbleBg, config.inputBarBg, config.sendBtnBg,
    config.passcodeBg, config.passcodeTitleText, config.passcodeKeypadText,
    config.unreadCountColor, config.openchatBg, config.chatListLastMsgText,
    config.chatListHighlightText, config.chatListLastMsgHighlightText, config.selectedBgAlpha,
  ]);

  const renderScreen = () => {
    switch (previewTab) {
      case "friends": return <FriendsScreen config={screenConfig} />;
      case "chat": return <MainScreen config={screenConfig} />;
      case "openchat": return <OpenChatsScreen config={screenConfig} />;
      case "shopping": return <ShoppingScreen config={screenConfig} />;
      case "more": return <MoreScreen config={screenConfig} />;
      case "passcode": return <PasscodeScreen config={screenConfig} />;
      default: return <MainScreen config={screenConfig} />;
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
type EditorCategory =
  | "manifest"
  | "friends-tab"
  | "chat-tab"
  | "chatroom"
  | "tabbar"
  | "more-tab"
  | "passcode"
  | "notification";

const editorCategories: { key: EditorCategory; label: string }[] = [
  { key: "manifest",    label: "테마 정보" },
  { key: "friends-tab", label: "친구탭" },
  { key: "chat-tab",    label: "채팅탭" },
  { key: "chatroom",    label: "채팅방" },
  { key: "tabbar",      label: "하단 탭바" },
  { key: "more-tab",    label: "더보기탭" },
  { key: "passcode",    label: "잠금화면" },
  { key: "notification", label: "알림/배너" },
];

export default function CreatePage() {
  const searchParams = useSearchParams();
  const themeIdParam = searchParams.get("id");

  const leftAsideRef = useRef<HTMLElement | null>(null);
  const [os, setOs] = useState<OS>("ios");
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("friends");
  const [activeEditorCategory, setActiveEditorCategory] = useState<EditorCategory>("manifest");
  const [imageUploads, setImageUploads] = useState<Record<string, string>>({});

  const [selectedSettingKey, setSelectedSettingKey] = useState<string | null>(null);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const setCurrentScreen = usePreviewThemeStore((state) => state.setCurrentScreen);
  const activeElementId = usePreviewThemeStore((state) => state.activeElementId);
  const setActiveElementId = usePreviewThemeStore((state) => state.setActiveElementId);
  const setTheme = usePreviewThemeStore((state) => state.setTheme);

  // ── URL ?id= 로 저장된 테마 불러오기 ──
  const loadThemeById = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/my-themes/${id}`);
      if (!res.ok) return;
      const data = await res.json() as {
        theme: {
          id: string;
          os: string;
          configJson: Record<string, unknown> | null;
          imageData: Record<string, string> | null;
        };
      };
      const { theme } = data;

      // OS 복원
      if (theme.os === "ios" || theme.os === "android") {
        setOs(theme.os);
      }

      // configJson 복원
      if (theme.configJson) {
        setConfig((prev) => ({
          ...prev,
          ...(theme.configJson as Partial<ThemeConfig>),
        }));
      }

      // imageData(base64) 복원 → objectURL로 변환
      if (theme.imageData) {
        const restoredImages: Record<string, string> = {};
        for (const [key, base64] of Object.entries(theme.imageData)) {
          try {
            const res2 = await fetch(base64);
            const blob = await res2.blob();
            restoredImages[key] = URL.createObjectURL(blob);
          } catch {
            // 변환 실패 무시
          }
        }
        setImageUploads(restoredImages);
      }

      // localStorage에 themeId 저장 (자동저장 연속성)
      localStorage.setItem("kakkumi_draft_theme_id", id);
      setThemeLoaded(true);
    } catch {
      setThemeLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (themeIdParam) {
      void loadThemeById(themeIdParam);
    } else {
      // 새 테마 만들기: 이전 draft ID 초기화해서 새 테마로 저장되게 함
      localStorage.removeItem("kakkumi_draft_theme_id");
      localStorage.removeItem("kakkumi_draft");
      setThemeLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeIdParam]);

  // ── 자동저장 훅 ──
  const { status: autoSaveStatus, triggerDebounce, triggerImmediate, triggerImmediateAfterReset } = useAutoSave({
    config,
    os,
    imageUploads,
    initialThemeId: themeIdParam ?? null,
  });

  // TabBar 컴포넌트는 store를 참조하므로 탭바 색상만 동기화
  useEffect(() => {
    setTheme({
      global: {
        bodyBg: config.bodyBg,
        headerBg: config.headerBg,
        headerText: config.headerText,
        primaryText: config.primaryText,
        descText: config.descText,
      },
      tabBar: {
        activeIconColor: config.tabBarSelectedIcon,
        inactiveIconColor: config.tabBarIcon,
        backgroundColor: config.tabBarBg,
      },
      chatsTab: {
        filterChipBg: config.bodyBg,
        unreadBadgeBg: config.unreadCountColor,
        lastMsgColor: config.chatListLastMsgText,
        namePressColor: config.chatListHighlightText,
        lastMsgPressColor: config.chatListLastMsgHighlightText,
        selectedBg: config.friendsSelectedBg,
        selectedBgAlpha: config.selectedBgAlpha,
      },
      openChatsTab: {
        bannerBackgroundColor: config.openchatBg,
      },
      chatRoom: {
        backgroundColor: config.chatBg,
        friendBubbleBg: config.otherBubbleBg,
        myBubbleBg: config.myBubbleBg,
        inputBarBg: config.inputBarBg,
        sendButtonBg: config.sendBtnBg,
      },
      passcode: {
        backgroundColor: config.passcodeBg,
        titleColor: config.passcodeTitleText,
        keypadTextColor: config.passcodeKeypadText,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, setTheme]);

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

  const set = (key: keyof ThemeConfig) => (value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    triggerDebounce();
  };

  const handleImageUpload = (key: string, file: File) => {
    const url = URL.createObjectURL(file);
    setImageUploads((prev) => ({ ...prev, [key]: url }));
    triggerImmediate();
  };

  const handleImageRemove = (key: string) => {
    setImageUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    triggerImmediate();
  };

  const handleDownload = async () => {
    if (os === "ios") {
      // iOS: KakaoTalkTheme.css + Images/ 구조를 ZIP으로 묶어 .ktheme로 저장
      const zip = new JSZip();
      const themeName = config.name.replace(/\s/g, "_");

      // CSS 생성
      zip.file("KakaoTalkTheme.css", generateCSS(config, imageUploads));

      // 업로드된 이미지를 Images/ 폴더에 포함
      const imageFileMap: Record<string, string> = {
        mainBg: "mainBgImage@2x.png",
        tabBg: "maintabBgImage@2x.png",
        chatroomBg: "chatroomBgImage@2x.png",
        defaultProfile: "profileImg01@2x.png",
        icon: "commonIcoTheme.png",
        tabFriendsNormal: "maintabIcoFriends@2x.png",
        tabFriendsSelected: "maintabIcoFriendsSelected@2x.png",
        tabChatNormal: "maintabIcoChats@2x.png",
        tabChatSelected: "maintabIcoChatsSelected@2x.png",
        tabOpenNormal: "maintabIcoNow@2x.png",
        tabOpenSelected: "maintabIcoNowSelected@2x.png",
        tabShopNormal: "maintabIcoShopping@2x.png",
        tabShopSelected: "maintabIcoShoppingSelected@2x.png",
        tabMoreNormal: "maintabIcoMore@2x.png",
        tabMoreSelected: "maintabIcoMoreSelected@2x.png",
        bubbleSend1: "chatroomBubbleSend01@2x.png",
        bubbleSend2: "chatroomBubbleSend02@2x.png",
        bubbleReceive1: "chatroomBubbleReceive01@2x.png",
        bubbleReceive2: "chatroomBubbleReceive02@2x.png",
        passcodeBgImg: "passcodeBgImage@2x.png",
        bullet1Empty: "passcodeImgCode01@2x.png",
        bullet2Empty: "passcodeImgCode02@2x.png",
        bullet3Empty: "passcodeImgCode03@2x.png",
        bullet4Empty: "passcodeImgCode04@2x.png",
        bullet1Fill: "passcodeImgCode01Selected@2x.png",
        bullet2Fill: "passcodeImgCode02Selected@2x.png",
        bullet3Fill: "passcodeImgCode03Selected@2x.png",
        bullet4Fill: "passcodeImgCode04Selected@2x.png",
      };

      const imgPromises = Object.entries(imageFileMap)
        .filter(([key]) => imageUploads[key])
        .map(async ([key, filename]) => {
          try {
            const res = await fetch(imageUploads[key]);
            const blob = await res.blob();
            zip.file(`Images/${filename}`, blob);
          } catch { /* skip */ }
        });

      await Promise.all(imgPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `${themeName}.ktheme`;
      a.click();
    } else {
      // Android: 테마 구조를 ZIP으로 다운로드
      const zip = new JSZip();
      const themeName = config.name.replace(/\s/g, "_");

      // colors.xml 생성
      const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <color name="tab_bar_background">${config.tabBarBg}</color>
  <color name="tab_icon_normal">${config.tabBarIcon}</color>
  <color name="tab_icon_selected">${config.tabBarSelectedIcon}</color>
  <color name="header_background">${config.headerBg}</color>
  <color name="header_text">${config.headerText}</color>
  <color name="body_background">${config.bodyBg}</color>
  <color name="primary_text">${config.primaryText}</color>
  <color name="desc_text">${config.descText}</color>
  <color name="chat_background">${config.chatBg}</color>
  <color name="input_bar_background">${config.inputBarBg}</color>
  <color name="send_button_background">${config.sendBtnBg}</color>
  <color name="send_button_icon">${config.sendBtnIcon}</color>
  <color name="my_bubble_background">${config.myBubbleBg}</color>
  <color name="my_bubble_text">${config.myBubbleText}</color>
  <color name="other_bubble_background">${config.otherBubbleBg}</color>
  <color name="other_bubble_text">${config.otherBubbleText}</color>
  <color name="unread_count">${config.unreadCountColor}</color>
  <color name="passcode_background">${config.passcodeBg}</color>
  <color name="passcode_title_text">${config.passcodeTitleText}</color>
  <color name="passcode_keypad_background">${config.passcodeKeypadBg}</color>
  <color name="passcode_keypad_text">${config.passcodeKeypadText}</color>
</resources>`;

      const themeXml = `<?xml version="1.0" encoding="utf-8"?>
<theme>
  <name>${config.name}</name>
  <version>${config.version}</version>
  <namespace>${config.namespace}</namespace>
  <compileSdk>${config.compileSdk}</compileSdk>
  <targetSdk>${config.targetSdk}</targetSdk>
  <author>${config.authorName}</author>
  <style>${config.darkMode ? "dark" : "light"}</style>
</theme>`;

      const readmeTxt = `카카오톡 Android 테마 패키지
===========================
테마 이름: ${config.name}
버전: ${config.version}
제작자: ${config.authorName}
패키지: ${config.namespace}

폴더 구조:
  res/values/colors.xml  - 색상 정의
  res/drawable-xhdpi/    - 이미지 리소스 (xhdpi 기준)
  theme.xml              - 테마 메타데이터

적용 방법:
1. 이 ZIP 파일의 내용을 Android 테마 프로젝트에 복사하세요.
2. res/drawable-xhdpi/ 폴더에 이미지를 추가하세요.
3. 빌드 후 .apk 파일로 배포하세요.

권장 이미지 규격: xhdpi 기준 제작
`;

      zip.file("theme.xml", themeXml);
      zip.file("res/values/colors.xml", colorsXml);
      zip.file("README.txt", readmeTxt);
      zip.file("res/drawable-xhdpi/.gitkeep", "");

      const imageKeyMap: Record<string, string> = {
        mainBg: "res/drawable-xhdpi/mainBgImage.png",
        tabBg: "res/drawable-xhdpi/maintabBgImage.png",
        chatroomBg: "res/drawable-xhdpi/chatroomBgImage.png",
        defaultProfile: "res/drawable-xhdpi/profileImg01.png",
        icon: "res/drawable-xhdpi/commonIcoTheme.png",
        bubbleSend1: "res/drawable-xhdpi/BubbleSend01.png",
        bubbleSend2: "res/drawable-xhdpi/BubbleSend02.png",
        bubbleReceive1: "res/drawable-xhdpi/BubbleReceive01.png",
        bubbleReceive2: "res/drawable-xhdpi/BubbleReceive02.png",
        passcodeBgImg: "res/drawable-xhdpi/passcodeBgImage.png",
      };

      const imagePromises = Object.entries(imageKeyMap)
        .filter(([key]) => imageUploads[key])
        .map(async ([key, zipPath]) => {
          const res = await fetch(imageUploads[key]);
          const blob = await res.blob();
          zip.file(zipPath, blob);
        });

      await Promise.all(imagePromises);

      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `${themeName}_android.zip`;
      a.click();
    }
  };

  if (!themeLoaded) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgb(74,123,247)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <span className="text-[13px]" style={{ color: "#8e8e93" }}>테마 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

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
        if (activeElementId !== null) { setActiveElementId(null); }
        const currentSelected = document.querySelectorAll('[data-active-element-id][data-active-selected="true"]');
        currentSelected.forEach((item) => item.removeAttribute("data-active-selected"));
        setSelectedSettingKey(null);
      }}
      style={{ backgroundColor: "#f3f3f3" }}
    >
      {/* ── 공통 헤더 ── */}
      <Header />

      {/* ── 서브 툴바 ── */}
      <div
        className="flex items-center justify-between px-6 shrink-0"
        style={{
          height: 48,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {/* 왼쪽: 테마명 */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-semibold" style={{ color: "#1c1c1e" }}>{config.name}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(0,0,0,0.05)", color: "#8e8e93" }}>v{config.version}</span>
        </div>

        {/* 가운데: 탭 프리뷰 선택 */}
        <div className="flex items-center gap-0.5 rounded-full px-1 py-1" style={{ background: "rgba(0,0,0,0.05)" }}>
          {(["friends","chat","openchat","shopping","more"] as PreviewTab[]).map((tab) => {
            const labels: Record<PreviewTab, string> = { friends:"친구", chat:"채팅", openchat:"지금", shopping:"쇼핑", more:"더보기", passcode:"암호" };
            return (
              <button key={tab} onClick={() => setPreviewTab(tab)}
                className="px-3.5 py-1 text-[12px] font-semibold transition-all rounded-full"
                style={{
                  color: previewTab === tab ? "#fff" : "#6b6b6b",
                  background: previewTab === tab ? "rgb(255,149,0)" : "transparent",
                  boxShadow: previewTab === tab ? "0 1px 6px rgba(255,149,0,0.35)" : "none",
                  whiteSpace: "nowrap",
                }}
              >{labels[tab]}</button>
            );
          })}
          <div className="w-px h-3.5 mx-0.5 self-center" style={{ background: "rgba(0,0,0,0.1)" }} />
          <button onClick={() => setPreviewTab(previewTab === "passcode" ? "friends" : "passcode")}
            className="px-3.5 py-1 text-[12px] font-semibold transition-all rounded-full"
            style={{
              color: previewTab === "passcode" ? "#fff" : "#6b6b6b",
              background: previewTab === "passcode" ? "rgb(255,149,0)" : "transparent",
              boxShadow: previewTab === "passcode" ? "0 1px 6px rgba(255,149,0,0.35)" : "none",
              whiteSpace: "nowrap",
            }}
          >암호</button>
        </div>

        {/* 오른쪽: OS + 버튼들 */}
        <div className="flex items-center gap-3">
          {/* OS 토글 */}
          <div className="flex items-center rounded-full p-0.5" style={{ background: "rgba(0,0,0,0.07)" }}>
            {(["ios","android"] as OS[]).map((o) => (
              <button key={o} onClick={() => setOs(o)}
                className="px-4 py-1 text-[12px] font-semibold transition-all rounded-full"
                style={{
                  color: os === o ? "#fff" : "#8e8e93",
                  background: os === o ? "rgb(74,123,247)" : "transparent",
                  boxShadow: os === o ? "0 1px 4px rgba(74,123,247,0.35)" : "none",
                }}
              >{o === "ios" ? "iOS" : "Android"}</button>
            ))}
          </div>

          {/* 초기화 버튼 */}
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:opacity-80"
            style={{ background: "rgba(255,59,48,0.08)", color: "rgb(255,59,48)", border: "1px solid rgba(255,59,48,0.15)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            초기화
          </button>

          {/* 자동저장 상태 표시 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
            style={{
              background: autoSaveStatus === "saved" ? "rgba(52,199,89,0.1)"
                : autoSaveStatus === "saving" ? "rgba(74,123,247,0.08)"
                : autoSaveStatus === "offline" ? "rgba(255,59,48,0.08)"
                : "rgba(0,0,0,0.04)",
              color: autoSaveStatus === "saved" ? "rgb(52,199,89)"
                : autoSaveStatus === "saving" ? "rgb(74,123,247)"
                : autoSaveStatus === "offline" ? "rgb(255,59,48)"
                : "#8e8e93",
              border: `1px solid ${autoSaveStatus === "saved" ? "rgba(52,199,89,0.2)"
                : autoSaveStatus === "saving" ? "rgba(74,123,247,0.15)"
                : autoSaveStatus === "offline" ? "rgba(255,59,48,0.2)"
                : "transparent"}`,
              minWidth: 140,
              justifyContent: "center",
            }}
          >
            {autoSaveStatus === "saving" && (
              <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
            )}
            {autoSaveStatus === "saved" && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            )}
            {autoSaveStatus === "offline" && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
              </svg>
            )}
            {autoSaveStatus === "saving" ? "저장 중..."
              : autoSaveStatus === "saved" ? "모든 변경 사항 저장됨"
              : autoSaveStatus === "offline" ? "오프라인 상태입니다"
              : "자동 저장 대기 중"}
          </div>

          {/* 다운로드 버튼 */}
          <button onClick={() => void handleDownload()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all active:scale-95"
            style={{
              background: "rgb(255,149,0)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(255,149,0,0.35)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M2 12h12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {os === "ios" ? ".ktheme 저장" : ".zip 저장"}
          </button>
        </div>
      </div>

      {/* ── 오프라인 배너 ── */}
      {autoSaveStatus === "offline" && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 text-[12px] font-medium shrink-0"
          style={{ background: "rgba(255,59,48,0.08)", borderBottom: "1px solid rgba(255,59,48,0.15)", color: "rgb(255,59,48)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
          </svg>
          오프라인 상태입니다. 연결 시 자동 저장됩니다.
        </div>
      )}

      {/* ── 바디 ── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 96px)" }}>

        {/* ── 좌측 카테고리 패널 ── */}
        <aside
          className="shrink-0 flex flex-col bg-white"
          style={{
            width: 168,
            minWidth: 168,
            borderRight: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="pt-5 pb-3 px-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">편집 메뉴</p>
          </div>
          <div className="flex flex-col px-2 gap-0.5 overflow-y-auto flex-1">
            {editorCategories.map((category, idx) => {
              const isActive = activeEditorCategory === category.key;
              const separatorBefore = idx === 5; // 더보기탭 앞 구분선
              return (
                <div key={category.key}>
                  {separatorBefore && (
                    <div className="mx-3 my-2 h-px bg-gray-100" />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveEditorCategory(category.key)}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12.5px] transition-all duration-150 flex items-center gap-2"
                    style={{
                      color: isActive ? "rgb(255, 149, 0)" : "#6b6b6b",
                      backgroundColor: isActive ? "rgba(255, 149, 0, 0.07)" : "transparent",
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {isActive && (
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "rgb(255, 149, 0)" }}
                      />
                    )}
                    <span className={isActive ? "" : "pl-[9px]"}>{category.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── 중앙 프리뷰 ── */}
        <main className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="transition-all duration-300 ease-out">
            {os === "ios" && previewTab === "friends" ? (
              <div className="flex items-start gap-8">
                <PreviewMockup disableTabNavigation mainBgImageUrl={imageUploads.mainBg} />
                <PreviewNewsMockup disableTabNavigation mainBgImageUrl={imageUploads.mainBg} />
              </div>
            ) : os === "ios" && previewTab === "chat" ? (
              <div className="flex items-start gap-8">
                <PreviewMockup disableTabNavigation mainBgImageUrl={imageUploads.mainBg} />
                <PreviewChatRoomMockup />
              </div>
            ) : os === "ios" ? (
              <PreviewMockup disableTabNavigation mainBgImageUrl={imageUploads.mainBg} />
            ) : previewTab === "friends" ? (
              <div className="flex items-start gap-8">
                <AndroidMockup config={config} previewTab="friends" />
                <AndroidFriendsProfileMockup config={config} />
              </div>
            ) : previewTab === "chat" ? (
              <div className="flex items-start gap-8">
                <AndroidMockup config={config} previewTab="chat" />
                <AndroidChatRoomMockup config={config} />
              </div>
            ) : (
              <AndroidMockup config={config} previewTab={previewTab} />
            )}
          </div>
        </main>

        {/* ── 우측 설정 패널 ── */}
        <aside
          ref={leftAsideRef}
          className="overflow-y-auto shrink-0 bg-[#fcfcfc]"
          style={{
            width: 300,
            minWidth: 300,
            maxWidth: 300,
            borderLeft: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.02)"
          }}
        >
          <div className="px-4 py-5 pb-20">
            {activeEditorCategory === "manifest" && (
              <>
                <Accordion title="테마 정보" badge="ManifestStyle">
                  <MacInput label="이름" hint="(-kakaotalk-theme-name)" value={config.name} onChange={set("name")} />
                  <MacInput label="아이디" hint="(-kakaotalk-theme-id)" value={config.packageId} onChange={set("packageId")} />
                  <MacInput label="버전" hint="(-kakaotalk-theme-version)" value={config.version} onChange={set("version")} readOnly={true} />
                  <MacInput label="제작자" hint="(-kakaotalk-author-name)" value={config.authorName} onChange={set("authorName")} />
                  <MacInput label="참조 URL" hint="(-kakaotalk-theme-url)" value={config.themeUrl} onChange={set("themeUrl")} />
                </Accordion>
                <Accordion title="시스템 스타일" badge="ManifestStyle">
                  <div className="flex items-center justify-between py-2.5 px-2.5">
                    <div>
                      <div className="text-[12.5px] font-semibold text-gray-800">다크 모드 지원</div>
                      <div className="text-[10px] mt-0.5 font-mono text-gray-400">-kakaotalk-theme-style: &apos;dark&apos;</div>
                    </div>
                    <button
                      onClick={() => set("darkMode")(!config.darkMode)}
                      className="w-[36px] h-[20px] rounded-full relative transition-all duration-200 shrink-0"
                      style={{
                        backgroundColor: config.darkMode ? "#34c759" : "rgba(0,0,0,0.15)",
                        boxShadow: config.darkMode ? "0 0 0 1px rgba(52,199,89,0.4)" : "0 0 0 1px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white shadow-md transition-all duration-200" style={{ left: config.darkMode ? "18px" : "2px" }} />
                    </button>
                  </div>
                </Accordion>
                <Accordion title="아이콘 이미지" badge="ManifestStyle">
                  <ImageUploadRow label="앱 테마 리스트 이미지" tooltip="commonIcoTheme.png (162×162)" imgKey="icon" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
                {os === "android" && (
                  <Accordion title="Android 빌드 설정" badge="ManifestStyle">
                    <MacInput label="namespace" hint="(build.gradle)" value={config.namespace} onChange={set("namespace")} />
                    <div className="flex gap-2 mt-3">
                      <MacInput label="compileSdk" value={config.compileSdk} onChange={set("compileSdk")} type="number" />
                      <MacInput label="targetSdk" value={config.targetSdk} onChange={set("targetSdk")} type="number" />
                    </div>
                  </Accordion>
                )}
              </>
            )}

            {activeEditorCategory === "friends-tab" && (
              <>
                <Accordion title="배경" badge="MainViewStyle">
                  <ColorRow label="배경색" value={config.bodyBg} onChange={set("bodyBg")} tooltip="background-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="mainBgImage.png" imgKey="mainBg" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                </Accordion>
                <Accordion title="헤더" badge="HeaderStyle-Main">
                  <ColorRow label="탭 텍스트" value={config.headerTabText} onChange={set("headerTabText")} tooltip="-ios-tab-text-color" />
                  <ColorRow label="탭 선택 텍스트" value={config.headerTabHighlightText} onChange={set("headerTabHighlightText")} tooltip="-ios-tab-highlighted-text-color" />
                </Accordion>
                <Accordion title="목록 텍스트" badge="MainViewStyle">
                  <ColorRow label="이름 / 아이콘" value={config.primaryText} onChange={(v) => { set("primaryText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-text-color" />
                  <ColorRow label="이름 프레스" value={config.chatListHighlightText} onChange={(v) => { set("chatListHighlightText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-highlighted-text-color" />
                  <ColorRow label="상태메시지" value={config.descText} onChange={(v) => { set("descText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-description-text-color" />
                  <ColorRow label="상태메시지 프레스" value={config.descHighlightText} onChange={(v) => { set("descHighlightText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-description-highlighted-text-color" />
                </Accordion>
                <Accordion title="목록 셀 배경" badge="MainViewStyle">
                  <ColorRow label="셀 배경색" value={config.friendsNormalBgColor} onChange={(v) => { set("friendsNormalBgColor")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-normal-background-color" />
                  <MacInput label="셀 배경 투명도" hint="(-ios-normal-background-alpha)" value={config.friendsNormalBgAlpha} onChange={set("friendsNormalBgAlpha")} />
                  <ColorRow label="선택 배경" value={config.friendsSelectedBg} onChange={(v) => { set("friendsSelectedBg")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-selected-background-color" />
                  <MacInput label="선택 배경 투명도" hint="(-ios-selected-background-alpha)" value={config.selectedBgAlpha} onChange={set("selectedBgAlpha")} />
                </Accordion>
                <Accordion title="섹션 / 보더" badge="SectionTitleStyle-Main">
                  <ColorRow label="섹션 타이틀" value={config.descText} onChange={(v) => { set("descText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-text-color" />
                  <MacInput label="섹션 타이틀 투명도" hint="(-ios-text-alpha)" value={config.sectionTitleTextAlpha} onChange={set("sectionTitleTextAlpha")} />
                  <ColorRow label="보더 컬러" value={config.friendsBorderColor} onChange={(v) => { set("friendsBorderColor")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="border-color" />
                  <MacInput label="보더 투명도" hint="(border-alpha)" value={config.borderAlpha} onChange={set("borderAlpha")} />
                </Accordion>
                <Accordion title="기능 버튼" badge="FeatureStyle-Primary / ButtonStyle-AddFriend">
                  <ColorRow label="기능 텍스트 컬러" value={config.featurePrimaryText} onChange={(v) => { set("featurePrimaryText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-text-color (FeatureStyle-Primary)" />
                  <ImageUploadRow label="친구추가 버튼 이미지" tooltip="findBtnAddFriend.png" imgKey="btnAddFriend" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "chat-tab" && (
              <>
                <Accordion title="배경" badge="MainViewStyle">
                  <ColorRow label="배경색" value={config.bodyBg} onChange={set("bodyBg")} tooltip="background-color" />
                </Accordion>
                <Accordion title="목록 텍스트" badge="MainViewStyle">
                  <ColorRow label="이름 / 아이콘" value={config.primaryText} onChange={(v) => { set("primaryText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-text-color" />
                  <ColorRow label="이름 프레스" value={config.chatListHighlightText} onChange={(v) => { set("chatListHighlightText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-highlighted-text-color" />
                  <ColorRow label="마지막 메시지" value={config.chatListLastMsgText} onChange={(v) => { set("chatListLastMsgText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-paragraph-text-color" />
                  <ColorRow label="마지막 메시지 프레스" value={config.chatListLastMsgHighlightText} onChange={(v) => { set("chatListLastMsgHighlightText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-paragraph-highlighted-text-color" />
                </Accordion>
                <Accordion title="목록 셀 배경" badge="MainViewStyle">
                  <ColorRow label="선택 배경" value={config.friendsSelectedBg} onChange={(v) => { set("friendsSelectedBg")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-selected-background-color" />
                  <MacInput label="선택 배경 투명도" hint="(-ios-selected-background-alpha)" value={config.selectedBgAlpha} onChange={set("selectedBgAlpha")} />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "chatroom" && (
              <>
                <Accordion title="채팅방 배경" badge="BackgroundStyle-ChatRoom">
                  <ColorRow label="배경 컬러" value={config.chatBg} onChange={set("chatBg")} tooltip="background-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="chatroomBgImage.png" imgKey="chatroomBg" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
                <Accordion title="인풋바" badge="InputBarStyle-Chat">
                  <ColorRow label="배경 컬러" value={config.inputBarBg} onChange={set("inputBarBg")} tooltip="background-color" />
                  <ColorRow label="텍스트 컬러" value={config.inputBarText} onChange={set("inputBarText")} tooltip="-ios-button-text-color" />
                </Accordion>
                <Accordion title="메뉴 버튼" badge="InputBarStyle-Chat">
                  <ColorRow label="아이콘 컬러" value={config.menuBtnColor} onChange={set("menuBtnColor")} tooltip="-ios-button-normal-foreground-color" />
                  <ColorRow label="프레스 컬러" value={config.menuBtnHighlightColor} onChange={set("menuBtnHighlightColor")} tooltip="-ios-button-highlighted-foreground-color" />
                  <ColorRow label="배경 컬러" value={config.inputFieldBg} onChange={set("inputFieldBg")} tooltip="-ios-button-normal-background-color" />
                  <MacInput label="배경 투명도" hint="(-ios-button-normal-background-alpha)" value={config.menuBtnNormalBgAlpha} onChange={set("menuBtnNormalBgAlpha")} />
                </Accordion>
                <Accordion title="전송 버튼" badge="InputBarStyle-Chat">
                  <ColorRow label="기본 배경" value={config.sendBtnBg} onChange={set("sendBtnBg")} tooltip="-ios-send-normal-background-color" />
                  <ColorRow label="프레스 배경" value={config.sendBtnHighlightBg} onChange={set("sendBtnHighlightBg")} tooltip="-ios-send-highlighted-background-color" />
                  <ColorRow label="기본 아이콘" value={config.sendBtnIcon} onChange={set("sendBtnIcon")} tooltip="-ios-send-normal-foreground-color" />
                  <ColorRow label="프레스 아이콘" value={config.sendBtnHighlightIcon} onChange={set("sendBtnHighlightIcon")} tooltip="-ios-send-highlighted-foreground-color" />
                </Accordion>
                <Accordion title="보낸 메시지" badge="MessageCellStyle-Send">
                  <ImageUploadRow label="첫 번째 배경 이미지" tooltip="chatroomBubbleSend01.png" imgKey="bubbleSend1" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="첫 번째 선택 이미지" tooltip="chatroomBubbleSend01Selected.png" imgKey="bubbleSend1Selected" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="연속 배경 이미지" tooltip="chatroomBubbleSend02.png" imgKey="bubbleSend2" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="연속 선택 이미지" tooltip="chatroomBubbleSend02Selected.png" imgKey="bubbleSend2Selected" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ColorRow label="텍스트" value={config.myBubbleText} onChange={set("myBubbleText")} tooltip="-ios-text-color" />
                  <ColorRow label="선택 텍스트" value={config.myBubbleSelectedText} onChange={set("myBubbleSelectedText")} tooltip="-ios-selected-text-color" />
                  <ColorRow label="안읽음 텍스트" value={config.myBubbleUnreadText} onChange={set("myBubbleUnreadText")} tooltip="-ios-unread-text-color" />
                  <MacInput label="첫 메시지 인셋" hint="-ios-title-edgeinsets" value="10px 11px 7px 17px" onChange={() => {}} readOnly={true} />
                  <MacInput label="연속 메시지 인셋" hint="-ios-group-title-edgeinsets" value="10px 11px 7px 17px" onChange={() => {}} readOnly={true} />
                </Accordion>
                <Accordion title="받은 메시지" badge="MessageCellStyle-Receive">
                  <ImageUploadRow label="첫 번째 배경 이미지" tooltip="chatroomBubbleReceive01.png" imgKey="bubbleReceive1" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="첫 번째 선택 이미지" tooltip="chatroomBubbleReceive01Selected.png" imgKey="bubbleReceive1Selected" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="연속 배경 이미지" tooltip="chatroomBubbleReceive02.png" imgKey="bubbleReceive2" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ImageUploadRow label="연속 선택 이미지" tooltip="chatroomBubbleReceive02Selected.png" imgKey="bubbleReceive2Selected" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ColorRow label="텍스트" value={config.otherBubbleText} onChange={set("otherBubbleText")} tooltip="-ios-text-color" />
                  <ColorRow label="선택 텍스트" value={config.otherBubbleSelectedText} onChange={set("otherBubbleSelectedText")} tooltip="-ios-selected-text-color" />
                  <ColorRow label="안읽음 텍스트" value={config.otherBubbleUnreadText} onChange={set("otherBubbleUnreadText")} tooltip="-ios-unread-text-color" />
                  <MacInput label="첫 메시지 인셋" hint="-ios-title-edgeinsets" value="10px 17px 7px 11px" onChange={() => {}} readOnly={true} />
                  <MacInput label="연속 메시지 인셋" hint="-ios-group-title-edgeinsets" value="10px 17px 7px 11px" onChange={() => {}} readOnly={true} />
                </Accordion>
                <Accordion title="공통" badge="MessageCellStyle">
                  <ColorRow label="안읽은 숫자 컬러" value={config.unreadCountColor} onChange={set("unreadCountColor")} tooltip="-ios-unread-text-color" />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "tabbar" && (
              <>
                <Accordion title="탭바 배경" badge="TabbarStyle">
                  <ColorRow label="배경 컬러" value={config.tabBarBg} onChange={set("tabBarBg")} tooltip="background-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="maintabBgImage.png" imgKey="tabBg" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ColorRow label="숏폼 배경 컬러" value={config.tabBarBg} onChange={set("tabBarBg")} tooltip="숏폼 전용 background-color" />
                </Accordion>
                <Accordion title="탭 아이콘" badge="TabbarStyle">
                  <ColorRow label="일반 아이콘 컬러" value={config.tabBarIcon} onChange={set("tabBarIcon")} tooltip="일반 아이콘 컬러" />
                  <ColorRow label="선택 아이콘 컬러" value={config.tabBarSelectedIcon} onChange={set("tabBarSelectedIcon")} tooltip="선택 아이콘 컬러" />
                  {[
                    { label: "친구", settingKey: "tab-friends", normalKey: "tabFriendsNormal", selectedKey: "tabFriendsSelected", normalTooltip: "maintablcoFriends.png", selectedTooltip: "maintablcoFriendsSelected.png" },
                    { label: "채팅", settingKey: "tab-chat", normalKey: "tabChatNormal", selectedKey: "tabChatSelected", normalTooltip: "maintablcoChats.png", selectedTooltip: "maintabicoChatsSelected.png" },
                    { label: "지금", settingKey: "tab-openchat", normalKey: "tabOpenNormal", selectedKey: "tabOpenSelected", normalTooltip: "maintabicoNow.png", selectedTooltip: "maintablcoNowSelected.png" },
                    { label: "쇼핑", settingKey: "tab-shopping", normalKey: "tabShopNormal", selectedKey: "tabShopSelected", normalTooltip: "maintabicoShopping.png", selectedTooltip: "maintabicoShoppingSelected.png" },
                    { label: "더보기", settingKey: "tab-more", normalKey: "tabMoreNormal", selectedKey: "tabMoreSelected", normalTooltip: "maintablcoMore.png", selectedTooltip: "maintablcoMoreSelected.png" },
                  ].map((item) => (
                    <div key={item.label} data-setting-key={item.settingKey} className="rounded-xl px-2 py-2 mb-1.5 transition-colors" style={{ background: selectedSettingKey === item.settingKey ? "rgba(74,123,247,0.07)" : "transparent", borderLeft: selectedSettingKey === item.settingKey ? "2px solid rgba(74,123,247,0.5)" : "2px solid transparent" }}>
                      <div className="text-[11px] font-semibold mb-1 px-1" style={{ color: selectedSettingKey === item.settingKey ? "rgb(74,123,247)" : "#6e6e73" }}>{item.label}</div>
                      <ImageUploadRow label={`${item.label} 일반`} tooltip={item.normalTooltip} imgKey={item.normalKey} imageUploads={imageUploads} onUpload={handleImageUpload} />
                      <ImageUploadRow label={`${item.label} 선택`} tooltip={item.selectedTooltip} imgKey={item.selectedKey} imageUploads={imageUploads} onUpload={handleImageUpload} />
                    </div>
                  ))}
                </Accordion>
              </>
            )}

            {activeEditorCategory === "more-tab" && (
              <>
                <Accordion title="더보기 / 그리드" badge="FeatureStyle">
                  <ColorRow label="상단 탭 텍스트" value={config.moreTabText} onChange={set("moreTabText")} tooltip="-ios-tab-text-color" />
                  <ColorRow label="서비스 버튼 컬러" value={config.moreServiceText} onChange={set("moreServiceText")} tooltip="-ios-text-color" />
                </Accordion>
                <Accordion title="날씨" badge="FeatureStyle">
                  <ColorRow label="위치 / 온도 텍스트" value={config.weatherText} onChange={set("weatherText")} tooltip="-ios-text-color" />
                  <ColorRow label="미세먼지 텍스트" value={config.weatherDescText} onChange={set("weatherDescText")} tooltip="-ios-description-text-color" />
                  <ColorRow label="GPS 아이콘 / 보더" value={config.weatherIconColor} onChange={set("weatherIconColor")} tooltip="-ios-text-color" />
                </Accordion>
                <Accordion title="게임" badge="FeatureStyle">
                  <ColorRow label="타이틀 / 공지 텍스트" value={config.gameText} onChange={set("gameText")} tooltip="-ios-text-color" />
                  <ColorRow label="부가정보 텍스트" value={config.gameDescText} onChange={set("gameDescText")} tooltip="-ios-description-text-color" />
                  <ColorRow label="보더 컬러" value={config.friendsBorderColor} onChange={set("friendsBorderColor")} tooltip="border-color" />
                  <MacInput label="보더 알파" hint="border-alpha" value={config.borderAlpha} onChange={set("borderAlpha")} />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "passcode" && (
              <>
                <Accordion title="잠금화면" badge="PasscodeStyle">
                  <ColorRow label="배경색" value={config.passcodeBg} onChange={set("passcodeBg")} tooltip="background-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="passcodeBgImage.png" imgKey="passcodeBgImg" imageUploads={imageUploads} onUpload={handleImageUpload} />
                  <ColorRow label="타이틀 컬러" value={config.passcodeTitleText} onChange={set("passcodeTitleText")} tooltip="-ios-text-color" />
                </Accordion>
                <Accordion title="불릿 이미지" badge="PasscodeStyle">
                  <div className="text-[11px] px-1 mb-1 font-semibold" style={{color:"#6e6e73"}}>일반</div>
                  {["bullet1Empty","bullet2Empty","bullet3Empty","bullet4Empty"].map((k, i) => (
                    <ImageUploadRow key={k} label={`불릿 ${i+1}`} tooltip={`passcodeImgCode0${i+1}.png`} imgKey={k} imageUploads={imageUploads} onUpload={handleImageUpload} />
                  ))}
                  <div className="text-[11px] px-1 mt-3 mb-1 font-semibold" style={{color:"#6e6e73"}}>선택</div>
                  {["bullet1Fill","bullet2Fill","bullet3Fill","bullet4Fill"].map((k, i) => (
                    <ImageUploadRow key={k} label={`선택 불릿 ${i+1}`} tooltip={`passcodeImgCode0${i+1}Selected.png`} imgKey={k} imageUploads={imageUploads} onUpload={handleImageUpload} />
                  ))}
                </Accordion>
                <Accordion title="키패드" badge="PasscodeStyle">
                  <ColorRow label="배경색" value={config.passcodeKeypadBg} onChange={set("passcodeKeypadBg")} tooltip="-ios-keypad-background-color" />
                  <ColorRow label="숫자 컬러" value={config.passcodeKeypadText} onChange={set("passcodeKeypadText")} tooltip="-ios-keypad-text-normal-color" />
                  <ImageUploadRow label="프레스 이미지" tooltip="passcodeKeypadPressed.png" imgKey="passcodeKeypadPressed" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "notification" && (
              <>
                <Accordion title="기본 프로필" badge="DefaultProfileStyle">
                  <ImageUploadRow label="기본 프로필 이미지" tooltip="profileImg01.png" imgKey="defaultProfile" imageUploads={imageUploads} onUpload={handleImageUpload} />
                </Accordion>
                <Accordion title="알림 배너" badge="BackgroundStyle-MessageNotificationBar">
                  <ColorRow label="배경색" value={config.notifBannerBg} onChange={set("notifBannerBg")} tooltip="background-color" />
                  <ColorRow label="이름 컬러" value={config.notifBannerNameText} onChange={set("notifBannerNameText")} tooltip="-ios-text-color (LabelStyle-MessageNotificationBarName)" />
                  <ColorRow label="메시지 컬러" value={config.notifBannerMsgText} onChange={set("notifBannerMsgText")} tooltip="-ios-text-color (LabelStyle-MessageNotificationBarMessage)" />
                </Accordion>
                <Accordion title="다이렉트 쉐어" badge="BackgroundStyle-DirectShareBar">
                  <ColorRow label="배경색" value={config.directShareBg} onChange={set("directShareBg")} tooltip="background-color" />
                  <ColorRow label="이름 컬러" value={config.directShareNameText} onChange={set("directShareNameText")} tooltip="-ios-text-color (LabelStyle-DirectShareBarName)" />
                  <ColorRow label="메시지 컬러" value={config.directShareMsgText} onChange={set("directShareMsgText")} tooltip="-ios-text-color (LabelStyle-DirectShareBarMessage)" />
                </Accordion>
                <Accordion title="하단 배너" badge="BottomBannerStyle">
                  <ColorRow label="배경 컬러 (다크)" value={config.bottomBannerBg} onChange={set("bottomBannerBg")} tooltip="background-color (BottomBannerStyle)" />
                  <ColorRow label="배경 컬러 (라이트)" value={config.bottomBannerLightBg} onChange={set("bottomBannerLightBg")} tooltip="background-color (BottomBannerStyle-Light)" />
                </Accordion>
              </>
            )}
          </div>
        </aside>
      </div>

      <style jsx global>{`
        [data-active-element-id][data-active-selected="true"] {
          background: rgba(74, 123, 247, 0.08);
          box-shadow: inset 0 0 0 1.5px rgba(74, 123, 247, 0.35);
          border-radius: 10px;
        }
      `}</style>

      {resetConfirm && (
        <div
          className="fixed z-50"
          style={{ top: 106, right: 24 }}
          >
          <div className="rounded-2xl p-5 w-[280px] flex flex-col gap-3"
            style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.07)" }}>
            <p className="text-[14px] font-bold" style={{ color: "#1a1a1a" }}>정말 초기화 하시겠어요?</p>
            <p className="text-[12px] leading-relaxed" style={{ color: "#8e8e93" }}>
              모든 색상, 이미지, 설정이 기본값으로 되돌아가요. 이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setResetConfirm(false)}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold"
                style={{ color: "#8e8e93", background: "rgba(0,0,0,0.05)" }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  setConfig(defaultConfig);
                  setImageUploads({});
                  setOs("ios");
                  setPreviewTab("friends");
                  setActiveEditorCategory("manifest");
                  localStorage.removeItem("kakkumi_draft_theme_id");
                  localStorage.removeItem("kakkumi_draft");
                  setResetConfirm(false);
                  triggerImmediateAfterReset();
                }}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all hover:opacity-85"
                style={{ background: "rgb(255,59,48)", color: "#fff" }}
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateCSS(config: ThemeConfig, imageUploads: Record<string, string> = {}): string {
  const img = (key: string, filename: string) =>
    imageUploads[key] ? `\n    -ios-background-image: '${filename}';` : "";

  return `/*
 Manifest
 */

ManifestStyle
{
    -kakaotalk-theme-name: '${config.name}';
    -kakaotalk-theme-version: '${config.version}';
    -kakaotalk-theme-url: '${config.themeUrl}';
    -kakaotalk-author-name: '${config.authorName}';
    -kakaotalk-theme-id: '${config.packageId}';${config.darkMode ? "\n    -kakaotalk-theme-style: 'dark';" : ""}
}


/*
 TabBar Style
 */

TabBarStyle-Main
{
    background-color: ${config.tabBarBg};${img("tabBg", "maintabBgImage@2x.png")}
    ${imageUploads["tabFriendsNormal"] ? `-ios-friends-normal-icon-image: 'maintabIcoFriends@2x.png';` : ""}
    ${imageUploads["tabFriendsSelected"] ? `-ios-friends-selected-icon-image: 'maintabIcoFriendsSelected@2x.png';` : ""}
    ${imageUploads["tabChatNormal"] ? `-ios-chats-normal-icon-image: 'maintabIcoChats@2x.png';` : ""}
    ${imageUploads["tabChatSelected"] ? `-ios-chats-selected-icon-image: 'maintabIcoChatsSelected@2x.png';` : ""}
    ${imageUploads["tabOpenNormal"] ? `-ios-now-normal-icon-image: 'maintabIcoNow@2x.png';` : ""}
    ${imageUploads["tabOpenSelected"] ? `-ios-now-selected-icon-image: 'maintabIcoNowSelected@2x.png';` : ""}
    ${imageUploads["tabShopNormal"] ? `-ios-shopping-normal-icon-image: 'maintabIcoShopping@2x.png';` : ""}
    ${imageUploads["tabShopSelected"] ? `-ios-shopping-selected-icon-image: 'maintabIcoShoppingSelected@2x.png';` : ""}
    ${imageUploads["tabMoreNormal"] ? `-ios-more-normal-icon-image: 'maintabIcoMore@2x.png';` : ""}
    ${imageUploads["tabMoreSelected"] ? `-ios-more-selected-icon-image: 'maintabIcoMoreSelected@2x.png';` : ""}
    -ios-icon-normal-color: ${config.tabBarIcon};
    -ios-icon-selected-color: ${config.tabBarSelectedIcon};
}


/*
 MainView Style
 */

HeaderStyle-Main
{
    -ios-text-color: ${config.headerText};
    -ios-tab-text-color: ${config.headerTabText};
    -ios-tab-highlighted-text-color: ${config.headerTabHighlightText};
}

MainViewStyle-Primary
{
    background-color: ${config.bodyBg};${img("mainBg", "mainBgImage@2x.png")}

    -ios-text-color: ${config.primaryText};
    -ios-highlighted-text-color: ${config.chatListHighlightText};

    -ios-description-text-color: ${config.descText};
    -ios-description-highlighted-text-color: ${config.descHighlightText};

    -ios-paragraph-text-color: ${config.chatListLastMsgText};
    -ios-paragraph-highlighted-text-color: ${config.chatListLastMsgHighlightText};

    -ios-normal-background-color: ${config.friendsNormalBgColor};
    -ios-normal-background-alpha: ${config.friendsNormalBgAlpha};

    -ios-selected-background-color: ${config.friendsSelectedBg};
    -ios-selected-background-alpha: ${config.selectedBgAlpha};
}

MainViewStyle-Secondary
{
    background-color: ${config.bodyBg};
}

SectionTitleStyle-Main
{
    border-color: ${config.friendsBorderColor};
    border-alpha: ${config.borderAlpha};

    -ios-text-color: ${config.descText};
    -ios-text-alpha: ${config.sectionTitleTextAlpha};
}


/*
 DefaultProfile Style
*/

DefaultProfileStyle
{${imageUploads["defaultProfile"] ? `
    -ios-profile-images: 'profileImg01@2x.png';` : ""}
}


/*
 Feature Style
 */

FeatureStyle-Primary
{
    -ios-text-color: ${config.featurePrimaryText};
}

${imageUploads["btnAddFriend"] ? `ButtonStyle-AddFriend
{
    -ios-image: 'findBtnAddFriend@2x.png';
}` : ""}

/*
 ChatRoom Style
 */

BackgroundStyle-ChatRoom
{
    background-color: ${config.chatBg};${img("chatroomBg", "chatroomBgImage@2x.png")}
}

InputBarStyle-Chat
{
    background-color: ${config.inputBarBg};

    -ios-button-text-color: ${config.inputBarText};

    -ios-send-normal-background-color: ${config.sendBtnBg};
    -ios-send-normal-foreground-color: ${config.sendBtnIcon};

    -ios-send-highlighted-background-color: ${config.sendBtnHighlightBg};
    -ios-send-highlighted-foreground-color: ${config.sendBtnHighlightIcon};

    -ios-button-normal-foreground-color: ${config.menuBtnColor};
    -ios-button-highlighted-foreground-color: ${config.menuBtnHighlightColor};

    -ios-button-normal-background-color: ${config.inputFieldBg};
    -ios-button-normal-background-alpha: ${config.menuBtnNormalBgAlpha};
}


/*
 Message Style
 */

MessageCellStyle-Send
{${imageUploads["bubbleSend1"] ? `
    -ios-background-image: 'chatroomBubbleSend01@2x.png' 17px 17px;` : ""}${imageUploads["bubbleSend1Selected"] ? `
    -ios-selected-background-image: 'chatroomBubbleSend01Selected@2x.png' 17px 17px;` : ""}${imageUploads["bubbleSend2"] ? `
    -ios-group-background-image: 'chatroomBubbleSend02@2x.png' 17px 17px;` : ""}${imageUploads["bubbleSend2Selected"] ? `
    -ios-group-selected-background-image: 'chatroomBubbleSend02Selected@2x.png' 17px 17px;` : ""}
    -ios-title-edgeinsets: 10px 11px 7px 17px;
    -ios-group-title-edgeinsets: 10px 11px 7px 17px;

    -ios-background-color: ${config.myBubbleBg};
    -ios-text-color: ${config.myBubbleText};
    -ios-selected-text-color: ${config.myBubbleSelectedText};
    -ios-unread-text-color: ${config.myBubbleUnreadText};
}

MessageCellStyle-Receive
{${imageUploads["bubbleReceive1"] ? `
    -ios-background-image: 'chatroomBubbleReceive01@2x.png' 22px 17px;` : ""}${imageUploads["bubbleReceive1Selected"] ? `
    -ios-selected-background-image: 'chatroomBubbleReceive01Selected@2x.png' 22px 17px;` : ""}${imageUploads["bubbleReceive2"] ? `
    -ios-group-background-image: 'chatroomBubbleReceive02@2x.png' 22px 17px;` : ""}${imageUploads["bubbleReceive2Selected"] ? `
    -ios-group-selected-background-image: 'chatroomBubbleReceive02Selected@2x.png' 22px 17px;` : ""}
    -ios-title-edgeinsets: 10px 17px 7px 11px;
    -ios-group-title-edgeinsets: 10px 17px 7px 11px;

    -ios-background-color: ${config.otherBubbleBg};
    -ios-text-color: ${config.otherBubbleText};
    -ios-selected-text-color: ${config.otherBubbleSelectedText};
    -ios-unread-text-color: ${config.otherBubbleUnreadText};
}


/*
 Passcode Style
 */

BackgroundStyle-Passcode
{
    background-color: ${config.passcodeBg};${img("passcodeBgImg", "passcodeBgImage@2x.png")}
}

LabelStyle-PasscodeTitle
{
    -ios-text-color: ${config.passcodeTitleText};
}

PasscodeStyle
{${imageUploads["bullet1Empty"] ? `
     -ios-bullet-first-image: 'passcodeImgCode01@2x.png';` : ""}${imageUploads["bullet2Empty"] ? `
     -ios-bullet-second-image: 'passcodeImgCode02@2x.png';` : ""}${imageUploads["bullet3Empty"] ? `
     -ios-bullet-third-image: 'passcodeImgCode03@2x.png';` : ""}${imageUploads["bullet4Empty"] ? `
     -ios-bullet-fourth-image: 'passcodeImgCode04@2x.png';` : ""}${imageUploads["bullet1Fill"] ? `
     -ios-bullet-selected-first-image: 'passcodeImgCode01Selected@2x.png';` : ""}${imageUploads["bullet2Fill"] ? `
     -ios-bullet-selected-second-image: 'passcodeImgCode02Selected@2x.png';` : ""}${imageUploads["bullet3Fill"] ? `
     -ios-bullet-selected-third-image: 'passcodeImgCode03Selected@2x.png';` : ""}${imageUploads["bullet4Fill"] ? `
     -ios-bullet-selected-fourth-image: 'passcodeImgCode04Selected@2x.png';` : ""}

    -ios-keypad-background-color: ${config.passcodeKeypadBg};
    -ios-keypad-text-normal-color: ${config.passcodeKeypadText};
    ${imageUploads["passcodeKeypadPressed"] ? `-ios-keypad-number-highlighted-image: 'passcodeKeypadPressed.png';` : ""}
}


/*
 Message Notification Bar Style
 */

BackgroundStyle-MessageNotificationBar
{
    background-color: ${config.notifBannerBg};
}

LabelStyle-MessageNotificationBarName
{
    -ios-text-color: ${config.notifBannerNameText};
}

LabelStyle-MessageNotificationBarMessage
{
    -ios-text-color: ${config.notifBannerMsgText};
}


/*
 Direct Share
*/

BackgroundStyle-DirectShareBar
{
    background-color: ${config.directShareBg};
}

LabelStyle-DirectShareBarName
{
    -ios-text-color: ${config.directShareNameText};
}

LabelStyle-DirectShareBarMessage
{
    -ios-text-color: ${config.directShareMsgText};
}


/*
 BottomBanner Style
 */

BottomBannerStyle {
    background-color: ${config.bottomBannerBg};
}

BottomBannerStyle-Light {
    background-color: ${config.bottomBannerLightBg};
}
`;
}

