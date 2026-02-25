# Kakkumi

카카오 소셜 로그인(무DB) 테스트용 설정.

## 환경 변수

```env
KAKAO_CLIENT_ID=카카오_REST_API_KEY
KAKAO_CLIENT_SECRET=선택값
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback
KAKAO_SESSION_SECRET=임의의_긴_랜덤_문자열
```

## 로그인 경로

- `/api/auth/kakao`: 카카오 로그인 시작
- `/api/auth/kakao/callback`: 콜백 처리
- `/api/auth/session`: 세션 확인
- `/api/auth/logout`: 로그아웃
