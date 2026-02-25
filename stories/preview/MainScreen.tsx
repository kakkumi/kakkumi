import React from 'react';
import { MessageCircle, Search, Settings, ListFilter, Pin, BellOff, Flag } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const chats = [
  { id: 1, type: 'single', room: '어피치', message: '오늘의 장보기 목록', time: '오후 12:30', unread: 0, isPinned: true, isMuted: false, avatars: ['🍑'] },
  { id: 2, type: 'single', room: '춘식이', message: '좋은 하루 보내~', time: '오후 12:30', unread: 2, isPinned: false, isMuted: true, avatars: ['🍠'] },
  { id: 3, type: 'single', room: '탄천런닝할게요', message: '러닝이 최고죠', time: '오후 12:30', unread: 10, isPinned: true, isMuted: false, avatars: ['🏃‍♀️'] },
  { id: 4, type: 'group2', room: '월간 독서 모임 3', message: '오늘 모임도 즐거웠어요', time: '어제', unread: 0, isPinned: false, isMuted: false, avatars: ['🐰', '🐻'] },
  { id: 5, type: 'group4', room: '동네 친구들 13', message: '사진 고마워!', time: '9월 12일', unread: 0, isPinned: false, isMuted: false, avatars: ['🦁', '🐻', '🐥', '🦖'] },
];

const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '26px 16px 12px 16px', // FriendsScreen과 완벽히 일치하는 패딩
  backgroundColor: 'transparent',
};

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
};

const listItemBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'pointer',
  padding: '12px 16px',
};

// Zustand Store Mock (Apeach 테마 컬러 적용)
const useThemeStore = (selector: any) => {
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
        unreadBadgeBg: '#F66C6C', // 안읽음 숫자 뱃지의 다홍색
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const MainScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { global, chatsTab } = themeConfig;

  // 상단 필터 칩 더미 데이터 (스크린샷 100% 고증)
  const filterChips = [
    { label: '전체', count: null, isActive: false },
    { label: '안읽음', count: 40, isActive: false },
    { label: '친구', count: 12, isActive: true }, 
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
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>채팅</h2>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={22} strokeWidth={2.5} />
          <MessageCircle size={22} strokeWidth={2.5} />
          <Settings size={22} strokeWidth={2.5} />
        </div>
      </header>

      {/* 2. 필터 칩 영역 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 16px 12px 16px',
        }}
      >
        <div className="chats-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              style={{
                border: 0,
                flexShrink: 0,
                borderRadius: 999,
                backgroundColor: chip.isActive ? chatsTab.filterChipActiveBg : chatsTab.filterChipBg,
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
            backgroundColor: chatsTab.filterChipBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ListFilter size={18} color={global.textColor} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="chats-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* 3. 상단 배너 영역 */}
        <div style={{ padding: '0 16px 16px 16px' }}>
        <div style={{
          backgroundColor: chatsTab.filterChipBg,
          borderRadius: 12,
          padding: '16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: global.textColor }}>
              오늘의 카카오가 궁금하다면?
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: global.descriptionColor, opacity: 0.8 }}>
              카카오소식 보러가기
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 24 }}>
            <span style={{ transform: 'rotate(-10deg)' }}>🍈</span>
            <span style={{ transform: 'rotate(10deg)' }}>🧀</span>
            <div style={{ 
              backgroundColor: '#191919', color: '#fff', fontSize: 13, fontWeight: 800, 
              padding: '2px 6px', borderRadius: 4, marginLeft: 4 
            }}>31</div>
          </div>
        </div>
      </div>

      {/* 4. 채팅방 리스트 영역 */}
        <section style={{ paddingBottom: 40 }}>
        {chats.map((chat) => (
          <article key={chat.id} style={listItemBaseStyle}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
              
              {/* 프사 영역 (단일 / 2인 그룹 / 4인 그룹 대응) */}
              <div style={{ width: 48, height: 48, position: 'relative', flexShrink: 0 }}>
                {chat.type === 'single' && (
                  <div style={{ width: '100%', height: '100%', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {chat.avatars[0]}
                  </div>
                )}
                {chat.type === 'group2' && (
                  <>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 32, height: 32, borderRadius: 12, backgroundColor: '#A2C5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {chat.avatars[0]}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 12, backgroundColor: '#FFB836', border: `2px solid ${global.backgroundColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {chat.avatars[1]}
                    </div>
                  </>
                )}
                {chat.type === 'group4' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden' }}>
                    {chat.avatars.map((av, idx) => (
                      <div key={idx} style={{ backgroundColor: ['#A2C5FF','#FFB836','#FFDEDE','#A0E5A0'][idx], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                        {av}
                      </div>
                    ))}
                  </div>
                )}
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
                  <p style={{ margin: 0, color: global.textColor, fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.room}
                  </p>
                  {/* 핀 고정 아이콘 */}
                  {chat.isPinned && <Pin size={12} color={global.descriptionColor} fill={global.descriptionColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                  {/* 알림 음소거 아이콘 */}
                  {chat.isMuted && <BellOff size={13} color={global.descriptionColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                </div>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: global.descriptionColor,
                    fontSize: 13,
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 12, flexShrink: 0 }}>
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