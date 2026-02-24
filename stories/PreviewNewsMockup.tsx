import { NewsScreen } from './preview/NewsScreen';
import { frameStyle } from './preview/styles';
import { TabBar } from './preview/TabBar';

export const PreviewNewsMockup = ({ disableTabNavigation = false }: { disableTabNavigation?: boolean }) => {
  return (
    <div style={{ position: 'relative', width: 387, height: 736 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 42,
          border: '5px solid #27272a',
          backgroundColor: '#fff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.2) inset',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 96,
            height: 24,
            borderRadius: 999,
            backgroundColor: '#111827',
            zIndex: 20,
          }}
        />

        <section style={frameStyle}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <NewsScreen />
          </div>
          <TabBar disabled={disableTabNavigation} />
        </section>
      </div>

      <div
        style={{
          position: 'absolute',
          right: -6,
          top: 96,
          width: 4,
          height: 46,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 88,
          width: 4,
          height: 30,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 130,
          width: 4,
          height: 30,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
    </div>
  );
};
