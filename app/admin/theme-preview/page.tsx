"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PreviewMockup } from "@/stories/PreviewMockup";
import { PreviewNewsMockup } from "@/stories/PreviewNewsMockup";
import { PreviewChatRoomMockup } from "@/stories/PreviewChatRoomMockup";
import { PreviewChatRoomInputMockup } from "@/stories/PreviewChatRoomInputMockup";
import { useThemeStore } from "@/stories/useThemeStore";

type ThemeConfig = Record<string, unknown>;
type ImageData = Record<string, string>;

type ScreenTab =
  | "friends"
  | "chat"
  | "openchat"
  | "shopping"
  | "more"
  | "chatroom"
  | "passcode"
  | "notification";

const TABS: { key: ScreenTab; label: string; emoji: string }[] = [
  { key: "friends",      label: "친구",    emoji: "👥" },
  { key: "chat",         label: "채팅",    emoji: "💬" },
  { key: "openchat",     label: "지금",    emoji: "🌐" },
  { key: "shopping",     label: "쇼핑",    emoji: "🛍" },
  { key: "more",         label: "더보기",  emoji: "⋯" },
  { key: "chatroom",     label: "채팅방",  emoji: "📩" },
  { key: "passcode",     label: "암호",    emoji: "🔒" },
  { key: "notification", label: "알림",    emoji: "🔔" },
];

const SCREEN_MAP: Record<ScreenTab, "FRIENDS" | "CHATS" | "OPENCHATS" | "SHOPPING" | "MORE" | "CHATROOM" | "PASSCODE"> = {
  friends:      "FRIENDS",
  chat:         "CHATS",
  openchat:     "OPENCHATS",
  shopping:     "SHOPPING",
  more:         "MORE",
  chatroom:     "CHATROOM",
  passcode:     "PASSCODE",
  notification: "CHATROOM",
};

