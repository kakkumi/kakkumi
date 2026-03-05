import React from 'react';
import { Search, UserPlus, Music, Settings, ChevronDown, ArrowRight } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const myProfile = { name: '카꾸미', message: '테마 수정 중입니다 ✨' };

const updatedFriends = [
  { id: 1, name: '서울', color: '#FEE500', isAd: false, hasNew: true },
  { id: 2, name: '부산', color: '#A2C5FF', isAd: false, hasNew: true },
  { id: 3, name: '제주', color: '#FFB836', isAd: true, hasNew: true },
  { id: 4, name: '여수', color: '#FFDEDE', isAd: false, hasNew: true },
];

const birthdayFriends = [
  { id: 1, name: '경주', message: '오늘 · 내게 생일 선물 준 친구' },
  { id: 2, name: '강릉', message: '오늘' },
  { id: 3, name: '전주', message: '오늘 · 내게 생일 선물 준 친구' },
];

const newFriends = [
  { id: 1, name: '거제', message: '친구 1' },
  { id: 2, name: '광주', message: '친구 2' },
  { id: 3, name: '대전', message: '친구 3' },
  { id: 4, name: '목포', message: '친구 4' },
  { id: 5, name: '속초', message: '친구 5' },
  { id: 6, name: '안동', message: '친구 6' },
  { id: 7, name: '울산', message: '친구 7' },
  { id: 8, name: '인천', message: '친구 8' },
  { id: 9, name: '전주', message: '친구 9' },
  { id: 10, name: '춘천', message: '친구 10' },
  { id: 11, name: '통영', message: '친구 11' },
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
  alignItems: 'center',
  padding: '8px 14px',
  cursor: 'pointer',
};

const avatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '15px',
};

// Zustand Store Mock (Apeach 테마 컬러 적용)
interface ThemeState {
  themeConfig: {
    global: { backgroundColor: string; textColor: string; descriptionColor: string };
    friendsTab: { headerTitleColor: string; headerIconColor: string; profileNameColor: string; updateSectionBg: string };
    chatsTab: { filterChipBg: string };
  };
}

