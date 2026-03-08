import React from 'react';
import { MessageCircle, Search, Settings, Plus, BellOff, Pin } from 'lucide-react';
import { ScreenThemeConfig } from './FriendsScreen';

const chats = [
  { id: 1, type: 'single', room: '카꾸미', message: '오늘의 장보기 목록', time: '오후 9:42', unread: 0, isPinned: true, isMuted: false, avatars: ['🍑'], color: '#FEE500' },
  { id: 2, type: 'single', room: '부산', message: '오늘 하루도 수고했어 잘 자', time: '오후 11:31', unread: 0, isPinned: false, isMuted: false, avatars: ['🌊'], color: '#A2C5FF' },
  { id: 3, type: 'single', room: '속초', message: '새 테마 입혔더니 카톡이 달라보여', time: '오후 6:33', unread: 0, isPinned: false, isMuted: false, avatars: ['🏔️'], color: '#FFC6FF' },
  { id: 4, type: 'single', room: '여수', message: '다이어트는 내일부터', time: '오후 1:19', unread: 0, isPinned: false, isMuted: false, avatars: ['🌅'], color: '#FFDEDE' },
  { id: 5, type: 'single', room: '전주', message: '뭐 해 잘 지내...?', time: '오전 4:41', unread: 1, isPinned: false, isMuted: true, avatars: ['🏯'], color: '#C7CEEA' },
  { id: 6, type: 'single', room: '인천', message: '오늘 즐거웠어~ 다음에 또 보자!', time: '어제', unread: 0, isPinned: false, isMuted: false, avatars: ['✈️'], color: '#FFB5A7' },
  { id: 7, type: 'single', room: '제주', message: '배고파', time: '어제', unread: 0, isPinned: false, isMuted: false, avatars: ['🍊'], color: '#c3c3c3' },
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
  cursor: 'pointer',
  padding: '7px 16px',
};

