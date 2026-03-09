import React from 'react';
import { Search, UserPlus, Music, Settings, ChevronDown, ArrowRight } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const myProfile = { name: '카꾸미', message: '테마 수정 중입니다 ✨' };

const personSVG = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="5" fill="rgba(120,120,120,0.55)"/>
    <path d="M5 21 Q4 21 4 20 Q4 13 12 13 Q20 13 20 20 Q20 21 19 21 Z" fill="rgba(120,120,120,0.55)"/>
  </svg>
);

const updatedFriends = [
  { id: 1, name: '서울', color: '#FEE500', isAd: false, hasNew: true },
  { id: 2, name: '부산', color: '#A2C5FF', isAd: false, hasNew: true },
  { id: 3, name: '제주', color: '#c3c3c3', isAd: true, hasNew: true },
  { id: 4, name: '여수', color: '#FFDEDE', isAd: false, hasNew: true },
];

const birthdayFriends = [
  { id: 1, name: '경주', message: '오늘 · 내게 생일 선물 준 친구', color: '#B5EAD7' },
  { id: 2, name: '강릉', message: '오늘', color: '#D4E09B' },
  { id: 3, name: '전주', message: '오늘 · 내게 생일 선물 준 친구', color: '#C7CEEA' },
];

const newFriends = [
  { id: 1,  name: '강릉', color: '#D4E09B' },
  { id: 2,  name: '거제', color: '#FFD6A5' },
  { id: 3,  name: '경주', color: '#B5EAD7' },
  { id: 4,  name: '광주', color: '#CAFFBF' },
  { id: 5,  name: '대전', color: '#9BF6FF' },
  { id: 6,  name: '목포', color: '#BDB2FF' },
  { id: 7,  name: '부산', color: '#A2C5FF' },
  { id: 8,  name: '서울', color: '#FEE500' },
  { id: 9,  name: '속초', color: '#FFC6FF' },
  { id: 10, name: '안동', color: '#FDFFB6' },
  { id: 11, name: '여수', color: '#FFDEDE' },
  { id: 12, name: '울산', color: '#A0C4FF' },
  { id: 13, name: '인천', color: '#FFB5A7' },
  { id: 14, name: '전주', color: '#C7CEEA' },
  { id: 15, name: '제주', color: '#c3c3c3' },
  { id: 16, name: '춘천', color: '#F6C3E5' },
  { id: 17, name: '통영', color: '#C9E4DE' },
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

// -------------------------------------------------------------------------

export interface ScreenThemeConfig {
  bodyBg: string;
  headerBg: string;
  headerText: string;
  primaryText: string;
  descText: string;
  tabBarBg: string;
  tabBarIcon: string;
  tabBarSelectedIcon: string;
  friendsSelectedBg: string;
  chatBg: string;
  otherBubbleBg: string;
  myBubbleBg: string;
  inputBarBg: string;
  sendBtnBg: string;
  passcodeBg: string;
  passcodeTitleText: string;
  passcodeKeypadText: string;
  unreadCountColor: string;
  openchatBg: string;
  mainBgImageUrl?: string;
  chatListLastMsgText?: string;
  chatListNamePressColor?: string;
  chatListLastMsgPressColor?: string;
  chatListSelectedBg?: string;
  chatListSelectedBgAlpha?: string;
  friendsListDescText?: string;
  friendsSelectedBgAlpha?: string;
  moreTabTextColor?: string;
  chatroomBgImageUrl?: string;
  myBubbleText?: string;
  myBubbleSelectedText?: string;
  myBubbleUnreadText?: string;
  friendBubbleText?: string;
  friendBubbleSelectedText?: string;
  friendBubbleUnreadText?: string;
  bubbleSend1Url?: string;
  bubbleSend1SelectedUrl?: string;
  bubbleSend2Url?: string;
  bubbleReceive1Url?: string;
  bubbleReceive1SelectedUrl?: string;
  bubbleReceive2Url?: string;
}

export const FriendsScreen = React.memo(function FriendsScreen({ config }: { config: ScreenThemeConfig }) {
  const global = {
    backgroundColor: config.bodyBg,
    textColor: config.primaryText,
    descriptionColor: config.descText,
    listDescColor: config.friendsListDescText ?? config.descText,
  };
  const backgroundStyle: React.CSSProperties = config.mainBgImageUrl
    ? {
        backgroundColor: 'transparent',
      }
    : {};

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: global.backgroundColor,
        ...backgroundStyle,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: global.textColor }}>
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
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>카꾸미</h2>
        </div>
        <div data-active-element-id="header-title-icon" style={{ ...iconRowStyle, color: global.textColor }}>
          <Search size={20} strokeWidth={2.3} color={global.textColor} />
          <UserPlus size={20} strokeWidth={2.3} color={global.textColor} />
          <Music size={20} strokeWidth={2.3} color={global.textColor} />
          <Settings size={20} strokeWidth={2.3} color={global.textColor} />
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
          fontWeight: 400,
          border: 'none',
        }}>
          친구
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.textColor, 
          borderRadius: 999, 
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 400,
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
            backgroundColor: '#F5F0E8',
            borderRadius: 11,
            padding: '13px 15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#3c2a2a' }}>
                크리에이터가 되어 수익을 만들어보세요
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgb(120,100,80)' }}>
                카꾸미 입점 신청하기
              </p>
            </div>
          </div>
        </div>

        {/* 4. 업데이트한 친구 영역 (가로 스크롤) */}
        <section style={{ padding: '6px 0 8px 0' }}>
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: global.descriptionColor }}>
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
                  }}>
                    <span style={{ fontSize: 18 }}>
                      {personSVG}
                    </span>
                  </div>
                  
                  {/* 빨간색 업데이트 점 (좌측 상단) */}
                  {friend.hasNew && (
                    <div style={{
                      position: 'absolute', top: -2, left: -2, width: 5, height: 5,
                      backgroundColor: '#f61010', borderRadius: '50%',
                      border: '1px solid #f61010'
                    }} />
                  )}
                  
                  {/* AD 배지 제거 */}
                </div>
                <span style={{ fontSize: 11, color: global.textColor, fontWeight: 400, opacity: 0.9 }}>{friend.name}</span>
              </div>
            ))}
            
            {/* 소식 더보기 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', backgroundColor: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${global.textColor}40`,
                marginTop: 2,
              }}>
                <ArrowRight size={13} color={global.listDescColor} />
              </div>
              <span style={{ fontSize: 11, color: global.textColor, marginTop: 8 }}>소식 더보기</span>
            </div>
          </div>
        </section>

        {/* 얇은 구분선 */}
        <div style={{ height: 1, backgroundColor: `${global.descriptionColor}15`, margin: '2px 14px' }} />

        {/* 5. 생일인 친구 영역 */}
        <section style={{ padding: '8px 0' }}>
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: global.descriptionColor }}>
            생일인 친구 5
          </p>
          
          {birthdayFriends.map((friend) => {
            const alpha = parseFloat(config.friendsSelectedBgAlpha ?? '1.0');
            const hexAlpha = Math.round(alpha * 255).toString(16).padStart(2, '0');
            return (
            <article key={friend.id} style={{
              ...listItemBaseStyle,
              ...(friend.id === 2 ? {
                backgroundColor: `${config.friendsSelectedBg}${hexAlpha}`,
                margin: '0 3px',
                padding: '8px 11px',
                borderRadius: 20,
              } : {}),
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 38, height: 38, borderRadius: 14, backgroundColor: friend.color, color: global.textColor }}>
                  {personSVG}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 1, height: 20, overflow: 'visible' }}>
                    <p style={{ margin: 0, color: global.textColor, fontSize: 14, fontWeight: 400, lineHeight: '20px' }}>{friend.name}</p>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: 0, marginLeft: 3 }}>
                      {/* 초 */}
                      <rect x="11" y="2" width="2" height="4" rx="1" fill="#ff3333"/>
                      {/* 불꽃 */}
                      <ellipse cx="12" cy="2" rx="1.2" ry="1.5" fill="#ff8c00"/>
                      {/* 케이크 윗층 */}
                      <rect x="5" y="9" width="14" height="5" rx="2" fill="#ff3333"/>
                      {/* 크림 물결 */}
                      <path d="M5 9 Q7 7 9 9 Q11 7 13 9 Q15 7 17 9 Q19 7 19 9" stroke="#fff" strokeWidth="1.2" fill="none"/>
                      {/* 케이크 아랫층 */}
                      <rect x="3" y="14" width="18" height="6" rx="2" fill="#ff3333"/>
                      {/* 크림 물결 */}
                      <path d="M3 14 Q5 12 7 14 Q9 12 11 14 Q13 12 15 14 Q17 12 19 14 Q21 12 21 14" stroke="#fff" strokeWidth="1.2" fill="none"/>
                    </svg>
                  </div>
                  <p style={{ margin: '2px 0 0', color: global.listDescColor, fontSize: 11, opacity: 0.8 }}>{friend.message}</p>
                </div>
              </div>
              {/* 선물하기 버튼 - 스크린샷과 동일한 타원형 */}
              <button style={{ 
                backgroundColor: 'transparent', 
                border: `1px solid ${global.textColor}30`,
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
            );
          })}

          {/* 더보기 토글 버튼 */}
          <div style={{ padding: '10px 14px 6px 14px', display: 'flex', justifyContent: 'center' }}>
            <button style={{ 
              width: 'auto',
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${global.listDescColor}60`,
              borderRadius: 999,
              color: global.listDescColor,
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
          <p style={{ margin: '0 14px 10px 14px', fontSize: 11, fontWeight: 600, color: global.descriptionColor }}>
            친구 18
          </p>
          {newFriends.map((friend) => (
            <article key={friend.id} style={listItemBaseStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ ...avatarStyle, width: 38, height: 38, borderRadius: 14, backgroundColor: friend.color, color: global.textColor }}>
                  {personSVG}
                </div>
                <div>
                  <p style={{ margin: friend.id === 2 ? '0 0 1px' : '0', color: global.textColor, fontSize: 14, fontWeight: 400 }}>{friend.name}</p>
                  {friend.id === 2 && (
                    <p style={{ margin: 0, color: global.listDescColor, fontSize: 11, opacity: 0.8 }}>안녕하세요</p>
                  )}
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
});
