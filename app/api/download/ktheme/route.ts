import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import JSZip from "jszip";

// configJson 타입 (useThemeStore 구조 그대로)
type ThemeConfig = {
    global?: {
        bodyBg?: string;
        headerBg?: string;
        headerText?: string;
        primaryText?: string;
        descText?: string;
        headerTabText?: string;
    };
    tabBar?: {
        activeIconColor?: string;
        inactiveIconColor?: string;
        backgroundColor?: string;
    };
    friendsTab?: {
        updateSectionBg?: string;
        listDescTextColor?: string;
        selectedBg?: string;
        selectedBgAlpha?: string;
        nameTextColor?: string;
    };
    chatsTab?: {
        filterChipBg?: string;
        unreadBadgeBg?: string;
        lastMsgColor?: string;
        namePressColor?: string;
        lastMsgPressColor?: string;
        selectedBg?: string;
        selectedBgAlpha?: string;
    };
    openChatsTab?: { bannerBackgroundColor?: string };
    chatRoom?: {
        backgroundColor?: string;
        friendBubbleBg?: string;
        myBubbleBg?: string;
        inputBarBg?: string;
        inputBarText?: string;
        inputFieldBg?: string;
        inputFieldBgAlpha?: number;
        sendButtonBg?: string;
        sendButtonFg?: string;
        sendButtonHighlightBg?: string;
        sendButtonHighlightFg?: string;
        menuButtonFg?: string;
        menuButtonHighlightFg?: string;
        myBubbleText?: string;
        myBubbleSelectedText?: string;
        myBubbleUnreadText?: string;
        friendBubbleText?: string;
        friendBubbleSelectedText?: string;
        friendBubbleUnreadText?: string;
    };
    passcode?: {
        backgroundColor?: string;
        titleColor?: string;
        keypadTextColor?: string;
        keypadBg?: string;
        bulletEmptyColor?: string;
        bulletFillColor?: string;
    };
};

// imageData 타입 (Supabase URL 또는 base64)
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

    // 이미지 파일명 목록 (imageData 키 기반)
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


/*
 TabBar Style
 */

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


/*
 MainView Style
 */

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


/*
 Feature Style
 */

FeatureStyle-Primary
{
    -ios-text-color: ${c(g.primaryText, "#191919")};
}


/*
 ChatRoom Style
 */

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


/*
 Message Style
 */

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


/*
 Passcode Style
 */

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


/*
 Message Notification Bar Style
 */

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


/*
 BottomBanner Style
 */

BottomBannerStyle {
    background-color: ${c(g.headerBg, "#FEE500")};
}

BottomBannerStyle-Light {
    background-color: ${c(g.headerBg, "#FEE500")};
}
`;
}

// base64 or URL → Uint8Array
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
        // URL fetch
        const res = await fetch(urlOrBase64);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    } catch {
        return null;
    }
}

// imageData 키 → Images/ 내 파일명 매핑
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

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.dbId) {
        return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { optionId, themeId } = await req.json() as { optionId: string; themeId: string };
    if (!optionId || !themeId) {
        return NextResponse.json({ error: "optionId, themeId가 필요합니다." }, { status: 400 });
    }

    // 구매 여부 확인
    const purchaseRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT p.id FROM "Purchase" p
        WHERE p."buyerId" = ${session.dbId}
          AND p."themeId" = ${themeId}
          AND p.status = 'COMPLETED'::"PurchaseStatus"
        LIMIT 1
    `;
    if (purchaseRows.length === 0) {
        return NextResponse.json({ error: "구매한 테마만 다운로드할 수 있습니다." }, { status: 403 });
    }

    // ThemeOption + Theme 조회
    const optRows = await prisma.$queryRaw<{
        configJson: unknown;
        imageData: unknown;
        themeTitle: string;
    }[]>`
        SELECT o."configJson", o."imageData", t.title AS "themeTitle"
        FROM "ThemeOption" o
        JOIN "Theme" t ON t.id = o."themeId"
        WHERE o.id = ${optionId} AND o."themeId" = ${themeId}
          AND o.status = 'ACTIVE'::"ThemeOptionStatus"
        LIMIT 1
    `;

    if (optRows.length === 0) {
        return NextResponse.json({ error: "옵션을 찾을 수 없습니다." }, { status: 404 });
    }

    const opt = optRows[0];
    const configJson = (opt.configJson && typeof opt.configJson === "object")
        ? opt.configJson as ThemeConfig
        : {} as ThemeConfig;
    const imageData = (opt.imageData && typeof opt.imageData === "object")
        ? opt.imageData as ImageData
        : {} as ImageData;
    const themeName = opt.themeTitle;

    // CSS 생성
    const css = generateCSS(configJson, themeName, imageData);

    // ZIP 생성
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
            "Content-Disposition": `attachment; filename="${encodeURIComponent(safeTitle)}.ktheme"`,
        },
    });
}
