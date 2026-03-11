"use client";

import { useEffect, useRef, useState, startTransition, useMemo, memo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import JSZip from "jszip";
import Header from "../components/Header";
import { useAutoSave } from "./useAutoSave";
import { BubbleDesigner, DEFAULT_SEND, DEFAULT_RECEIVE, BubbleDesignOptions } from "./BubbleDesigner";
import { IconDesigner, IconDesignOptions } from "./IconDesigner";

import { PreviewNewsMockup } from "@/stories/PreviewNewsMockup";
import { PreviewChatRoomMockup } from "@/stories/PreviewChatRoomMockup";
import { PreviewChatRoomInputMockup } from "@/stories/PreviewChatRoomInputMockup";
import { PreviewMockup } from "@/stories/PreviewMockup";
import { ChatRoomScreen } from "@/stories/preview/ChatRoomScreen";
import { FriendsScreen } from "@/stories/preview/FriendsScreen";
import { MainScreen } from "@/stories/preview/MainScreen";
import { MoreScreen } from "@/stories/preview/MoreScreen";
import { NewsScreen } from "@/stories/preview/NewsScreen";
import { OpenChatsScreen } from "@/stories/preview/OpenChatsScreen";
import { PasscodeScreen } from "@/stories/preview/PasscodeScreen";
import { ShoppingScreen } from "@/stories/preview/ShoppingScreen";
import { TabBar } from "@/stories/preview/TabBar";
import { frameStyle } from "@/stories/preview/styles";
import { ScreenType, useThemeStore as usePreviewThemeStore } from "@/stories/useThemeStore";

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
  friendsListDescText: string;
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
  bubbleSendInset1: string;
  bubbleSendInset2: string;
  otherBubbleBg: string;
  otherBubbleText: string;
  otherBubbleSelectedText: string;
  otherBubbleUnreadText: string;
  bubbleReceiveInset1: string;
  bubbleReceiveInset2: string;
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
  // ── UI 상태 (저장/복원용) ──
  uiDefaultProfileOn?: boolean;
  uiPasscodeBgMode?: "color" | "image";
  uiTabBgMode?: "color" | "image";
  uiBulletEmptyMode?: "default" | "color" | "image";
  uiBulletFillMode?: "color" | "image";
  uiBulletEmptyColor?: string;
  uiBulletFillColor?: string;
  uiKeypadPressedOn?: boolean;
  uiIconMode?: "svg" | "image";
  uiIconOpts?: Record<string, unknown>;
  uiSendBubbleOpts?: Record<string, unknown>;
  uiReceiveBubbleOpts?: Record<string, unknown>;
}

