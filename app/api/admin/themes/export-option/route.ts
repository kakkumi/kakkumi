import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

// configJson 타입 (useThemeStore 구조)
type ThemeConfig = {
    global?: {
        bodyBg?: string; headerBg?: string; headerText?: string;
        primaryText?: string; descText?: string; headerTabText?: string;
    };
    tabBar?: { activeIconColor?: string; inactiveIconColor?: string; backgroundColor?: string };
    friendsTab?: {
        updateSectionBg?: string; listDescTextColor?: string; selectedBg?: string;
        selectedBgAlpha?: string; nameTextColor?: string;
    };
    chatsTab?: {
        filterChipBg?: string; unreadBadgeBg?: string; lastMsgColor?: string;
        namePressColor?: string; lastMsgPressColor?: string;
        selectedBg?: string; selectedBgAlpha?: string;
    };
    openChatsTab?: { bannerBackgroundColor?: string };
    chatRoom?: {
        backgroundColor?: string; friendBubbleBg?: string; myBubbleBg?: string;
        inputBarBg?: string; inputBarText?: string; inputFieldBg?: string;
        inputFieldBgAlpha?: number; sendButtonBg?: string; sendButtonFg?: string;
        sendButtonHighlightBg?: string; sendButtonHighlightFg?: string;
        menuButtonFg?: string; menuButtonHighlightFg?: string;
        myBubbleText?: string; myBubbleSelectedText?: string; myBubbleUnreadText?: string;
        friendBubbleText?: string; friendBubbleSelectedText?: string; friendBubbleUnreadText?: string;
    };
    passcode?: {
        backgroundColor?: string; titleColor?: string; keypadTextColor?: string;
        keypadBg?: string; bulletEmptyColor?: string; bulletFillColor?: string;
    };
};
type ImageData = Record<string, string>;

function c(val?: string, fallback = "#000000"): string {
    return val ?? fallback;
}

