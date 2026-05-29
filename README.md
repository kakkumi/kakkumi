<div align="center">
  <img src="public/카꾸미.png" alt="카꾸미 로고" width="120" />
  <h1>카꾸미</h1>
  <p><b>카카오톡 iOS 테마를 브라우저에서 직접 만들고, 사고 팔 수 있는 플랫폼</b></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" />
    <img src="https://img.shields.io/badge/Toss_Payments-결제연동-0064FF" />
    <img src="https://img.shields.io/badge/Vercel-배포-000000?logo=vercel&logoColor=white" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/1인_개발-solo-FF9500" />

  </p>
</div>

---

## 📖 프로젝트 소개

**카꾸미**는 카카오톡 iOS 테마(`.ktheme`)를 브라우저에서 직접 제작하고,  
창작자가 만든 테마를 판매·구매할 수 있는 **테마 마켓플레이스 웹 서비스**입니다.

- 🎨 별도 앱 설치 없이 **브라우저만으로** 테마 제작 가능
- 📱 편집 내용이 **실시간 폰 목업**에 바로 반영
- 💸 창작자는 만든 테마를 **스토어에 등록해 판매**
- 🔍 관리자 **검수 시스템**을 통한 콘텐츠 품질 관리

---

## ✨ 주요 기능

### 🎨 테마 에디터
- 탭바, 헤더, 말풍선(보내기/받기), 배경 등 각 UI 요소를 **컬러 피커**로 자유롭게 편집
- 다크모드 / 라이트모드 **별도 설정** 지원
- 배경 이미지 업로드 지원

### 📱 실시간 폰 목업 미리보기
- 편집 즉시 중앙 목업에 반영되는 **실시간 프리뷰**
- 친구목록, 채팅방, 더보기 등 **탭별 미리보기** 제공
- 실제 카카오톡 UI와 동일한 비율의 목업 컴포넌트

### 💾 테마 다운로드
- 에디터 설정값을 `.ktheme` 포맷 스펙에 맞는 구조로 **직접 변환**
- 테마 데이터는 `JSONB` 컬럼에 `base64`로 저장 → **별도 스토리지 없이** 다운로드 가능
- iOS 카카오톡 앱에서 바로 적용 가능한 파일로 내보내기

### 🛒 테마 마켓플레이스
- 창작자가 제작한 테마를 스토어에 등록·판매
- 관리자 **검수 시스템** (승인/반려, 반려 사유 이메일 자동 발송)
- 테마 상세 페이지, 검색, 카테고리 필터

### 💳 결제 및 정산 (Toss Payments)
- 정산 내역 마이페이지에서 조회
- 적립금 시스템 (구매 시 5% 적립, 유효기간 1년)

### 👤 회원 시스템
- **카카오 OAuth** 로그인
- 마이페이지: 구매 내역, 내 테마, 정산 현황, 은행계좌 등록, 크레딧/적립금 관리
- 창작자 프로필 페이지

### 📬 고객센터
- **FAQ** (카테고리 필터 + 키워드 검색)
- **1:1 문의** (스레드형 답변, 이미지 첨부, 상태 추적)
- **우체통** (건의·오류 신고, 비공개 제출)
- **알림 시스템** (구매, 판매, 검수 결과 등 실시간 알림)

