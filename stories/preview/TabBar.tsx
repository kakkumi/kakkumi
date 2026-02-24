import { Globe, Hash, MessageCircle, MoreHorizontal, ShoppingBag, User } from 'lucide-react';

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

export const TabBar = ({ disabled = false }: { disabled?: boolean }) => {
  const currentScreen = useThemeStore((state) => state.currentScreen);
  const setCurrentScreen = useThemeStore((state) => state.setCurrentScreen);
  const activeElementId = useThemeStore((state) => state.activeElementId);
  const setActiveElementId = useThemeStore((state) => state.setActiveElementId);
  const tabBar = useThemeStore((state) => state.tabBar);

  const tabs: { key: TabScreenKey; label: string; icon: React.ReactNode }[] = [
    { key: 'FRIENDS', label: '친구', icon: <User size={20} /> },
    { key: 'CHATS', label: '채팅', icon: <MessageCircle size={20} /> },
    {
      key: 'OPENCHATS',
      label: '오픈채팅',
      icon: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <Hash size={13} />
          <Globe size={14} />
        </span>
      ),
    },
    { key: 'SHOPPING', label: '쇼핑', icon: <ShoppingBag size={20} /> },
    { key: 'MORE', label: '더보기', icon: <MoreHorizontal size={20} /> },
  ];

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: tabBar.backgroundColor,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '8px 4px 10px',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === currentScreen;
        const focused = activeElementId === tabElementMap[tab.key];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveElementId(tabElementMap[tab.key]);
              if (disabled) return;
              setCurrentScreen(tab.key);
            }}
            style={{
              border: 0,
              backgroundColor: 'transparent',
              color: active ? tabBar.activeIconColor : tabBar.inactiveIconColor,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 8,
              boxShadow: focused ? '0 0 0 2px #3b82f6 inset' : 'none',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </footer>
  );
};
