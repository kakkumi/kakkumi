import { create } from 'zustand';

export type ScreenType =
  | 'FRIENDS'
  | 'CHATS'
  | 'OPENCHATS'
  | 'SHOPPING'
  | 'MORE'
  | 'CHATROOM'
  | 'PASSCODE';

export type ActiveElementId =
  | 'header-title-icon'
  | 'tabBar-friends'
  | 'tabBar-chats'
  | 'tabBar-openchats'
  | 'tabBar-shopping'
  | 'tabBar-more'
  | null;

type ThemeState = {
  currentScreen: ScreenType;
  activeElementId: ActiveElementId;
  global: {
    bodyBg: string;
    headerBg: string;
    headerText: string;
    primaryText: string;
    descText: string;
    headerTabText: string;
    profileImgUrls?: string[];
  };
  tabBar: {
    activeIconColor: string;
    inactiveIconColor: string;
    backgroundColor: string;
    backgroundImageUrl?: string;
  };
  friendsTab: {
    updateSectionBg: string;
    listDescTextColor: string;
    selectedBg: string;
    selectedBgAlpha: string;
  };
  chatsTab: {
    filterChipBg: string;
    unreadBadgeBg: string;
    lastMsgColor: string;
    namePressColor: string;
    lastMsgPressColor: string;
    selectedBg: string;
    selectedBgAlpha: string;
  };
  openChatsTab: {
    bannerBackgroundColor: string;
  };
  chatRoom: {
    backgroundColor: string;
    friendBubbleBg: string;
    myBubbleBg: string;
    inputBarBg: string;
    inputBarText: string;
    inputFieldBg: string;
    inputFieldBgAlpha: number;
    sendButtonBg: string;
    sendButtonFg: string;
    sendButtonHighlightBg: string;
    sendButtonHighlightFg: string;
    menuButtonFg: string;
    menuButtonHighlightFg: string;
    bgImageUrl?: string;
    myBubbleText?: string;
    myBubbleSelectedText?: string;
    myBubbleUnreadText?: string;
    friendBubbleText?: string;
    friendBubbleSelectedText?: string;
    friendBubbleUnreadText?: string;
    bubbleSend1Url?: string;
    bubbleSend1SelectedUrl?: string;
    bubbleSend2Url?: string;
    bubbleReceive1Url?: string;
    bubbleReceive1SelectedUrl?: string;
    bubbleReceive2Url?: string;
  };
  passcode: {
    backgroundColor: string;
    titleColor: string;
    keypadTextColor: string;
    keypadBg?: string;
    bgImageUrl?: string;
    bulletEmptyColor?: string;
    bulletFillColor?: string;
    bulletEmptyDefault?: boolean;
    bulletEmptyImageUrl?: string;
    bulletFillImageUrl?: string;
    keypadPressedImageUrl?: string;
    keypadPressedOn?: boolean;
  };
  setCurrentScreen: (screen: ScreenType) => void;
  setActiveElementId: (id: ActiveElementId) => void;
  setTheme: (partial: {
    global?: Partial<ThemeState['global']>;
    tabBar?: Partial<ThemeState['tabBar']>;
    friendsTab?: Partial<ThemeState['friendsTab']>;
    chatsTab?: Partial<ThemeState['chatsTab']>;
    openChatsTab?: Partial<ThemeState['openChatsTab']>;
    chatRoom?: Partial<ThemeState['chatRoom']>;
    passcode?: Partial<ThemeState['passcode']>;
  }) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentScreen: 'CHATS',
  activeElementId: null,
  global: {
    bodyBg: '#F5F5F5',
    headerBg: '#FEE500',
    headerText: '#3A1D1D',
    primaryText: '#191919',
    descText: '#9E9E9E',
    headerTabText: '#9E9E9E',
    profileImgUrls: undefined as string[] | undefined,
  },
  tabBar: {
    activeIconColor: '#3A1D1D',
    inactiveIconColor: '#9E9E9E',
    backgroundColor: '#FFFFFF',
    backgroundImageUrl: undefined as string | undefined,
  },
  friendsTab: {
    updateSectionBg: '#F2F2F7',
    listDescTextColor: '#9E9E9E',
    selectedBg: '#F2F2F7',
    selectedBgAlpha: '1.0',
  },
  chatsTab: {
    filterChipBg: '#F5F5F5',
    unreadBadgeBg: '#FF3B30',
    lastMsgColor: '#9E9E9E',
    namePressColor: '#3A1D1D',
    lastMsgPressColor: '#9E9E9E',
    selectedBg: '#F2F2F7',
    selectedBgAlpha: '1.0',
  },
  openChatsTab: {
    bannerBackgroundColor: '#F5F5F5',
  },
  chatRoom: {
    backgroundColor: '#B2C7D9',
    friendBubbleBg: '#FFFFFF',
    myBubbleBg: '#FEE500',
    inputBarBg: '#FFFFFF',
    inputBarText: '#8E8E93',
    inputFieldBg: '#F2F2F7',
    inputFieldBgAlpha: 0.04,
    sendButtonBg: '#FEE500',
    sendButtonFg: '#3A1D1D',
    sendButtonHighlightBg: '#E6CE00',
    sendButtonHighlightFg: '#3A1D1D',
    menuButtonFg: '#9E9E9E',
    menuButtonHighlightFg: '#6E6E73',
    bgImageUrl: '',
  },
  passcode: {
    backgroundColor: '#F5F5F5',
    titleColor: '#191919',
    keypadTextColor: '#191919',
  },
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setActiveElementId: (id) => set({ activeElementId: id }),
  setTheme: (partial) => set((state) => ({
    global: partial.global ? { ...state.global, ...partial.global } : state.global,
    tabBar: partial.tabBar ? { ...state.tabBar, ...partial.tabBar } : state.tabBar,
    friendsTab: partial.friendsTab ? { ...state.friendsTab, ...partial.friendsTab } : state.friendsTab,
    chatsTab: partial.chatsTab ? { ...state.chatsTab, ...partial.chatsTab } : state.chatsTab,
    openChatsTab: partial.openChatsTab ? { ...state.openChatsTab, ...partial.openChatsTab } : state.openChatsTab,
    chatRoom: partial.chatRoom ? { ...state.chatRoom, ...partial.chatRoom } : state.chatRoom,
    passcode: partial.passcode ? { ...state.passcode, ...partial.passcode } : state.passcode,
  })),
}));