const defaultConfig: ThemeConfig = {
  name: "나의 테마",
  version: "1.0.0",
  packageId: "",
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
  friendsListDescText: "#9E9E9E",
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
  bubbleSendInset1: "10px 10px 7px 12px",
  bubbleSendInset2: "10px 10px 7px 12px",
  otherBubbleBg: "#FFFFFF",
  otherBubbleText: "#191919",
  otherBubbleSelectedText: "#191919",
  otherBubbleUnreadText: "#FF3B30",
  bubbleReceiveInset1: "10px 16px 7px 10px",
  bubbleReceiveInset2: "10px 16px 7px 10px",
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
const ImageUploadRow = memo(function ImageUploadRow({ label, tooltip, imgKey, imageUploads, onUpload, onRemove, badge, badgeColor }: {
  label: string; tooltip: string; imgKey: string;
  imageUploads: Record<string, string>;
  onUpload: (key: string, file: File) => void;
  onRemove?: (key: string) => void;
  badge?: string;
  badgeColor?: string;
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
            {badge && (
              <span className="text-[10px] font-semibold" style={{ color: badgeColor ?? '#9ca3af' }}>{badge}</span>
            )}
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
  if (type === "slider") {
    const numVal = parseFloat(value) || 0;
    return (
      <div className="flex flex-col px-2.5 py-1 mb-1.5 w-full">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-gray-500">{label}</span>
            {hint && (
              <div className="group/tip relative flex items-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <div className="absolute left-0 bottom-6 z-50 hidden group-hover/tip:block text-[11px] rounded-lg px-3 py-2 w-max max-w-[200px] leading-snug shadow-xl ring-1 ring-black/5 bg-white text-gray-800">
                  {hint}
                  <div className="absolute left-1.5 -bottom-1 w-2 h-2 bg-white rotate-45 transform border-b border-r border-gray-100"></div>
                </div>
              </div>
            )}
          </div>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(1, Math.max(0, v)).toString());
            }}
            disabled={readOnly}
            className="w-[52px] text-right text-[11px] font-mono text-gray-500 bg-transparent border-b border-gray-200 outline-none focus:border-orange-400 py-0.5"
          />
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={numVal}
          onChange={(e) => onChange(parseFloat(e.target.value).toString())}
          disabled={readOnly}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-400"
          style={{ background: `linear-gradient(to right, rgb(251,146,60) ${numVal * 100}%, #e5e7eb ${numVal * 100}%)` }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-300">0.0</span>
          <span className="text-[9px] text-gray-300">1.0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-2.5 py-0.5 group mb-1.5 w-full">
      <label className="text-[11px] font-medium text-gray-500 mb-0.5 transition-colors group-focus-within:text-orange-500 flex items-center gap-1.5">
        {label}
        {hint && (
          <div className="group/tip relative flex items-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div className="absolute left-0 bottom-6 z-50 hidden group-hover/tip:block text-[11px] rounded-lg px-3 py-2 w-max max-w-[200px] leading-snug shadow-xl ring-1 ring-black/5 bg-white text-gray-800">
              {hint}
              <div className="absolute left-1.5 -bottom-1 w-2 h-2 bg-white rotate-45 transform border-b border-r border-gray-100"></div>
            </div>
          </div>
        )}
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

/* ── 채팅 탭 전용: 목업 2개 나란히 ── */
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
            <TabBar disabled darkMode={config.darkMode} />
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

/* ── iOS 채팅방 목업 (채팅 탭 듀얼용) ── */
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

function AndroidMockup({ config, previewTab, imageUploads, passcodeBgMode, bulletEmptyMode, bulletFillMode, bulletEmptyColor, bulletFillColor, keypadPressedOn }: { config: ThemeConfig; previewTab: PreviewTab; imageUploads: Record<string, string>; passcodeBgMode: "color" | "image"; bulletEmptyMode: "default" | "color" | "image"; bulletFillMode: "color" | "image"; bulletEmptyColor: string; bulletFillColor: string; keypadPressedOn: boolean }) {
  const passcodeBgImgUrl = imageUploads["passcodeBgImg"];
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
    passcodeKeypadBg: config.passcodeKeypadBg,
    unreadCountColor: config.unreadCountColor,
    openchatBg: config.openchatBg,
    mainBgImageUrl: undefined,
    chatListLastMsgText: config.chatListLastMsgText,
    chatListNamePressColor: config.chatListHighlightText,
    chatListLastMsgPressColor: config.chatListLastMsgHighlightText,
    chatListSelectedBg: config.friendsSelectedBg,
    chatListSelectedBgAlpha: config.selectedBgAlpha,
    passcodeBgImageUrl: passcodeBgMode === "image" ? (passcodeBgImgUrl || undefined) : undefined,
    bulletEmptyColor: bulletEmptyMode === "color" ? bulletEmptyColor : undefined,
    bulletEmptyDefault: bulletEmptyMode === "default",
    bulletFillColor: bulletFillMode === "color" ? bulletFillColor : undefined,
    bulletEmptyImageUrl: bulletEmptyMode === "image" ? (imageUploads['bulletEmpty'] ?? undefined) : undefined,
    bulletFillImageUrl: bulletFillMode === "image" ? (imageUploads['bulletFill'] ?? undefined) : undefined,
    passcodeKeypadPressedImageUrl: keypadPressedOn ? (imageUploads['passcodeKeypadPressed'] ?? undefined) : undefined,
    passcodeKeypadPressedOn: keypadPressedOn,
  }), [
    config.bodyBg, config.headerBg, config.headerText, config.primaryText, config.descText,
    config.tabBarBg, config.tabBarIcon, config.tabBarSelectedIcon, config.friendsSelectedBg,
    config.chatBg, config.otherBubbleBg, config.myBubbleBg, config.inputBarBg, config.sendBtnBg,
    config.passcodeBg, config.passcodeTitleText, config.passcodeKeypadText, config.passcodeKeypadBg,
    config.unreadCountColor, config.openchatBg, config.chatListLastMsgText,
    config.chatListHighlightText, config.chatListLastMsgHighlightText, config.selectedBgAlpha,
    passcodeBgImgUrl, passcodeBgMode,
    bulletEmptyMode, bulletFillMode, bulletEmptyColor, bulletFillColor,
    imageUploads, keypadPressedOn,
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
            {showTabBar ? <TabBar disabled darkMode={config.darkMode} /> : null}
          </section>
        </div>
      </div>
      <div className="absolute right-[-6px] top-20 w-1 h-14 bg-zinc-700 rounded-r-md" />
    </div>
  );
}

type PreviewTab = "friends" | "chat" | "openchat" | "shopping" | "more" | "passcode" | "notification";
type EditorCategory =
  | "manifest"
  | "friends-tab"
  | "chat-tab"
  | "chatroom"
  | "chat-inputbar"
  | "tabbar"
  | "more-tab"
  | "passcode"
  | "notification";

const editorCategories: { key: EditorCategory; label: string }[] = [
  { key: "manifest",      label: "테마 정보" },
  { key: "friends-tab",   label: "친구탭" },
  { key: "chat-tab",      label: "채팅탭" },
  { key: "chatroom",      label: "채팅방" },
  { key: "chat-inputbar", label: "채팅_인풋바" },
  { key: "tabbar",        label: "상·하단바" },
  { key: "more-tab",      label: "더보기탭" },
  { key: "passcode",      label: "잠금화면" },
  { key: "notification",  label: "알림/배너" },
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
  const [sendBubbleOpts, setSendBubbleOpts] = useState<BubbleDesignOptions>({ ...DEFAULT_SEND, bgColor: defaultConfig.myBubbleBg });
  const [receiveBubbleOpts, setReceiveBubbleOpts] = useState<BubbleDesignOptions>({ ...DEFAULT_RECEIVE, bgColor: defaultConfig.otherBubbleBg });
  const [iconOpts, setIconOpts] = useState<IconDesignOptions>({ bgColor: "#FFFFFF", iconColor: "#FEE500" });
  const [iconMode, setIconMode] = useState<"svg" | "image">("svg");
  const [iconSvgUrl, setIconSvgUrl] = useState<string>("");
  const [iconImageUrl, setIconImageUrl] = useState<string>("");
  const [passcodeBgMode, setPasscodeBgMode] = useState<"color" | "image">("color");
  const [tabBgMode, setTabBgMode] = useState<"color" | "image">("color");
  const [bulletEmptyMode, setBulletEmptyMode] = useState<"default" | "color" | "image">("default");
  const [bulletFillMode, setBulletFillMode] = useState<"color" | "image">("color");
  const [bulletEmptyColor, setBulletEmptyColor] = useState("#191919");
  const [bulletFillColor, setBulletFillColor] = useState("#4a7bf7");
  const [keypadPressedOn, setKeypadPressedOn] = useState(true);
  const [defaultProfileOn, setDefaultProfileOn] = useState(false);
  const [isDarkChatBg, setIsDarkChatBg] = useState(false);

  // hex 색상 밝기 계산 (0~255)
  const getHexLuminance = (hex: string): number => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    if (isNaN(r)) return 128;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // 이미지 URL 밝기 계산 (배경 컬러 위에 이미지 합성 후 canvas 샘플링)
  const getImageLuminance = (url: string, bgHex: string): Promise<number> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 80;
        canvas.width = Math.min(img.width, MAX);
        canvas.height = Math.min(img.height, MAX);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(128);
        // 먼저 배경 컬러를 채워서 투명 PNG의 투명 부분에 배경 컬러가 비치도록 합성
        const h = bgHex.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        if (!isNaN(r)) {
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let total = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          count++;
        }
        resolve(count > 0 ? total / count : 128);
      };
      img.onerror = () => resolve(128);
      img.src = url;
    });
  };

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

        // UI 상태값 복원
        const c = theme.configJson as Partial<ThemeConfig>;
        if (c.uiDefaultProfileOn !== undefined) setDefaultProfileOn(c.uiDefaultProfileOn);
        if (c.uiPasscodeBgMode !== undefined) setPasscodeBgMode(c.uiPasscodeBgMode);
        if (c.uiTabBgMode !== undefined) setTabBgMode(c.uiTabBgMode);
        if (c.uiBulletEmptyMode !== undefined) setBulletEmptyMode(c.uiBulletEmptyMode);
        if (c.uiBulletFillMode !== undefined) setBulletFillMode(c.uiBulletFillMode);
        if (c.uiBulletEmptyColor !== undefined) setBulletEmptyColor(c.uiBulletEmptyColor);
        if (c.uiBulletFillColor !== undefined) setBulletFillColor(c.uiBulletFillColor);
        if (c.uiKeypadPressedOn !== undefined) setKeypadPressedOn(c.uiKeypadPressedOn);
        if (c.uiIconMode !== undefined) setIconMode(c.uiIconMode);
        if (c.uiIconOpts !== undefined) setIconOpts(c.uiIconOpts as unknown as IconDesignOptions);
        if (c.uiSendBubbleOpts !== undefined) setSendBubbleOpts(c.uiSendBubbleOpts as unknown as BubbleDesignOptions);
        if (c.uiReceiveBubbleOpts !== undefined) setReceiveBubbleOpts(c.uiReceiveBubbleOpts as unknown as BubbleDesignOptions);
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
      // 초기 useEffect들이 enabled=false 상태에서 실행된 후 enabled=true로 전환
      requestAnimationFrame(() => {
        setThemeLoaded(true);
        isInitializingRef.current = false;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeIdParam]);

  // 기존 테마 로드 완료 후 초기화 useEffect들이 모두 실행될 시간을 준 뒤 저장 허용
  useEffect(() => {
    if (!themeLoaded || !themeIdParam) return;
    const timer = setTimeout(() => {
      isInitializingRef.current = false;
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeLoaded]);

  // UI 상태 변경 헬퍼 - state와 config를 동시에 업데이트
  const setDefaultProfileOnWithConfig = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setDefaultProfileOn(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      setConfig(c => ({ ...c, uiDefaultProfileOn: next }));
      return next;
    });
  }, []);
  const setPasscodeBgModeWithConfig = useCallback((val: "color" | "image") => {
    setPasscodeBgMode(val);
    setConfig(c => ({ ...c, uiPasscodeBgMode: val }));
  }, []);
  const setTabBgModeWithConfig = useCallback((val: "color" | "image") => {
    setTabBgMode(val);
    setConfig(c => ({ ...c, uiTabBgMode: val }));
  }, []);
  const setBulletEmptyModeWithConfig = useCallback((val: "default" | "color" | "image") => {
    setBulletEmptyMode(val);
    setConfig(c => ({ ...c, uiBulletEmptyMode: val }));
  }, []);
  const setBulletFillModeWithConfig = useCallback((val: "color" | "image") => {
    setBulletFillMode(val);
    setConfig(c => ({ ...c, uiBulletFillMode: val }));
  }, []);
  const setBulletEmptyColorWithConfig = useCallback((val: string) => {
    setBulletEmptyColor(val);
    setConfig(c => ({ ...c, uiBulletEmptyColor: val }));
  }, []);
  const setBulletFillColorWithConfig = useCallback((val: string) => {
    setBulletFillColor(val);
    setConfig(c => ({ ...c, uiBulletFillColor: val }));
  }, []);
  const setKeypadPressedOnWithConfig = useCallback((val: boolean) => {
    setKeypadPressedOn(val);
    setConfig(c => ({ ...c, uiKeypadPressedOn: val }));
  }, []);
  const setIconModeWithConfig = useCallback((val: "svg" | "image") => {
    setIconMode(val);
    setConfig(c => ({ ...c, uiIconMode: val }));
  }, []);
  const setIconOptsWithConfig = useCallback((val: IconDesignOptions) => {
    setIconOpts(val);
    setConfig(c => ({ ...c, uiIconOpts: val as unknown as Record<string, unknown> }));
  }, []);
  const setSendBubbleOptsWithConfig = useCallback((val: BubbleDesignOptions) => {
    setSendBubbleOpts(val);
    setConfig(c => ({ ...c, uiSendBubbleOpts: val as unknown as Record<string, unknown> }));
  }, []);
  const setReceiveBubbleOptsWithConfig = useCallback((val: BubbleDesignOptions) => {
    setReceiveBubbleOpts(val);
    setConfig(c => ({ ...c, uiReceiveBubbleOpts: val as unknown as Record<string, unknown> }));
  }, []);

  // 채팅방 배경 밝기 계산 → isDarkChatBg
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const imgUrl = imageUploads['chatroomBg'];
    if (imgUrl) {
      getImageLuminance(imgUrl, config.chatBg).then(lum => {
        setIsDarkChatBg(lum < 128);
      });
    } else {
      setIsDarkChatBg(getHexLuminance(config.chatBg) < 128);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.chatBg, imageUploads['chatroomBg']]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ── 로그인 닉네임 → authorName 자동 설정 ──
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { session?: { nickname?: string | null; name?: string | null } | null }) => {
        const nickname = data?.session?.nickname ?? data?.session?.name ?? null;
        if (nickname) {
          setConfig((prev) => ({ ...prev, authorName: nickname }));
        }
      })
      .catch(() => {});
  }, []);

  // ── 변경사항 감지 (새 테마일 때만 저장 허용) ──
  // 오직 사용자가 명시적으로 변경했을 때만 true로 설정됨 (useEffect 자동 계산 없음)
  const hasChangesRef = useRef(false);

  // 기존 테마 로드 직후 초기화 useEffect들이 triggerDebounce를 호출하는 것을 막기 위한 ref
  const isInitializingRef = useRef(true);

  // ── 자동저장 훅 ──
  const { status: autoSaveStatus, triggerDebounce, triggerImmediate, triggerImmediateAfterReset } = useAutoSave({
    config,
    os,
    imageUploads,
    initialThemeId: themeIdParam ?? null,
    allowCreateRef: themeIdParam ? undefined : hasChangesRef,
    allowSaveRef: themeIdParam ? isInitializingRef : undefined,
    enabled: themeLoaded,
    onCreated: (packageId) => {
      setConfig(prev => ({ ...prev, packageId }));
    },
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
        headerTabText: config.headerTabText,
        profileImgUrls: defaultProfileOn ? [
          imageUploads['profileImg01'],
          imageUploads['profileImg02'],
          imageUploads['profileImg03'],
        ].filter(Boolean) as string[] : undefined,
      },
      friendsTab: {
        updateSectionBg: '#F2F2F7',
        listDescTextColor: config.friendsListDescText,
        selectedBg: config.friendsSelectedBg,
        selectedBgAlpha: config.selectedBgAlpha,
        nameTextColor: config.friendsNameText,
      },
      tabBar: {
        activeIconColor: config.tabBarSelectedIcon,
        inactiveIconColor: config.tabBarIcon,
        backgroundColor: config.tabBarBg,
        backgroundImageUrl: tabBgMode === "image" ? (imageUploads["tabBg"] || undefined) : undefined,
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
      passcode: {
        backgroundColor: config.passcodeBg,
        titleColor: config.passcodeTitleText,
        keypadTextColor: config.passcodeKeypadText,
      },
    });
  }, [config, setTheme, tabBgMode, imageUploads]);

  useEffect(() => {
    setTheme({
      chatRoom: {
        backgroundColor: config.chatBg,
        friendBubbleBg: config.otherBubbleBg,
        myBubbleBg: config.myBubbleBg,
        inputBarBg: config.inputBarBg,
        inputBarText: config.inputBarText,
        inputFieldBg: config.inputFieldBg,
        inputFieldBgAlpha: parseFloat(config.menuBtnNormalBgAlpha),
        sendButtonBg: config.sendBtnBg,
        sendButtonFg: config.sendBtnIcon,
        sendButtonHighlightBg: config.sendBtnHighlightBg,
        sendButtonHighlightFg: config.sendBtnHighlightIcon,
        menuButtonFg: config.menuBtnColor,
        menuButtonHighlightFg: config.menuBtnHighlightColor,
        bgImageUrl: imageUploads['chatroomBg'] ?? '',
        myBubbleText: config.myBubbleText,
        myBubbleSelectedText: config.myBubbleSelectedText,
        myBubbleUnreadText: config.myBubbleUnreadText,
        friendBubbleText: config.otherBubbleText,
        friendBubbleSelectedText: config.otherBubbleSelectedText,
        friendBubbleUnreadText: config.otherBubbleUnreadText,
        bubbleSend1Url: imageUploads['bubbleSend1'] ?? '',
        bubbleSend1SelectedUrl: imageUploads['bubbleSend1Selected'] ?? '',
        bubbleSend2Url: imageUploads['bubbleSend2'] ?? '',
        bubbleReceive1Url: imageUploads['bubbleReceive1'] ?? '',
        bubbleReceive1SelectedUrl: imageUploads['bubbleReceive1Selected'] ?? '',
        bubbleReceive2Url: imageUploads['bubbleReceive2'] ?? '',
        nameTimeColor: isDarkChatBg ? '#E3E3E3' : '#242424',
        characterUrl: sendBubbleOpts.characterUrl || undefined,
      },
      passcode: {
        backgroundColor: config.passcodeBg,
        titleColor: config.passcodeTitleText,
        keypadTextColor: config.passcodeKeypadText,
        keypadBg: config.passcodeKeypadBg,
        bgImageUrl: passcodeBgMode === "image" ? (imageUploads['passcodeBgImg'] ?? '') : '',
        bulletEmptyColor: bulletEmptyMode === "color" ? bulletEmptyColor : undefined,
        bulletFillColor: bulletFillMode === "color" ? bulletFillColor : undefined,
        bulletEmptyDefault: bulletEmptyMode === "default",
        bulletEmptyImageUrl: bulletEmptyMode === "image" ? (imageUploads['bulletEmpty'] ?? undefined) : undefined,
        bulletFillImageUrl: bulletFillMode === "image" ? (imageUploads['bulletFill'] ?? undefined) : undefined,
        keypadPressedImageUrl: keypadPressedOn ? (imageUploads['passcodeKeypadPressed'] ?? undefined) : undefined,
        keypadPressedOn: keypadPressedOn,
      },
    });
  }, [imageUploads, passcodeBgMode, tabBgMode, bulletEmptyMode, bulletFillMode, bulletEmptyColor, bulletFillColor, keypadPressedOn, defaultProfileOn, isDarkChatBg, sendBubbleOpts, config.chatBg, config.otherBubbleBg, config.myBubbleBg, config.inputBarBg, config.inputBarText, config.inputFieldBg, config.menuBtnNormalBgAlpha, config.sendBtnBg, config.sendBtnIcon, config.sendBtnHighlightBg, config.sendBtnHighlightIcon, config.menuBtnColor, config.menuBtnHighlightColor, config.myBubbleText, config.myBubbleSelectedText, config.myBubbleUnreadText, config.otherBubbleText, config.otherBubbleSelectedText, config.otherBubbleUnreadText, config.passcodeBg, config.passcodeTitleText, config.passcodeKeypadText, config.passcodeKeypadBg, config.tabBarBg, config.tabBarIcon, config.tabBarSelectedIcon, setTheme]);

  // iconOpts 변경 시 자동저장 트리거
  useEffect(() => {
    if (!themeIdParam) return;
    triggerDebounce();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconOpts]);

  // 불릿 색상/모드 변경 시 자동저장 트리거
  useEffect(() => {
    if (!themeIdParam) return;
    triggerDebounce();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulletEmptyColor, bulletFillColor, bulletEmptyMode, bulletFillMode]);

  // passcodeBgMode, keypadPressedOn, tabBgMode 변경 시 즉시 자동저장 트리거
  useEffect(() => {
    if (!themeIdParam) return;
    triggerImmediate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcodeBgMode, keypadPressedOn, tabBgMode]);

  // 다크/라이트모드 전환 시 탭바 배경색 자동 설정
  useEffect(() => {
    const newBg = config.darkMode ? "#000000" : "#FFFFFF";
    setConfig((prev) => ({ ...prev, tabBarBg: newBg }));
    setTheme({
      tabBar: {
        activeIconColor: config.tabBarSelectedIcon,
        inactiveIconColor: config.tabBarIcon,
        backgroundColor: newBg,
        backgroundImageUrl: tabBgMode === "image" ? (imageUploads["tabBg"] || undefined) : undefined,
      },
    });
    if (!themeIdParam) return;
    triggerImmediate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.darkMode]);

  useEffect(() => {
    const screenMap: Record<PreviewTab, ScreenType> = {
      friends: "FRIENDS",
      chat: "CHATS",
      openchat: "OPENCHATS",
      shopping: "SHOPPING",
      more: "MORE",
      passcode: "PASSCODE",
      notification: "CHATROOM",
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
    hasChangesRef.current = true;
    setConfig((prev) => ({ ...prev, [key]: value }));
    triggerDebounce();
  };

  const handleImageUpload = (key: string, file: File) => {
    const url = URL.createObjectURL(file);
    hasChangesRef.current = true;
    setImageUploads((prev) => ({ ...prev, [key]: url }));
    triggerImmediateAfterReset();
  };

  const handleImageRemove = (key: string) => {
    hasChangesRef.current = true;
    setImageUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    triggerImmediateAfterReset();
  };

  // 말풍선 디자이너에서 생성된 PNG blob URL을 imageUploads에 자동 주입
  const handleSendBubbleGenerate = useCallback(({ bubble1, bubble2 }: { bubble1: string; bubble2: string }) => {
    hasChangesRef.current = true;
    setImageUploads((prev) => ({ ...prev, bubbleSend1: bubble1, bubbleSend1Selected: bubble1, bubbleSend2: bubble2, bubbleSend2Selected: bubble2 }));
    triggerImmediateAfterReset();
  }, [triggerImmediateAfterReset]);

  const handleReceiveBubbleGenerate = useCallback(({ bubble1, bubble2 }: { bubble1: string; bubble2: string }) => {
    hasChangesRef.current = true;
    setImageUploads((prev) => ({ ...prev, bubbleReceive1: bubble1, bubbleReceive1Selected: bubble1, bubbleReceive2: bubble2, bubbleReceive2Selected: bubble2 }));
    triggerImmediateAfterReset();
  }, [triggerImmediateAfterReset]);

  // 불릿 색상 → bullet.svg 기반 PNG 생성 후 imageUploads에 주입 (저장 트리거 없음 - 호출부에서 직접 트리거)
  const generateBulletPng = useCallback(async (color: string, key: string) => {
    const W = 340, H = 340;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);
    // bullet.svg: ellipse cx=170, cy=170, rx=ry=60.01515
    ctx.beginPath();
    ctx.ellipse(170, 170, 60.01515, 60.01515, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), "image/png"));
    const url = URL.createObjectURL(blob);
    setImageUploads(prev => ({ ...prev, [key]: url }));
  }, []);

  // 불릿 색상 변경 시 PNG 자동 생성 (초기 포함)
  useEffect(() => {
    if (bulletEmptyMode === "color") {
      void generateBulletPng(bulletEmptyColor, "bulletEmptyColorPng");
    }
  }, [bulletEmptyColor, bulletEmptyMode, generateBulletPng]);

  useEffect(() => {
    if (bulletFillMode === "color") {
      void generateBulletPng(bulletFillColor, "bulletFillColorPng");
    }
  }, [bulletFillColor, bulletFillMode, generateBulletPng]);

  const handleDownload = async () => {
    if (os === "ios") {
      // iOS: KakaoTalkTheme.css + Images/ 구조를 ZIP으로 묶어 .ktheme로 저장
      const zip = new JSZip();
      const themeName = config.name.replace(/\s/g, "_");

      // CSS 생성
      zip.file("KakaoTalkTheme.css", generateCSS(config, imageUploads, passcodeBgMode, bulletEmptyMode, bulletFillMode, keypadPressedOn, tabBgMode, defaultProfileOn, !!sendBubbleOpts.characterUrl));

      // 업로드된 이미지를 Images/ 폴더에 포함
      const imageFileMap: Record<string, string> = {
        mainBg: "mainBgImage@2x.png",
        tabBg: "maintabBgImage@3x.png",
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
        bubbleSend1: "chatroomBubbleSend01@3x.png",
        bubbleSend2: "chatroomBubbleSend02@3x.png",
        bubbleReceive1: "chatroomBubbleReceive01@3x.png",
        bubbleReceive2: "chatroomBubbleReceive02@3x.png",
        passcodeBgImg: "passcodeBgImage@2x.png",
        bulletEmpty: "passcodeImgCode@3x.png",
        bulletFill: "passcodeImgCodeSelected@3x.png",
        passcodeKeypadPressed: "passcodeKeypadPressed@3x.png",
        profileImg01: "profileImg01@3x.png",
        profileImg02: "profileImg02@3x.png",
        profileImg03: "profileImg03@3x.png",
      };

      // 모드에 따라 실제 사용할 imageUploads 키 결정
      const resolvedUploads: Record<string, string> = { ...imageUploads };
      if (bulletEmptyMode === "color") {
        resolvedUploads["bulletEmpty"] = imageUploads["bulletEmptyColorPng"] ?? "";
      }
      if (bulletFillMode === "color") {
        resolvedUploads["bulletFill"] = imageUploads["bulletFillColorPng"] ?? "";
      }

      const imgPromises = Object.entries(imageFileMap)
        .filter(([key]) => {
          if (key === "passcodeBgImg" && passcodeBgMode === "color") return false;
          if (key === "tabBg" && tabBgMode === "color") return false;
          if (key === "bulletEmpty" && bulletEmptyMode === "default") return false;
          if (key === "passcodeKeypadPressed" && !keypadPressedOn) return false;
          if ((key === "profileImg01" || key === "profileImg02" || key === "profileImg03") && !defaultProfileOn) return false;
          return !!resolvedUploads[key];
        })
        .map(async ([key, filename]) => {
          try {
            const res = await fetch(resolvedUploads[key]);
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

      const readmeTxt = `Android 테마 패키지
===========================
테마 이름: ${config.name}
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
        </div>

        {/* 가운데: 탭 프리뷰 선택 */}
        <div className="flex items-center gap-0.5 rounded-full px-1 py-1" style={{ background: "rgba(0,0,0,0.05)" }}>
          {(["friends","chat","openchat","shopping","more"] as PreviewTab[]).map((tab) => {
            const labels: Record<PreviewTab, string> = { friends:"친구", chat:"채팅", openchat:"지금", shopping:"쇼핑", more:"더보기", passcode:"암호", notification:"알림" };
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
          <button onClick={() => setPreviewTab(previewTab === "notification" ? "friends" : "notification")}
            className="px-3.5 py-1 text-[12px] font-semibold transition-all rounded-full"
            style={{
              color: previewTab === "notification" ? "#fff" : "#6b6b6b",
              background: previewTab === "notification" ? "rgb(255,149,0)" : "transparent",
              boxShadow: previewTab === "notification" ? "0 1px 6px rgba(255,149,0,0.35)" : "none",
              whiteSpace: "nowrap",
            }}
          >알림</button>
        </div>

        {/* 오른쪽: OS + 버튼들 */}
        <div className="flex items-center gap-3">
          {/* OS 토글 */}
          <div className="flex items-center rounded-full p-0.5" style={{ background: "rgba(0,0,0,0.07)" }}>
            {(["ios","android"] as OS[]).map((o) => (
              <button key={o} onClick={() => { hasChangesRef.current = true; setOs(o); triggerImmediate(); }}
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
              const separatorBefore = idx === 6; // 상·하단바 앞 구분선
              return (
                <div key={category.key}>
                  {separatorBefore && (
                    <div className="mx-3 my-2 h-px bg-gray-100" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEditorCategory(category.key);
                      if (category.key === "chat-inputbar") setPreviewTab("chat");
                      if (category.key === "notification") setPreviewTab("notification");
                    }}
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
                <PreviewChatRoomInputMockup />
              </div>
            ) : os === "ios" && previewTab === "notification" ? (
              <div className="flex items-start gap-8">
                <PreviewChatRoomMockup hideContent={true} bannerType="notif" notifBannerBg={config.notifBannerBg} notifBannerNameColor={config.notifBannerNameText} notifBannerMsgColor={config.notifBannerMsgText} />
                <PreviewChatRoomMockup hideContent={true} bannerType="directShare" directShareBg={config.directShareBg} directShareNameColor={config.directShareNameText} directShareMsgColor={config.directShareMsgText} />
              </div>
            ) : os === "ios" ? (
              <PreviewMockup disableTabNavigation mainBgImageUrl={imageUploads.mainBg} />
            ) : previewTab === "friends" ? (
              <div className="flex items-start gap-8">
                <AndroidMockup config={config} previewTab="friends" imageUploads={imageUploads} passcodeBgMode={passcodeBgMode} bulletEmptyMode={bulletEmptyMode} bulletFillMode={bulletFillMode} bulletEmptyColor={bulletEmptyColor} bulletFillColor={bulletFillColor} keypadPressedOn={keypadPressedOn} />
                <AndroidFriendsProfileMockup config={config} />
              </div>
            ) : previewTab === "chat" ? (
              <div className="flex items-start gap-8">
                <AndroidMockup config={config} previewTab="chat" imageUploads={imageUploads} passcodeBgMode={passcodeBgMode} bulletEmptyMode={bulletEmptyMode} bulletFillMode={bulletFillMode} bulletEmptyColor={bulletEmptyColor} bulletFillColor={bulletFillColor} keypadPressedOn={keypadPressedOn} />
                <AndroidChatRoomMockup config={config} />
              </div>
            ) : (
              <AndroidMockup config={config} previewTab={previewTab} imageUploads={imageUploads} passcodeBgMode={passcodeBgMode} bulletEmptyMode={bulletEmptyMode} bulletFillMode={bulletFillMode} bulletEmptyColor={bulletEmptyColor} bulletFillColor={bulletFillColor} keypadPressedOn={keypadPressedOn} />
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
                  <MacInput label="고유 테마 ID" hint="(-kakaotalk-theme-id)" value={config.packageId || "저장 후 자동 생성"} onChange={set("packageId")} readOnly={true} />

                  <MacInput label="제작자" hint="(-kakaotalk-author-name)" value={config.authorName} onChange={set("authorName")} readOnly={true} />
                  <MacInput label="참조 URL" hint="(-kakaotalk-theme-url)" value={config.themeUrl} onChange={set("themeUrl")} />
                </Accordion>
                <Accordion title="시스템 스타일" badge="ManifestStyle">
                  <div className="flex flex-col gap-2 py-2.5 px-2.5">
                    <div className="text-[12.5px] font-semibold text-gray-800">다크 모드 지원</div>
                    <div className="flex rounded-lg overflow-hidden border border-gray-200">
                      <button
                        onClick={() => set("darkMode")(false)}
                        className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                        style={{
                          backgroundColor: !config.darkMode ? "rgb(251,146,60)" : "#fff",
                          color: !config.darkMode ? "#fff" : "#9ca3af",
                        }}
                      >
                        light
                      </button>
                      <button
                        onClick={() => set("darkMode")(true)}
                        className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                        style={{
                          backgroundColor: config.darkMode ? "rgb(251,146,60)" : "#fff",
                          color: config.darkMode ? "#fff" : "#9ca3af",
                        }}
                      >
                        dark
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>
                        {config.darkMode
                          ? "어플 시스템 UI (테마 관리 화면, 상태바 등) 가 다크 모드로 전환돼요. 내 커스텀 이미지나 색상에는 영향이 없지만 하단바 배경색은 어두운 색으로 고정이에요."
                          : "어플 시스템 UI (테마 관리 화면, 상태바 등) 가 라이트 모드로 전환돼요. 내 커스텀 이미지나 색상에는 영향 없어요."}
                      </span>
                    </div>
                  </div>
                </Accordion>
                <Accordion title="아이콘 이미지" badge="ManifestStyle">
                  <div className="mx-1 mb-1 rounded-xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                    <div className="px-3 py-2 bg-orange-50 border-b border-orange-100">
                      <p className="text-[11px] font-bold text-orange-600">🎨 아이콘 제작</p>
                      <p className="text-[10px] text-orange-400 mt-0.5">색상으로 제작하거나 직접 이미지를 업로드하세요</p>
                    </div>
                    <IconDesigner
                      options={iconOpts}
                      onChange={(opts) => { hasChangesRef.current = true; setIconOptsWithConfig(opts); }}
                      onSvgGenerate={(url) => {
                        setIconSvgUrl(url);
                        if (iconMode === "svg") {
                          setImageUploads((prev) => ({ ...prev, icon: url }));
                          triggerImmediateAfterReset();
                        }
                      }}
                      onModeChange={(m) => {
                        setIconModeWithConfig(m);
                        setImageUploads((prev) => ({
                          ...prev,
                          icon: m === "svg" ? iconSvgUrl : iconImageUrl,
                        }));
                        triggerImmediateAfterReset();
                      }}
                      uploadedUrl={iconImageUrl || undefined}
                      onUpload={(file) => {
                        const url = URL.createObjectURL(file);
                        setIconImageUrl(url);
                        setImageUploads((prev) => ({ ...prev, icon: url }));
                        triggerImmediateAfterReset();
                      }}
                      onRemoveUpload={() => {
                        setIconImageUrl("");
                        setImageUploads((prev) => ({ ...prev, icon: iconSvgUrl }));
                        triggerImmediateAfterReset();
                      }}
                    />
                  </div>
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
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>채팅탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                  <ImageUploadRow label="배경 이미지" tooltip="-ios-background-image" imgKey="mainBg" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>채팅탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="목록 텍스트" badge="MainViewStyle">
                  <ColorRow label="이름 / 아이콘" value={config.primaryText} onChange={(v) => { set("primaryText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-text-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>채팅탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                  <ColorRow label="친구칩 (상태메시지)" value={config.friendsListDescText} onChange={(v) => { set("friendsListDescText")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-description-text-color" />
                  <ColorRow label="친구칩 리스트 Pressed" value={config.friendsSelectedBg} onChange={(v) => { set("friendsSelectedBg")(v); if (previewTab !== "friends") setPreviewTab("friends"); }} tooltip="-ios-selected-background-color" />
                  <MacInput label="선택 배경 투명도" hint="(-ios-selected-background-alpha)" value={config.selectedBgAlpha} onChange={set("selectedBgAlpha")} type="slider" />
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="기본 프로필 이미지" badge="DefaultProfileStyle">
                  {/* 기본 프로필 이미지 on/off 스위치 */}
                  <div className="flex items-center justify-between px-2.5 py-1 mb-1">
                    <span className="text-[12px] font-medium text-gray-500">기본 프로필 이미지</span>
                    <button
                      type="button"
                      onClick={() => {
                        hasChangesRef.current = true;
                        setDefaultProfileOnWithConfig(prev => {
                          if (prev) {
                            setImageUploads(u => {
                              const next = { ...u };
                              delete next['profileImg01'];
                              delete next['profileImg02'];
                              delete next['profileImg03'];
                              return next;
                            });
                          }
                          return !prev;
                        });
                      }}
                      style={{
                        width: 36, height: 20, borderRadius: 10,
                        backgroundColor: defaultProfileOn ? 'rgb(74,123,247)' : '#d1d5db',
                        position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 2,
                        left: defaultProfileOn ? 18 : 2,
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                  {defaultProfileOn && (
                    <>
                      <ImageUploadRow label="프로필 이미지 01" badge="(필수)" badgeColor="rgb(248,113,113)" tooltip="profileImg01@3x.png" imgKey="profileImg01" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                      <ImageUploadRow label="프로필 이미지 02" badge="(선택)" tooltip="profileImg02@3x.png" imgKey="profileImg02" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                      <ImageUploadRow label="프로필 이미지 03" badge="(선택)" tooltip="profileImg03@3x.png" imgKey="profileImg03" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                    </>
                  )}
                </Accordion>
              </>
            )}

            {activeEditorCategory === "chat-tab" && (
              <>
                <Accordion title="배경" badge="MainViewStyle">
                  <ColorRow label="배경색" value={config.bodyBg} onChange={set("bodyBg")} tooltip="background-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                  <ImageUploadRow label="배경 이미지" tooltip="-ios-background-image" imgKey="mainBg" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="목록 텍스트" badge="MainViewStyle-Primary">
                  <ColorRow label="이름 / 아이콘" value={config.primaryText} onChange={(v) => { set("primaryText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-text-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭, 더보기탭과 공유되는 값입니다</span>
                  </div>
                  <ColorRow label="이름 프레스" value={config.chatListHighlightText} onChange={(v) => { set("chatListHighlightText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-highlighted-text-color" />
                  <ColorRow label="마지막 메시지" value={config.chatListLastMsgText} onChange={(v) => { set("chatListLastMsgText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-paragraph-text-color" />
                  <ColorRow label="마지막 메시지 프레스" value={config.chatListLastMsgHighlightText} onChange={(v) => { set("chatListLastMsgHighlightText")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-paragraph-highlighted-text-color" />
                  <ColorRow label="선택 배경" value={config.friendsSelectedBg} onChange={(v) => { set("friendsSelectedBg")(v); if (previewTab !== "chat") setPreviewTab("chat"); }} tooltip="-ios-selected-background-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭과 공유되는 값입니다</span>
                  </div>
                  <MacInput label="선택 배경 투명도" hint="(-ios-selected-background-alpha)" value={config.selectedBgAlpha} onChange={set("selectedBgAlpha")} type="slider" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭과 공유되는 값입니다</span>
                  </div>
                </Accordion>
              </>
            )}

            {activeEditorCategory === "chatroom" && (
              <>
                <Accordion title="채팅방 배경" badge="BackgroundStyle-ChatRoom">
                  <ColorRow label="배경 컬러" value={config.chatBg} onChange={set("chatBg")} tooltip="background-color" />
                  <ImageUploadRow label="배경 이미지" tooltip="-ios-background-image" imgKey="chatroomBg" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  <div className="px-2.5 pb-1 flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(251,146,60)' }}>배경 이미지 없음 → 배경 컬러만 보임</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(251,146,60)' }}>배경 이미지 있음 → 이미지가 컬러 위에 표시됨</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(251,146,60)' }}>불투명 PNG → 배경 컬러 완전히 가려짐</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(251,146,60)' }}>투명 PNG → 투명 부분에 배경 컬러가 비침</span>
                    </div>
                  </div>
                  <div className="px-2.5 pb-2 mt-1 flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(239,68,68)' }}>이름·시간 텍스트는 배경 밝기를 자동 감지해 색상이 결정돼요</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px] leading-snug" style={{ color: 'rgb(239,68,68)' }}>배경컬러와 투명 PNG가 합쳐졌다면 미리보기의 텍스트 색이 애매할 수 있어요. 확실한 결과는 어플에서 확인 부탁드려요.</span>
                    </div>
                  </div>
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="보낸 메시지" badge="MessageCellStyle-Send">
                  {/* ── 말풍선 디자이너 ── */}
                  <div className="mx-1 mb-3 rounded-xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                    <div className="px-3 py-2 bg-orange-50 border-b border-orange-100">
                      <p className="text-[11px] font-bold text-orange-600">🎨 말풍선 직접 제작</p>
                      <p className="text-[10px] text-orange-400 mt-0.5">PNG 생성 후 자동으로 미리보기에 반영됩니다</p>
                    </div>
                    <BubbleDesigner
                      side="send"
                      options={sendBubbleOpts}
                      onChange={(opts) => {
                        setSendBubbleOptsWithConfig(opts);
                        set("myBubbleBg")(opts.bgColor);
                      }}
                      onGenerate={handleSendBubbleGenerate}
                    />
                  </div>
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px] text-gray-400">또는 직접 이미지 파일을 업로드할 수 있습니다</span>
                  </div>
                  <ColorRow label="텍스트 컬러" value={config.myBubbleText} onChange={set("myBubbleText")} tooltip="-ios-text-color" />
                  <ColorRow label="읽지않은 메시지 숫자 컬러" value={config.myBubbleUnreadText} onChange={set("myBubbleUnreadText")} tooltip="-ios-unread-text-color" />
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="받은 메시지" badge="MessageCellStyle-Receive">
                  {/* ── 말풍선 디자이너 ── */}
                  <div className="mx-1 mb-3 rounded-xl border border-orange-100 bg-orange-50/40 overflow-hidden">
                    <div className="px-3 py-2 bg-orange-50 border-b border-orange-100">
                      <p className="text-[11px] font-bold text-orange-600">🎨 말풍선 직접 제작</p>
                      <p className="text-[10px] text-orange-400 mt-0.5">PNG 생성 후 자동으로 미리보기에 반영됩니다</p>
                    </div>
                    <BubbleDesigner
                      side="receive"
                      options={receiveBubbleOpts}
                      onChange={(opts) => {
                        setReceiveBubbleOptsWithConfig(opts);
                        set("otherBubbleBg")(opts.bgColor);
                      }}
                      onGenerate={handleReceiveBubbleGenerate}
                    />
                  </div>
                  <ColorRow label="텍스트 컬러" value={config.otherBubbleText} onChange={set("otherBubbleText")} tooltip="-ios-text-color" />
                  <ColorRow label="읽지않은 메시지 숫자 컬러" value={config.otherBubbleUnreadText} onChange={set("otherBubbleUnreadText")} tooltip="-ios-unread-text-color" />
                </Accordion>

              </>
            )}

            {activeEditorCategory === "chat-inputbar" && (
              <>
                <Accordion title="인풋바" badge="InputBarStyle-Chat">
                  <ColorRow label="인풋바 배경컬러" value={config.inputBarBg} onChange={set("inputBarBg")} tooltip="background-color" />
                  <ColorRow label="보내기 버튼 배경컬러" value={config.sendBtnBg} onChange={set("sendBtnBg")} tooltip="-ios-send-normal-background-color" />
                  <ColorRow label="보내기 버튼 아이콘 컬러" value={config.sendBtnIcon} onChange={set("sendBtnIcon")} tooltip="-ios-send-normal-foreground-color" />
                  <ColorRow label="보내기 버튼 프레스 컬러" value={config.sendBtnHighlightBg} onChange={set("sendBtnHighlightBg")} tooltip="-ios-send-highlighted-background-color" />
                  <ColorRow label="보내기 버튼 아이콘 프레스 컬러" value={config.sendBtnHighlightIcon} onChange={set("sendBtnHighlightIcon")} tooltip="-ios-send-highlighted-foreground-color" />
                  <ColorRow label="메뉴 버튼 아이콘 컬러" value={config.menuBtnColor} onChange={set("menuBtnColor")} tooltip="-ios-button-normal-foreground-color" />
                  <ColorRow label="메뉴 버튼 아이콘 프레스 컬러" value={config.menuBtnHighlightColor} onChange={set("menuBtnHighlightColor")} tooltip="-ios-button-highlighted-foreground-color" />
                  <ColorRow label="인풋바 텍스트 컬러" value={config.inputBarText} onChange={set("inputBarText")} tooltip="-ios-button-text-color" />
                  <ColorRow label="메뉴 버튼 / 인풋바 배경 컬러" value={config.inputFieldBg} onChange={set("inputFieldBg")} tooltip="-ios-button-normal-background-color" />
                  <MacInput label="투명도" hint="(-ios-button-normal-background-alpha)" value={config.menuBtnNormalBgAlpha} onChange={set("menuBtnNormalBgAlpha")} type="slider" />
                </Accordion>

              </>
            )}

            {activeEditorCategory === "tabbar" && (
              <>
                <Accordion title="상단바 타이틀" badge="HeaderStyle-Main">
                  <ColorRow label="타이틀 컬러" value={config.headerText} onChange={set("headerText")} tooltip="-ios-text-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5 mt-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>채팅 · 지금 · 쇼핑 · 더보기 탭과 공유되는 값입니다</span>
                  </div>
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="탭바 배경" badge="TabbarStyle">
                  <div className="mx-2.5 mb-2 flex rounded-lg overflow-hidden border border-gray-200">
                    <button
                      type="button"
                      onClick={() => { if (!config.darkMode) { hasChangesRef.current = true; setTabBgModeWithConfig("color"); } }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{
                        backgroundColor: tabBgMode === "color" ? "rgb(251,146,60)" : "#fff",
                        color: tabBgMode === "color" ? "#fff" : "#9ca3af",
                        opacity: config.darkMode ? 0.4 : 1,
                        cursor: config.darkMode ? "not-allowed" : "pointer",
                      }}
                    >
                      배경색
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (!config.darkMode) { hasChangesRef.current = true; setTabBgModeWithConfig("image"); } }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{
                        backgroundColor: tabBgMode === "image" ? "rgb(251,146,60)" : "#fff",
                        color: tabBgMode === "image" ? "#fff" : "#9ca3af",
                        opacity: config.darkMode ? 0.4 : 1,
                        cursor: config.darkMode ? "not-allowed" : "pointer",
                      }}
                    >
                      이미지 업로드
                    </button>
                  </div>
                  {config.darkMode && (
                    <div className="px-2.5 pb-1 flex items-center gap-1.5 mt-1 mb-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                      <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>다크 모드 사용 시 어플 시스템이 하단바 배경을 검정(#000000)으로 고정해요.</span>
                    </div>
                  )}
                  {tabBgMode === "color" ? (
                    <div style={{ pointerEvents: config.darkMode ? "none" : "auto", opacity: config.darkMode ? 0.4 : 1 }}>
                      <ColorRow label="배경 컬러" value={config.darkMode ? "#000000" : config.tabBarBg} onChange={set("tabBarBg")} tooltip="background-color" />
                    </div>
                  ) : (
                    <div style={{ pointerEvents: config.darkMode ? "none" : "auto", opacity: config.darkMode ? 0.4 : 1 }}>
                      <ImageUploadRow label="배경 이미지" tooltip="maintabBgImage.png" imgKey="tabBg" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                    </div>
                  )}
                </Accordion>
              </>
            )}

            {activeEditorCategory === "more-tab" && (
              <>
                <Accordion title="목록 텍스트" badge="MainViewStyle-Primary">
                  <ColorRow label="이름 / 아이콘" value={config.primaryText} onChange={(v) => { set("primaryText")(v); if (previewTab !== "more") setPreviewTab("more"); }} tooltip="-ios-text-color" />
                  <div className="px-2.5 pb-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgb(251,146,60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                    <span className="text-[10px]" style={{ color: 'rgb(251,146,60)' }}>친구탭, 채팅탭과 공유되는 값입니다</span>
                  </div>
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="헤더" badge="HeaderStyle-Main">
                  <ColorRow label="탭 텍스트" value={config.headerTabText} onChange={(v) => { set("headerTabText")(v); if (previewTab !== "more") setPreviewTab("more"); }} tooltip="-ios-tab-text-color" />
                </Accordion>
              </>
            )}

            {activeEditorCategory === "passcode" && (
              <>
                <Accordion title="잠금화면" badge="PasscodeStyle">
                  {/* 배경 모드 탭 */}
                  <div className="mx-2.5 mb-2 flex rounded-lg overflow-hidden border border-gray-200">
                    <button
                      type="button"
                      onClick={() => { hasChangesRef.current = true; setPasscodeBgModeWithConfig("color"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: passcodeBgMode === "color" ? "rgb(251,146,60)" : "#fff", color: passcodeBgMode === "color" ? "#fff" : "#9ca3af" }}
                    >
                      배경색
                    </button>
                    <button
                      type="button"
                      onClick={() => { hasChangesRef.current = true; setPasscodeBgModeWithConfig("image"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: passcodeBgMode === "image" ? "rgb(251,146,60)" : "#fff", color: passcodeBgMode === "image" ? "#fff" : "#9ca3af" }}
                    >
                      이미지 업로드
                    </button>
                  </div>
                  {passcodeBgMode === "color" ? (
                    <ColorRow label="배경색" value={config.passcodeBg} onChange={set("passcodeBg")} tooltip="background-color" />
                  ) : (
                    <div className="py-1.5 px-2.5 group">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-medium text-gray-500">배경 이미지</span>
                        <div className="flex items-center gap-3">
                          {imageUploads["passcodeBgImg"] && (
                            <button type="button" onClick={() => handleImageRemove("passcodeBgImg")}
                              className="text-[9px] text-red-500 font-medium px-2 py-0.5 bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                              삭제
                            </button>
                          )}
                          <label className="flex items-center cursor-pointer">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-gray-100 border border-transparent hover:border-orange-200 hover:bg-white hover:shadow-sm transition-all duration-200">
                              {imageUploads["passcodeBgImg"]
                                // eslint-disable-next-line @next/next/no-img-element
                                ? <img src={imageUploads["passcodeBgImg"]} alt="배경" className="w-full h-full object-cover" />
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(200,200,200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                  </svg>
                              }
                            </div>
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload("passcodeBgImg", f); e.target.value = ""; }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  <ColorRow label="타이틀 컬러" value={config.passcodeTitleText} onChange={set("passcodeTitleText")} tooltip="-ios-text-color" />
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="불릿 이미지" badge="PasscodeStyle">
                  {/* 선택 불릿 */}
                  <div className="text-[11px] px-2.5 mb-1.5 font-semibold" style={{color:"#6e6e73"}}>선택</div>
                  <div className="mx-2.5 mb-2 flex rounded-lg overflow-hidden border border-gray-200">
                    <button type="button" onClick={() => { hasChangesRef.current = true; setBulletFillModeWithConfig("color"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: bulletFillMode === "color" ? "rgb(251,146,60)" : "#fff", color: bulletFillMode === "color" ? "#fff" : "#9ca3af" }}>
                      색상
                    </button>
                    <button type="button" onClick={() => { hasChangesRef.current = true; setBulletFillModeWithConfig("image"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: bulletFillMode === "image" ? "rgb(251,146,60)" : "#fff", color: bulletFillMode === "image" ? "#fff" : "#9ca3af" }}>
                      이미지 업로드
                    </button>
                  </div>
                  {bulletFillMode === "color" ? (
                    <div className="flex items-center justify-between px-2.5 py-1 mb-2">
                      <span className="text-[12px] font-medium text-gray-500">불릿 색상</span>
                      <div className="flex items-center gap-2">
                        <label className="relative cursor-pointer">
                          <input type="color" value={bulletFillColor}
                            onChange={(e) => { hasChangesRef.current = true; setBulletFillColorWithConfig(e.target.value); triggerDebounce(); }}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                          <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ backgroundColor: bulletFillColor }} />
                        </label>
                        <span className="text-[11px] font-mono text-gray-400 w-[56px] uppercase">{bulletFillColor}</span>
                      </div>
                    </div>
                  ) : (
                    <ImageUploadRow label="선택 불릿 이미지" tooltip="passcodeImgCodeSelected@3x.png" imgKey="bulletFill" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  )}

                  {/* 일반 불릿 */}
                  <div className="text-[11px] px-2.5 mt-3 mb-1.5 font-semibold" style={{color:"#6e6e73"}}>일반</div>
                  <div className="mx-2.5 mb-2 flex rounded-lg overflow-hidden border border-gray-200">
                    <button type="button" onClick={() => { hasChangesRef.current = true; setBulletEmptyModeWithConfig("default"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: bulletEmptyMode === "default" ? "rgb(251,146,60)" : "#fff", color: bulletEmptyMode === "default" ? "#fff" : "#9ca3af" }}>
                      기본
                    </button>
                    <button type="button" onClick={() => { hasChangesRef.current = true; setBulletEmptyModeWithConfig("color"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: bulletEmptyMode === "color" ? "rgb(251,146,60)" : "#fff", color: bulletEmptyMode === "color" ? "#fff" : "#9ca3af" }}>
                      색상
                    </button>
                    <button type="button" onClick={() => { hasChangesRef.current = true; setBulletEmptyModeWithConfig("image"); }}
                      className="flex-1 py-1.5 text-[11px] font-semibold transition-colors"
                      style={{ backgroundColor: bulletEmptyMode === "image" ? "rgb(251,146,60)" : "#fff", color: bulletEmptyMode === "image" ? "#fff" : "#9ca3af" }}>
                      이미지 업로드
                    </button>
                  </div>
                  {bulletEmptyMode === "color" && (
                    <div className="flex items-center justify-between px-2.5 py-1">
                      <span className="text-[12px] font-medium text-gray-500">불릿 색상</span>
                      <div className="flex items-center gap-2">
                        <label className="relative cursor-pointer">
                          <input type="color" value={bulletEmptyColor}
                            onChange={(e) => { hasChangesRef.current = true; setBulletEmptyColorWithConfig(e.target.value); triggerDebounce(); }}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                          <div className="w-5 h-5 rounded-full ring-1 ring-black/10 shadow-sm" style={{ backgroundColor: bulletEmptyColor }} />
                        </label>
                        <span className="text-[11px] font-mono text-gray-400 w-[56px] uppercase">{bulletEmptyColor}</span>
                      </div>
                    </div>
                  )}
                  {bulletEmptyMode === "image" && (
                    <ImageUploadRow label="일반 불릿 이미지" tooltip="passcodeImgCode@3x.png" imgKey="bulletEmpty" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  )}
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="키패드" badge="PasscodeStyle">
                  <ColorRow label="배경색" value={config.passcodeKeypadBg} onChange={set("passcodeKeypadBg")} tooltip="-ios-keypad-background-color" />
                  <ColorRow label="숫자 컬러" value={config.passcodeKeypadText} onChange={set("passcodeKeypadText")} tooltip="-ios-keypad-text-normal-color" />
                  {/* 프레스 이미지 스위치 */}
                  <div className="flex items-center justify-between px-2.5 py-1 mb-1">
                    <span className="text-[12px] font-medium text-gray-500">프레스 이미지</span>
                    <button
                      type="button"
                      onClick={() => { hasChangesRef.current = true; setKeypadPressedOnWithConfig(!keypadPressedOn); }}
                      style={{
                        width: 36, height: 20, borderRadius: 10,
                        backgroundColor: keypadPressedOn ? 'rgb(74,123,247)' : '#d1d5db',
                        position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 2,
                        left: keypadPressedOn ? 18 : 2,
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                  {keypadPressedOn && (
                    <ImageUploadRow label="프레스 이미지" tooltip="passcodeKeypadPressed@3x.png" imgKey="passcodeKeypadPressed" imageUploads={imageUploads} onUpload={handleImageUpload} onRemove={handleImageRemove} />
                  )}
                </Accordion>
              </>
            )}

            {activeEditorCategory === "notification" && (
              <>
                <Accordion title="메시지 알림 배너" badge="BackgroundStyle-MessageNotificationBar">
                  <ColorRow label="메시지 알림 배너 - 배경 컬러" value={config.notifBannerBg} onChange={set("notifBannerBg")} tooltip="background-color" />
                  <ColorRow label="메시지 알림 배너 - 이름 컬러" value={config.notifBannerNameText} onChange={set("notifBannerNameText")} tooltip="-ios-text-color" />
                  <ColorRow label="메시지 알림 배너 - 텍스트 컬러" value={config.notifBannerMsgText} onChange={set("notifBannerMsgText")} tooltip="-ios-text-color" />
                </Accordion>
                <hr className="border-t border-gray-300 mx-2 mb-4" />
                <Accordion title="전달완료 배너" badge="BackgroundStyle-DirectShareBar">
                  <ColorRow label="전달완료 배너 - 배경 컬러" value={config.directShareBg} onChange={set("directShareBg")} tooltip="background-color" />
                  <ColorRow label="전달완료 배너 - 이름 컬러" value={config.directShareNameText} onChange={set("directShareNameText")} tooltip="-ios-text-color" />
                  <ColorRow label="전달완료 배너 - 텍스트 컬러" value={config.directShareMsgText} onChange={set("directShareMsgText")} tooltip="-ios-text-color" />
                </Accordion>
              </>
            )}
          </div>
        </aside>
      </div>

      <style jsx global>{``}</style>

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
                  hasChangesRef.current = false;
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

function generateCSS(config: ThemeConfig, imageUploads: Record<string, string> = {}, passcodeBgMode: "color" | "image" = "color", bulletEmptyMode: "default" | "color" | "image" = "default", bulletFillMode: "color" | "image" = "color", keypadPressedOn = true, tabBgMode: "color" | "image" = "color", defaultProfileOn = false, hasCharacter = false): string {
  const img = (key: string, filename: string) =>
    imageUploads[key] ? `\n    -ios-background-image: '${filename}';` : "";

  return `/*
 Manifest
 */

ManifestStyle
{
    -kakaotalk-theme-name: '${config.name}';
    -kakaotalk-theme-url: '${config.themeUrl}';
    -kakaotalk-author-name: '${config.authorName}';
    -kakaotalk-theme-id: '${config.packageId}';${config.darkMode ? "\n    -kakaotalk-theme-style: 'dark';" : ""}
}


/*
 TabBar Style
 */

TabBarStyle-Main
{
    ${[
      tabBgMode === "image" && imageUploads["tabBg"] ? `-ios-background-image: 'maintabBgImage@3x.png';` : `background-color: ${config.tabBarBg};`,
      imageUploads["tabFriendsNormal"] ? `-ios-friends-normal-icon-image: 'maintabIcoFriends@2x.png';` : "",
      imageUploads["tabFriendsSelected"] ? `-ios-friends-selected-icon-image: 'maintabIcoFriendsSelected@2x.png';` : "",
      imageUploads["tabChatNormal"] ? `-ios-chats-normal-icon-image: 'maintabIcoChats@2x.png';` : "",
      imageUploads["tabChatSelected"] ? `-ios-chats-selected-icon-image: 'maintabIcoChatsSelected@2x.png';` : "",
      imageUploads["tabOpenNormal"] ? `-ios-now-normal-icon-image: 'maintabIcoNow@2x.png';` : "",
      imageUploads["tabOpenSelected"] ? `-ios-now-selected-icon-image: 'maintabIcoNowSelected@2x.png';` : "",
      imageUploads["tabShopNormal"] ? `-ios-shopping-normal-icon-image: 'maintabIcoShopping@2x.png';` : "",
      imageUploads["tabShopSelected"] ? `-ios-shopping-selected-icon-image: 'maintabIcoShoppingSelected@2x.png';` : "",
      imageUploads["tabMoreNormal"] ? `-ios-more-normal-icon-image: 'maintabIcoMore@2x.png';` : "",
      imageUploads["tabMoreSelected"] ? `-ios-more-selected-icon-image: 'maintabIcoMoreSelected@2x.png';` : "",
      `-ios-icon-normal-color: ${config.tabBarIcon};`,
      `-ios-icon-selected-color: ${config.tabBarSelectedIcon};`,
    ].filter(Boolean).join("\n    ")}
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
{${(() => {
  if (!defaultProfileOn) return '';
  const imgs = [
    imageUploads['profileImg01'] ? `'profileImg01@3x.png'` : '',
    imageUploads['profileImg02'] ? `'profileImg02@3x.png'` : '',
    imageUploads['profileImg03'] ? `'profileImg03@3x.png'` : '',
  ].filter(Boolean);
  return imgs.length > 0 ? `\n    -ios-profile-images: ${imgs.join(' ')};` : '';
})()}
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
{
    -ios-background-image: 'chatroomBubbleSend01.png' ${hasCharacter ? '15px 55px' : '15px 15px'};
    -ios-selected-background-image: 'chatroomBubbleSend01.png' ${hasCharacter ? '15px 55px' : '15px 5px'};
    -ios-group-background-image: 'chatroomBubbleSend02.png' 15px 15px;
    -ios-group-selected-background-image: 'chatroomBubbleSend02.png' 15px 15px;
    -ios-title-edgeinsets: ${hasCharacter ? '47.5px 12px 7px 52px' : '10px 12px 7px 20px'};
    -ios-group-title-edgeinsets: ${hasCharacter ? '8px 12px 7px 52px' : '8px 12px 7px 20px'};

    -ios-background-color: ${config.myBubbleBg};
    -ios-text-color: ${config.myBubbleText};
    -ios-selected-text-color: ${config.myBubbleSelectedText};
    -ios-unread-text-color: ${config.myBubbleUnreadText};
}

MessageCellStyle-Receive
{
    -ios-background-image: 'chatroomBubbleReceive01.png' 22px 15px;
    -ios-selected-background-image: 'chatroomBubbleReceive01.png' 22px 15px;
    -ios-group-background-image: 'chatroomBubbleReceive02.png' 22px 15px;
    -ios-group-selected-background-image: 'chatroomBubbleReceive02.png' 22px 15px;
    -ios-title-edgeinsets: 8px 19.5px 7px 12px;
    -ios-group-title-edgeinsets: 8px 19.5px 7px 12px;

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
    background-color: ${config.passcodeBg};${passcodeBgMode === "image" ? img("passcodeBgImg", "passcodeBgImage@2x.png") : ""}
}

LabelStyle-PasscodeTitle
{
    -ios-text-color: ${config.passcodeTitleText};
}

PasscodeStyle
{${imageUploads["bulletEmpty"] ? `
     -ios-bullet-first-image: 'passcodeImgCode@3x.png';
     -ios-bullet-second-image: 'passcodeImgCode@3x.png';
     -ios-bullet-third-image: 'passcodeImgCode@3x.png';
     -ios-bullet-fourth-image: 'passcodeImgCode@3x.png';` : ""}${imageUploads["bulletFill"] ? `
     -ios-bullet-selected-first-image: 'passcodeImgCodeSelected@3x.png';
     -ios-bullet-selected-second-image: 'passcodeImgCodeSelected@3x.png';
     -ios-bullet-selected-third-image: 'passcodeImgCodeSelected@3x.png';
     -ios-bullet-selected-fourth-image: 'passcodeImgCodeSelected@3x.png';` : ""}

    -ios-keypad-background-color: ${config.passcodeKeypadBg};
    -ios-keypad-text-normal-color: ${config.passcodeKeypadText};
    ${(keypadPressedOn && imageUploads["passcodeKeypadPressed"]) ? `-ios-keypad-number-highlighted-image: 'passcodeKeypadPressed@3x.png';` : ""}
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

