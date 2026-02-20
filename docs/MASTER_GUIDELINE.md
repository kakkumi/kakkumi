카카오톡 테마 제작 & 마켓플레이스 플랫폼 - 마스터 개발 가이드라인

(Single Source of Truth for AI & Developers)

1. 프로젝트 개요 (Overview)

목표: 웹 브라우저에서 실시간으로 카카오톡 테마(이미지, 색상)를 미리보기로 편집하고, 이를 iOS용(.ktheme) 및 Android용(.apk) 파일로 빌드하여 마켓에서 판매 및 다운로드할 수 있는 상용 서비스.

주요 타겟: 카카오톡 테마 창작자(Creator) 및 일반 구매자(User).

2. 시스템 아키텍처 및 역할 분리 (System Architecture)

본 프로젝트는 실시간 렌더링(프론트엔드)과 무거운 파일 컴파일(백엔드 워커)의 충돌을 막기 위해 철저히 역할을 분리합니다.

Frontend (Web Client): * 에디터 엔진: Zustand를 통한 상태 관리로 DOM/CSS Variables를 제어하여 실시간 미리보기 제공.

마켓플레이스: SSR/SSG를 활용한 SEO 최적화 테마 스토어.

Main Backend (API Server): * 테마 메타데이터 읽기/쓰기, 유저 인증, PG사 결제 Webhook 처리 및 트랜잭션 검증.

무거운 작업은 큐(Queue)로 넘기고 즉각 클라이언트에 응답(Non-blocking).

Build Worker (독립 서버): * 큐(SQS)에서 메시지를 받아 iOS .ktheme 압축 및 Android .apk 컴파일/서명 전담.

Storage & Database:

DB: PostgreSQL (Prisma ORM) - 무결성 보장.

Storage: AWS S3 + CloudFront - 원본 에셋 및 빌드 결과물 저장.

3. 기술 스택 (Tech Stack)

Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Lucide React

Backend: Next.js API Routes (Serverless), Prisma ORM

Build Worker: Node.js (또는 Python), Docker (Android SDK, Apktool 포함)

Infra: Vercel(또는 AWS EC2), AWS S3, AWS SQS, PostgreSQL (Supabase/RDS)

4. 데이터베이스 스키마 (Prisma ERD)

데이터 무결성(특히 테마 상태와 결제)을 보장하기 위한 핵심 구조입니다.

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  role      Role       @default(USER) // USER, CREATOR, ADMIN
  themes    Theme[]
  purchases Purchase[]
}

model Theme {
  id           String        @id @default(uuid())
  creatorId    String
  title        String
  price        Int           @default(0)
  status       ThemeStatus   @default(DRAFT) // DRAFT, PUBLISHED
  thumbnailUrl String?
  versions     ThemeVersion[]
  purchases    Purchase[]
}

// 잦은 수정 및 롤백을 위한 버전 관리 테이블
model ThemeVersion {
  id             String      @id @default(uuid())
  themeId        String
  version        String      
  configJson     Json        // 에디터 상태값 (OS 중립적 JSON 포맷)
  kthemeFileUrl  String?     // S3 URL
  apkFileUrl     String?     // S3 URL
  buildStatus    BuildStatus @default(PENDING) // PENDING, PROCESSING, SUCCESS, FAILED
}

// 결제 금액 위변조 검증 및 다운로드 권한 SSOT
model Purchase {
  id              String         @id @default(uuid())
  buyerId         String
  themeId         String
  amount          Int            
  pgTransactionId String?        @unique
  status          PurchaseStatus @default(PENDING) // PENDING, COMPLETED, REFUNDED
}


5. 핵심 데이터 흐름 (Data Flow)

A. 테마 제작 및 빌드 흐름

[Front] 에디터에서 이미지/색상 변경 -> Zustand 전역 상태(configJson) 업데이트 -> 실시간 미리보기 렌더링.

