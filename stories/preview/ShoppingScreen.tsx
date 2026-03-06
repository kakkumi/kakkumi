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
        overflow: 'hidden',
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

      {/* 3. 메인 쇼핑 스크롤 영역 (하얀색 배경) */}
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundColor: '#FFFFFF' }}>

        {/* 배너 카드 영역 (가로 스크롤) */}
        <section className="no-scrollbar" style={{ display: 'flex', gap: 12, padding: '10px 16px 10px 16px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>

          {/* 카드 1 : 베이비&키즈페어 */}
          <div style={{
            width: '75%', flexShrink: 0, aspectRatio: '3/4', backgroundColor: '#AECBFF', borderRadius: 16,
            padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            scrollSnapAlign: 'start', position: 'relative', overflow: 'hidden'
          }}>
            {/* 배경 장식 (기저귀 이미지 모방) */}
            <div style={{ position: 'absolute', top: '20%', right: -20, fontSize: 120, opacity: 0.8, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))' }}>👶</div>

            <div style={{ backgroundColor: '#FFFFFF', color: '#FF3B30', fontWeight: 900, fontSize: 14, padding: '4px 8px', borderRadius: 6, alignSelf: 'flex-start', zIndex: 1 }}>
              베이비&키즈페어
            </div>

            <div style={{ zIndex: 1, color: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>톡딜가</span>
                <span style={{ fontSize: 14, textDecoration: 'line-through', opacity: 0.8, marginBottom: 2 }}>234,900원</span>
                <span style={{ fontSize: 24, fontWeight: 800 }}>144,900원</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#FEE500' }}>최대혜택가</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: '#FEE500' }}>125,457원</span>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.9 }}>하기스 맥스드라이 밴드형 3박스 외</p>
            </div>
          </div>

          {/* 카드 2 : 부대찌개 */}
          <div style={{
            width: '75%', flexShrink: 0, aspectRatio: '3/4', backgroundColor: '#1C1C1E', borderRadius: 16,
            padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            scrollSnapAlign: 'start', position: 'relative', overflow: 'hidden',
            backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.8) 100%)'
          }}>
            {/* 배경 장식 (음식 이미지 모방) */}
            <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', fontSize: 140, filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))' }}>🥘</div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#191919', fontWeight: 800, fontSize: 14, padding: '4px 8px', borderRadius: 6, alignSelf: 'flex-start', zIndex: 1 }}>
              리뷰인증
            </div>

            <div style={{ zIndex: 1, color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ backgroundColor: '#FF3B30', color: '#FFF', padding: '2px 4px', borderRadius: 4, fontSize: 16, fontWeight: 800 }}>50%</div>
                <span style={{ fontSize: 24, fontWeight: 800 }}>4,900원</span>
                <span style={{ fontSize: 14, textDecoration: 'line-through', opacity: 0.6 }}>9,900원</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: 17, fontWeight: 700 }}>햄 듬뿍 부대찌개 600g</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* 썸네일 그룹 */}
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFC1C1', zIndex: 3, border: '1px solid #1C1C1E' }} />
                  <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#A2C5FF', zIndex: 2, marginLeft: -8, border: '1px solid #1C1C1E' }} />
                  <div style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FEE500', zIndex: 1, marginLeft: -8, border: '1px solid #1C1C1E' }} />
                </div>
                <span style={{ fontSize: 13, opacity: 0.9 }}>7,531개 주문중</span>
              </div>
            </div>
          </div>

        </section>

        {/* 퀵 메뉴 아이콘 영역 */}
        <section style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 24px 16px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Gift size={32} color="#FF5C5C" fill="#FFC1C1" strokeWidth={1.5} />
            <span style={{ fontSize: 12, color: '#191919' }}>선물하기</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Percent size={32} color="#FF3B30" strokeWidth={2.5} />
            <span style={{ fontSize: 12, color: '#191919' }}>톡딜</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ backgroundColor: '#FF3B30', color: '#FFF', borderRadius: 6, padding: '4px 6px', fontSize: 13, fontWeight: 900, letterSpacing: -0.5, transform: 'scale(0.9)' }}>
              LIVE
            </div>
            <span style={{ fontSize: 12, color: '#191919' }}>라이브쇼핑</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Package size={32} color="#FF9500" fill="#FFEBB3" strokeWidth={1.5} />
            <span style={{ fontSize: 12, color: '#191919' }}>받은선물</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Receipt size={32} color="#8E8E93" strokeWidth={1.5} />
            <span style={{ fontSize: 12, color: '#191919' }}>주문내역</span>
          </div>
        </section>

        <div style={{ height: 8, backgroundColor: '#F2F2F2' }} />

        {/* 나를 위한 추천 딜 영역 */}
        <section style={{ padding: '24px 16px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191919' }}>나를 위한 추천 딜</h3>
            <Info size={16} color="#999999" />
          </div>

        </section>

      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
