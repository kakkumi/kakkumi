import React from 'react';
import { MessageCircle, Search, Settings, ListFilter } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const chats = [
  { id: 1, room: '어피치', message: '오늘의 장보기 목록', time: '오후 12:30', unread: 0 },
  { id: 2, room: '춘식이', message: '좋은 하루 보내~', time: '오후 12:30', unread: 2 },
  { id: 3, room: '탄천 러닝함께해요 🏃‍♀️', message: '러닝이 최고죠', time: '오후 12:30', unread: 10 },
  { id: 4, room: '월간 독서 모임 📚', message: '오늘 모임도 즐거웠어요', time: '어제', unread: 0 },
  { id: 5, room: '동네 친구들 🏘️', message: '사진 고마워!', time: '8월 12일', unread: 0 },
];

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

const listItemBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const avatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '18px',
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
        filterChipBg: '#F66C6C', // 어피치 테마의 밝은 핑크색
        filterChipActiveBg: '#664242', // 선택된 칩의 짙은 배경
        filterChipTextColor: '#FFDEDE', // 선택된 칩의 글자색
        unreadBadgeBg: '#FF7F7F',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const MainScreen = () => {
  // Zustand 스토어에서 최신 카카오톡 테마 상태값들을 모두 불러옵니다.
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { global, chatsTab } = themeConfig;

  // 상단 필터 칩 더미 데이터 (이미지 고증)
  const filterChips = [
    { label: '전체', count: null, isActive: false },
    { label: '안읽음', count: 40, isActive: false },
    { label: '친구', count: 12, isActive: true }, // '친구' 탭이 활성화된 상태 모방
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
        fontFamily: 'sans-serif',
      }}
    >
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: chatsTab.headerTitleColor }}>
        <h2 style={{ margin: 0, fontSize: 23, fontWeight: 700 }}>채팅</h2>
        <div style={iconRowStyle}>
          <Search size={22} />
          <MessageCircle size={22} />
          <Settings size={22} />
        </div>
      </header>

      {/* 2. 필터 칩 영역 (이미지 UI 반영) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
        }}
      >
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px' }}>
          {filterChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              style={{
                border: 0,
                flexShrink: 0,
                borderRadius: 999,
                // 활성화 여부에 따라 배경색과 글자색 스위칭
                backgroundColor: chip.isActive ? chatsTab.filterChipActiveBg : chatsTab.filterChipBg,
                color: chip.isActive ? chatsTab.filterChipTextColor : global.textColor,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: chip.isActive ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <span>{chip.label}</span>
              {/* 카운트 배지 (ex: 안읽음 40, 친구 12) */}
              {chip.count && (
                <span style={{ 
                  color: chip.isActive ? chatsTab.unreadBadgeBg : global.textColor,
                  fontSize: 12, 
                  fontWeight: 700 
                }}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* 우측 정렬 아이콘 */}
        <ListFilter size={20} color={global.textColor} style={{ marginLeft: 8, flexShrink: 0 }} />
      </div>

      {/* 3. 상단 배너 영역 (오늘의 카카오가 궁금하다면?) */}
      <div style={{ padding: '4px 16px 16px 16px' }}>
        <div style={{
          backgroundColor: chatsTab.filterChipBg,
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>
              오늘의 카카오가 궁금하다면?
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: global.descriptionColor }}>
              카카오소식 보러가기
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4, fontSize: 22 }}>
            🍈🧀 {/* 카카오 소식 이모지 모방 */}
          </div>
        </div>
      </div>

      {/* 4. 채팅방 리스트 영역 */}
      <section className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {chats.map((chat) => (
          <article key={chat.id} style={{ ...listItemBaseStyle, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
              {/* 프로필 이미지 (임시) */}
              <div style={{ 
                ...avatarStyle, 
                width: 48, 
                height: 48, 
                borderRadius: 18, 
                backgroundColor: chatsTab.filterChipBg,
                color: global.textColor
              }}>
                {chat.room.slice(0, 1)}
              </div>
              
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, color: global.textColor, fontSize: 16, fontWeight: 600 }}>
                  {chat.room}
                </p>
                <p
                  style={{
                    margin: '3px 0 0',
                    color: global.descriptionColor,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {chat.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, marginLeft: 12 }}>
              <span style={{ color: global.descriptionColor, fontSize: 11 }}>{chat.time}</span>
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
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {chat.unread}
                </span>
              ) : <div style={{ height: 20 }} />} {/* 레이아웃 틀어짐 방지용 빈 공간 */}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};