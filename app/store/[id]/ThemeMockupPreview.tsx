"use client";

import { useState } from "react";
import { FriendsScreen, ScreenThemeConfig } from "@/stories/preview/FriendsScreen";
import { MainScreen } from "@/stories/preview/MainScreen";
import { OpenChatsScreen } from "@/stories/preview/OpenChatsScreen";
import { ShoppingScreen } from "@/stories/preview/ShoppingScreen";
import { MoreScreen } from "@/stories/preview/MoreScreen";
import { ChatRoomScreen } from "@/stories/preview/ChatRoomScreen";
import { PasscodeScreen } from "@/stories/preview/PasscodeScreen";
import { TabBar } from "@/stories/preview/TabBar";
import { frameStyle } from "@/stories/preview/styles";

export type ThemeOptionData = {
    id: string;
    name: string;
    os: string;
    configJson: Record<string, unknown> | null;
    imageData: Record<string, string> | null;
};

// configJson + imageData → ScreenThemeConfig 변환
function buildScreenConfig(
    configJson: Record<string, unknown> | null,
    imageData: Record<string, string> | null
): ScreenThemeConfig {
    const cfg = configJson ?? {};
    const img = imageData ?? {};

    const str = (key: string, fallback: string) =>
        typeof cfg[key] === "string" ? (cfg[key] as string) : fallback;
    const bool = (key: string, fallback: boolean) =>
        typeof cfg[key] === "boolean" ? (cfg[key] as boolean) : fallback;

    return {
        bodyBg: str("bodyBg", "#F5F5F5"),
        headerBg: str("headerBg", "#FEE500"),
        headerText: str("headerText", "#3A1D1D"),
        primaryText: str("primaryText", "#191919"),
        descText: str("descText", "#9E9E9E"),
        tabBarBg: str("tabBarBg", "#FFFFFF"),
        tabBarIcon: str("tabBarInactiveIconColor", "#9E9E9E"),
        tabBarSelectedIcon: str("tabBarActiveIconColor", "#3A1D1D"),
        friendsSelectedBg: str("friendsSelectedBg", "#F2F2F7"),
        chatBg: str("chatBg", "#B2C7D9"),
        otherBubbleBg: str("otherBubbleBg", "#FFFFFF"),
        myBubbleBg: str("myBubbleBg", "#FEE500"),
        inputBarBg: str("inputBarBg", "#FFFFFF"),
        sendBtnBg: str("sendButtonBg", "#FEE500"),
        passcodeBg: str("passcodeBg", "#F5F5F5"),
        passcodeKeypadBg: str("passcodeKeypadBg", "rgba(0,0,0,0.06)"),
        passcodeTitleText: str("passcodeTitleColor", "#191919"),
        passcodeKeypadText: str("passcodeKeypadTextColor", "#191919"),
        unreadCountColor: "#FF3B30",
        openchatBg: str("openChatsBannerBg", "#F5F5F5"),
        mainBgImageUrl: typeof img["chatroomBg"] === "string" ? img["chatroomBg"] : undefined,
        chatListLastMsgText: str("chatsLastMsgColor", "#9E9E9E"),
        chatListNamePressColor: str("chatsNamePressColor", "#3A1D1D"),
        chatListLastMsgPressColor: str("chatsLastMsgPressColor", "#9E9E9E"),
        chatListSelectedBg: str("chatsSelectedBg", "#F2F2F7"),
        chatListSelectedBgAlpha: str("chatsSelectedBgAlpha", "1.0"),
        friendsListDescText: str("friendsListDescTextColor", "#9E9E9E"),
        friendsNameText: str("friendsNameTextColor", "#191919"),
        friendsSelectedBgAlpha: str("friendsSelectedBgAlpha", "1.0"),
        moreTabTextColor: str("headerTabText", "#9E9E9E"),
        passcodeBgImageUrl: typeof img["passcodeBg"] === "string" ? img["passcodeBg"] : undefined,
        bulletEmptyColor: str("bulletEmptyColor", "#191919"),
        bulletFillColor: str("bulletFillColor", "#4a7bf7"),
        bulletEmptyDefault: bool("bulletEmptyDefault", false),
        bulletEmptyImageUrl: typeof img["bulletEmpty"] === "string" ? img["bulletEmpty"] : undefined,
        bulletFillImageUrl: typeof img["bulletFill"] === "string" ? img["bulletFill"] : undefined,
        passcodeKeypadPressedImageUrl: typeof img["keypadPressed"] === "string" ? img["keypadPressed"] : undefined,
        passcodeKeypadPressedOn: bool("passcodeKeypadPressedOn", false),
        chatRoomNameTimeColor: str("chatRoomNameTimeColor", "#9E9E9E"),
        bubbleSend1CharacterUrl: typeof img["character"] === "string" ? img["character"] : undefined,
    };
}

// 폰 프레임이 있는 목업
// 내부 화면 원본 크기: 368×699 (PreviewMockup 기준)
// 폰 프레임 표시 크기: 288×547 → scale = 288/368 ≈ 0.7826
const PHONE_W = 288;
const PHONE_H = 547;
const ORIG_W = 368;
const ORIG_H = 699;
const SCALE = PHONE_W / ORIG_W;

