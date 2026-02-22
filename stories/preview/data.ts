import type { ChatItem, FriendItem, OpenFeedItem } from './types';

export const friends: FriendItem[] = [
  { id: 1, name: '라이언', message: '오늘도 화이팅!' },
  { id: 2, name: '춘식이', message: '점심 추천 받습니다' },
  { id: 3, name: '어피치', message: '저녁에 산책 갈래?' },
  { id: 4, name: '무지', message: '새 테마 시안 보냈어' },
];

export const chats: ChatItem[] = [
  { id: 1, room: '디자인팀', message: 'UI 반영 완료했습니다.', time: '오후 3:42', unread: 3 },
  { id: 2, room: '친구들', message: '주말 약속 정리할게요!', time: '오후 2:18', unread: 0 },
  { id: 3, room: '오픈채팅 공지', message: '이벤트 일정이 업데이트되었어요.', time: '오전 11:05', unread: 18 },
];

export const openFeeds: OpenFeedItem[] = [
  {
    id: 1,
    title: 'UI/UX 스터디 오픈채팅',
    likes: 128,
    comments: 24,
    summary: '최신 카카오톡 UI 패턴 공유 및 피드백 세션 모집 중',
  },
  {
    id: 2,
    title: 'iOS 테마 제작자 모임',
    likes: 92,
    comments: 17,
    summary: '말풍선/탭바 에셋 교체 팁과 QA 정리',
  },
];
