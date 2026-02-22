export const MoreScreen = () => {
  return (
    <section style={{ flex: 1, padding: 16, backgroundColor: '#fff8f8' }}>
      <h2 style={{ margin: 0, color: '#664242', fontSize: 23 }}>더보기</h2>
      <p style={{ color: '#805959', marginTop: 8 }}>설정, 테마, 지갑 등 메뉴 진입 영역</p>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {['설정', '테마', '지갑', '실험실'].map((menu) => (
          <button
            key={menu}
            type="button"
            style={{
              border: '1px solid #f1dada',
              borderRadius: 12,
              backgroundColor: '#fff',
              padding: '10px 12px',
              textAlign: 'left',
              color: '#664242',
              fontWeight: 600,
            }}
          >
            {menu}
          </button>
        ))}
      </div>
    </section>
  );
};
