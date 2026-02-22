import type { CSSProperties } from 'react';

export const frameStyle: CSSProperties = {
  width: 375,
  height: 720,
  borderRadius: 30,
  overflow: 'hidden',
  border: '1px solid #f0d3d3',
  boxShadow: '0 12px 28px rgba(102,66,66,0.14)',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const headerBaseStyle: CSSProperties = {
  padding: '26px 16px 10px',
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
