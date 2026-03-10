import React from 'react';
import { Menu, Search, Smile, Plus } from 'lucide-react';
import { ScreenThemeConfig } from './FriendsScreen';

const headerBaseStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '42px 14px 8px 14px', backgroundColor: 'transparent',
  position: 'relative', zIndex: 10,
};
const iconRowStyle: React.CSSProperties = { display: 'flex', gap: '14px', alignItems: 'center' };

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

// ── 말풍선 컴포넌트 ──────────────────────────────────────────────────
// imageUrl이 있으면 이미지 배경(캐릭터 걸침 포함), 없으면 색상 배경
interface BubbleBoxProps {
  imageUrl?: string;
  bgColor: string;
  textColor: string;
  children: React.ReactNode;
  side: 'send' | 'receive';
  order: 1 | 2; // 1 = 첫 번째(꼬리 있음), 2 = 연속(꼬리 없음)
}

function BubbleBox({ bgColor, textColor, children, side, order }: Omit<BubbleBoxProps, 'imageUrl'> & { imageUrl?: string }) {
  const borderRadius = side === 'send'
    ? order === 1 ? '18px 4px 18px 18px' : '18px 18px 18px 18px'
    : order === 1 ? '4px 18px 18px 18px' : '18px 18px 18px 18px';

  return (
    <div style={{
      backgroundColor: bgColor, color: textColor,
      padding: side === 'receive' ? '5px 14px 5px 12px' : '5px 14px',
      borderRadius, fontSize: 13, lineHeight: 1.4,
      boxShadow: side === 'receive' ? '0 1px 2px rgba(0,0,0,0.04)' : undefined,
      border: side === 'receive' ? '1px solid rgba(0,0,0,0.05)' : undefined,
    }}>
      {children}
    </div>
  );
}

