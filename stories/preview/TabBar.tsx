import { MessageCircle, MoreHorizontal, ShoppingBag, User } from 'lucide-react';

import { ScreenType, useThemeStore } from '../useThemeStore';

export const tabScreens: ScreenType[] = ['FRIENDS', 'CHATS', 'OPENCHATS', 'SHOPPING', 'MORE'];

type TabScreenKey = 'FRIENDS' | 'CHATS' | 'OPENCHATS' | 'SHOPPING' | 'MORE';
type TabElementId = 'tabBar-friends' | 'tabBar-chats' | 'tabBar-openchats' | 'tabBar-shopping' | 'tabBar-more';

const tabElementMap: Record<TabScreenKey, TabElementId> = {
  FRIENDS: 'tabBar-friends',
  CHATS: 'tabBar-chats',
  OPENCHATS: 'tabBar-openchats',
  SHOPPING: 'tabBar-shopping',
  MORE: 'tabBar-more',
};

const OpenChatIcon = ({ color }: { color: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 왼쪽 말풍선 */}
    <path d="M4 4h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-3 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
    {/* 오른쪽 말풍선 */}
    <path d="M16 8h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5l-2.5-2.5H12" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>
    {/* 왼쪽 말풍선 안 삼각형(재생버튼) */}
    <polygon points="7,7.5 7,11.5 11,9.5" fill={color}/>
  </svg>
);

export const TabBar = ({ disabled = false, darkMode = false }: { disabled?: boolean; darkMode?: boolean }) => {
  const currentScreen = useThemeStore((state) => state.currentScreen);
  const setCurrentScreen = useThemeStore((state) => state.setCurrentScreen);
  const setActiveElementId = useThemeStore((state) => state.setActiveElementId);
  const tabBar = useThemeStore((state) => state.tabBar);

  // 목업 고정 색상 (코드 생성과 무관)
  const inactiveColor = darkMode ? '#696b6d' : '#b9bcbf';
  const activeColor = darkMode ? '#e4e9ef' : '#3a3a3c';

  const tabs: { key: TabScreenKey; label: string; icon: (color: string) => React.ReactNode }[] = [
    { key: 'FRIENDS', label: '친구', icon: (color) => <User size={20} color={color} /> },
    { key: 'CHATS', label: '채팅', icon: (color) => <MessageCircle size={20} color={color} /> },
    { key: 'OPENCHATS', label: '오픈채팅', icon: (color) => <OpenChatIcon color={color} /> },
    { key: 'SHOPPING', label: '쇼핑', icon: (color) => <ShoppingBag size={20} color={color} style={{ marginTop: 3 }} /> },
    { key: 'MORE', label: '더보기', icon: (color) => <MoreHorizontal size={20} color={color} style={{ marginTop: 3 }} /> },
  ];

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: tabBar.backgroundImageUrl ? 'transparent' : tabBar.backgroundColor,
        backgroundImage: tabBar.backgroundImageUrl ? `url(${tabBar.backgroundImageUrl})` : undefined,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '12px 4px 16px',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === currentScreen;
        const color = active ? activeColor : inactiveColor;

        return (
          <button
            key={tab.key}
            type="button"
            data-keep-active-element="true"
            onClick={() => {
              setActiveElementId(tabElementMap[tab.key]);
              if (disabled) return;
              setCurrentScreen(tab.key);
            }}
            style={{
              border: 0,
              color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 8,
              backgroundColor: 'transparent',
            }}
          >
            {tab.icon(color)}
          </button>
        );
      })}
    </footer>
  );
};
