import React from 'react';
import { ArrowLeft, Menu, Search, Smile, Plus, ArrowUp, Calendar } from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '30px 16px 12px 16px',
  backgroundColor: 'transparent',
  position: 'relative',
  zIndex: 10,
};

const iconRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
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
      {/* 배경 장식 (스크린샷의 흩날리는 꽃잎과 어피치 모방) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 80, left: 80, fontSize: 24, opacity: 0.8, color: '#fff' }}>✿</div>
        <div style={{ position: 'absolute', bottom: 120, right: 40, fontSize: 32, opacity: 0.8, color: '#fff' }}>✿</div>
        <div style={{ position: 'absolute', top: 150, right: 80, fontSize: 28, opacity: 0.8, color: '#fff' }}>✿</div>
        <div style={{ position: 'absolute', bottom: 20, right: -20, width: 200, height: 100, backgroundColor: '#FFF4F4', borderRadius: '50% 50% 0 0', filter: 'blur(10px)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', bottom: 20, left: -20, width: 150, height: 80, backgroundColor: '#FFF4F4', borderRadius: '50% 50% 0 0', filter: 'blur(10px)', opacity: 0.6 }} />
      </div>

      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: '#191919' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 60 }}>
          <ArrowLeft size={24} strokeWidth={2} color="#191919" style={{ cursor: 'pointer' }} />
        </div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#191919', flex: 1, textAlign: 'center' }}>
          어피치
        </h2>
        <div style={{ ...iconRowStyle, width: 60, justifyContent: 'flex-end', gap: 14 }}>
          <Search size={22} strokeWidth={2} color="#191919" style={{ cursor: 'pointer' }} />
          <Menu size={24} strokeWidth={2} color="#191919" style={{ cursor: 'pointer' }} />
        </div>
      </header>

      {/* 2. 대화 영역 */}
      <main className="chats-scroll" style={{ flex: 1, padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', zIndex: 10 }}>
        
        {/* 날짜 구분선 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px 0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: 'rgba(212, 184, 184, 0.6)', // 스크린샷의 반투명 팥죽색 배경
            color: '#FFFFFF', fontSize: 11, fontWeight: 500,
            padding: '5px 12px', borderRadius: 999,
          }}>
            <Calendar size={12} strokeWidth={2.5} />
            <span>2024년 12월 20일 월요일</span>
            <span style={{ marginLeft: 2, opacity: 0.8 }}>{'>'}</span>
          </div>
        </div>

        {/* 상대방 메시지 블록 */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* 상대방 프로필 */}
          <div style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: '#FFC1C1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            😌
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>어피치</span>
            
            {/* 메시지 1 (꼬리 있음) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '8px 14px',
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
                padding: '8px 14px',
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
          <div style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: '#FFB0B0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            😌
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>어피치</span>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{
                backgroundColor: chatRoom.friendBubbleBg,
                color: chatRoom.friendBubbleText,
                padding: '8px 14px',
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
                padding: '8px 14px',
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
              padding: '8px 14px',
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
              padding: '8px 14px',
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
              padding: '8px 14px',
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
              padding: '8px 14px',
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