function PhoneMockup({ config, screenKey }: { config: ScreenThemeConfig; screenKey: string }) {
    const showTabBar = ["FRIENDS", "CHATS", "OPENCHATS", "SHOPPING", "MORE"].includes(screenKey);

    const renderScreen = () => {
        switch (screenKey) {
            case "FRIENDS":   return <FriendsScreen config={config} />;
            case "CHATS":     return <MainScreen config={config} />;
            case "OPENCHATS": return <OpenChatsScreen config={config} />;
            case "SHOPPING":  return <ShoppingScreen config={config} />;
            case "MORE":      return <MoreScreen config={config} />;
            case "CHATROOM":  return <ChatRoomScreen config={config} />;
            case "PASSCODE":  return <PasscodeScreen config={config} />;
            default:          return <MainScreen config={config} />;
        }
    };

    return (
        <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, flexShrink: 0 }}>
            {/* 폰 외곽 */}
            <div style={{
                position: "absolute", inset: 0, borderRadius: 24,
                border: "3px solid #27272a",
                backgroundColor: "#000",
                boxShadow: "0 16px 48px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.15) inset",
                overflow: "hidden",
            }}>
                {/* 노치 */}
                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 72, height: 18, borderRadius: 999, backgroundColor: "#111827", zIndex: 20 }} />

                {/* 스케일 다운 래퍼: 원본 크기로 렌더링 후 transform으로 축소 */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: ORIG_W,
                    height: ORIG_H,
                    transform: `scale(${SCALE})`,
                    transformOrigin: "top left",
                    ...(config.mainBgImageUrl && screenKey === "CHATROOM" ? {
                        backgroundImage: `url(${config.mainBgImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center top",
                    } : {}),
                }}>
                    <div style={{
                        ...frameStyle,
                        width: ORIG_W,
                        height: ORIG_H,
                        borderRadius: 0,
                        border: "none",
                        boxShadow: "none",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "transparent",
                    }}>
                        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>{renderScreen()}</div>
                        {showTabBar && <TabBar disabled />}
                    </div>
                </div>
            </div>
            {/* 사이드 버튼 */}
            <div style={{ position: "absolute", right: -4, top: 72, width: 4, height: 35, borderRadius: 4, backgroundColor: "#3f3f46" }} />
            <div style={{ position: "absolute", left: -4, top: 66, width: 4, height: 23, borderRadius: 4, backgroundColor: "#3f3f46" }} />
            <div style={{ position: "absolute", left: -4, top: 98, width: 4, height: 23, borderRadius: 4, backgroundColor: "#3f3f46" }} />
        </div>
    );
}

const SCREENS: { key: string; label: string }[] = [
    { key: "FRIENDS",   label: "친구탭" },
    { key: "CHATS",     label: "채팅탭" },
    { key: "CHATROOM",  label: "채팅방" },
    { key: "OPENCHATS", label: "오픈채팅탭" },
    { key: "SHOPPING",  label: "쇼핑탭" },
    { key: "MORE",      label: "더보기탭" },
    { key: "PASSCODE",  label: "암호화면" },
];

export default function ThemeMockupPreview({ options }: { options: ThemeOptionData[] }) {
    // 내 테마 방식(configJson이 있는) 옵션만 필터
    const previewableOptions = options.filter(o => o.configJson !== null);

    const [selectedOptionId, setSelectedOptionId] = useState(previewableOptions[0]?.id ?? "");

    if (previewableOptions.length === 0) return null;

    const selected = previewableOptions.find(o => o.id === selectedOptionId) ?? previewableOptions[0];
    const screenConfig = buildScreenConfig(selected.configJson, selected.imageData);

    return (
        <div className="flex flex-col gap-8 mt-12 pt-10" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[17px] font-bold" style={{ color: "#1a1a1a" }}>테마 미리보기</h3>
                    <p className="text-[13px]" style={{ color: "#aaa" }}>실제 어플 화면을 미리 확인해보세요</p>
                </div>
                {/* 옵션이 여러 개면 탭 선택 */}
                {previewableOptions.length > 1 && (
                    <div className="flex gap-2 flex-wrap justify-end">
                        {previewableOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOptionId(opt.id)}
                                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                                style={{
                                    background: selectedOptionId === opt.id ? "rgb(255,149,0)" : "rgba(0,0,0,0.05)",
                                    color: selectedOptionId === opt.id ? "#fff" : "#888",
                                }}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 목업 스크롤 영역 */}
            <div
                className="flex gap-5 overflow-x-auto pb-4"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}
            >
                {SCREENS.map(screen => (
                    <div key={screen.key} className="flex flex-col items-center gap-2 shrink-0">
                        <span className="text-[11px] font-semibold" style={{ color: "#bbb" }}>{screen.label}</span>
                        <PhoneMockup config={screenConfig} screenKey={screen.key} />
                    </div>
                ))}
            </div>
        </div>
    );
}
