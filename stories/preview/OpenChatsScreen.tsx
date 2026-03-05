import React from 'react';
import { Search, Settings, MoreHorizontal, MessageCircle } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
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

// Zustand Store Mock (Apeach 테마 컬러 적용)
interface OpenChatsThemeState {
  themeConfig: {
    global: { backgroundColor: string; textColor: string; descriptionColor: string };
    openChatsTab: { headerTitleColor: string; bannerBackgroundColor: string };
  };
}

const useThemeStore = (selector: (state: OpenChatsThemeState) => OpenChatsThemeState['themeConfig']) => {
  const state: OpenChatsThemeState = {
    themeConfig: {
      global: {
        backgroundColor: '#FFFFFF',
        textColor: '#664242',
        descriptionColor: '#805959',
      },
      openChatsTab: {
        headerTitleColor: '#664242',
        bannerBackgroundColor: 'rgba(255, 255, 255, 0.6)',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const OpenChatsScreen = () => {
  const themeConfig = useThemeStore((state: OpenChatsThemeState) => state.themeConfig);
  const { global, openChatsTab } = themeConfig;

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
      <header style={{ ...headerBaseStyle, color: openChatsTab.headerTitleColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>지금</h2>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={20} strokeWidth={2.3} />
          <div style={{ position: 'relative', display: 'inline-flex', width: 20, height: 20 }}>
            {/* 말풍선 아이콘: 우상단 +버튼 영역만큼 잘림 */}
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              clipPath: 'polygon(0% 0%, 62% 0%, 62% 38%, 100% 38%, 100% 100%, 0% 100%)',
            }}>
              <MessageCircle size={19} strokeWidth={2.3} />
            </div>
            {/* + 버튼: 배경 없이 텍스트만 */}
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: 'currentColor',
              fontSize: 11,
              fontWeight: 900,
              WebkitTextStroke: '0.5px currentColor',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}>+</span>
          </div>
          <Settings size={20} strokeWidth={2.3} />
        </div>
      </header>

      {/* 2. 필터 칩 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px 12px 14px' }}>
        <div className="chats-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          {[
            { label: '숏폼', isActive: false },
            { label: '오픈채팅', isActive: true },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              style={{
                border: chip.isActive ? 'none' : `1px solid ${global.textColor}30`,
                flexShrink: 0,
                borderRadius: 999,
                backgroundColor: chip.isActive ? '#000000' : 'transparent',
                color: chip.isActive ? '#FFFFFF' : global.textColor,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {chip.label}
              {chip.isActive && (
                <span style={{
                  backgroundColor: '#ff6507',
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: 500,
                  minWidth: 16,
                  height: 16,
                  lineHeight: '16px',
                  textAlign: 'center',
                  padding: '0 4px',
                  borderRadius: 999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  999+
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="chats-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>

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
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>
                테마 만들기는?
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: global.descriptionColor, opacity: 0.8 }}>
                카꾸미
              </p>
            </div>
          </div>
        </div>

        {/* 부산, 속초 채팅방 */}
        <section style={{ marginBottom: 8 }}>
          {[
            { id: 2, room: '부산', message: '오늘 하루도 수고했어 잘 자', time: '오후 11:31', unread: 0, avatars: ['🌊'], color: '#A2C5FF' },
            { id: 3, room: '속초', message: '새 테마 입혔더니 카톡이 달라보여', time: '오후 6:33', unread: 0, avatars: ['🏔️'], color: '#FFC6FF' },
          ].map((chat) => (
            <article key={chat.id} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '7px 16px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
                <div style={{ width: 46, height: 46, position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 17, backgroundColor: chat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="7" r="5" fill="rgba(120,120,120,0.55)"/>
                      <path d="M5 21 Q4 21 4 20 Q4 13 12 13 Q20 13 20 20 Q20 21 19 21 Z" fill="rgba(120,120,120,0.55)"/>
                    </svg>
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: '#3c2a2a', fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.room}
                    </p>
                  </div>
                  <p style={{ margin: '2px 0 0', color: '#3c2a2a', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.9 }}>
                    {chat.message}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                <span style={{ color: global.descriptionColor, fontSize: 11, opacity: 0.8 }}>{chat.time}</span>
                <div style={{ height: 20 }} />
              </div>
            </article>
          ))}
        </section>

        {/* 4. 피드 목록 영역 */}
        <section style={{ padding: '8px 0 40px 0' }}>
          <p style={{ margin: '0 16px 16px 16px', fontSize: 15, fontWeight: 400, color: global.textColor }}>
            지금 뜨는 커뮤니티
          </p>

          {/* 피드 1 & 2 (스레드로 연결된 피드) */}
          <div style={{ position: 'relative', padding: '0 16px' }}>
            {/* 세로 스레드 연결선 */}
            <div style={{ 
              position: 'absolute', 
              top: 40, 
              bottom: 40, 
              left: 36, // 아바타 중앙 정렬
              width: 1.5, 
              backgroundColor: `${global.descriptionColor}30` 
            }} />

            {/* 메인 피드 (해외 여행 사진방) */}
            <article style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 16, backgroundColor: '#A2C5FF', 
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, border: `3px solid ${global.backgroundColor}` // 선과 겹치는 부분 깔끔하게 처리
                }}>
                  🗼
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 400, color: global.textColor }}>해외 여행 사진방</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: global.descriptionColor, opacity: 0.9 }}>
                        <span>설레이는 어피치</span>
                        <span>·</span>
                        <span>30분 전</span>
                        <span style={{ backgroundColor: 'rgba(162, 126, 255, 0.15)', color: '#A27EFF', padding: '1px 6px', borderRadius: 4, fontWeight: 400, fontSize: 11, marginLeft: 2 }}>
                          여행
                        </span>
                      </div>
                    </div>
                    <MoreHorizontal size={20} color={global.descriptionColor} style={{ opacity: 0.6 }} />
                  </div>
                  
                  {/* 본문 이미지 */}
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#D1D6D2', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
                     <span style={{ fontSize: 60 }}>🗼</span> {/* 에펠탑 이미지 모방 */}
                  </div>

                  {/* 리액션 영역 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.descriptionColor, fontWeight: 400 }}>
                      <span style={{ fontSize: 16, marginRight: 4 }}>❤️😮</span>
                      12
                    </div>
                    <span style={{ color: global.descriptionColor, opacity: 0.5 }}>·</span>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.descriptionColor, fontWeight: 400, gap: 4 }}>
                      댓글 16
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 댓글형 피드 (설레이는 라이언) */}
            <article style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 28, height: 28, borderRadius: 10, backgroundColor: '#FFB836', 
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, marginLeft: 6, border: `3px solid ${global.backgroundColor}` // 아바타 사이즈 축소 및 들여쓰기 느낌
                }}>
                  🦁
                </div>
                <div style={{ flex: 1, minWidth: 0, marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: global.textColor }}>설레이는 라이언</span>
                    <span style={{ fontSize: 12, color: global.descriptionColor, opacity: 0.8 }}>· 30분 전</span>
                  </div>
                  <div style={{ fontSize: 14, color: global.textColor, lineHeight: 1.5, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                    <span>와 에펠탑은 언제 봐도 로망 그 자체네요!</span>
                    <span style={{ width: '100%' }}>파리 감성이 듬뿍 느껴집니다.</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* 얇은 구분선 */}
          <div style={{ height: 1, backgroundColor: `${global.descriptionColor}15`, margin: '8px 16px 20px 16px' }} />

          {/* 피드 3 (수도권 날씨 실시간 대화방) */}
          <article style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: 16, backgroundColor: '#87CEEB', 
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>
                ☁️
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 400, color: global.textColor, marginBottom: 2 }}>
                      수도권 날씨 실시간 대화방
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: global.descriptionColor, opacity: 0.9 }}>
                      <span>파란하늘</span>
                      <span>·</span>
                      <span>30분 전</span>
                      <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', padding: '1px 6px', borderRadius: 4, fontWeight: 400, fontSize: 11, marginLeft: 2 }}>
                        일상
                      </span>
                    </div>
                  </div>
                  <MoreHorizontal size={20} color={global.descriptionColor} style={{ opacity: 0.6 }} />
                </div>
                
                <p style={{ margin: '10px 0', fontSize: 14, color: global.textColor, lineHeight: 1.4 }}>
                  오늘 아침 바람 완전 가을같지 않나요?
                </p>

                {/* 리액션 영역 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.descriptionColor, fontWeight: 400 }}>
                    <span style={{ fontSize: 16, marginRight: 4 }}>👍😮</span>
                    12
                  </div>
                  <span style={{ color: global.descriptionColor, opacity: 0.5 }}>·</span>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.descriptionColor, fontWeight: 400 }}>
                    댓글 16
                  </div>
                </div>
              </div>
            </div>
          </article>

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