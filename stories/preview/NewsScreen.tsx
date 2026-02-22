import React from 'react';
import {
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music,
  Search,
  Settings,
  Upload,
  UserPlus,
} from 'lucide-react';

const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '26px 16px 8px 16px',
  backgroundColor: 'transparent',
};

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
};

const avatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '16px',
};

const useThemeStore = (selector: any) => {
  const state = {
    themeConfig: {
      global: {
        backgroundColor: '#FFDEDE',
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
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { global, friendsTab, chatsTab } = themeConfig;

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
        <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800 }}>어피치</h2>
        <div style={iconRowStyle}>
          <Search size={22} />
          <UserPlus size={22} />
          <Music size={22} />
          <Settings size={22} />
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 16px 16px' }}>
        <button
          style={{
            backgroundColor: 'transparent',
            color: global.textColor,
            borderRadius: 999,
            padding: '7px 16px',
            fontSize: 14,
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
            padding: '7px 16px',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          소식
        </button>
      </div>

      <div className="news-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div
            style={{
              backgroundColor: chatsTab.filterChipBg,
              borderRadius: 14,
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>오늘의 카카오가 궁금하다면?</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: global.descriptionColor }}>카카오소식 보러가기</p>
            </div>
            <div style={{ display: 'flex', gap: 4, fontSize: 22 }}>🍈🧀</div>
          </div>
        </div>

        <section style={{ padding: '8px 16px 20px' }}>
          <article style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 40, height: 40, borderRadius: 14, backgroundColor: '#FEE500', color: '#000' }}>춘</div>
                <div>
                  <p style={{ margin: 0, color: global.textColor, fontSize: 15, fontWeight: 700 }}>춘식이</p>
                  <p style={{ margin: '2px 0 0', color: global.descriptionColor, fontSize: 12 }}>8분 전</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${global.descriptionColor}40`,
                    borderRadius: 999,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: global.textColor,
                    cursor: 'pointer',
                  }}
                >
                  친구추가
                </button>
                <MoreHorizontal size={20} color={global.descriptionColor} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <p style={{ margin: '0 0 12px 0', fontSize: 14, color: global.textColor, lineHeight: 1.5 }}>이번에 새로 들인 식물..🌱</p>

            <div
              style={{
                width: '100%',
                height: 280,
                backgroundColor: '#EBEBEB',
                borderRadius: 16,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            >
              <span style={{ fontSize: 80 }}>🪴</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, cursor: 'pointer' }}>
              <MapPin size={15} color={global.textColor} />
              <span style={{ fontSize: 13, color: global.textColor, fontWeight: 500 }}>분당구 삼평동</span>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <Heart size={22} color={global.textColor} strokeWidth={1.5} />
                <span style={{ fontSize: 14, color: global.textColor, fontWeight: 500 }}>24</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <MessageCircle size={22} color={global.textColor} strokeWidth={1.5} />
                <span style={{ fontSize: 14, color: global.textColor, fontWeight: 500 }}>8</span>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', gap: 16 }}>
                <Upload size={22} color={global.textColor} strokeWidth={1.5} style={{ cursor: 'pointer', marginTop: -2 }} />
                <Bookmark size={22} color={global.textColor} strokeWidth={1.5} style={{ cursor: 'pointer' }} />
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
