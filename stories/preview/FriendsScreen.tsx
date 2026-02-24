import React from 'react';
import { Search, UserPlus, Music, Settings, ChevronDown, ArrowRight } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const myProfile = { name: '어피치', message: '테마 수정 중입니다 ✨' };

const updatedFriends = [
  { id: 1, name: '춘식이', color: '#FEE500', isAd: false, hasNew: true },
  { id: 2, name: '라이언', color: '#A2C5FF', isAd: false, hasNew: true },
  { id: 3, name: '카카오', color: '#FFB836', isAd: true, hasNew: true },
  { id: 4, name: '어피치', color: '#FFDEDE', isAd: false, hasNew: true },
];

const birthdayFriends = [
  { id: 1, name: '스카피', message: '오늘 · 내게 생일 선물 준 친구' },
  { id: 2, name: '죠르디', message: '오늘 · 내게 생일 선물 준 친구' },
  { id: 3, name: '어피치', message: '오늘' },
  { id: 4, name: '라이언', message: '오늘' },
  { id: 5, name: '춘식이', message: '오늘' },
];

const newFriends = [
  { id: 1, name: '새로운 친구 1', message: '' },
];

const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '27px 14px 8px 14px',
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
        filterChipBg: '#FFFFFF', // 카카오톡 배너 배경은 흰색에 투명도를 줌
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const FriendsScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>어피치</h2>
        </div>
        <div style={iconRowStyle}>
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
          padding: '6px 14px', 
          fontSize: 13, 
          fontWeight: 700, 
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          친구 <span style={{ opacity: 0.9, fontSize: 12, fontWeight: 500 }}></span>
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.textColor, 
          borderRadius: 999, 
          padding: '6px 14px', 
          fontSize: 13, 
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
                오늘의 카카오가 궁금하다면?
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: global.descriptionColor, opacity: 0.8 }}>
                카카오소식 보러가기
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 22 }}>
              <span style={{ transform: 'rotate(-10deg)' }}>🍈</span>
              <span style={{ transform: 'rotate(10deg)' }}>🧀</span>
              <div style={{ 
                backgroundColor: '#191919', color: '#fff', fontSize: 12, fontWeight: 800, 
                padding: '2px 6px', borderRadius: 4, marginLeft: 4 
              }}>31</div>
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
                    <span style={{ fontSize: 18 }}>{friend.name.slice(0, 1) === '춘' ? '🍠' : friend.name.slice(0, 1) === '라' ? '🦁' : friend.name.slice(0, 1) === '카' ? '🐻' : '🍑'}</span>
                  </div>
                  
                  {/* 빨간색 업데이트 점 (좌측 상단) */}
                  {friend.hasNew && (
                    <div style={{
                      position: 'absolute', top: -2, left: -2, width: 5, height: 5,
                      backgroundColor: friendsTab.updateSectionBg, borderRadius: '50%',
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
            생일인 친구 8
          </p>
          
          {birthdayFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 40, height: 40, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.6)', color: global.textColor }}>
                  <span style={{ fontSize: 18 }}>{friend.name.slice(0, 1) === '스' ? '🐰' : friend.name.slice(0, 1) === '죠' ? '🦖' : friend.name.slice(0, 1) === '어' ? '🍑' : friend.name.slice(0, 1) === '라' ? '🦁' : '🍠'}</span>
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
              padding: '7px 12px', 
              backgroundColor: 'transparent', 
              border: `1px solid ${global.descriptionColor}20`, 
              borderRadius: 999, // 스크린샷처럼 완전히 둥근 모서리
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
            새로운 친구 1
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