function generateCSS(cfg: ThemeConfig, themeName: string, images: ImageData): string {
    const g = cfg.global ?? {};
    const tb = cfg.tabBar ?? {};
    const ft = cfg.friendsTab ?? {};
    const ct = cfg.chatsTab ?? {};
    const cr = cfg.chatRoom ?? {};
    const pc = cfg.passcode ?? {};

    const hasBgImage = !!images["mainBgImage"];
    const hasTabBgImage = !!images["maintabBgImage"];
    const hasChatBgImage = !!images["chatroomBgImage"];
    const hasPasscodeBg = !!images["passcodeBgImage"];
    const hasBubbleSend1 = !!images["chatroomBubbleSend01"];
    const hasBubbleSend2 = !!images["chatroomBubbleSend02"];
    const hasBubbleReceive1 = !!images["chatroomBubbleReceive01"];
    const hasBubbleReceive2 = !!images["chatroomBubbleReceive02"];
    const hasFriendsIcon = !!images["maintabIcoFriends"];
    const hasChatsIcon = !!images["maintabIcoChats"];
    const hasNowIcon = !!images["maintabIcoNow"];
    const hasShoppingIcon = !!images["maintabIcoShopping"];
    const hasMoreIcon = !!images["maintabIcoMore"];

    return `/*
 Manifest
 */

ManifestStyle
{
    -kakaotalk-theme-name: '${themeName}';
    -kakaotalk-theme-version: '1.0.0';
    -kakaotalk-theme-url: 'https://kakkumi.kr';
    -kakaotalk-author-name: 'Kakkumi';
    -kakaotalk-theme-id: 'kr.kakkumi.theme.${themeName.replace(/\s/g, "").toLowerCase()}';
}

TabBarStyle-Main
{
    background-color: ${c(tb.backgroundColor, "#FFFFFF")};
    ${hasTabBgImage ? "-ios-background-image: 'maintabBgImage.png';" : ""}
    ${hasFriendsIcon ? "-ios-friends-normal-icon-image: 'maintabIcoFriends.png';\n    -ios-friends-selected-icon-image: 'maintabIcoFriendsSelected.png';" : ""}
    ${hasChatsIcon ? "-ios-chats-normal-icon-image: 'maintabIcoChats.png';\n    -ios-chats-selected-icon-image: 'maintabIcoChatsSelected.png';" : ""}
    ${hasNowIcon ? "-ios-now-normal-icon-image: 'maintabIcoNow.png';\n    -ios-now-selected-icon-image: 'maintabIcoNowSelected.png';" : ""}
    ${hasShoppingIcon ? "-ios-shopping-normal-icon-image: 'maintabIcoShopping.png';\n    -ios-shopping-selected-icon-image: 'maintabIcoShoppingSelected.png';" : ""}
    ${hasMoreIcon ? "-ios-more-normal-icon-image: 'maintabIcoMore.png';\n    -ios-more-selected-icon-image: 'maintabIcoMoreSelected.png';" : ""}
    -ios-tab-normal-foreground-color: ${c(tb.inactiveIconColor, "#9E9E9E")};
    -ios-tab-selected-foreground-color: ${c(tb.activeIconColor, "#3A1D1D")};
}

HeaderStyle-Main
{
    -ios-text-color: ${c(g.headerText, "#3A1D1D")};
    -ios-tab-text-color: ${c(g.headerTabText, "#9E9E9E")};
}

MainViewStyle-Primary
{
    background-color: ${c(g.bodyBg, "#F5F5F5")};
    ${hasBgImage ? "-ios-background-image: 'mainBgImage.png';" : ""}
    -ios-text-color: ${c(g.primaryText, "#191919")};
    -ios-highlighted-text-color: ${c(ft.nameTextColor, "#191919")};
    -ios-description-text-color: ${c(g.descText, "#9E9E9E")};
    -ios-description-highlighted-text-color: ${c(g.descText, "#9E9E9E")};
    -ios-paragraph-text-color: ${c(ct.lastMsgColor, "#9E9E9E")};
    -ios-paragraph-highlighted-text-color: ${c(ct.lastMsgPressColor, "#9E9E9E")};
    -ios-normal-background-color: ${c(ft.selectedBg, "#F2F2F7")};
    -ios-normal-background-alpha: ${ft.selectedBgAlpha ?? "0.0"};
    -ios-selected-background-color: ${c(ft.selectedBg, "#F2F2F7")};
    -ios-selected-background-alpha: ${ft.selectedBgAlpha ?? "0.05"};
}

MainViewStyle-Secondary
{
    background-color: ${c(g.bodyBg, "#F5F5F5")};
}

SectionTitleStyle-Main
{
    border-color: ${c(g.headerBg, "#FEE500")};
    border-alpha: 0.09;
    -ios-text-color: ${c(g.headerBg, "#FEE500")};
    -ios-text-alpha: 1.0;
}

FeatureStyle-Primary
{
    -ios-text-color: ${c(g.primaryText, "#191919")};
}

BackgroundStyle-ChatRoom
{
    background-color: ${c(cr.backgroundColor, "#B2C7D9")};
    ${hasChatBgImage ? "-ios-background-image: 'chatroomBgImage.png';" : ""}
}

InputBarStyle-Chat
{
    background-color: ${c(cr.inputBarBg, "#FFFFFF")};
    -ios-send-normal-background-color: ${c(cr.sendButtonBg, "#FEE500")};
    -ios-send-normal-foreground-color: ${c(cr.sendButtonFg, "#3A1D1D")};
    -ios-send-highlighted-background-color: ${c(cr.sendButtonHighlightBg, "#E6CE00")};
    -ios-send-highlighted-foreground-color: ${c(cr.sendButtonHighlightFg, "#3A1D1D")};
    -ios-button-normal-foreground-color: ${c(cr.menuButtonFg, "#9E9E9E")};
    -ios-button-highlighted-foreground-color: ${c(cr.menuButtonHighlightFg, "#6E6E73")};
    -ios-button-text-color: ${c(cr.inputBarText, "#8E8E93")};
    -ios-button-normal-background-color: ${c(cr.inputFieldBg, "#F2F2F7")};
    -ios-button-normal-background-alpha: ${cr.inputFieldBgAlpha ?? 0.04};
}

MessageCellStyle-Send
{
    ${hasBubbleSend1 ? "-ios-background-image: 'chatroomBubbleSend01.png' 17px 17px;\n    -ios-selected-background-image: 'chatroomBubbleSend01Selected.png' 17px 17px;" : `-ios-background-color: ${c(cr.myBubbleBg, "#FEE500")};`}
    ${hasBubbleSend2 ? "-ios-group-background-image: 'chatroomBubbleSend02.png' 17px 17px;\n    -ios-group-selected-background-image: 'chatroomBubbleSend02Selected.png' 17px 17px;" : ""}
    -ios-text-color: ${c(cr.myBubbleText, "#191919")};
    -ios-selected-text-color: ${c(cr.myBubbleSelectedText, cr.myBubbleText ?? "#191919")};
    -ios-unread-text-color: ${c(cr.myBubbleUnreadText, "#9E9E9E")};
}

MessageCellStyle-Receive
{
    ${hasBubbleReceive1 ? "-ios-background-image: 'chatroomBubbleReceive01.png' 22px 17px;\n    -ios-selected-background-image: 'chatroomBubbleReceive01Selected.png' 22px 17px;" : `-ios-background-color: ${c(cr.friendBubbleBg, "#FFFFFF")};`}
    ${hasBubbleReceive2 ? "-ios-group-background-image: 'chatroomBubbleReceive02.png' 22px 17px;\n    -ios-group-selected-background-image: 'chatroomBubbleReceive02Selected.png' 22px 17px;" : ""}
    -ios-text-color: ${c(cr.friendBubbleText, "#191919")};
    -ios-selected-text-color: ${c(cr.friendBubbleSelectedText, cr.friendBubbleText ?? "#191919")};
    -ios-unread-text-color: ${c(cr.friendBubbleUnreadText, "#9E9E9E")};
}

BackgroundStyle-Passcode
{
    background-color: ${c(pc.backgroundColor, "#F5F5F5")};
    ${hasPasscodeBg ? "-ios-background-image: 'passcodeBgImage.png';" : ""}
}

LabelStyle-PasscodeTitle
{
    -ios-text-color: ${c(pc.titleColor, "#191919")};
}

PasscodeStyle
{
    -ios-bullet-empty-color: ${c(pc.bulletEmptyColor, "#D1D1D6")};
    -ios-bullet-fill-color: ${c(pc.bulletFillColor, pc.titleColor ?? "#191919")};
    -ios-keypad-background-color: ${c(pc.keypadBg, "#F5F5F5")};
    -ios-keypad-text-normal-color: ${c(pc.keypadTextColor, "#191919")};
}

BackgroundStyle-MessageNotificationBar
{
    background-color: ${c(cr.myBubbleBg, "#FEE500")};
}

LabelStyle-MessageNotificationBarName
{
    -ios-text-color: ${c(g.primaryText, "#191919")};
}

LabelStyle-MessageNotificationBarMessage
{
    -ios-text-color: ${c(g.descText, "#9E9E9E")};
}

BottomBannerStyle {
    background-color: ${c(g.headerBg, "#FEE500")};
}

BottomBannerStyle-Light {
    background-color: ${c(g.headerBg, "#FEE500")};
}
`;
}

