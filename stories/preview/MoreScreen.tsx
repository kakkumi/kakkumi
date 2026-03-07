import React from 'react';
import { 
  Search, ScanLine, Settings, Gift, Package, Percent, Smile, 
  MonitorPlay, Shirt, ShoppingBag, UserCircle, Calendar, 
  Gamepad2, CalendarClock, Cloud
} from 'lucide-react';
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

export const MoreScreen = React.memo(function MoreScreen({ config }: { config: ScreenThemeConfig }) {
  const global = {
    backgroundColor: config.bodyBg,
    textColor: config.primaryText,
    descriptionColor: config.descText,
  };
  const chatsTab = {
    filterChipBg: `${config.bodyBg}99`,
  };

  // 그리드 메뉴 데이터
  const gridMenus = [
    { icon: <Gift size={22} strokeWidth={1.2} />, label: '선물하기' },
    { icon: <Package size={22} strokeWidth={1.2} />, label: '받은선물', hasDot: true },
    { icon: <Percent size={22} strokeWidth={1.2} />, label: '핫딜' },
    { icon: <Smile size={22} strokeWidth={1.2} />, label: '이모티콘' },
    { icon: <MonitorPlay size={22} strokeWidth={1.2} />, label: '라이브방송' },
    { icon: <Shirt size={22} strokeWidth={1.2} />, label: '브랜드관' },
    { icon: <ShoppingBag size={22} strokeWidth={1.2} />, label: '마켓' },
    { icon: <Gamepad2 size={22} strokeWidth={1.2} />, label: '게임' },
    { icon: <UserCircle size={22} strokeWidth={1.2} />, label: '모바일신분증' },
    { icon: <Cloud size={22} strokeWidth={1.2} />, label: '클라우드' },
    { icon: <Calendar size={22} strokeWidth={1.2} />, label: '캘린더' },
    { icon: <CalendarClock size={22} strokeWidth={1.2} />, label: '예약하기' },
  ];

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
      <header style={{ ...headerBaseStyle, color: global.textColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>더보기</h2>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={20} strokeWidth={2.3} />
          <ScanLine size={20} strokeWidth={2.3} />
          <Settings size={20} strokeWidth={2.3} />
        </div>
      </header>

      {/* 2. 홈 / 지갑 토글 */}
      <div style={{ display: 'flex', gap: 7, padding: '2px 14px 12px 14px' }}>
        <button style={{
          backgroundColor: '#000000',
          color: global.backgroundColor,
          borderRadius: 999,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 400,
          border: 'none',
          cursor: 'pointer',
        }}>
          홈
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.textColor,
          borderRadius: 999,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 400,
          border: `1px solid ${global.textColor}30`,
          cursor: 'pointer',
        }}>
          지갑
        </button>
      </div>

      {/* 스크롤 가능한 메인 영역 */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* 3. 카카오페이 배너 */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{
            backgroundColor: '#FEE500',
            borderRadius: 14,
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3c2a2a', fontWeight: 400, fontSize: 13 }}>
              pay 87,000원
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, fontWeight: 400, color: '#3c2a2a' }}>
              <span>송금</span>
              <span>자산</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ScanLine size={13} strokeWidth={2} /> 결제
              </span>
            </div>
          </div>
        </div>

        {/* 4. 그리드 메뉴 영역 */}
        <section style={{ padding: '8px 16px 16px 16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            rowGap: 16,
            columnGap: 8,
            backgroundColor: '#f5f5f5',
            borderRadius: 14,
            padding: '14px 8px',
          }}>
            {gridMenus.map((menu, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', cursor: 'pointer' }}>
                <div style={{ color: global.textColor }}>
                  {menu.icon}
                </div>
                {menu.hasDot && (
                  <div style={{ position: 'absolute', top: -2, right: 14, width: 6, height: 6, backgroundColor: '#FF5C5C', borderRadius: '50%' }} />
                )}
                <span style={{ fontSize: 10, color: global.textColor, fontWeight: 500 }}>{menu.label}</span>
              </div>
            ))}
          </div>

          {/* 페이지네이션 닷 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <div style={{ width: 14, height: 6, borderRadius: 3, backgroundColor: '#0A7BFF' }} />
            <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: `${global.textColor}40` }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: `${global.textColor}30` }} />
          </div>
        </section>

        {/* 5. 광고 배너 */}
        <div style={{ padding: '0 16px 12px 16px' }}>
          <div style={{ borderRadius: 6, overflow: 'hidden', border: `1px solid ${global.descriptionColor}20` }}>
            <div style={{ width: '100%', height: 150, position: 'relative', overflow: 'hidden' }}>
              <img src="/previews/flower.jpg" alt="광고 배너" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.2)', color: '#FFF', fontSize: 10, padding: '2px 6px', borderRadius: 999 }}>광고</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgb(69,67,67)' }}>꽃으로 전하는 마음</span>
              <button style={{ backgroundColor: 'transparent', border: `1px solid ${global.descriptionColor}30`, borderRadius: 4, padding: '4px 10px', fontSize: 11, color: global.descriptionColor }}>
                바로가기
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});
