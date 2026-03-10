import React from 'react';
import { Delete } from 'lucide-react';
import { ScreenThemeConfig } from './FriendsScreen';

export const PasscodeScreen = React.memo(function PasscodeScreen({ config }: { config: ScreenThemeConfig }) {
  const passcode = {
    backgroundColor: config.passcodeBg,
    titleColor: config.passcodeTitleText,
    keypadBackgroundColor: config.passcodeKeypadBg ?? config.bodyBg,
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

      {/* 1. 상단 정보 영역 */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: passcode.titleColor,
          zIndex: 1,
          paddingBottom: 0,
          backgroundColor: config.passcodeBgImageUrl ? 'transparent' : passcode.backgroundColor,
          backgroundImage: config.passcodeBgImageUrl ? `url(${config.passcodeBgImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 400, color: passcode.titleColor }}>암호 입력</h2>
        <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 400, color: passcode.titleColor, opacity: 0.7 }}>암호를 입력해주세요.</p>

        {/* 불릿 */}
        <div style={{ display: 'flex', gap: 0, marginTop: 28, alignItems: 'center', height: 40 }}>
          {/* 1, 2번: 선택 불릿 */}
          {config.bulletFillImageUrl ? (
            <>
              <img src={config.bulletFillImageUrl} alt="" style={{ width: 40, height: 40, margin: '0 5px', objectFit: 'contain' }} />
              <img src={config.bulletFillImageUrl} alt="" style={{ width: 40, height: 40, margin: '0 5px', objectFit: 'contain' }} />
            </>
          ) : (
            <>
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: config.bulletFillColor ?? '#4a7bf7', margin: '0 13px' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: config.bulletFillColor ?? '#4a7bf7', margin: '0 13px' }} />
            </>
          )}
          {/* 3, 4번: 일반 불릿 */}
          {config.bulletEmptyDefault ? (
            <>
              <div style={{ width: 14, height: 2, borderRadius: 1, backgroundColor: '#aaaaaa', margin: '0 13px' }} />
              <div style={{ width: 14, height: 2, borderRadius: 1, backgroundColor: '#aaaaaa', margin: '0 13px' }} />
            </>
          ) : config.bulletEmptyImageUrl ? (
            <>
              <img src={config.bulletEmptyImageUrl} alt="" style={{ width: 40, height: 40, margin: '0 5px', objectFit: 'contain' }} />
              <img src={config.bulletEmptyImageUrl} alt="" style={{ width: 40, height: 40, margin: '0 5px', objectFit: 'contain' }} />
            </>
          ) : (
            <>
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: config.bulletEmptyColor ?? '#191919', margin: '0 13px' }} />
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: config.bulletEmptyColor ?? '#191919', margin: '0 13px' }} />
            </>
          )}
        </div>
      </section>

      {/* 2. 하단 키패드 영역 */}
      <section
        style={{
          flex: '0 0 40%',
          minHeight: 0,
          backgroundColor: passcode.keypadBackgroundColor,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
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
                color: passcode.keypadTextColor,
                fontSize: key === '취소' ? 13 : 22,
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: key === '' ? 'default' : 'pointer',
                position: 'relative',
              }}
            >
              {key === '5' && config.passcodeKeypadPressedOn !== false && (
                config.passcodeKeypadPressedImageUrl ? (
                  <img
                    src={config.passcodeKeypadPressedImageUrl}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -47%)',
                      width: 85,
                      height: 85,
                      objectFit: 'contain',
                      zIndex: 0,
                      pointerEvents: 'none',
                      opacity: 0.7,
                    }}
                  />
                ) : (
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
                )
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {key === 'delete' ? (
                  <Delete size={24} strokeWidth={1.5} color={passcode.keypadTextColor} />
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

