import React from 'react';
import { Menu, Search, Smile, Plus } from 'lucide-react';
import { ScreenThemeConfig } from './FriendsScreen';

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

const personSVG = (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="5" fill="rgba(120,120,120,0.55)"/>
    <path d="M5 21 Q4 21 4 20 Q4 13 12 13 Q20 13 20 20 Q20 21 19 21 Z" fill="rgba(120,120,120,0.55)"/>
  </svg>
);

const members = [
  { name: '통영', color: '#C9E4DE' },
  { name: '거제', color: '#FFD6A5' },
  { name: '안동', color: '#FDFFB6' },
  { name: '강릉', color: '#D4E09B' },
];

export const ChatRoomScreen = React.memo(function ChatRoomScreen({ config }: { config: ScreenThemeConfig }) {
  const chatRoom = {
    backgroundColor: config.chatBg,
    myBubbleBg: config.myBubbleBg,
    myBubbleText: '#191919',
    friendBubbleBg: config.otherBubbleBg,
    friendBubbleText: '#191919',
    inputBarBg: config.inputBarBg,
    sendNormalBg: config.sendBtnBg,
    sendNormalFg: config.headerText,
    menuButtonFg: config.tabBarSelectedIcon,
    menuButtonBg: 'rgba(0,0,0,0.04)',
    unreadTextColor: config.tabBarSelectedIcon,
  };
  const global = {
    backgroundColor: config.bodyBg,
    textColor: config.primaryText,
    descriptionColor: config.descText,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', backgroundColor: chatRoom.backgroundColor, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', position: 'relative' }}>

      {/* 헤더 */}
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
          노는 게 제일 좋아
        </h2>
        <div style={{ ...iconRowStyle, width: 60, justifyContent: 'flex-end' }}>
          <Search size={20} strokeWidth={2.3} color="#191919" />
          <Menu size={20} strokeWidth={2.3} color="#191919" />
        </div>
      </header>

      {/* 대화 영역 */}
      <main className="chats-scroll" style={{ flex: 1, padding: '0 16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', zIndex: 10 }}>

        {/* 날짜 구분선 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 3px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,234,234,0.3)', color: '#191919', fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 999 }}>
            <span>2026년 02월 27일 금요일</span>
            <svg width="6" height="10" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: -1 }}>
              <path d="M2 1L14 11L2 21" stroke="#191919" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 통영 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[0].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>통영</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ backgroundColor: chatRoom.friendBubbleBg, color: chatRoom.friendBubbleText, padding: '5px 14px 5px 12px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                카꾸미에서 테마 만들어봤어?
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:10</span>
            </div>
          </div>
        </div>

        {/* 거제 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[2].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>거제</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ backgroundColor: chatRoom.friendBubbleBg, color: chatRoom.friendBubbleText, padding: '5px 14px 5px 12px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                그거 어렵지 않아?
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:11</span>
            </div>
          </div>
        </div>

        {/* 내 메시지 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '82%' }}>
            <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:12</span>
            <div style={{ backgroundColor: chatRoom.myBubbleBg, color: chatRoom.myBubbleText, padding: '5px 14px', borderRadius: '18px 4px 18px 18px', fontSize: 13, lineHeight: 1.4 }}>
              나는 스토어에서 테마 사봤는데 괜찮더라구
            </div>
          </div>
        </div>

        {/* 안동 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[1].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>안동</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              <div style={{ backgroundColor: chatRoom.friendBubbleBg, color: chatRoom.friendBubbleText, padding: '5px 14px 5px 12px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}>
                나도 테마제작은 관심 있는데 코딩은 너무 어렵더라
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:13</span>
            </div>
          </div>
        </div>

        {/* 내 메시지 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '82%' }}>
            <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:14</span>
            <div style={{ backgroundColor: chatRoom.myBubbleBg, color: chatRoom.myBubbleText, padding: '5px 14px', borderRadius: '18px 4px 18px 18px', fontSize: 13, lineHeight: 1.4 }}>
              나도 만들어볼까 ㅎㅎ
            </div>
          </div>
        </div>

        {/* 강릉 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[3].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: global.descriptionColor, marginLeft: 2 }}>강릉</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ backgroundColor: chatRoom.friendBubbleBg, color: chatRoom.friendBubbleText, padding: '5px 14px 5px 12px', borderRadius: '4px 18px 18px 18px', fontSize: 13, lineHeight: 1.4, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)', wordBreak: 'keep-all' }}>
                나 테마 만들었는데 코딩 1도 모름 ㅋㅋㅋ
              </div>
              <span style={{ fontSize: 11, color: global.descriptionColor, flexShrink: 0 }}>오후 2:15</span>
            </div>
          </div>
        </div>

      </main>

      {/* 하단 입력바 */}
      <footer style={{ backgroundColor: chatRoom.inputBarBg, padding: '10px 16px 17px 16px', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', zIndex: 10 }}>
        <button type="button" style={{ border: 0, borderRadius: 999, backgroundColor: chatRoom.menuButtonBg, color: '#353434', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div style={{ flex: 1, height: 28, borderRadius: 18, backgroundColor: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 14px' }}>
          <span style={{ color: '#999999', fontSize: 13 }}>메시지 입력</span>
          <Smile size={17} color="#999999" strokeWidth={2} style={{ cursor: 'pointer' }} />
        </div>
        <button type="button" style={{ border: 0, borderRadius: 999, backgroundColor: chatRoom.menuButtonBg, color: '#353434', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', fontSize: 17, fontWeight: 700 }}>
          #
        </button>
      </footer>

      <style jsx>{`
        .chats-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
});
