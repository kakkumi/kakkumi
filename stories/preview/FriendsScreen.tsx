import React from 'react';
import { Search, UserPlus, Music, Settings, ChevronDown, ArrowRight } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const myProfile = { name: '어피치', message: '테마 수정 중입니다 ✨' };

const updatedFriends = [
  { id: 1, name: '춘식이', color: '#FEE500', isAd: false },
  { id: 2, name: '라이언', color: '#A2C5FF', isAd: false },
  { id: 3, name: '카카오', color: '#FFB836', isAd: true },
  { id: 4, name: '어피치', color: '#FFDEDE', isAd: false },
];

const birthdayFriends = [
  { id: 1, name: '스카피', message: '오늘 · 내게 생일 선물 준 친구' },
  { id: 2, name: '죠르디', message: '오늘 · 내게 생일 선물 준 친구' },
  { id: 3, name: '어피치', message: '오늘' },
];

const newFriends = [
  { id: 1, name: '새로운 친구 1', message: '반갑습니다!' },
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
  alignItems: 'center',
  padding: '10px 16px',
  cursor: 'pointer',
};

const avatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '16px',
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
      friendsTab: {
        headerTitleColor: '#664242',
        headerIconColor: '#664242',
        profileNameColor: '#664242',
        updateSectionBg: '#F66C6C', // 어피치 테마의 섹션 타이틀/보더 컬러
      },
      chatsTab: {
        filterChipBg: '#F66C6C', // 배너 배경용으로 공용 사용
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const FriendsScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { global, friendsTab, chatsTab } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: global.backgroundColor,
        fontFamily: 'sans-serif',
      }}
    >
      
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: friendsTab.headerTitleColor }}>
        <h2 style={{ margin: 0, fontSize: 23, fontWeight: 800 }}>어피치</h2>
        <div style={iconRowStyle}>
          <Search size={22} />
          <UserPlus size={22} />
          <Music size={22} />
          <Settings size={22} />
        </div>
      </header>

      {/* 2. 친구 / 소식 토글 (스크린샷 고증) */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 16px 16px' }}>
        <button style={{ 
          backgroundColor: global.textColor, 
          color: global.backgroundColor, 
          borderRadius: 999, 
          padding: '7px 16px', 
          fontSize: 14, 
          fontWeight: 700, 
          border: 'none' 
        }}>
          친구 <span style={{ opacity: 0.8, fontSize: 12, marginLeft: 2 }}>1</span>
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.textColor, 
          borderRadius: 999, 
          padding: '7px 16px', 
          fontSize: 14, 
          fontWeight: 600, 
          border: `1px solid ${global.textColor}20` 
        }}>
          소식
        </button>
      </div>

      <div className="friends-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* 3. 상단 배너 영역 */}
        <div style={{ padding: '0 16px 16px 16px' }}>
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
              🍈🧀
            </div>
          </div>
        </div>

        {/* 4. 업데이트한 친구 영역 (가로 스크롤) */}
        <section style={{ padding: '8px 16px 16px 16px' }}>
          <p style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: friendsTab.updateSectionBg }}>
            업데이트한 친구 4
          </p>
          <div className="friends-scroll" style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {updatedFriends.map((friend) => (
              <div key={friend.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 20, backgroundColor: friend.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${global.backgroundColor}`, outline: `2px solid ${friendsTab.updateSectionBg}`
                }}>
                  {friend.name.slice(0, 1)}
                </div>
                {friend.isAd && (
                  <span style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#FF3B30', color: '#fff', fontSize: 8, fontWeight: 800, padding: '2px 4px', borderRadius: 4 }}>
                    AD
                  </span>
                )}
                <span style={{ fontSize: 11, color: global.textColor }}>{friend.name}</span>
              </div>
            ))}
            {/* 소식 더보기 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 20, backgroundColor: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${global.descriptionColor}40`
              }}>
                <ArrowRight size={20} color={global.descriptionColor} />
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor }}>소식 더보기</span>
            </div>
          </div>
        </section>

        <div style={{ height: 1, backgroundColor: `${global.descriptionColor}20`, margin: '0 16px' }} />

        {/* 5. 생일인 친구 영역 */}
        <section style={{ padding: '16px 0' }}>
          <p style={{ margin: '0 16px 8px 16px', fontSize: 12, fontWeight: 700, color: friendsTab.updateSectionBg }}>
            생일인 친구 8
          </p>
          
          {birthdayFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 44, height: 44, borderRadius: 16, backgroundColor: chatsTab.filterChipBg, color: global.textColor }}>
                  {friend.name.slice(0, 1)}
                </div>
                <div>
                  <p style={{ margin: 0, color: global.textColor, fontSize: 15, fontWeight: 600 }}>
                    {friend.name} <span style={{ fontSize: 12, color: friendsTab.updateSectionBg }}>🎂</span>
                  </p>
                  <p style={{ margin: '2px 0 0', color: global.descriptionColor, fontSize: 12 }}>{friend.message}</p>
                </div>
              </div>
              {/* 선물하기 버튼 */}
              <button style={{ 
                backgroundColor: 'transparent', 
                border: `1px solid ${global.descriptionColor}40`, 
                borderRadius: 999, 
                padding: '6px 12px', 
                fontSize: 12, 
                fontWeight: 600, 
                color: global.textColor,
                cursor: 'pointer'
              }}>
                선물하기
              </button>
            </article>
          ))}

          {/* 더보기 토글 버튼 */}
          <div style={{ padding: '8px 16px' }}>
            <button style={{ 
              width: '100%', 
              padding: '10px', 
              backgroundColor: 'transparent', 
              border: `1px solid ${global.descriptionColor}30`, 
              borderRadius: 8, 
              color: global.descriptionColor, 
              fontSize: 13, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 4,
              cursor: 'pointer'
            }}>
              오늘 생일 친구 더보기 <ChevronDown size={16} />
            </button>
          </div>
        </section>

        <div style={{ height: 1, backgroundColor: `${global.descriptionColor}20`, margin: '0 16px' }} />

        {/* 6. 새로운 친구 영역 */}
        <section style={{ padding: '16px 0' }}>
          <p style={{ margin: '0 16px 8px 16px', fontSize: 12, fontWeight: 700, color: friendsTab.updateSectionBg }}>
            새로운 친구 1
          </p>
          {newFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 44, height: 44, borderRadius: 16, backgroundColor: '#E2E2E2', color: '#888' }}>
                  {friend.name.slice(0, 1)}
                </div>
                <div>
                  <p style={{ margin: 0, color: global.textColor, fontSize: 15, fontWeight: 600 }}>{friend.name}</p>
                  <p style={{ margin: '2px 0 0', color: global.descriptionColor, fontSize: 12 }}>{friend.message}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>

      <style jsx>{`
        .friends-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};