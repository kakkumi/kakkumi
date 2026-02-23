import React from 'react';
import { Delete } from 'lucide-react';

// Zustand Store Mock (Apeach 테마 컬러 적용)
const useThemeStore = (selector: any) => {
  const state = {
    themeConfig: {
      global: {
        backgroundColor: '#FFDEDE',
      },
      passcode: {
        backgroundColor: '#FFDEDE',
        titleColor: '#664242',
        keypadBackgroundColor: '#FFF2F2',
        keypadTextColor: '#664242',
        keypadPressedColor: 'rgba(246, 108, 108, 0.15)', // 어피치 테마 프레스시 나타나는 꽃 배경색 모방
      }
    }
  };
  return selector(state);
};
// -------------------------------------------------------------------------

export const PasscodeScreen = () => {
  const themeConfig = useThemeStore((state: any) => state.themeConfig);
  const { passcode } = themeConfig;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
        backgroundColor: passcode.backgroundColor,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}
    >
      {/* 배경 하단 장식 (구름 & 꽃 모양 모방) */}
      <div style={{ position: 'absolute', top: '45%', left: 0, right: 0, height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: 0.6, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', backgroundColor: '#FFF4F4', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', bottom: -10, right: -10, width: 150, height: 100, borderRadius: '50%', backgroundColor: '#FFF4F4', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', bottom: 30, left: 30, fontSize: 30, color: '#FFF' }}>✿</div>
        <div style={{ position: 'absolute', bottom: 50, right: 50, fontSize: 24, color: '#FFF' }}>✿</div>
        <div style={{ position: 'absolute', bottom: 10, right: 120, fontSize: 36, color: '#FFF' }}>✿</div>
      </div>

      {/* 1. 상단 정보 영역 (비밀번호 입력) */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: passcode.titleColor,
          zIndex: 1,
          paddingBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>비밀번호</h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.8, fontWeight: 500 }}>카카오톡 암호를 입력해주세요.</p>

        {/* 불릿 (입력 인디케이터) */}
        <div style={{ display: 'flex', gap: 16, marginTop: 40, alignItems: 'center', height: 40 }}>
          {/* 입력된 불릿 2개 (어피치 인사) */}
          <div style={{ fontSize: 32, transform: 'rotate(-10deg) translateY(4px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🙇‍♀️</div>
          <div style={{ fontSize: 32, transform: 'rotate(10deg) translateY(4px)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>🙇‍♀️</div>
          {/* 입력 안된 불릿 2개 (빈 꽃) */}
          <div style={{ fontSize: 24, color: '#FFF', textShadow: `0 0 1px ${passcode.titleColor}, 0 0 1px ${passcode.titleColor}`, opacity: 0.8 }}>✿</div>
          <div style={{ fontSize: 24, color: '#FFF', textShadow: `0 0 1px ${passcode.titleColor}, 0 0 1px ${passcode.titleColor}`, opacity: 0.8 }}>✿</div>
        </div>
      </section>

      {/* 2. 하단 키패드 영역 (배경색 분리됨) */}
      <section
        style={{
          flex: '0 0 40%',
          minHeight: 0,
          backgroundColor: passcode.keypadBackgroundColor,
          borderTopLeftRadius: 24, // 스크린샷 5번 파란 박스의 둥근 모서리 느낌
          borderTopRightRadius: 24,
          padding: '24px 20px 10px 20px',
          zIndex: 1,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            rowGap: 18,
            columnGap: 22,
            maxWidth: 320,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'].map((key, index) => (
            <button
              key={`${key}-${index}`}
              type="button"
              disabled={key === ''}
              style={{
                height: 44,
                border: 0,
                backgroundColor: 'transparent',
                color: passcode.keypadTextColor,
                fontSize: 22,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: key === '' ? 'default' : 'pointer',
                position: 'relative',
              }}
            >
              {/* 7. Highlighted Image (터치/클릭 시 나타나는 꽃 모양 이펙트) */}
              {key === '5' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 64,
                  color: 'rgba(246, 108, 108, 0.28)',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}>
                  ✿
                </div>
              )}
              
              <span style={{ position: 'relative', zIndex: 1 }}>
                {key === 'delete' ? (
                  <Delete size={24} strokeWidth={2} />
                ) : (
                  key
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};