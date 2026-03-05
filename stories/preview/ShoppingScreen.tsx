import React from 'react';
import {
  Search, ShoppingBag, Settings, Info,
  Gift, Percent, Package, Receipt,
  Upload, Heart
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
const useThemeStore = (selector: any) => {
  const state = {
    themeConfig: {
      global: {
        backgroundColor: '#FFDEDE',
        textColor: '#664242',
        descriptionColor: '#805959',
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const ShoppingScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
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
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '4px 16px 16px 16px', overflowX: 'auto' }}>
        {['홈', '랭킹', 'LG생건쎈딜', '쟁쟁한특가', '베이비&키즈'].map((chip, idx) => (
          <button
            key={chip}
            style={{
              backgroundColor: idx === 0 ? global.textColor : 'transparent',
              color: idx === 0 ? '#FFFFFF' : global.textColor,
              borderRadius: 999,
              padding: '8px 16px',
              fontSize: 15,
              fontWeight: idx === 0 ? 700 : 500,
              border: idx === 0 ? 'none' : `1px solid ${global.textColor}30`,
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* 3. 메인 쇼핑 스크롤 영역 (하얀색 배경) */}
      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundColor: '#FFFFFF' }}>

        {/* 배너 카드 영역 (가로 스크롤) */}
        <section className="no-scrollbar" style={{ display: 'flex', gap: 12, padding: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>

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
        <section style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px 32px 24px' }}>
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
        <section style={{ padding: '24px 16px 40px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#191919' }}>나를 위한 추천 딜</h3>
            <Info size={16} color="#999999" />
          </div>

          {/* 추천 딜 아이템 1 (구운란) */}
          <article style={{ marginBottom: 32 }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#E5C07B', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <span style={{ fontSize: 120 }}>🥚</span>
              {/* 마감 1일전 뱃지 */}
              <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
                마감 1일전
              </div>
              {/* 하단 어피치 장식 (스크린샷 고증) */}
              <div style={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 40, display: 'flex', justifyContent: 'space-around', fontSize: 32 }}>
                <span>🍑</span><span>🍑</span><span>🍑</span><span>🍑</span><span>🍑</span>
              </div>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ backgroundColor: '#F5F5F5', display: 'inline-block', padding: '3px 6px', borderRadius: 4, fontSize: 11, color: '#666', fontWeight: 500, marginBottom: 8 }}>
                무료배송
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: 16, color: '#191919', lineHeight: 1.4 }}>
                국내산 구운란 대란 30구. 쫄깃하고 탱글한 맛
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#0A7BFF' }}>톡딜가</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#191919' }}>8,900원~</span>
                  <span style={{ fontSize: 14, color: '#999', textDecoration: 'line-through', marginBottom: 2 }}>49,900원</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFC1C1', zIndex: 2, border: '1.5px solid #FFF' }} />
                    <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#A2C5FF', zIndex: 1, marginLeft: -10, border: '1.5px solid #FFF' }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#666' }}>2,818개 주문 중이에요</span>
                </div>
                <div style={{ display: 'flex', gap: 16, color: '#191919' }}>
                  <Upload size={24} strokeWidth={1.5} />
                  <Heart size={24} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </article>

          {/* 추천 딜 아이템 2 (카무트 효소) */}
          <article>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#F0F0F0', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 100 }}>💊</span>
              <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: 12, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
                마감 2일전
              </div>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <div style={{ backgroundColor: 'rgba(10, 123, 255, 0.1)', color: '#0A7BFF', display: 'inline-block', padding: '3px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>할인쿠폰 2장</div>
                <div style={{ backgroundColor: '#F5F5F5', display: 'inline-block', padding: '3px 6px', borderRadius: 4, fontSize: 11, color: '#666', fontWeight: 500 }}>무료배송</div>
              </div>

              <p style={{ margin: '0 0 8px 0', fontSize: 16, color: '#191919', lineHeight: 1.4 }}>
                골드카무트효소 3개월+추가 9포+리조또 4개+쇼핑백
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#0A7BFF' }}>톡딜가</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#191919' }}>41,000원~</span>
                  <span style={{ fontSize: 14, color: '#999', textDecoration: 'line-through', marginBottom: 2 }}>110,000원</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#FF3B30' }}>
                  최대혜택가 36,900원
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#98E59E', zIndex: 2, border: '1.5px solid #FFF' }} />
                    <div style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEE500', zIndex: 1, marginLeft: -10, border: '1.5px solid #FFF' }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#666' }}>2,495개 주문 중이에요</span>
                </div>
                <div style={{ display: 'flex', gap: 16, color: '#191919' }}>
                  <Upload size={24} strokeWidth={1.5} />
                  <Heart size={24} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </article>

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
