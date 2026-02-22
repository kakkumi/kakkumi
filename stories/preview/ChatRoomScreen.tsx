import { ArrowLeft, MoreHorizontal, Search, Smile } from 'lucide-react';

import { useThemeStore } from '../useThemeStore';
import { avatarStyle, headerBaseStyle } from './styles';

export const ChatRoomScreen = () => {
  const chatRoom = useThemeStore((state) => state.chatRoom);

  return (
    <section
      style={{
        flex: 1,
        backgroundColor: chatRoom.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ ...headerBaseStyle, backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ArrowLeft size={20} color="#4d4d4d" />
          <strong style={{ color: '#4d4d4d', fontSize: 17 }}>어피치</strong>
        </div>
        <div style={{ display: 'flex', gap: 12, color: '#4d4d4d' }}>
          <Search size={18} />
          <MoreHorizontal size={18} />
        </div>
      </header>

      <main style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            alignSelf: 'center',
            fontSize: 11,
            color: '#4d4d4d',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: 999,
            padding: '4px 10px',
          }}
        >
          2026년 2월 22일
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <span style={{ ...avatarStyle, width: 32, height: 32, borderRadius: 12, fontSize: 12 }}>어</span>
          <div
            style={{
              maxWidth: '70%',
              backgroundColor: chatRoom.friendBubbleBg,
              borderRadius: '16px 16px 16px 6px',
              padding: '9px 12px',
              color: '#4d4d4d',
              fontSize: 13,
            }}
          >
            최신 UI 반영본 확인했어?
          </div>
          <span style={{ fontSize: 11, color: '#4d4d4d' }}>오후 3:41</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ color: '#ff7f7f', fontSize: 11, fontWeight: 700 }}>1</span>
          <span style={{ fontSize: 11, color: '#4d4d4d' }}>오후 3:42</span>
          <div
            style={{
              maxWidth: '70%',
              backgroundColor: chatRoom.myBubbleBg,
              borderRadius: '16px 16px 6px 16px',
              padding: '9px 12px',
              color: '#4d4d4d',
              fontSize: 13,
            }}
          >
            응, 탭별 상세 구조까지 모두 분리했어.
          </div>
        </div>
      </main>

      <footer
        style={{
          backgroundColor: chatRoom.inputBarBg,
          padding: 10,
          display: 'grid',
          gridTemplateColumns: '34px 1fr 30px 56px',
          gap: 8,
          alignItems: 'center',
          borderTop: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 10,
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: '#4d4d4d',
            height: 34,
            fontSize: 22,
            lineHeight: '34px',
          }}
        >
          +
        </button>
        <div
          style={{
            height: 34,
            borderRadius: 12,
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            color: '#7d7d7d',
            fontSize: 12,
          }}
        >
          메시지 입력
        </div>
        <button
          type="button"
          aria-label="이모티콘"
          style={{
            border: 0,
            borderRadius: 10,
            backgroundColor: 'transparent',
            color: '#6f6f6f',
            height: 34,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Smile size={18} />
        </button>
        <button
          type="button"
          style={{
            border: 0,
            borderRadius: 10,
            backgroundColor: chatRoom.sendButtonBg,
            color: '#fff',
            height: 34,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          전송
        </button>
      </footer>
    </section>
  );
};