const useThemeStore = (selector: (state: ThemeState) => ThemeState['themeConfig']) => {
  const state: ThemeState = {
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
        updateSectionBg: '#F66C6C',
      },
      chatsTab: {
        filterChipBg: '#FFFFFF',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const FriendsScreen = () => {
  const themeConfig = useThemeStore((state) => state.themeConfig);
  const { global, friendsTab } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: global.backgroundColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      
      {/* 1. 상단 헤더 */}
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

      {/* 2. 친구 / 소식 토글 */}
      <div style={{ display: 'flex', gap: 7, padding: '2px 14px 12px 14px' }}>
        <button style={{ 
          backgroundColor: global.textColor, 
          color: global.backgroundColor, 
          borderRadius: 999, 
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          친구 <span style={{ opacity: 0.9, fontSize: 11, fontWeight: 500 }}></span>
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.textColor, 
          borderRadius: 999, 
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 600,
          border: `1px solid ${global.textColor}30`
        }}>
          소식
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="friends-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        
        {/* 3. 상단 배너 영역 */}
        <div style={{ padding: '0 14px 12px 14px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.6)', // 사진과 동일한 부드러운 반투명 흰색 배경
            borderRadius: 11,
            padding: '13px 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>
                크리에이터가 되어 수익을 만들어보세요
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: global.descriptionColor, opacity: 0.8 }}>
                입점 신청하기
              </p>
            </div>
          </div>
        </div>

        {/* 4. 업데이트한 친구 영역 (가로 스크롤) */}
        <section style={{ padding: '6px 0 8px 0' }}>
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: friendsTab.updateSectionBg }}>
            업데이트한 친구 4
          </p>
          <div
            className="friends-scroll"
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              padding: '4px 10px 2px 10px',
            }}
          >
            {updatedFriends.map((friend) => (
              <div key={friend.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ position: 'relative' }}>
                  {/* 프사 테두리 링 */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 18, backgroundColor: friend.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${global.backgroundColor}`
                  }}>
                    <span style={{ fontSize: 18 }}>👤</span>
                  </div>
                  
                  {/* 빨간색 업데이트 점 (좌측 상단) */}
                  {friend.hasNew && (
                    <div style={{
                      position: 'absolute', top: -2, left: -2, width: 5, height: 5,
                      backgroundColor: '#f61010', borderRadius: '50%',
                      border: `1px solid ${global.backgroundColor}`
                    }} />
                  )}
                  
                  {/* AD 배지 (우측 상단) */}
                  {friend.isAd && (
                    <div style={{ 
                      position: 'absolute', top: -4, right: -6, backgroundColor: '#FFFFFF', 
                      color: global.descriptionColor, fontSize: 7, fontWeight: 800, 
                      padding: '1px 2px', borderRadius: 4, border: `1px solid ${global.descriptionColor}40`
                    }}>
                      AD
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: global.textColor, opacity: 0.9 }}>{friend.name}</span>
              </div>
            ))}
            
            {/* 소식 더보기 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', backgroundColor: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${global.descriptionColor}40`,
                marginTop: 2,
              }}>
                <ArrowRight size={13} color={global.descriptionColor} />
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor, marginTop: 8 }}>소식 더보기</span>
            </div>
          </div>
        </section>

        {/* 얇은 구분선 */}
        <div style={{ height: 1, backgroundColor: `${global.descriptionColor}15`, margin: '2px 14px' }} />

        {/* 5. 생일인 친구 영역 */}
        <section style={{ padding: '8px 0' }}>
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: friendsTab.updateSectionBg }}>
            생일인 친구 5
          </p>
          
          {birthdayFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', color: global.textColor }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: global.textColor, fontSize: 14, fontWeight: 600 }}>{friend.name}</p>
                    <span style={{ fontSize: 13, color: friendsTab.updateSectionBg, marginTop: -2 }}>🎂</span>
                  </div>
                  <p style={{ margin: '2px 0 0', color: global.descriptionColor, fontSize: 11, opacity: 0.8 }}>{friend.message}</p>
                </div>
              </div>
              {/* 선물하기 버튼 - 스크린샷과 동일한 타원형 */}
              <button style={{ 
                backgroundColor: 'transparent', 
                border: `1px solid ${global.descriptionColor}30`, 
                borderRadius: 999, 
                padding: '5px 10px', 
                fontSize: 11, 
                fontWeight: 600, 
                color: global.textColor,
                cursor: 'pointer'
              }}>
                선물하기
              </button>
            </article>
          ))}

          {/* 더보기 토글 버튼 */}
          <div style={{ padding: '10px 14px 6px 14px', display: 'flex', justifyContent: 'center' }}>
            <button style={{ 
              width: 'auto',
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${global.descriptionColor}20`, 
              borderRadius: 999,
              color: global.descriptionColor,
              fontSize: 12, 
              fontWeight: 500,
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 3,
              cursor: 'pointer'
            }}>
              오늘 생일 친구 더보기 <ChevronDown size={14} strokeWidth={2} />
            </button>
          </div>
        </section>

        {/* 얇은 구분선 */}
        <div style={{ height: 1, backgroundColor: `${global.descriptionColor}15`, margin: '3px 14px' }} />

        {/* 6. 새로운 친구 영역 */}
        <section style={{ padding: '12px 0 28px 0' }}>
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: friendsTab.updateSectionBg }}>
            친구 11
          </p>
          {newFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', color: global.textColor }}>
                  <span style={{ fontSize: 18 }}>🐰</span>
                </div>
                <div>
                  <p style={{ margin: 0, color: global.textColor, fontSize: 14, fontWeight: 600 }}>{friend.name}</p>
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