import React from 'react';
import {
  Search, ShoppingBag, Settings, Info,
  Gift, Percent, Package, Receipt
} from 'lucide-react';

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
interface ThemeState {
  themeConfig: {
    global: {
      backgroundColor: string;
      textColor: string;
      descriptionColor: string;
    };
  };
}

const useThemeStore = (selector: (state: ThemeState) => ThemeState['themeConfig']) => {
  const state: ThemeState = {
    themeConfig: {
      global: {
        backgroundColor: '#FFFFFF',
        textColor: '#664242',
        descriptionColor: '#805959',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const ShoppingScreen = () => {
  const themeConfig = useThemeStore((state) => state.themeConfig);
  const { global } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        backgroundColor: global.backgroundColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. 상단 헤더 */}
      <header style={{ ...headerBaseStyle, color: global.textColor }}>
        <h2 data-active-element-id="header-title-icon" style={{ margin: 0, fontSize: 17, fontWeight: 400, color: '#3c2a2a' }}>쇼핑</h2>
        <div data-active-element-id="header-title-icon" style={iconRowStyle}>
          <Search size={20} strokeWidth={2.3} />
          <div style={{ position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={2.3} />
            <span style={{ position: 'absolute', top: 9, left: '50%', transform: 'translateX(-50%)', fontSize: 8, fontWeight: 800 }}>MY</span>
          </div>
          <Settings size={20} strokeWidth={2.3} />
        </div>
      </header>

      {/* 2. 상단 탭 칩 메뉴 */}
      <div style={{ display: 'flex', gap: 7, padding: '2px 14px 4px 14px' }}>
        {[{ label: '홈', active: true }, { label: '랭킹', active: false }].map(({ label, active }) => (
          <button
            key={label}
            style={{
              backgroundColor: active ? '#000000' : 'transparent',
              color: active ? global.backgroundColor : global.textColor,
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 400,
              border: active ? 'none' : `1px solid ${global.textColor}30`,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 3. 메인 영역 */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>

        {/* 배너 카드 영역 */}
        <div style={{ padding: '10px 14px' }}>
          <div style={{
            width: '100%', height: 370,
            background: 'linear-gradient(145deg, #FFE4E1 0%, #FADADD 50%, #F5C0C8 100%)',
            borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
          }}>
            <div style={{ backgroundColor: '#664242', color: '#FFF', fontWeight: 400, fontSize: 11, padding: '3px 9px', borderRadius: 999, alignSelf: 'flex-start' }}>
              신규 테마 출시
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#3c2020', lineHeight: 1.3 }}>
                봄 감성 테마<br />지금 바로 꾸며보세요
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#805959' }}>카꾸미 인기 테마 모아보기</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ backgroundColor: '#664242', color: '#FFF', fontSize: 10, fontWeight: 400, padding: '2px 7px', borderRadius: 999 }}>무료 ~</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#664242' }}>2,900원~</span>
              </div>
            </div>
          </div>
        </div>

        {/* 퀵 메뉴 아이콘 영역 */}
        <section style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 24px 16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Gift size={26} color="#FF5C5C" fill="#FFC1C1" strokeWidth={1.5} />
            <span style={{ fontSize: 11, color: '#191919' }}>선물하기</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Percent size={26} color="#FF3B30" strokeWidth={2.5} />
            <span style={{ fontSize: 11, color: '#191919' }}>톡딜</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ backgroundColor: '#FF3B30', color: '#FFF', borderRadius: 6, padding: '3px 5px', fontSize: 11, fontWeight: 900, letterSpacing: -0.5 }}>
                LIVE
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#191919' }}>라이브쇼핑</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Package size={26} color="#FF9500" fill="#FFEBB3" strokeWidth={1.5} />
            <span style={{ fontSize: 11, color: '#191919' }}>받은선물</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Receipt size={26} color="#8E8E93" strokeWidth={1.5} />
            <span style={{ fontSize: 11, color: '#191919' }}>주문내역</span>
          </div>
        </section>

        <div style={{ height: 8, backgroundColor: '#F2F2F2' }} />

        {/* 나를 위한 추천 딜 영역 */}
        <section style={{ padding: '24px 16px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#191919', transform: 'scaleX(0.97)', transformOrigin: 'left' }}>나를 위한 추천 딜</h3>
            <Info size={16} color="#999999" />
          </div>


        </section>

      </div>

    </div>
  );
};