export const MainScreen = React.memo(function MainScreen({ config }: { config: ScreenThemeConfig }) {
  const SELECTED_CHAT_ID = 3; // 속초 - 미리보기 선택 상태 예시
  const global = {
    backgroundColor: config.bodyBg,
    textColor: config.primaryText,
    descriptionColor: config.descText,
  };
  const backgroundStyle: React.CSSProperties = config.mainBgImageUrl
    ? {
        backgroundColor: 'transparent',
      }
    : {};
  const chatsTab = {
    headerTitleColor: config.headerText,
    filterChipBg: config.bodyBg,
    filterChipActiveBg: config.tabBarSelectedIcon,
    filterChipTextColor: config.bodyBg,
    unreadBadgeBg: config.unreadCountColor,
  };

  const filterChips = [
    { label: '전체', count: null, isActive: true },
    { label: '안읽음', count: 40, isActive: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', backgroundColor: global.backgroundColor, ...backgroundStyle, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ ...headerBaseStyle, color: chatsTab.headerTitleColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: chatsTab.headerTitleColor }}>채팅</h2>
        <div data-active-element-id="header-title-icon" style={{ ...iconRowStyle, color: global.textColor }}>
          <Search size={20} strokeWidth={2.3} color={global.textColor} />
          <div style={{ position: 'relative', display: 'inline-flex', width: 20, height: 20 }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', clipPath: 'polygon(0% 0%, 62% 0%, 62% 38%, 100% 38%, 100% 100%, 0% 100%)', color: global.textColor }}>
              <MessageCircle size={19} strokeWidth={2.3} />
            </div>
            <span style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'transparent', color: global.textColor, fontSize: 11, fontWeight: 900, WebkitTextStroke: '0.5px currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</span>
          </div>
          <Settings size={20} strokeWidth={2.3} color={global.textColor} />
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px 12px 14px' }}>
        <div className="chats-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
          {filterChips.map((chip) => (
            <button key={chip.label} type="button" style={{ border: chip.isActive ? 'none' : `1px solid ${global.textColor}30`, flexShrink: 0, borderRadius: 999, backgroundColor: chip.isActive ? global.textColor : 'transparent', color: chip.isActive ? global.backgroundColor : global.textColor, padding: '5px 12px', fontSize: 12, fontWeight: 400, cursor: 'pointer' }}>
              {chip.label}
              {chip.count && (
                <span style={{ backgroundColor: chatsTab.unreadBadgeBg, color: '#FFFFFF', fontSize: 10, fontWeight: 500, minWidth: 16, height: 16, lineHeight: '16px', textAlign: 'center', padding: '0 4px', borderRadius: 999, marginLeft: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{chip.count}</span>
              )}
            </button>
          ))}
          <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'transparent', border: `1px solid ${global.textColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Plus size={18} color={global.textColor} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: '0 14px 12px 14px' }}>
          <div style={{ backgroundColor: '#F5F0E8', borderRadius: 11, padding: '13px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#3c2a2a' }}>나에게 딱 맞는 테마를 찾아보세요</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'rgb(120,100,80)', opacity: 0.8 }}>테마 구경하기</p>
            </div>
          </div>
        </div>
        <section>
          {chats.map((chat) => {
            const isSelected = chat.id === SELECTED_CHAT_ID;
            const selectedBgColor = config.chatListSelectedBg ?? global.backgroundColor;
            const selectedBgAlpha = config.chatListSelectedBgAlpha !== undefined ? parseFloat(config.chatListSelectedBgAlpha) : 1;
            const namePressColor = config.chatListNamePressColor ?? global.textColor;
            const lastMsgPressColor = config.chatListLastMsgPressColor ?? config.chatListLastMsgText ?? global.textColor;

            const itemBg = isSelected
              ? (() => {
                  // hex → rgba 변환
                  const hex = selectedBgColor.replace('#', '');
                  const r = parseInt(hex.substring(0,2), 16);
                  const g = parseInt(hex.substring(2,4), 16);
                  const b = parseInt(hex.substring(4,6), 16);
                  return isNaN(r) ? selectedBgColor : `rgba(${r},${g},${b},${selectedBgAlpha})`;
                })()
              : 'transparent';

            return (
            <article key={chat.id} style={{ ...listItemBaseStyle, backgroundColor: itemBg, ...(isSelected ? { margin: '0 3px', padding: '7px 13px', borderRadius: 20 } : {}) }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
                <div style={{ width: 46, height: 46, position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 17, backgroundColor: chat.id === 1 ? 'transparent' : chat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>
                    {chat.id === 1 ? chat.avatars[0] : (
                      <svg width="23" height="23" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="5" fill="rgba(120,120,120,0.55)"/><path d="M5 21 Q4 21 4 20 Q4 13 12 13 Q20 13 20 20 Q20 21 19 21 Z" fill="rgba(120,120,120,0.55)"/></svg>
                    )}
                  </div>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {chat.id === 1 && <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: global.textColor, color: global.backgroundColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, flexShrink: 0, lineHeight: 1 }}>나</span>}
                    <p style={{ margin: 0, color: isSelected ? namePressColor : global.textColor, fontSize: 14, fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.room}</p>
                    {chat.isPinned && <Pin size={12} color={isSelected ? namePressColor : global.textColor} fill={isSelected ? namePressColor : global.textColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                    {chat.isMuted && <BellOff size={13} color={isSelected ? namePressColor : global.textColor} style={{ opacity: 0.6, flexShrink: 0 }} />}
                  </div>
                  <p style={{ margin: '2px 0 0', color: isSelected ? lastMsgPressColor : (config.chatListLastMsgText ?? global.textColor), fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: 0.9 }}>{chat.message}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12, flexShrink: 0 }}>
                <span style={{ color: global.textColor, fontSize: 11, opacity: 0.8 }}>{chat.time}</span>
                {chat.unread > 0 ? (
                  <span style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: chatsTab.unreadBadgeBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontSize: 10, fontWeight: 500 }}>{chat.unread}</span>
                ) : <div style={{ height: 20 }} />}
              </div>
            </article>
          )})}
        </section>
      </div>

      <style jsx>{`.chats-scroll::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
});


