import { useThemeStore } from '../useThemeStore';

export const PasscodeScreen = () => {
  const passcode = useThemeStore((state) => state.passcode);

  return (
    <section
      style={{
        flex: 1,
        backgroundColor: passcode.backgroundColor,
        color: passcode.titleColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '84px 20px 24px',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20 }}>비밀번호를 입력해주세요</h2>

      <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#664242' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #664242' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #664242' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #664242' }} />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 292,
          marginTop: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '지우기'].map((key, index) => (
          <button
            key={`${key}-${index}`}
            type="button"
            disabled={key === ''}
            style={{
              height: 56,
              borderRadius: 16,
              border: 0,
              fontSize: key === '지우기' ? 15 : 24,
              fontWeight: key === '지우기' ? 700 : 500,
              backgroundColor: key === '' ? 'transparent' : '#fff2f2',
              color: passcode.keypadTextColor,
            }}
          >
            {key}
          </button>
        ))}
      </div>
    </section>
  );
};