[Front] '빌드 요청' -> POST /api/themes/:id/build 호출.

[API] ThemeVersion을 PENDING으로 DB 저장 -> AWS SQS에 빌드 작업 전송 -> 202 Accepted 응답.

[Worker] SQS 메시지 수신 -> iOS용 CSS 생성 및 ZIP 압축(.ktheme) & Android용 XML 교체 및 Apktool 컴파일(.apk).

[Worker] 결과물을 S3에 업로드 -> DB 상태 SUCCESS 업데이트.

[Front] 상태 폴링(Polling) 후 다운로드/판매 버튼 활성화.

B. 마켓플레이스 결제 및 다운로드 흐름

[Front] 구매 버튼 클릭 -> PG사 결제 모듈 실행.

[API Webhook] PG사 승인 데이터 수신 -> DB 원본 price와 결제 amount 비교 검증.

[API Webhook] (트랜잭션) 일치 시 Purchase 생성. 불일치 시 PG사 승인 취소 및 롤백.

[API Download] 클라이언트 다운로드 요청 -> DB Purchase 권한 검증.

[API Download] 권한 확인 시 AWS S3 Pre-signed URL (5분 만료) 생성 후 반환 (직접 스트리밍 금지).

6. UI/UX 구조 (UI/UX Layout)

테마 스튜디오 (Editor): Split View

좌측 (컨트롤 패널): 아코디언 메뉴 기반의 색상 피커, 이미지 업로더. OS 공통 에셋 설정 후 세부 설정.

우측 (미리보기 패널): 디바이스 프레임 내부에 카카오톡 UI(친구목록, 채팅방, 암호창 등) 렌더링.

마켓플레이스 (Store):

홈: 배너, 카테고리, 무한 스크롤 테마 리스트.

상세: 테마 썸네일 스와이퍼, 호환 OS 뱃지, 제작자 정보, 동적 버튼(구매하기 vs 다운로드).

7. 개발 로드맵 (Milestones)

Phase 1: 코어 에디터 MVP - Next.js + Zustand 기반 실시간 렌더링 엔진 UI 구축.

Phase 2: 빌드 워커 파이프라인 - iOS .ktheme / Android .apk 컴파일 로직 및 SQS 연동.

Phase 3: DB 및 유저 시스템 - Prisma 세팅, 테마 저장/불러오기 API 구축.

Phase 4: 결제 및 마켓 연동 - PG사 Webhook 트랜잭션 처리, S3 Pre-signed URL 보안 처리.

Phase 5: 최적화 및 상용화 - SEO, 성능 최적화, 예외 처리 강화.

8. AI 코딩 가이드라인 (CRITICAL RULES) 🚨

이 문서를 바탕으로 코드를 생성하는 모든 AI 어시스턴트는 아래 규칙을 절대 위반해서는 안 됩니다.

렌더링 최적화: 에디터 상태 변경 시 Next.js 페이지 전체가 리렌더링되지 않도록 Zustand와 CSS Variables(var(--color)) 또는 Inline Styles를 활용하세요.

블로킹 방지 (Worker 분리): 메인 API 라우트(app/api/...) 내부에 파일 시스템 접근(fs), 압축, 컴파일 로직을 작성하지 마세요. 비동기 큐 전송 로직만 작성해야 합니다.

트랜잭션 강제 (DB): 결제(Webhook), 테마 생성 등 여러 테이블을 건드리는 로직은 반드시 prisma.$transaction으로 묶어야 합니다.

다운로드 보안: S3 파일 URL을 클라이언트에 하드코딩하거나 직접 스트리밍 방식으로 전달하지 마세요. 반드시 권한 검증 후 Pre-signed URL을 발급하는 코드를 작성하세요.

명확한 파일 경로: 코드 제안 시 상단에 해당 코드가 위치해야 할 정확한 디렉토리와 파일명(예: // app/api/payment/webhook/route.ts)을 주석으로 명시하세요.