function AdminThemePreviewInner() {
  const searchParams = useSearchParams();
  const optionId = searchParams.get("optionId");
  const pending   = searchParams.get("pending") === "1";

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ScreenTab>("friends");
  const [mainBgImageUrl, setMainBgImageUrl] = useState<string | undefined>(undefined);
  const [notifBannerBg,  setNotifBannerBg]  = useState<string | undefined>(undefined);
  const [notifNameColor, setNotifNameColor] = useState<string | undefined>(undefined);
  const [notifMsgColor,  setNotifMsgColor]  = useState<string | undefined>(undefined);
  const [directShareBg,  setDirectShareBg]  = useState<string | undefined>(undefined);
  const [directShareNameColor, setDirectShareNameColor] = useState<string | undefined>(undefined);
  const [directShareMsgColor,  setDirectShareMsgColor]  = useState<string | undefined>(undefined);
  const [meta, setMeta] = useState<{ themeTitle: string; optionName: string; myThemeName: string | null; os: string } | null>(null);

  const setTheme        = useThemeStore((s) => s.setTheme);
  const setCurrentScreen = useThemeStore((s) => s.setCurrentScreen);

  // 탭 전환 시 store 화면도 동기화
  useEffect(() => {
    if (activeTab !== "notification") {
      setCurrentScreen(SCREEN_MAP[activeTab]);
    }
  }, [activeTab, setCurrentScreen]);

  useEffect(() => {
    if (!optionId) { setError("optionId가 없습니다."); setLoading(false); return; }

    fetch(`/api/admin/themes/option-config?optionId=${optionId}${pending ? "&pending=1" : ""}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json() as { error: string }).error ?? "오류");
        return res.json() as Promise<{
          configJson: ThemeConfig; imageData: ImageData;
          os: string; optionName: string; themeTitle: string; myThemeName: string | null;
        }>;
      })
      .then((data) => {
        const c   = data.configJson ?? {};
        const img = data.imageData  ?? {};

        setTheme({
          global: {
            bodyBg:        (c.bodyBg        as string) ?? "#F5F5F5",
            headerBg:      (c.headerBg      as string) ?? "#FEE500",
            headerText:    (c.headerText    as string) ?? "#3A1D1D",
            primaryText:   (c.primaryText   as string) ?? "#191919",
            descText:      (c.descText      as string) ?? "#9E9E9E",
            headerTabText: (c.headerTabText as string) ?? "#9E9E9E",
          },
          tabBar: {
            activeIconColor:    (c.tabBarSelectedIcon as string) ?? "#3A1D1D",
            inactiveIconColor:  (c.tabBarIcon         as string) ?? "#9E9E9E",
            backgroundColor:    (c.tabBarBg           as string) ?? "#FFFFFF",
            backgroundImageUrl:  img["tabBg"] || undefined,
          },
          friendsTab: {
            updateSectionBg:  "#F2F2F7",
            listDescTextColor:(c.friendsListDescText as string) ?? "#9E9E9E",
            selectedBg:       (c.friendsSelectedBg   as string) ?? "#F2F2F7",
            selectedBgAlpha:  (c.selectedBgAlpha     as string) ?? "1.0",
            nameTextColor:    (c.friendsNameText     as string) ?? "#191919",
          },
          chatsTab: {
            filterChipBg:      (c.bodyBg                       as string) ?? "#F5F5F5",
            unreadBadgeBg:     (c.unreadCountColor             as string) ?? "#FF3B30",
            lastMsgColor:      (c.chatListLastMsgText          as string) ?? "#9E9E9E",
            namePressColor:    (c.chatListHighlightText        as string) ?? "#3A1D1D",
            lastMsgPressColor: (c.chatListLastMsgHighlightText as string) ?? "#9E9E9E",
            selectedBg:        (c.friendsSelectedBg            as string) ?? "#F2F2F7",
            selectedBgAlpha:   (c.selectedBgAlpha              as string) ?? "1.0",
          },
          openChatsTab: { bannerBackgroundColor: (c.openchatBg as string) ?? "#F5F5F5" },
          chatRoom: {
            backgroundColor:         (c.chatBg                as string) ?? "#B2C7D9",
            friendBubbleBg:          (c.otherBubbleBg         as string) ?? "#FFFFFF",
            myBubbleBg:              (c.myBubbleBg            as string) ?? "#FEE500",
            inputBarBg:              (c.inputBarBg            as string) ?? "#FFFFFF",
            inputBarText:            (c.inputBarText          as string) ?? "#8E8E93",
            inputFieldBg:            (c.inputFieldBg          as string) ?? "#F2F2F7",
            inputFieldBgAlpha:        parseFloat((c.menuBtnNormalBgAlpha as string) ?? "0.04"),
            sendButtonBg:            (c.sendBtnBg             as string) ?? "#FEE500",
            sendButtonFg:            (c.sendBtnIcon           as string) ?? "#3A1D1D",
            sendButtonHighlightBg:   (c.sendBtnHighlightBg   as string) ?? "#E6CE00",
            sendButtonHighlightFg:   (c.sendBtnHighlightIcon as string) ?? "#3A1D1D",
            menuButtonFg:            (c.menuBtnColor          as string) ?? "#9E9E9E",
            menuButtonHighlightFg:   (c.menuBtnHighlightColor as string) ?? "#6E6E73",
            bgImageUrl:               img["chatroomBg"] || "",
            myBubbleText:            (c.myBubbleText           as string | undefined),
            myBubbleSelectedText:    (c.myBubbleSelectedText   as string | undefined),
            myBubbleUnreadText:      (c.myBubbleUnreadText     as string | undefined),
            friendBubbleText:        (c.otherBubbleText        as string | undefined),
            friendBubbleSelectedText:(c.otherBubbleSelectedText as string | undefined),
            friendBubbleUnreadText:  (c.otherBubbleUnreadText  as string | undefined),
            bubbleSend1Url:           img["bubbleSend1"]          || "",
            bubbleSend1SelectedUrl:   img["bubbleSend1Selected"]  || "",
            bubbleSend2Url:           img["bubbleSend2"]          || "",
            bubbleReceive1Url:        img["bubbleReceive1"]       || "",
            bubbleReceive1SelectedUrl:img["bubbleReceive1Selected"] || "",
            bubbleReceive2Url:        img["bubbleReceive2"]       || "",
          },
          passcode: {
            backgroundColor: (c.passcodeBg         as string) ?? "#F5F5F5",
            titleColor:      (c.passcodeTitleText  as string) ?? "#191919",
            keypadTextColor: (c.passcodeKeypadText as string) ?? "#191919",
            keypadBg:        (c.passcodeKeypadBg   as string | undefined),
            bgImageUrl:       img["passcodeBgImg"] || "",
            bulletEmptyColor: c.uiBulletEmptyMode === "color" ? (c.uiBulletEmptyColor as string | undefined) : undefined,
            bulletFillColor:  c.uiBulletFillMode  === "color" ? (c.uiBulletFillColor  as string | undefined) : undefined,
            bulletEmptyDefault: c.uiBulletEmptyMode === "default",
            bulletEmptyImageUrl: c.uiBulletEmptyMode === "image" ? (img["bulletEmpty"] || undefined) : undefined,
            bulletFillImageUrl:  c.uiBulletFillMode  === "image" ? (img["bulletFill"]  || undefined) : undefined,
            keypadPressedImageUrl: img["passcodeKeypadPressed"] || undefined,
            keypadPressedOn: !!(c.uiKeypadPressedOn),
          },
        });

        setMainBgImageUrl(img["mainBg"] || undefined);

        // 알림 배너 색상
        setNotifBannerBg( (c.notifBannerBg       as string | undefined));
        setNotifNameColor((c.notifBannerNameText  as string | undefined));
        setNotifMsgColor( (c.notifBannerMsgText   as string | undefined));
        setDirectShareBg( (c.directShareBg        as string | undefined));
        setDirectShareNameColor((c.directShareNameText as string | undefined));
        setDirectShareMsgColor( (c.directShareMsgText  as string | undefined));

        setMeta({ themeTitle: data.themeTitle, optionName: data.optionName, myThemeName: data.myThemeName, os: data.os });
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "불러오기 실패"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionId, pending]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f5f7" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-black/10 border-t-black/50 animate-spin" />
          <span className="text-[13px]" style={{ color: "#8e8e93" }}>테마 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f5f7" }}>
        <div className="text-center">
          <p className="text-[15px] font-semibold" style={{ color: "#ff3b30" }}>오류</p>
          <p className="text-[13px] mt-1" style={{ color: "#8e8e93" }}>{error}</p>
        </div>
      </div>
    );
  }

  // 탭별 목업 렌더
  const renderMockups = () => {
    switch (activeTab) {
      case "friends":
        return (
          <div className="flex items-start gap-8 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>친구 목록</span>
              <PreviewMockup disableTabNavigation mainBgImageUrl={mainBgImageUrl} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>뉴스 홈</span>
              <PreviewNewsMockup disableTabNavigation mainBgImageUrl={mainBgImageUrl} />
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="flex items-start gap-8 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>채팅 목록</span>
              <PreviewMockup disableTabNavigation mainBgImageUrl={mainBgImageUrl} />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>채팅방</span>
              <PreviewChatRoomMockup />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>입력바 / 버튼</span>
              <PreviewChatRoomInputMockup />
            </div>
          </div>
        );
      case "notification":
        return (
          <div className="flex items-start gap-8 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>알림 배너</span>
              <PreviewChatRoomMockup
                hideContent
                bannerType="notif"
                notifBannerBg={notifBannerBg}
                notifBannerNameColor={notifNameColor}
                notifBannerMsgColor={notifMsgColor}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[11px] font-medium" style={{ color: "#8e8e93" }}>다이렉트 쉐어</span>
              <PreviewChatRoomMockup
                hideContent
                bannerType="directShare"
                directShareBg={directShareBg}
                directShareNameColor={directShareNameColor}
                directShareMsgColor={directShareMsgColor}
              />
            </div>
          </div>
        );
      default:
        // openchat, shopping, more, chatroom, passcode
        return (
          <div className="flex flex-col items-center gap-2">
            <PreviewMockup disableTabNavigation mainBgImageUrl={mainBgImageUrl} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f7" }}>
      {/* 상단 정보 바 */}
      <div
        className="flex items-center gap-3 px-5 py-2.5 shrink-0"
        style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[14px] font-semibold truncate" style={{ color: "#1c1c1e" }}>
            {meta?.themeTitle}
          </p>
          <p className="text-[11px]" style={{ color: "#8e8e93" }}>
            옵션: {meta?.optionName}
            {meta?.myThemeName && ` · 내 테마: ${meta.myThemeName}`}
            {" · "}{meta?.os === "ios" ? "iOS" : "Android"}
            {pending && (
              <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(74,123,247,0.12)", color: "rgb(74,123,247)" }}>
                변경 신청 내용
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => window.close()}
          className="shrink-0 text-[12px] px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(0,0,0,0.06)", color: "#3c3c43" }}
        >
          닫기
        </button>
      </div>

      {/* 화면 탭 버튼 */}
      <div
        className="flex items-center gap-1 px-5 py-2 shrink-0 overflow-x-auto"
        style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: activeTab === t.key ? "rgb(74,123,247)" : "transparent",
              color: activeTab === t.key ? "#fff" : "#6b7280",
              border: activeTab === t.key ? "none" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 목업 미리보기 영역 */}
      <div className="flex-1 flex items-start justify-center py-10 px-4 overflow-auto">
        {renderMockups()}
      </div>
    </div>
  );
}

export default function AdminThemePreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f5f7" }}>
        <div className="w-8 h-8 rounded-full border-[3px] border-black/10 border-t-black/50 animate-spin" />
      </div>
    }>
      <AdminThemePreviewInner />
    </Suspense>
  );
}
