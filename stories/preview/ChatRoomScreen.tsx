import React from 'react';
import { Menu, Search, Smile, Plus, ArrowUp } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '42px 14px 8px 14px',
  backgroundColor: 'transparent',
  position: 'relative',
  zIndex: 10,
};

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  alignItems: 'center',
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
      chatRoom: {
        backgroundColor: '#FFDEDE',
        myBubbleBg: '#FF7F7F', // 보내기 말풍선 배경 (추정)
        myBubbleText: '#FFFFFF',
        friendBubbleBg: '#FFFFFF',
        friendBubbleText: '#4D4D4D',
        inputBarBg: '#FFFFFF',
        sendNormalBg: '#FF7F7F',
        sendNormalFg: '#FFFFFF',
        menuButtonFg: '#E86464',
        menuButtonBg: 'rgba(0,0,0,0.04)',
        unreadTextColor: '#FF7F7F', // 안읽음 숫자 컬러
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const ChatRoomScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { chatRoom, global } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: chatRoom.backgroundColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}
    >
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: '#191919' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 60 }}>
          <span style={{ cursor: 'pointer', color: '#3c2a2a', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="13" height="18" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: 3 }}>
              <path d="M14 1L2 11L14 21" stroke="#3c2a2a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 17, fontWeight: 400 }}>40</span>
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a', flex: 1, textAlign: 'center' }}>
          봄이
        </h2>
        <div style={{ ...iconRowStyle, width: 60, justifyContent: 'flex-end' }}>
          <Search size={20} strokeWidth={2.3} color="#191919" style={{ cursor: 'pointer' }} />
          <Menu size={20} strokeWidth={2.3} color="#191919" style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* 2. 대화 영역 */}
      <main className="chats-scroll" style={{ flex: 1, padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', zIndex: 10 }}>
        
        {/* 날짜 구분선 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: 'rgba(214,212,212,0.4)',
            color: '#191919', fontSize: 11, fontWeight: 500,
            padding: '5px 12px', borderRadius: 999,
          }}>
            <span>2026년 02월 27일 금요일</span>
            <svg width="6" height="10" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: -1 }}>
              <path d="M2 1L14 11L2 21" stroke="#191919" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 상대방 메시지 블록 */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* 상대방 프로필 */}
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: '#FFC1C1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
            😌
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>어피치</span>
            
            {/* 메시지 1 (꼬리 있음) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '5px 14px',
                borderRadius: '4px 18px 18px 18px', // 왼쪽 위가 뾰족한 꼬리
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                어피치피치한
              </div>
            </div>

            {/* 메시지 2 (꼬리 없음) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '5px 14px',
                borderRadius: '18px', // 둥근 형태
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                봄~봄~봄이 왔어요
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginBottom: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: chatRoom.unreadTextColor, lineHeight: 1 }}>1</span>
                <span style={{ fontSize: 11, color: global.descriptionColor, lineHeight: 1 }}>오후 12:03</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상대방 메시지 블록 (selected 구분용 - 프로필 추가) */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: '#FFB0B0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
            😌
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>어피치</span>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '5px 14px',
                borderRadius: '4px 18px 18px 18px',
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                어피치피치한
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '5px 14px',
                borderRadius: '18px',
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                봄~봄~봄이 왔어요
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, marginBottom: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: chatRoom.unreadTextColor, lineHeight: 1 }}>1</span>
                <span style={{ fontSize: 11, color: global.descriptionColor, lineHeight: 1 }}>오후 12:03</span>
              </div>
            </div>
          </div>
        </div>

        {/* 내 메시지 블록 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginTop: 8 }}>
          
          {/* 메시지 1 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
            <div style={{
              backgroundColor: chatRoom.myBubbleBg,
              color: chatRoom.myBubbleText,
              padding: '5px 14px',
              borderRadius: '18px 4px 18px 18px', // 오른쪽 위가 뾰족한 꼬리
              fontSize: 14,
              lineHeight: 1.4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
              으아 설레에
            </div>
          </div>

          {/* 메시지 2 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
            <div style={{
              backgroundColor: chatRoom.myBubbleBg,
              color: chatRoom.myBubbleText,
              padding: '5px 14px',
              borderRadius: '18px', // 둥근 형태
              fontSize: 14,
              lineHeight: 1.4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
              ㅎㅎㅎ
            </div>
          </div>

          {/* 메시지 1 (복제) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
            <div style={{
              backgroundColor: chatRoom.myBubbleBg,
              color: chatRoom.myBubbleText,
              padding: '5px 14px',
              borderRadius: '18px 4px 18px 18px',
              fontSize: 14,
              lineHeight: 1.4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
              으아 설레에
            </div>
          </div>

          {/* 메시지 2 (선택 상태) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '75%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, marginBottom: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: chatRoom.unreadTextColor, lineHeight: 1 }}>1</span>
              <span style={{ fontSize: 11, color: global.descriptionColor, lineHeight: 1 }}>오후 12:04</span>
            </div>
            <div style={{
              backgroundColor: '#F27979',
              color: chatRoom.myBubbleText,
              padding: '5px 14px',
              borderRadius: '18px',
              fontSize: 14,
              lineHeight: 1.4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            }}>
              ㅎㅎㅎ
            </div>
          </div>

        </div>
      </main>

      {/* 3. 하단 입력바 (최신 11.4.0 UI 고증) */}
      <footer
        style={{
          backgroundColor: chatRoom.inputBarBg,
          padding: '8px 16px 24px 16px', // 하단 Safe Area 여백 포함
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          zIndex: 10,
        }}
      >
        {/* + 메뉴 버튼 */}
        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 999,
            backgroundColor: chatRoom.menuButtonBg,
            color: chatRoom.menuButtonFg,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        {/* 텍스트 입력창 (둥근 필 스타일) */}
        <div
          style={{
            flex: 1,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px 0 16px',
          }}
        >
          <span style={{ color: '#191919', fontSize: 14 }}>
            카카오톡 테마
          </span>
          <Smile size={20} color="#999999" strokeWidth={2} style={{ cursor: 'pointer' }} />
        </div>

        {/* 전송 버튼 (둥근 화살표) */}
        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 999,
            backgroundColor: chatRoom.sendNormalBg,
            color: chatRoom.sendNormalFg,
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <ArrowUp size={20} strokeWidth={3} />
        </button>
      </footer>

      <style jsx>{`
        .chats-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
