import { Search, Settings } from 'lucide-react';

import { useThemeStore } from '../useThemeStore';
import { openFeeds } from './data';
import { headerBaseStyle, iconRowStyle, listItemBaseStyle } from './styles';

export const OpenChatsScreen = () => {
  const bannerBackgroundColor = useThemeStore((state) => state.openChatsTab.bannerBackgroundColor);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#FFDEDE',
      }}
    >
      <header style={headerBaseStyle}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              border: 0,
              borderRadius: 999,
              padding: '7px 12px',
              backgroundColor: '#f4e3e3',
              color: '#805959',
              fontWeight: 700,
            }}
          >
            숏폼
          </button>
          <button
            type="button"
            style={{
              border: 0,
              borderRadius: 999,
              padding: '7px 12px',
              backgroundColor: '#664242',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            오픈채팅
          </button>
        </div>
        <div style={iconRowStyle}>
          <Search size={19} />
          <Settings size={19} />
        </div>
      </header>

      <section
        style={{
          margin: '12px 16px',
          borderRadius: 16,
          padding: '14px 12px',
          backgroundColor: bannerBackgroundColor,
          color: '#664242',
          fontWeight: 700,
        }}
      >
        <p style={{ margin: 0, fontSize: 14 }}>지금 인기 오픈채팅</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 500 }}>실시간 참여 가능한 커뮤니티를 확인해보세요</p>
      </section>

      <section className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {openFeeds.map((feed) => (
          <article key={feed.id} style={{ ...listItemBaseStyle, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: '#ffdede',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#664242' }}>{feed.title}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#805959' }}>{feed.summary}</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9b7e7e' }}>
                좋아요 {feed.likes} · 댓글 {feed.comments}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
