import type { CSSProperties } from 'react';

export const frameStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const headerBaseStyle: CSSProperties = {
  padding: '31px 16px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
};

export const iconRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  color: '#664242',
};

export const listItemBaseStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 16px',
  borderBottom: '1px solid rgba(0,0,0,0.04)',
};

export const avatarStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 14,
  backgroundColor: '#ffdede',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#664242',
  fontWeight: 700,
};