### 🔐 관리자 페이지
- 테마 검수 승인/반려
- 회원 관리, 문의 답변
- 매출 및 정산 현황

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **프레임워크** | Next.js 15 (App Router) |
| **언어** | TypeScript |
| **스타일링** | Tailwind CSS |
| **ORM** | Prisma |
| **데이터베이스** | PostgreSQL (Supabase) |
| **인증** | 카카오 OAuth 2.0 |
| **결제** | Toss Payments |
| **배포** | Vercel |
| **스케줄러** | Vercel Cron Jobs |

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│              Vercel (배포)               │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │     Next.js App Router          │    │
│  │  ┌──────────┐  ┌─────────────┐  │    │
│  │  │  Pages   │  │  API Routes │  │    │
│  │  │ (RSC/CC) │  │  /api/**    │  │    │
│  │  └──────────┘  └──────┬──────┘  │    │
│  └──────────────────────┼──────────┘    │
│                          │               │
│  ┌───────────────────────▼────────────┐ │
│  │         Prisma ORM                 │ │
│  └───────────────────────┬────────────┘ │
└──────────────────────────┼──────────────┘
                           │
              ┌────────────▼────────────┐
              │  Supabase (PostgreSQL)   │
              │  - 유저/테마/구매 데이터   │
              │  - JSONB: 테마 데이터    │
              │    (base64 이미지 포함)  │
              └─────────────────────────┘

외부 연동:
  카카오 OAuth ──── 로그인
  Toss Payments ─── 결제/정산
  Vercel Cron ───── 월별 정산 스케줄러
```

---

## 💡 기술적 도전 & 해결

### 1. `.ktheme` 포맷 변환 로직 직접 설계
카카오톡 iOS 테마 파일 포맷(`.ktheme`)은 공식 문서가 없어 직접 리버스 엔지니어링으로 스펙을 분석했습니다.  
에디터에서 설정한 색상·이미지 값을 해당 스펙에 맞는 구조로 변환하는 로직을 `app/create/` 에 직접 구현했습니다.

### 2. JSONB + base64 — 별도 스토리지 없는 아키텍처
이미지 스토리지 비용과 복잡도를 줄이기 위해 테마 이미지를 base64로 인코딩한 뒤 PostgreSQL의 JSONB 컬럼에 함께 저장하는 방식을 선택했습니다.  
덕분에 별도 스토리지 없이 미리보기·다운로드가 가능한 구조를 완성했습니다.

### 3. 실시간 폰 목업 미리보기
에디터 상태 변경 시 목업 컴포넌트가 즉시 반응하도록 상태관리 구조를 설계했습니다.  
`stories/` 폴더에 목업 컴포넌트를 별도 모듈화하여 재사용성을 높였습니다.

### 4. Toss Payments 결제 + 창작자 정산 시스템
결제 승인 → 구매 내역 저장 → 정산 대상 집계 → Vercel Cron으로 월 1회 자동 정산 처리까지  
이어지는 전체 흐름을 직접 설계하고 구현했습니다.

---

## 📁 프로젝트 구조

```
kakkumi/
├── app/
│   ├── create/          # 테마 에디터 페이지
│   ├── gallery/         # 테마 스토어
│   ├── creator/[id]/    # 창작자 프로필
│   ├── my-themes/       # 내 테마 관리
│   ├── mypage/          # 마이페이지 (정산, 적립금 등)
│   ├── payment/         # 결제 플로우
│   ├── notifications/   # 알림
│   ├── support/         # 고객센터 (FAQ, 1:1 문의, 우체통)
│   ├── admin/           # 관리자 페이지
│   └── api/             # API Routes
│       ├── auth/        # 카카오 OAuth
│       ├── themes/      # 테마 CRUD
│       ├── payment/     # Toss Payments
│       ├── creator/     # 창작자 정산
│       ├── inquiry/     # 1:1 문의
│       ├── mailbox/     # 우체통
│       └── cron/        # 정산 스케줄러
├── stories/             # 폰 목업 컴포넌트
├── lib/                 # 유틸리티 (prisma, session, toss 등)
├── prisma/              # DB 스키마 & 마이그레이션
└── apk-builder/         # APK 빌드 도구
```



## 📄 라이선스

본 프로젝트는 포트폴리오 목적으로 공개된 소스코드입니다.  
무단 상업적 이용은 금지합니다.

---

<div align="center">
  <p>Made with ❤️ by <b>kakkumi</b></p>
  <p>
    <a href="mailto:kakkumi.official@gmail.com">kakkumi.official@gmail.com</a>
  </p>
</div>
