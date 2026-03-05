import React from 'react';
import { MessageCircle, Search, Settings, Plus, Pin, BellOff, Flag } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const chats = [
  { id: 1, type: 'single', room: '어피치', message: '오늘의 장보기 목록', time: '오후 12:30', unread: 0, isPinned: true, isMuted: false, avatars: ['🍑'] },
  { id: 2, type: 'single', room: '춘식이', message: '좋은 하루 보내~', time: '오후 12:30', unread: 2, isPinned: false, isMuted: true, avatars: ['🍠'] },
  { id: 3, type: 'single', room: '탄천런닝할게요', message: '러닝이 최고죠', time: '오후 12:30', unread: 10, isPinned: true, isMuted: false, avatars: ['🏃‍♀️'] },
  { id: 4, type: 'single', room: '라이언', message: '오늘 점심 뭐 먹었어?', time: '오후 1:15', unread: 1, isPinned: false, isMuted: false, avatars: ['🦁'] },
  { id: 5, type: 'single', room: '무지', message: '주말에 시간 돼?', time: '오후 2:00', unread: 0, isPinned: false, isMuted: false, avatars: ['🐰'] },
  { id: 6, type: 'single', room: '콘', message: '사진 보내줄게!', time: '어제', unread: 3, isPinned: false, isMuted: false, avatars: ['🐻'] },
  { id: 7, type: 'single', room: '네오', message: '다음에 또 보자~', time: '어제', unread: 0, isPinned: false, isMuted: true, avatars: ['🐱'] },
];

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

const listItemBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'pointer',
  padding: '7px 16px',
};

interface ThemeState {
  themeConfig: {
    global: { backgroundColor: string; textColor: string; descriptionColor: string };
    chatsTab: {
      headerTitleColor: string;
      filterChipBg: string;
      filterChipActiveBg: string;
      filterChipTextColor: string;
      unreadBadgeBg: string;
    };
  };
}

// Zustand Store Mock (Apeach 테마 컬러 적용)
const useThemeStore = (selector: (state: ThemeState) => ThemeState['themeConfig']) => {
  const state = {
    themeConfig: {
      global: {
        backgroundColor: '#FFDEDE',
        textColor: '#664242',
        descriptionColor: '#805959',
      },
      chatsTab: {
        headerTitleColor: '#664242',
        filterChipBg: 'rgba(255, 255, 255, 0.6)', // 비활성 칩 및 배너의 반투명 흰색
        filterChipActiveBg: '#664242', // 활성 칩 짙은 배경
        filterChipTextColor: '#FFDEDE', // 활성 칩 글자색 (연분홍)
        unreadBadgeBg: '#ff6507',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const MainScreen = () => {
  const themeConfig = useThemeStore((state: ThemeState) => state.themeConfig);
  const { global, chatsTab } = themeConfig;

  // 상단 필터 칩 더미 데이터 (스크린샷 100% 고증)
  const filterChips = [
    { label: '전체', count: null, isActive: false },
    { label: '안읽음', count: 40, isActive: false },
  ];

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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: chatsTab.headerTitleColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>채팅</h2>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={20} strokeWidth={2.3} />
          <MessageCircle size={20} strokeWidth={2.3} />
          <Settings size={20} strokeWidth={2.3} />
        </div>
      </header>

      {/* 2. 필터 칩 영역 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '2px 14px 12px 14px',
        }}
      >
        <div className="chats-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              style={{
                border: chip.isActive ? 0 : '1px solid rgba(150, 150, 150, 0.4)',
                flexShrink: 0,
                borderRadius: 999,
                backgroundColor: chip.isActive ? chatsTab.filterChipActiveBg : 'transparent',
                color: chip.isActive ? chatsTab.filterChipTextColor : global.textColor,
                height: 32,
                padding: '0 14px',
                fontSize: 14,
                fontWeight: chip.isActive ? 700 : 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <span>{chip.label}</span>
              {/* 카운트 배지 (ex: 안읽음 40, 친구 12) */}
              {chip.count && (
                <span style={{ 
                  backgroundColor: chatsTab.unreadBadgeBg,
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 500,
                  minWidth: 16,
                  height: 16,
                  lineHeight: '16px',
                  textAlign: 'center',
                  padding: '0 4px',
                  borderRadius: 999,
                  marginLeft: -2
                }}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
          <div style={{ 
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'transparent',
            border: '1px solid rgba(150, 150, 150, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Plus size={18} color={global.textColor} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {/* 3. 상단 배너 영역 */}
        <div style={{ padding: '0 14px 12px 14px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 11,
          padding: '13px 15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>
              나에게 딱 맞는 테마를 찾아보세요
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 11, color: global.descriptionColor, opacity: 0.8 }}>
              테마 구경하기
            </p>
          </div>
        </div>
      </div>

      {/* 4. 채팅방 리스트 영역 */}
        <section>
        {chats.map((chat) => (
          <article key={chat.id} style={listItemBaseStyle}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
              
              {/* 프사 영역 */}
              <div style={{ width: 46, height: 46, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>
                  {chat.avatars[0]}
                </div>
              </div>
              
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {chat.id === 1 && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: chatsTab.filterChipActiveBg,
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 8,
                        fontWeight: 600,
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      나
                    </span>
                  )}
                  {chat.id === 3 && (
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: chatsTab.filterChipActiveBg,
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Flag size={8} strokeWidth={2.2} color="#FFFFFF" />
                    </span>
                  )}
                  <p style={{ margin: 0, color: '#3c2a2a', fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.room}
                  </p>
                  {/* 핀 고정 아이콘 */}
                  {chat.isPinned && <Pin size={12} color={global.descriptionColor} fill={global.descriptionColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                  {/* 알림 음소거 아이콘 */}
                  {chat.isMuted && <BellOff size={13} color={global.descriptionColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                </div>
                <p
                  style={{
                    margin: '2px 0 0',
                    color: '#3c2a2a',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    opacity: 0.9
                  }}
                >
                  {chat.message}
                </p>
              </div>
            </div>

            {/* 시간 및 안읽음 뱃지 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12, flexShrink: 0 }}>
              <span style={{ color: global.descriptionColor, fontSize: 11, opacity: 0.8 }}>{chat.time}</span>
              {chat.unread > 0 ? (
                <span
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: chatsTab.unreadBadgeBg,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                >
                  {chat.unread}
                </span>
              ) : <div style={{ height: 20 }} />}
            </div>
          </article>
        ))}
        </section>
      </div>

      <style jsx>{`
        .chats-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};