export const ShoppingScreen = () => {
  return (
    <section style={{ flex: 1, padding: 16, backgroundColor: '#fff8f8' }}>
      <h2 style={{ margin: 0, color: '#664242', fontSize: 23 }}>쇼핑</h2>
      <p style={{ color: '#805959', marginTop: 8 }}>추천 상품과 테마 연동 배너 영역</p>
      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {[1, 2, 3].map((card) => (
          <article
            key={card}
            style={{
              borderRadius: 14,
              backgroundColor: '#fff',
              border: '1px solid #f1dada',
              padding: 12,
              color: '#664242',
            }}
          >
            쇼핑 카드 {card}
          </article>
        ))}
      </div>
    </section>
  );
};
