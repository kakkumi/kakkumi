import React from 'react';
import {
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music,
  Search,
  Settings,
  UserPlus,
} from 'lucide-react';

const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '42px 14px 8px 14px',
  backgroundColor: 'transparent',
};

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  alignItems: 'center',
};

const avatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '15px',
};

interface ThemeState {
  themeConfig: {
    global: { backgroundColor: string; textColor: string; descriptionColor: string };
    friendsTab: { headerTitleColor: string };
    chatsTab: { filterChipBg: string };
  };
}

const useThemeStore = (selector: (state: ThemeState) => ThemeState['themeConfig']) => {
  const state: ThemeState = {
    themeConfig: {
      global: {
        backgroundColor: '#FFFFFF',
        textColor: '#664242',
        descriptionColor: '#805959',
      },
      friendsTab: {
        headerTitleColor: '#664242',
      },
      chatsTab: {
        filterChipBg: '#F66C6C',
      },
    },
  };

  return selector(state);
};

export const NewsScreen = () => {
  const themeConfig = useThemeStore((state) => state.themeConfig);
  const { global, friendsTab } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: global.backgroundColor,
        fontFamily: 'sans-serif',
      }}
    >
      <header style={{ ...headerBaseStyle, color: friendsTab.headerTitleColor }}>
        <div data-active-element-id="header-title-icon" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 11,
              backgroundColor: 'rgba(255,255,255,0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
            }}
          >
            🍑
          </div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>카꾸미</h2>
        </div>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={20} strokeWidth={2.3} />
          <UserPlus size={20} strokeWidth={2.3} />
          <Music size={20} strokeWidth={2.3} />
          <Settings size={20} strokeWidth={2.3} />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 7, padding: '2px 14px 12px 14px' }}>
        <button
          style={{
            backgroundColor: 'transparent',
            color: global.textColor,
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            border: `1px solid ${global.textColor}20`,
            cursor: 'pointer',
          }}
        >
          친구
        </button>
        <button
          style={{
            backgroundColor: global.textColor,
            color: global.backgroundColor,
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          소식
        </button>
      </div>

      <div className="news-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ padding: '0 14px 12px 14px' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: 11,
              padding: '13px 15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>크리에이터가 되어 수익을 만들어보세요</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: global.descriptionColor }}>입점 신청하기</p>
            </div>
          </div>
        </div>

        <section style={{ padding: '6px 14px 16px' }}>
          <article style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 38, height: 38, borderRadius: 13, backgroundColor: '#FEE500', color: '#000' }}>서</div>
                <div>
                  <p style={{ margin: 0, color: global.textColor, fontSize: 14, fontWeight: 700 }}>서울</p>
                  <p style={{ margin: '2px 0 0', color: global.descriptionColor, fontSize: 11 }}>8분 전</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MoreHorizontal size={18} color={global.descriptionColor} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: 13, color: global.textColor, lineHeight: 1.45 }}>이번에 새로 들인 식물..🌱</p>

            <div
              style={{
                width: '100%',
                height: 252,
                backgroundColor: '#EBEBEB',
                borderRadius: 14,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: 72 }}>🪴</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14, cursor: 'pointer' }}>
              <MapPin size={14} color={global.textColor} />
              <span style={{ fontSize: 12, color: global.textColor, fontWeight: 500 }}>분당구 삼평동</span>
            </div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <Heart size={20} color={global.textColor} strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: global.textColor, fontWeight: 500 }}>24</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                <MessageCircle size={20} color={global.textColor} strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: global.textColor, fontWeight: 500 }}>8</span>
              </div>
            </div>
          </article>
        </section>
      </div>

      <style jsx>{`
        .news-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
