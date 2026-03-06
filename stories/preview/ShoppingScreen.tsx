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

            {/* 배경 SVG 장식 */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 320 370" fill="none" xmlns="http://www.w3.org/2000/svg">

              {/* 배경 큰 원형 */}
              <circle cx="260" cy="80" r="90" fill="#F5C0C8" opacity="0.45" />
              <circle cx="240" cy="60" r="60" fill="#FADADD" opacity="0.6" />
              <circle cx="30" cy="300" r="50" fill="#F5C0C8" opacity="0.3" />
              <circle cx="290" cy="280" r="30" fill="#FFE4E1" opacity="0.5" />
              <circle cx="70" cy="160" r="22" fill="#F5C0C8" opacity="0.2" />

              {/* 복숭아 */}
              <ellipse cx="258" cy="78" rx="48" ry="52" fill="#E8919E" opacity="0.55" />
              <ellipse cx="270" cy="70" rx="28" ry="32" fill="#F2A8B2" opacity="0.6" />
              {/* 복숭아 잎 */}
              <path d="M262 32 Q276 12 293 24 Q281 40 262 32Z" fill="#A8D8A8" opacity="0.75" />
              <path d="M259 30 Q247 11 233 20 Q245 37 259 30Z" fill="#90C890" opacity="0.65" />
              {/* 줄기 */}
              <path d="M260 31 Q262 21 264 14" stroke="#7AB87A" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              {/* 복숭아 하이라이트 */}
              <circle cx="247" cy="60" r="5" fill="white" opacity="0.55" />
              <circle cx="255" cy="69" r="2.5" fill="white" opacity="0.35" />

              {/* 하트 여러 개 */}
              <path d="M40 120 C40 117 43 115 46 118 C49 115 52 117 52 120 C52 124 46 129 46 129 C46 129 40 124 40 120Z" fill="#E8919E" opacity="0.45" />
              <path d="M280 200 C280 198 282 197 284 199 C286 197 288 198 288 200 C288 203 284 206 284 206 C284 206 280 203 280 200Z" fill="#E8919E" opacity="0.4" />
              <path d="M100 250 C100 248 102 246 104 248 C106 246 108 248 108 250 C108 253 104 256 104 256 C104 256 100 253 100 250Z" fill="#E8919E" opacity="0.3" />
              <path d="M20 180 C20 178.5 21.5 177.5 23 179 C24.5 177.5 26 178.5 26 180 C26 182 23 184.5 23 184.5 C23 184.5 20 182 20 180Z" fill="#C87878" opacity="0.35" />
              <path d="M260 310 C260 308 262 307 264 309 C266 307 268 308 268 310 C268 313 264 316 264 316 C264 316 260 313 260 310Z" fill="#E8919E" opacity="0.3" />

              {/* 별 여러 개 */}
              <path d="M60 200 L62 206 L68 206 L63 210 L65 216 L60 212 L55 216 L57 210 L52 206 L58 206Z" fill="#F5C0C8" opacity="0.55" />
              <path d="M285 150 L286.5 154 L291 154 L287.5 156.5 L289 161 L285 158 L281 161 L282.5 156.5 L279 154 L283.5 154Z" fill="#FADADD" opacity="0.65" />
              <path d="M30 70 L31 73 L34 73 L31.5 75 L32.5 78 L30 76 L27.5 78 L28.5 75 L26 73 L29 73Z" fill="#E8919E" opacity="0.4" />
              <path d="M155 290 L156 293 L159 293 L156.5 295 L157.5 298 L155 296 L152.5 298 L153.5 295 L151 293 L154 293Z" fill="#F5C0C8" opacity="0.45" />

              {/* 반짝임 +/× 모양 */}
              <line x1="80" y1="230" x2="80" y2="242" stroke="#E8919E" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="74" y1="236" x2="86" y2="236" stroke="#E8919E" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              <line x1="300" y1="100" x2="300" y2="110" stroke="#C87878" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
              <line x1="295" y1="105" x2="305" y2="105" stroke="#C87878" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
              <line x1="190" y1="40" x2="190" y2="50" stroke="#E8919E" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              <line x1="185" y1="45" x2="195" y2="45" stroke="#E8919E" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />

              {/* 작은 꽃 */}
              <circle cx="130" cy="300" r="5" fill="#F5C0C8" opacity="0.5" />
              <circle cx="124" cy="300" r="3.5" fill="#FADADD" opacity="0.5" />
              <circle cx="136" cy="300" r="3.5" fill="#FADADD" opacity="0.5" />
              <circle cx="130" cy="294" r="3.5" fill="#FADADD" opacity="0.5" />
              <circle cx="130" cy="306" r="3.5" fill="#FADADD" opacity="0.5" />
              <circle cx="130" cy="300" r="3" fill="white" opacity="0.7" />

              {/* 작은 꽃2 */}
              <circle cx="45" cy="340" r="4" fill="#F5C0C8" opacity="0.4" />
              <circle cx="39" cy="340" r="3" fill="#FADADD" opacity="0.4" />
              <circle cx="51" cy="340" r="3" fill="#FADADD" opacity="0.4" />
              <circle cx="45" cy="334" r="3" fill="#FADADD" opacity="0.4" />
              <circle cx="45" cy="346" r="3" fill="#FADADD" opacity="0.4" />
              <circle cx="45" cy="340" r="2.5" fill="white" opacity="0.6" />

              {/* 곡선 장식선 */}
              <path d="M20 240 Q60 220 80 260 Q100 300 140 280" stroke="#E8919E" strokeWidth="1" fill="none" opacity="0.2" strokeLinecap="round" />
              <path d="M200 320 Q230 300 250 330 Q270 355 300 340" stroke="#C87878" strokeWidth="1" fill="none" opacity="0.18" strokeLinecap="round" />

            </svg>

            {/* 뱃지 */}
            <div style={{ backgroundColor: '#9a7777', color: '#FFF', fontWeight: 400, fontSize: 11, padding: '3px 9px', borderRadius: 999, alignSelf: 'flex-start', position: 'relative', zIndex: 1 }}>
              신규 테마 출시
            </div>

            {/* 하단 텍스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', zIndex: 1 }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#3c2020', lineHeight: 1.3 }}>
                봄 감성 테마<br />지금 바로 꾸며보세요
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#805959' }}>카꾸미 인기 테마 모아보기</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ backgroundColor: '#8f6363', color: '#FFF', fontSize: 11, fontWeight: 400, padding: '2px 7px', borderRadius: 999 }}>무료부터 2,500원까지</span>
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