export const ChatRoomScreen = React.memo(function ChatRoomScreen({ config }: { config: ScreenThemeConfig }) {
  const alpha = config.inputFieldBgAlpha ?? 1;
  const rawFieldBg = config.inputFieldBg ?? '#e8e8e8';
  const hex = rawFieldBg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const inputFieldBgWithAlpha = `rgba(${r},${g},${b},${alpha})`;

  const chatRoom = {
    backgroundColor: config.chatBg,
    myBubbleBg: config.myBubbleBg,
    myBubbleText: config.myBubbleText ?? '#191919',
    myBubbleUnreadText: config.myBubbleUnreadText ?? '#FF3B30',
    friendBubbleBg: config.otherBubbleBg,
    friendBubbleText: config.friendBubbleText ?? '#191919',
    friendBubbleUnreadText: config.friendBubbleUnreadText ?? '#FF3B30',
    inputBarBg: config.inputBarBg,
    inputBarText: config.inputBarText ?? '#8E8E93',
    inputFieldBg: inputFieldBgWithAlpha,
    menuButtonFg: config.menuButtonFg ?? '#353434',
    menuButtonBg: 'rgba(0,0,0,0.04)',
    bubbleSend1: config.bubbleSend1Url || undefined,
    bubbleSend2: config.bubbleSend2Url || undefined,
    bubbleReceive1: config.bubbleReceive1Url || undefined,
    bubbleReceive2: config.bubbleReceive2Url || undefined,
  };
  const descColor = config.descText;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden',
      backgroundColor: chatRoom.backgroundColor,
      backgroundImage: config.chatroomBgImageUrl ? `url(${config.chatroomBgImageUrl})` : undefined,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
    }}>

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
          노는 게 제일 좋아 7
        </h2>
        <div style={{ ...iconRowStyle, width: 60, justifyContent: 'flex-end' }}>
          <Search size={20} strokeWidth={2.3} color="#191919" />
          <Menu size={20} strokeWidth={2.3} color="#191919" />
        </div>
      </header>

      {/* 대화 영역 */}
      <main style={{
        flex: 1, paddingTop: 8, paddingLeft: 8, paddingRight: 16, paddingBottom: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', overflowX: 'visible', zIndex: 10,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
      } as React.CSSProperties}>

        {/* 날짜 */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 3px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'rgba(234,234,234,0.3)', color: '#191919', fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 999 }}>
            <span>2026년 02월 27일 금요일</span>
          </div>
        </div>

        {/* ── 통영: 받은 첫 번째 + 두 번째 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[0].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: descColor, marginLeft: 2 }}>통영</span>
            {/* 첫 번째 말풍선 (bubbleReceive1) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, overflow: 'visible' }}>
              <BubbleBox imageUrl={chatRoom.bubbleReceive1} bgColor={chatRoom.friendBubbleBg} textColor={chatRoom.friendBubbleText} side="receive" order={1}>
                카꾸미에서 테마 만들어봤어?
              </BubbleBox>
            </div>
            {/* 두 번째 말풍선 (bubbleReceive2) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 4, overflow: 'visible' }}>
              <BubbleBox imageUrl={chatRoom.bubbleReceive2} bgColor={chatRoom.friendBubbleBg} textColor={chatRoom.friendBubbleText} side="receive" order={2}>
                만들어본 사람 후기 좀
              </BubbleBox>
              <span style={{ fontSize: 9, color: descColor, flexShrink: 0 }}>오후 2:10</span>
            </div>
          </div>
        </div>

        {/* ── 거제: 받은 두 번째 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[2].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: descColor, marginLeft: 2 }}>거제</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, overflow: 'visible' }}>
              <BubbleBox imageUrl={chatRoom.bubbleReceive2} bgColor={chatRoom.friendBubbleBg} textColor={chatRoom.friendBubbleText} side="receive" order={2}>
                그거 어렵지 않아?
              </BubbleBox>
              <span style={{ fontSize: 9, color: descColor, flexShrink: 0 }}>오후 2:13</span>
            </div>
          </div>
        </div>

        {/* ── 내 메시지 1: 보낸 첫 번째 (bubbleSend1) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '82%', overflow: 'visible' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: chatRoom.myBubbleUnreadText, fontWeight: 700, lineHeight: 1, alignSelf: 'flex-end' }}>2</span>
              <span style={{ fontSize: 9, color: descColor }}>오후 3:33</span>
            </div>
            <BubbleBox imageUrl={chatRoom.bubbleSend1} bgColor={chatRoom.myBubbleBg} textColor={chatRoom.myBubbleText} side="send" order={1}>
              나는 스토어에서 테마 사봤는데 괜찮더라구
            </BubbleBox>
          </div>
        </div>

        {/* ── 내 메시지 2: 보낸 두 번째 (bubbleSend2) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '82%', overflow: 'visible' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <span style={{ fontSize: 9, color: chatRoom.myBubbleUnreadText, fontWeight: 700, lineHeight: 1, alignSelf: 'flex-end' }}>2</span>
              <span style={{ fontSize: 9, color: descColor }}>오후 3:34</span>
            </div>
            <BubbleBox imageUrl={chatRoom.bubbleSend2} bgColor={chatRoom.myBubbleBg} textColor={chatRoom.myBubbleText} side="send" order={2}>
              나도 만들어볼까 ㅎㅎ
            </BubbleBox>
          </div>
        </div>

        {/* ── 안동: 받은 두 번째 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[1].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: descColor, marginLeft: 2 }}>안동</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, overflow: 'visible' }}>
              <BubbleBox imageUrl={chatRoom.bubbleReceive2} bgColor={chatRoom.friendBubbleBg} textColor={chatRoom.friendBubbleText} side="receive" order={2}>
                나도 테마제작은 관심 있는데 코딩은 너무 어렵더라
              </BubbleBox>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: chatRoom.friendBubbleUnreadText, fontWeight: 700, lineHeight: 1 }}>3</span>
                <span style={{ fontSize: 9, color: descColor }}>오후 4:21</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 강릉: 받은 두 번째 ── */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: members[3].color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{personSVG}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '82%' }}>
            <span style={{ fontSize: 12, color: descColor, marginLeft: 2 }}>강릉</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, overflow: 'visible' }}>
              <BubbleBox imageUrl={chatRoom.bubbleReceive2} bgColor={chatRoom.friendBubbleBg} textColor={chatRoom.friendBubbleText} side="receive" order={2}>
                나 테마 만들었는데 코딩 1도 모름 ㅋㅋㅋ
              </BubbleBox>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: chatRoom.friendBubbleUnreadText, fontWeight: 700, lineHeight: 1 }}>4</span>
                <span style={{ fontSize: 9, color: descColor }}>오후 4:38</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* 하단 입력바 */}
      <footer style={{ backgroundColor: chatRoom.inputBarBg, padding: '10px 16px 17px 16px', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', zIndex: 10 }}>
        <button type="button" style={{ border: 0, borderRadius: 999, backgroundColor: chatRoom.inputFieldBg, color: chatRoom.menuButtonFg, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div style={{ flex: 1, height: 28, borderRadius: 18, backgroundColor: chatRoom.inputFieldBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 14px' }}>
          <span style={{ color: chatRoom.inputBarText, fontSize: 13, opacity: 0.5 }}>메시지 입력</span>
          <Smile size={17} color={chatRoom.inputBarText} strokeWidth={2} style={{ cursor: 'pointer' }} />
        </div>
        <button type="button" style={{ border: 0, borderRadius: 999, backgroundColor: chatRoom.inputFieldBg, color: chatRoom.menuButtonFg, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', fontSize: 17, fontWeight: 700 }}>
          #
        </button>
      </footer>
    </div>
  );
});
