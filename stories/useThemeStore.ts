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
  tabBar: {
    activeIconColor: string;
    inactiveIconColor: string;
    backgroundColor: string;
  };
  friendsTab: {
    updateSectionBg: string;
  };
  chatsTab: {
    filterChipBg: string;
    unreadBadgeBg: string;
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
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentScreen: 'CHATS',
  activeElementId: null,
  tabBar: {
    activeIconColor: '#664242',
    inactiveIconColor: '#B39898',
    backgroundColor: '#FFF6F6',
  },
  friendsTab: {
    updateSectionBg: '#FFE7E7',
  },
  chatsTab: {
    filterChipBg: '#FCE1E1',
    unreadBadgeBg: '#FF5D5D',
  },
  openChatsTab: {
    bannerBackgroundColor: '#FFD2D2',
  },
  chatRoom: {
    backgroundColor: '#DCEEFF',
    friendBubbleBg: '#FFFFFF',
    myBubbleBg: '#FFE066',
    inputBarBg: '#FFFFFF',
    sendButtonBg: '#FF7F7F',
  },
  passcode: {
    backgroundColor: '#FFDEDE',
    titleColor: '#664242',
    keypadTextColor: '#664242',
  },
  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  setActiveElementId: (id) => set({ activeElementId: id }),
}));