async function fetchImageAsBytes(urlOrBase64: string): Promise<Uint8Array | null> {
    try {
        if (urlOrBase64.startsWith("data:")) {
            const base64 = urlOrBase64.split(",")[1];
            if (!base64) return null;
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return bytes;
        }
        const res = await fetch(urlOrBase64);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    } catch {
        return null;
    }
}

const IMAGE_KEY_MAP: Record<string, string[]> = {
    mainBgImage: ["mainBgImage@3x.png"],
    maintabBgImage: ["maintabBgImage@2x.png", "maintabBgImage@3x.png"],
    chatroomBgImage: ["chatroomBgImage@3x.png"],
    passcodeBgImage: ["passcodeBgImage@3x.png"],
    chatroomBubbleSend01: ["chatroomBubbleSend01@2x.png", "chatroomBubbleSend01@3x.png"],
    chatroomBubbleSend01Selected: ["chatroomBubbleSend01Selected@2x.png", "chatroomBubbleSend01Selected@3x.png"],
    chatroomBubbleSend02: ["chatroomBubbleSend02@2x.png", "chatroomBubbleSend02@3x.png"],
    chatroomBubbleSend02Selected: ["chatroomBubbleSend02Selected@2x.png", "chatroomBubbleSend02Selected@3x.png"],
    chatroomBubbleReceive01: ["chatroomBubbleReceive01@2x.png", "chatroomBubbleReceive01@3x.png"],
    chatroomBubbleReceive01Selected: ["chatroomBubbleReceive01Selected@2x.png", "chatroomBubbleReceive01Selected@3x.png"],
    chatroomBubbleReceive02: ["chatroomBubbleReceive02@2x.png", "chatroomBubbleReceive02@3x.png"],
    chatroomBubbleReceive02Selected: ["chatroomBubbleReceive02Selected@2x.png", "chatroomBubbleReceive02Selected@3x.png"],
    maintabIcoFriends: ["maintabIcoFriends@2x.png", "maintabIcoFriends@3x.png"],
    maintabIcoFriendsSelected: ["maintabIcoFriendsSelected@2x.png", "maintabIcoFriendsSelected@3x.png"],
    maintabIcoChats: ["maintabIcoChats@2x.png", "maintabIcoChats@3x.png"],
    maintabIcoChatsSelected: ["maintabIcoChatsSelected@2x.png", "maintabIcoChatsSelected@3x.png"],
    maintabIcoNow: ["maintabIcoNow@2x.png", "maintabIcoNow@3x.png"],
    maintabIcoNowSelected: ["maintabIcoNowSelected@2x.png", "maintabIcoNowSelected@3x.png"],
    maintabIcoShopping: ["maintabIcoShopping@2x.png", "maintabIcoShopping@3x.png"],
    maintabIcoShoppingSelected: ["maintabIcoShoppingSelected@2x.png", "maintabIcoShoppingSelected@3x.png"],
    maintabIcoMore: ["maintabIcoMore@2x.png", "maintabIcoMore@3x.png"],
    maintabIcoMoreSelected: ["maintabIcoMoreSelected@2x.png", "maintabIcoMoreSelected@3x.png"],
};

