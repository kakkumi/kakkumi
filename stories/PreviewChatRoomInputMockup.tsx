'use client';

import React from 'react';
import { Plus, Smile } from 'lucide-react';
import { useThemeStore } from './useThemeStore';

export const PreviewChatRoomInputMockup = () => {
  const globalStore = useThemeStore((state) => state.global);
  const tabBar = useThemeStore((state) => state.tabBar);
  const chatRoom = useThemeStore((state) => state.chatRoom);

  const inputBarBg = chatRoom.inputBarBg;
  const sendBtnBg = chatRoom.sendButtonBg;
  const sendBtnFg = globalStore.headerText;
  const menuBtnBg = 'rgba(0,0,0,0.04)';
  const activeIconColor = tabBar.activeIconColor;

  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: 10,
      fontWeight: 600,
      color: '#9e9e9e',
      letterSpacing: '0.04em',
      padding: '10px 14px 6px 14px',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
      backgroundColor: '#f7f7f7',
    }}>
      {text}
    </div>
  );

  return (
    <div style={{
      position: 'relative',
      width: 300,
      borderRadius: 18,
      border: '1.5px solid rgba(0,0,0,0.1)',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── 섹션 1: 인풋바 ── */}
      {sectionLabel('case 01.메시지 입력 전')}
      <div style={{
        backgroundColor: inputBarBg,
        padding: '10px 14px 12px 14px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: menuBtnBg,
          color: activeIconColor,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
        }}>
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div style={{
          flex: 1,
          height: 32,
          borderRadius: 18,
          backgroundColor: '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px 0 14px',
        }}>
          <span style={{ color: '#999999', fontSize: 13 }}>메시지 입력</span>
          <Smile size={17} color="#999999" strokeWidth={2} />
        </div>
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: menuBtnBg,
          color: activeIconColor,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
          fontSize: 17,
          fontWeight: 700,
        }}>
          #
        </button>
      </div>

      {/* ── 섹션 2 ── */}
      {sectionLabel('case 02.메시지 입력 후')}
      <div style={{
        backgroundColor: inputBarBg,
        padding: '10px 14px 12px 14px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: menuBtnBg,
          color: activeIconColor,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
        }}>
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div style={{
          flex: 1,
          height: 32,
          borderRadius: 18,
          backgroundColor: '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px 0 14px',
        }}>
          <span style={{ color: '#191919', fontSize: 13 }}>안녕하세요!</span>
          <Smile size={17} color="#999999" strokeWidth={2} />
        </div>
        {/* 전송 버튼 */}
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: sendBtnBg,
          color: sendBtnFg,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M5 12l7-7 7 7" stroke={sendBtnFg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── 섹션 3 */}
      {sectionLabel('case 03. 버튼 Pressed 시')}
      <div style={{
        backgroundColor: inputBarBg,
        padding: '10px 14px 12px 14px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: menuBtnBg,
          color: activeIconColor,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
        }}>
          <Plus size={18} strokeWidth={2.5} />
        </button>
        <div style={{
          flex: 1,
          height: 32,
          borderRadius: 18,
          backgroundColor: '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px 0 14px',
        }}>
          <span style={{ color: '#191919', fontSize: 13 }}>안녕하세요!</span>
          <Smile size={17} color="#999999" strokeWidth={2} />
        </div>
        {/* 전송 버튼 */}
        <button type="button" style={{
          border: 0,
          borderRadius: 999,
          backgroundColor: sendBtnBg,
          color: sendBtnFg,
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'default',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M5 12l7-7 7 7" stroke={sendBtnFg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  );
};

