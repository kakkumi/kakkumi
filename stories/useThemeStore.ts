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
  };
  tabBar: {
    activeIconColor: string;
    inactiveIconColor: string;
    backgroundColor: string;
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
    sendButtonBg: string;
  };
  passcode: {
    backgroundColor: string;
    titleColor: string;
    keypadTextColor: string;
  };
  setCurrentScreen: (screen: ScreenType) => void;
  setActiveElementId: (id: ActiveElementId) => void;
  setTheme: (partial: Partial<Omit<ThemeState, 'setCurrentScreen' | 'setActiveElementId' | 'setTheme'>>) => void;
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
  },
  tabBar: {
    activeIconColor: '#3A1D1D',
    inactiveIconColor: '#9E9E9E',
    backgroundColor: '#FFFFFF',
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
    sendButtonBg: '#FEE500',
  },
  passcode: {
    backgroundColor: '#F5F5F5',
    titleColor: '#191919',
    keypadTextColor: '#191919',
  },
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setActiveElementId: (id) => set({ activeElementId: id }),
  setTheme: (partial) => set((state) => ({
    global: partial.global ?? state.global,
    tabBar: partial.tabBar ?? state.tabBar,
    friendsTab: partial.friendsTab ?? state.friendsTab,
    chatsTab: partial.chatsTab ?? state.chatsTab,
    openChatsTab: partial.openChatsTab ?? state.openChatsTab,
    chatRoom: partial.chatRoom ?? state.chatRoom,
    passcode: partial.passcode ?? state.passcode,
  })),
}));
