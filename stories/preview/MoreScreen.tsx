import React from 'react';
import { 
  Search, ScanLine, Settings, Gift, Package, Percent, Smile, 
  MonitorPlay, Shirt, ShoppingBag, UserCircle, Calendar, 
  Gamepad2, CalendarClock, ChevronRight, MapPin, Sun, Cloud, MessageCircle
} from 'lucide-react';

// --- 외부 파일 의존성 제거 (미리보기를 위한 통합 모의 데이터 및 스타일) ---
const headerBaseStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '26px 16px 12px 16px',
  backgroundColor: 'transparent',
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
      chatsTab: {
        filterChipBg: 'rgba(255, 255, 255, 0.4)', // 반투명 배경 재사용
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const MoreScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { global, chatsTab } = themeConfig;

  // 그리드 메뉴 데이터
  const gridMenus = [
    { icon: <Gift size={28} strokeWidth={1.2} />, label: '선물하기' },
    { icon: <Package size={28} strokeWidth={1.2} />, label: '받은선물' },
    { icon: <Percent size={28} strokeWidth={1.2} />, label: '톡딜', hasDot: true },
    { icon: <Smile size={28} strokeWidth={1.2} />, label: '이모티콘' },
    { icon: <MonitorPlay size={28} strokeWidth={1.2} />, label: '라이브쇼핑' },
    { icon: <Shirt size={28} strokeWidth={1.2} />, label: '브랜드패션' },
    { icon: <ShoppingBag size={28} strokeWidth={1.2} />, label: '메이커스' },
    { icon: <UserCircle size={28} strokeWidth={1.2} />, label: '프렌즈', hasDot: true },
    { icon: <Calendar size={28} strokeWidth={1.2} />, label: '캘린더' },
    { icon: <CalendarClock size={28} strokeWidth={1.2} />, label: '캘린더' }, // 스크린샷 오타(캘린더 중복) 고증
    { icon: <Gamepad2 size={28} strokeWidth={1.2} />, label: '게임' },
    { icon: <CalendarClock size={28} strokeWidth={1.2} />, label: '예약하기' },
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
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>더보기</h2>
        <div style={iconRowStyle}>
          <Search size={22} strokeWidth={2.5} />
          <ScanLine size={22} strokeWidth={2.5} />
          <Settings size={22} strokeWidth={2.5} />
        </div>
      </header>

      {/* 2. 홈 / 지갑 토글 */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 16px 16px 16px' }}>
        <button style={{ 
          backgroundColor: global.textColor, 
          color: global.backgroundColor, 
          borderRadius: 999, 
          padding: '7px 18px', 
          fontSize: 15, 
          fontWeight: 700, 
          border: 'none',
        }}>
          홈
        </button>
        <button style={{ 
          backgroundColor: 'transparent', 
          color: global.descriptionColor, 
          borderRadius: 999, 
          padding: '7px 18px', 
          fontSize: 15, 
          fontWeight: 600, 
          border: `1px solid transparent`, // 숏폼/오픈채팅과 달리 테두리가 없음
        }}>
          지갑
        </button>
      </div>

      {/* 스크롤 가능한 메인 영역 */}
      <div className="more-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        
        {/* 3. 카카오페이 배너 */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <div style={{
            backgroundColor: '#FEE500', // 카카오페이 고유 옐로우
            borderRadius: 14,
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#191919', fontWeight: 800, fontSize: 16 }}>
              <MessageCircle size={18} fill="#191919" stroke="none" /> pay 53,000원
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 13, fontWeight: 700, color: '#191919' }}>
              <span>송금</span>
              <span>자산</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ScanLine size={14} strokeWidth={3} /> 결제
              </span>
            </div>
          </div>
        </div>

        {/* 4. 그리드 메뉴 영역 */}
        <section style={{ padding: '8px 16px 24px 16px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            rowGap: 24, 
            columnGap: 8 
          }}>
            {gridMenus.map((menu, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', cursor: 'pointer' }}>
                <div style={{ color: global.textColor }}>
                  {menu.icon}
                </div>
                {menu.hasDot && (
                  <div style={{ position: 'absolute', top: -2, right: 18, width: 6, height: 6, backgroundColor: '#FF5C5C', borderRadius: '50%' }} />
                )}
                <span style={{ fontSize: 11, color: global.textColor, fontWeight: 500 }}>{menu.label}</span>
              </div>
            ))}
          </div>

          {/* 페이지네이션 닷 */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 24 }}>
            <div style={{ width: 14, height: 6, borderRadius: 3, backgroundColor: '#0A7BFF' }} />
            <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: `${global.textColor}40` }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: `${global.textColor}30` }} />
          </div>
        </section>

        {/* 5. 광고 배너 (나이키 골프) */}
        <div style={{ padding: '0 16px 24px 16px' }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${global.descriptionColor}20` }}>
            <div style={{ 
              width: '100%', height: 160, backgroundColor: '#2C5A59', position: 'relative',
              backgroundImage: 'linear-gradient(to bottom right, #5A8F8E, #1E3D3C)', // 골프 이미지 톤 모방
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
               <span style={{ fontSize: 40, opacity: 0.8 }}>⛳️</span>
               <div style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.2)', color: '#FFF', fontSize: 10, padding: '2px 6px', borderRadius: 999 }}>AD</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.4)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: global.textColor }}>나이키 골프 Collection</span>
              <button style={{ backgroundColor: 'transparent', border: `1px solid ${global.descriptionColor}30`, borderRadius: 4, padding: '4px 10px', fontSize: 11, color: global.descriptionColor }}>
                바로가기
              </button>
            </div>
          </div>
        </div>

        {/* 6. 게임플레이 섹션 */}
        <section style={{ padding: '0 0 24px 0' }}>
          <h3 style={{ margin: '0 16px 8px 16px', fontSize: 16, fontWeight: 800, color: global.textColor }}>
            게임플레이
          </h3>
          <div style={{ margin: '0 16px 16px 16px', padding: '12px 16px', backgroundColor: chatsTab.filterChipBg, borderRadius: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 16 }}>📢</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: global.textColor }}>게임하며 모으는 쇼핑포인트! 게임플레이 OPEN</span>
            </div>
            
            <div className="more-scroll" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {/* 게임 1 */}
              <div style={{ width: 140, flexShrink: 0 }}>
                <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#A2C5FF', borderRadius: 12, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 8 }}>
                  <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#FF5C5C', color: '#FFF', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>NEW</div>
                  🦖
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>쪼르디 구출 대작전</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: global.descriptionColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCircle size={12} /> 130만 플레이
                </p>
              </div>
              {/* 게임 2 */}
              <div style={{ width: 140, flexShrink: 0 }}>
                <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#98E59E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 8 }}>
                  🧩
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>퍼즐탐험</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: global.descriptionColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCircle size={12} /> 80만 플레이
                </p>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: `${global.descriptionColor}15`, margin: '8px 0' }} />

            {/* 랭킹 / 쇼핑포인트 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: global.textColor, fontWeight: 500 }}>
                🏆 이번주 나의 랭킹
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: global.textColor, display: 'flex', alignItems: 'center' }}>
                23위 <ChevronRight size={16} color={global.descriptionColor} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0 8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: global.textColor, fontWeight: 500 }}>
                🪙 이번 달 나의 쇼핑포인트
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: global.textColor, display: 'flex', alignItems: 'center' }}>
                5,123P <ChevronRight size={16} color={global.descriptionColor} />
              </div>
            </div>
          </div>
        </section>

        {/* 7. 카카오 나우 섹션 */}
        <section style={{ padding: '0 16px 24px 16px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 800, color: global.textColor }}>
            카카오 나우
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', minWidth: 0 }}>
            {/* 나우 카드 1 */}
            <div style={{ backgroundColor: '#DED1FF', borderRadius: 12, padding: 16, aspectRatio: '1', boxSizing: 'border-box', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#191919', lineHeight: 1.4 }}>일이삼사오육칠팔구<br/>십일이삼사오육칠팔</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#191919', opacity: 0.8 }}>일이삼사오육칠팔구십</p>
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 48 }}>😊</div>
            </div>
            {/* 나우 카드 2 */}
            <div style={{ 
              backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, aspectRatio: '1', boxSizing: 'border-box', minWidth: 0,
              backgroundImage: 'linear-gradient(to bottom right, #FFFF99, #FF99CC, #99FFCC)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
            }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#191919', lineHeight: 1.4 }}>일이삼사오육칠팔구<br/>십일이삼사오육칠팔</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#191919', opacity: 0.8 }}>일이삼사오육칠팔구십</p>
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 40, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🪐✨</div>
            </div>
            {/* 나우 카드 3 */}
            <div style={{ backgroundColor: '#C1FFD7', borderRadius: 12, padding: 16, aspectRatio: '1', boxSizing: 'border-box', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#191919', lineHeight: 1.4 }}>일이삼사오육칠팔구<br/>십일이삼사오육칠팔</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#191919', opacity: 0.8 }}>일이삼사오육칠팔구십</p>
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 48 }}>⚽️</div>
            </div>
            {/* 나우 카드 4 */}
            <div style={{ backgroundColor: '#FFE7B0', borderRadius: 12, padding: 16, aspectRatio: '1', boxSizing: 'border-box', minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#191919', lineHeight: 1.4 }}>일이삼사오육칠팔구<br/>십일이삼사오육칠팔</p>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#191919', opacity: 0.8 }}>일이삼사오육칠팔구십</p>
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 48 }}>🔮</div>
            </div>
          </div>
        </section>

        {/* 8. 날씨 섹션 */}
        <section style={{ padding: '0 16px 40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: global.textColor }}>
              <MapPin size={14} /> <span style={{ fontSize: 13, fontWeight: 500 }}>성남시 백현동</span>
            </div>
            <ScanLine size={16} color={global.descriptionColor} /> {/* 과녁 모양 아이콘 모방 */}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Sun size={32} color="#FFA500" fill="#FFA500" />
            <span style={{ fontSize: 32, fontWeight: 300, color: global.textColor, letterSpacing: -1 }}>18°</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, color: global.textColor, fontWeight: 500 }}>어제보다 2°C 높아요.</span>
              <span style={{ fontSize: 12, color: global.descriptionColor }}>미세먼지 <span style={{ color: '#FF5C5C', fontWeight: 600 }}>나쁨</span></span>
            </div>
          </div>

          {/* 광고형 정보 블록 */}
          <div style={{ backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <MapPin size={12} fill="#FEE500" color="#FEE500" /> 
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0A7BFF' }}>삼평동,</span> 
                <span style={{ fontSize: 11, color: global.textColor }}>주변 호텔</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: global.textColor }}>호텔 스카이파크 센트럴 서울 판교</p>
              <p style={{ margin: '2px 0 0', fontSize: 10, color: global.descriptionColor }}>경기 성남시 분당구 판교역로 152</p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#A2C5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
              🏨
            </div>
          </div>
        </section>

      </div>

      <style jsx>{`
        .more-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};