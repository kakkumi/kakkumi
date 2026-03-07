import React from 'react';
import { Delete } from 'lucide-react';
import { ScreenThemeConfig } from './FriendsScreen';

export const PasscodeScreen = React.memo(function PasscodeScreen({ config }: { config: ScreenThemeConfig }) {
  const passcode = {
    backgroundColor: config.passcodeBg,
    titleColor: config.passcodeTitleText,
    keypadBackgroundColor: config.bodyBg,
    keypadTextColor: config.passcodeKeypadText,
    keypadPressedColor: `${config.passcodeKeypadText}22`,
  };

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
          backgroundColor: passcode.backgroundColor,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400, color: '#3c2a2a' }}>암호 입력</h2>
        <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 400, color: '#3c2a2a', opacity: 0.8 }}>암호를 입력해주세요.</p>

        {/* 불릿 (입력 인디케이터) */}
        <div style={{ display: 'flex', gap: 0, marginTop: 40, alignItems: 'center', height: 40 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#191919', margin: '0 13px' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#191919', margin: '0 13px' }} />
          <div style={{ width: 14, height: 2, backgroundColor: '#CCCCCC', borderRadius: 2, margin: '0 13px' }} />
          <div style={{ width: 14, height: 2, backgroundColor: '#CCCCCC', borderRadius: 2, margin: '0 13px' }} />
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
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '취소', '0', 'delete'].map((key, index) => (
            <button
              key={`${key}-${index}`}
              type="button"
              disabled={key === ''}
              style={{
                height: 44,
                border: 0,
                backgroundColor: 'transparent',
                color: '#3c2a2a',
                fontSize: key === '취소' ? 13 : 22,
                fontWeight: key === '취소' ? 400 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: key === '' ? 'default' : 'pointer',
                position: 'relative',
              }}
            >
              {/* 5번 키 회색 원형 배경 */}
              {key === '5' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.08)',
                  zIndex: 0,
                  pointerEvents: 'none',
                }} />
              )}
              
              <span style={{ position: 'relative', zIndex: 1 }}>
                {key === 'delete' ? (
                  <Delete size={24} strokeWidth={1.5} />
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
});
