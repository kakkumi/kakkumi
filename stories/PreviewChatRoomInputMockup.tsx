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
  const myBubbleBg = chatRoom.myBubbleBg;
  const friendBubbleBg = chatRoom.friendBubbleBg;
  const descColor = globalStore.descText;
  const primaryText = globalStore.primaryText;
  const chatBg = chatRoom.backgroundColor;
  const chatroomBgImageUrl = chatRoom.bgImageUrl;
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
      width: 240,
      borderRadius: 18,
      border: '1.5px solid rgba(0,0,0,0.1)',
      overflow: 'hidden',
      backgroundColor: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── 섹션 1: 인풋바 ── */}
      {sectionLabel('인풋바 InputBarStyle')}
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
          height: 28,
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

      {/* ── 섹션 2: 전송 버튼 ── */}
      {sectionLabel('전송 버튼 InputBarStyle')}
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
          height: 28,
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

      {/* ── 섹션 3: 메시지 ── */}
      {sectionLabel('메시지 MessageCellStyle')}
      <div style={{
        backgroundColor: chatBg,
        backgroundImage: chatroomBgImageUrl ? `url(${chatroomBgImageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {/* 받은 메시지 */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            backgroundColor: '#D4E09B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="7" r="5" fill="rgba(120,120,120,0.55)" />
              <path d="M5 21 Q4 21 4 20 Q4 13 12 13 Q20 13 20 20 Q20 21 19 21 Z" fill="rgba(120,120,120,0.55)" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '75%' }}>
            <span style={{ fontSize: 11, color: descColor, marginLeft: 2 }}>강릉</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
              <div style={{
                backgroundColor: friendBubbleBg,
                color: primaryText,
                padding: '5px 12px',
                borderRadius: '4px 16px 16px 16px',
                fontSize: 12,
                lineHeight: 1.4,
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}>
                나 테마 만들었어 ㅋㅋ
              </div>
              <span style={{ fontSize: 10, color: descColor, flexShrink: 0 }}>오후 2:15</span>
            </div>
          </div>
        </div>

        {/* 보낸 메시지 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, maxWidth: '75%' }}>
            <span style={{ fontSize: 10, color: descColor, flexShrink: 0 }}>오후 2:16</span>
            <div style={{
              backgroundColor: myBubbleBg,
              color: primaryText,
              padding: '5px 12px',
              borderRadius: '16px 4px 16px 16px',
              fontSize: 12,
              lineHeight: 1.4,
            }}>
              대박이다!!
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