// GET /api/admin/themes/export-option?optionId=xxx
// 관리자 전용: 내 테마(myThemeId) 기반 옵션의 configJson으로 .ktheme 생성
export async function GET(req: NextRequest) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const optionId = searchParams.get("optionId");
    const usePending = searchParams.get("pending") === "1";

    if (!optionId) {
        return NextResponse.json({ error: "optionId가 필요합니다." }, { status: 400 });
    }

    // ThemeOption + Theme 조회 (pending 여부에 따라)
    const optRows = await prisma.$queryRaw<{
        configJson: unknown;
        pendingConfigJson: unknown;
        imageData: unknown;
        pendingImageData: unknown;
        myThemeId: string | null;
        pendingMyThemeId: string | null;
        themeTitle: string;
        os: string;
    }[]>`
        SELECT o."configJson", o."pendingConfigJson",
               o."imageData", o."pendingImageData",
               o."myThemeId", o."pendingMyThemeId",
               t.title AS "themeTitle", o.os
        FROM "ThemeOption" o
        JOIN "Theme" t ON t.id = o."themeId"
        WHERE o.id = ${optionId}
        LIMIT 1
    `;

    if (optRows.length === 0) {
        return NextResponse.json({ error: "옵션을 찾을 수 없습니다." }, { status: 404 });
    }

    const opt = optRows[0];

    // pending이면 pendingConfigJson/imageData 우선, 없으면 현재 것
    const rawConfig = usePending
        ? (opt.pendingConfigJson ?? opt.configJson)
        : opt.configJson;
    const rawImage = usePending
        ? (opt.pendingImageData ?? opt.imageData)
        : opt.imageData;

    const configJson = (rawConfig && typeof rawConfig === "object")
        ? rawConfig as ThemeConfig
        : {} as ThemeConfig;
    const imageData = (rawImage && typeof rawImage === "object")
        ? rawImage as ImageData
        : {} as ImageData;
    const themeName = opt.themeTitle;

    // CSS 생성 → ZIP 패킹
    const css = generateCSS(configJson, themeName, imageData);
    const zip = new JSZip();
    zip.file("KakaoTalkTheme.css", css);

    const imagesFolder = zip.folder("Images");
    if (imagesFolder) {
        for (const [key, url] of Object.entries(imageData)) {
            if (!url) continue;
            const fileNames = IMAGE_KEY_MAP[key];
            if (!fileNames) continue;
            const bytes = await fetchImageAsBytes(url);
            if (!bytes) continue;
            for (const fileName of fileNames) {
                imagesFolder.file(fileName, bytes);
            }
        }
    }

    const zipUint8 = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    const zipBuffer = zipUint8.buffer.slice(zipUint8.byteOffset, zipUint8.byteOffset + zipUint8.byteLength);
    const safeTitle = themeName.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");

    return new NextResponse(zipBuffer as ArrayBuffer, {
        status: 200,
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}_${optionId.slice(0, 6)}.ktheme"`,
        },
    });
}

