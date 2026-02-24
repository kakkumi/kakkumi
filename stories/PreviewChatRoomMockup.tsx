import { ChatRoomScreen } from './preview/ChatRoomScreen';
import { frameStyle } from './preview/styles';

export const PreviewChatRoomMockup = () => {
  return (
    <div style={{ position: 'relative', width: 368, height: 699 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 40,
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
            width: 91,
            height: 23,
            borderRadius: 999,
            backgroundColor: '#111827',
            zIndex: 20,
          }}
        />

        <section style={frameStyle}>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            <ChatRoomScreen />
          </div>
        </section>
      </div>

      <div
        style={{
          position: 'absolute',
          right: -6,
          top: 91,
          width: 4,
          height: 44,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 84,
          width: 4,
          height: 29,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -6,
          top: 124,
          width: 4,
          height: 29,
          borderRadius: 4,
          backgroundColor: '#3f3f46',
        }}
      />
    </div>
  );
};
