import React from 'react';
import { Search, Settings, MoreHorizontal, MessageCircle } from 'lucide-react';
import { TiWeatherPartlySunny } from 'react-icons/ti';
import { BsAirplane } from 'react-icons/bs';
import { ScreenThemeConfig } from './FriendsScreen';

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

// -------------------------------------------------------------------------

export const OpenChatsScreen = React.memo(function OpenChatsScreen({ config }: { config: ScreenThemeConfig }) {
  const global = {
    backgroundColor: config.bodyBg,
    textColor: config.primaryText,
    descriptionColor: config.descText,
  };
  const openChatsTab = {
    headerTitleColor: config.headerText,
    bannerBackgroundColor: config.openchatBg,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: config.mainBgImageUrl ? 'transparent' : global.backgroundColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: openChatsTab.headerTitleColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>지금</h2>
        <div data-active-element-id="header-title-icon" style={{ ...iconRowStyle, color: global.textColor }}>
          <Search size={20} strokeWidth={2.3} color={global.textColor} />
          <div style={{ position: 'relative', display: 'inline-flex', width: 20, height: 20 }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              clipPath: 'polygon(0% 0%, 62% 0%, 62% 38%, 100% 38%, 100% 100%, 0% 100%)',
              color: global.textColor,
            }}>
              <MessageCircle size={19} strokeWidth={2.3} />
            </div>
            <span style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'transparent',
              color: global.textColor,
              fontSize: 11,
              fontWeight: 900,
              WebkitTextStroke: '0.5px currentColor',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}>+</span>
          </div>
          <Settings size={20} strokeWidth={2.3} color={global.textColor} />
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
                backgroundColor: chip.isActive ? global.textColor : 'transparent',
                color: chip.isActive ? global.backgroundColor : global.textColor,
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
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#3c2a2a' }}>
                테마 만들기는?
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgb(120,100,80)', opacity: 0.8 }}>
                카꾸미
              </p>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: 8 }}>
          {[
            {
              id: 2,
              room: '건강 정보방',
              message: '오늘 걷기 1만보 달성했어요!',
              time: '오후 5:48',
              unread: 999,
              members: 684,
              gradient: { id: 'grad-health', from: '#74b9a0', to: '#a8d5c2' },
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 심장 + 박동선 (건강) */}
                  <path d="M12 21C12 21 4 14.5 4 9C4 6.239 6.239 4 9 4C10.657 4 12 5.343 12 5.343C12 5.343 13.343 4 15 4C17.761 4 20 6.239 20 9C20 14.5 12 21 12 21Z" fill="white" fillOpacity="0.9"/>
                  <polyline points="2,12 5,12 7,9 9,15 11,11 13,13 15,12 22,12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
                </svg>
              ),
            },
            {
              id: 3,
              room: '강아지 자랑방',
              message: '우리 꾸미 새 옷 입혔는데 너무 귀엽지 않나요?',
              time: '오후 4:03',
              unread: 12,
              members: 54,
              gradient: { id: 'grad-dog', from: '#e8a87c', to: '#f5c9a0' },
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* 강아지 얼굴 */}
                  {/* 귀 왼쪽 */}
                  <ellipse cx="7.5" cy="7" rx="2.8" ry="3.5" fill="white" fillOpacity="0.9" transform="rotate(-15 7.5 7)"/>
                  {/* 귀 오른쪽 */}
                  <ellipse cx="16.5" cy="7" rx="2.8" ry="3.5" fill="white" fillOpacity="0.9" transform="rotate(15 16.5 7)"/>
                  {/* 얼굴 */}
                  <ellipse cx="12" cy="13" rx="6" ry="5.5" fill="white" fillOpacity="0.95"/>
                  {/* 눈 왼쪽 */}
                  <circle cx="9.8" cy="12" r="1" fill="#c47a50"/>
                  {/* 눈 오른쪽 */}
                  <circle cx="14.2" cy="12" r="1" fill="#c47a50"/>
                  {/* 코 */}
                  <ellipse cx="12" cy="14.5" rx="1.5" ry="1" fill="#c47a50" fillOpacity="0.8"/>
                  {/* 입 */}
                  <path d="M10.5 15.5 Q12 17 13.5 15.5" stroke="#c47a50" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.8"/>
                </svg>
              ),
            },
          ].map((chat) => (
            <article key={chat.id} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', padding: '7px 16px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
                <div style={{ width: 46, height: 46, position: 'relative', flexShrink: 0 }}>
                  <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                      <linearGradient id={chat.gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={chat.gradient.from} />
                        <stop offset="100%" stopColor={chat.gradient.to} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ width: '100%', height: '100%', borderRadius: 17, background: `linear-gradient(135deg, ${chat.gradient.from}, ${chat.gradient.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {chat.icon}
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: global.textColor, fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.room}
                    </p>
                    <span style={{ fontSize: 12, color: global.textColor, opacity: 0.7, flexShrink: 0 }}>
                      {chat.members.toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', color: global.textColor, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.9 }}>
                    {chat.message}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                <span style={{ color: global.textColor, fontSize: 11, opacity: 0.8 }}>{chat.time}</span>
                {chat.unread > 0 && (
                  <span style={{
                    backgroundColor: '#ff6507',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 500,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                  }}>
                    {chat.unread >= 999 ? '999+' : chat.unread}
                  </span>
                )}
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
              left: 36,
              width: 1.5,
              backgroundColor: `${global.textColor}30`
            }} />

            {/* 메인 피드 (해외 여행 사진방) */}
            <article style={{ marginBottom: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 16, background: 'linear-gradient(135deg, #89b4f7, #c4d9ff)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `3px solid ${global.backgroundColor}`
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 비행기 */}
                    <path d="M21 3L3 10.5L10 12.5L12 19.5L15 14L21 3Z" fill="white" fillOpacity="0.95" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
                    <path d="M10 12.5L14 9" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 400, color: global.textColor }}>해외 여행 사진방</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: global.textColor, opacity: 0.9 }}>
                        <span>지구 한 바퀴</span>
                        <span>·</span>
                        <span>30분 전</span>
                        <span style={{ backgroundColor: 'rgba(162, 126, 255, 0.15)', color: '#A27EFF', padding: '1px 6px', borderRadius: 4, fontWeight: 400, fontSize: 11, marginLeft: 2 }}>
                          여행
                        </span>
                      </div>
                    </div>
                    <MoreHorizontal size={20} color="rgb(160,160,160)" style={{ opacity: 0.6 }} />
                  </div>
                  
                  {/* 본문 이미지 */}
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', backgroundColor: '#ccd9f0' }}>
                    <img
                      src="/previews/france.jpg"
                      alt="해외 여행"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.placeholder-text')) {
                          const p = document.createElement('div');
                          p.className = 'placeholder-text';
                          p.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#7a9abf;font-size:13px;';
                          p.innerText = '📁 public/previews/france.jpg 를 추가해주세요';
                          parent.appendChild(p);
                        }
                      }}
                    />
                  </div>

                  {/* 리액션 영역 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.textColor, fontWeight: 400 }}>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 4, gap: 1 }}>
                      {/* 하트 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21C12 21 4 14.5 4 9C4 6.239 6.239 4 9 4C10.657 4 12 5.5 12 5.5C12 5.5 13.343 4 15 4C17.761 4 20 6.239 20 9C20 14.5 12 21 12 21Z" fill="#e05c6e"/>
                      </svg>
                      {/* 놀람 얼굴 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#FFD93D"/>
                        <circle cx="9" cy="10" r="1.3" fill="#333"/>
                        <circle cx="15" cy="10" r="1.3" fill="#333"/>
                        <ellipse cx="12" cy="15" rx="2.5" ry="3" fill="#333"/>
                      </svg>
                    </span>
                    12
                  </div>
                    <span style={{ color: global.textColor, opacity: 0.5 }}>·</span>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.textColor, fontWeight: 400, gap: 4 }}>
                      댓글 16
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* 댓글형 피드 */}
            <article style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 28, height: 28, borderRadius: 10,
                  background: 'linear-gradient(135deg, #2c3e6b, #4a6fa5)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: 6, border: `3px solid ${global.backgroundColor}`
                }}>
                  <BsAirplane size={11} color="white" style={{ opacity: 0.9 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, marginTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: global.textColor }}>새벽 비행기</span>
                    <span style={{ fontSize: 12, color: global.textColor, opacity: 0.8 }}>· 17분 전</span>
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
          <div style={{ height: 1, backgroundColor: 'rgba(150,150,150,0.15)', margin: '8px 16px 20px 16px' }} />

          {/* 피드 3 (수도권 날씨 실시간 대화방) */}
          <article style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: 16, background: 'linear-gradient(135deg, #7fa8c9, #b0cfe0)',
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TiWeatherPartlySunny size={22} color="white" style={{ opacity: 0.95 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 400, color: global.textColor, marginBottom: 2 }}>
                      수도권 날씨 실시간 대화방
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: global.textColor, opacity: 0.9 }}>
                      <span>파란 하늘</span>
                      <span>·</span>
                      <span>54분 전</span>
                      <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50', padding: '1px 6px', borderRadius: 4, fontWeight: 400, fontSize: 11, marginLeft: 2 }}>
                        일상
                      </span>
                    </div>
                  </div>
                  <MoreHorizontal size={20} color="rgb(160,160,160)" style={{ opacity: 0.6 }} />
                </div>
                
                <p style={{ margin: '10px 0', fontSize: 14, color: global.textColor, lineHeight: 1.4 }}>
                  오늘 아침 바람 완전 가을같지 않나요?
                </p>

                {/* 리액션 영역 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.textColor, fontWeight: 400 }}>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 4, gap: 1 }}>
                      {/* 엄지 좋아요 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 22H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3" fill="#4a90d9" stroke="#4a90d9" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.29 3.29A1 1 0 0 1 11 3h1a1 1 0 0 1 1 1v4h3a2 2 0 0 1 1.93 2.57l-1.66 6A2 2 0 0 1 14.34 18H7V13l3-3V4a1 1 0 0 1 .29-.71z" fill="#4a90d9" stroke="#4a90d9" strokeWidth="0.5"/>
                      </svg>
                      {/* 놀람 얼굴 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#FFD93D"/>
                        <circle cx="9" cy="10" r="1.3" fill="#333"/>
                        <circle cx="15" cy="10" r="1.3" fill="#333"/>
                        <ellipse cx="12" cy="15" rx="2.5" ry="3" fill="#333"/>
                      </svg>
                    </span>
                    12
                  </div>
                  <span style={{ color: global.textColor, opacity: 0.5 }}>·</span>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: global.textColor, fontWeight: 400 }}>
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
});
