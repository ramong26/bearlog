# Bearlog

개인 목표와 할 일을 관리하는 웹 애플리케이션입니다. 일반 모드와 개발자 모드를 지원하며, 개발자 모드에서는 GitHub Issue/PR을 할 일로 연동할 수 있습니다.

## 웹사이트 주소
- **https://bearlog.vercel.app**

## 주요 기능

- **목표(Goal) 관리** — 목표를 생성하고 하위 할 일로 진행률을 추적
- **할 일(Todo) 관리** — 마감일, 태그, 즐겨찾기, 첨부파일 지원
- **노트(Note)** — Tiptap 기반 리치 텍스트 에디터로 할 일에 노트 연결
- **캘린더** — 날짜 기준 할 일 시각화
- **대시보드** — 최근 할 일, 진행률 요약, 즐겨찾기 한눈에 보기
- **GitHub 연동** — 저장소 연결 후 Issue/PR을 할 일로 동기화 (개발자 모드)
- **다국어 지원** — 한국어, 영어, 일본어, 중국어
- **다크/라이트 테마** — 전역 테마 전환

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript (strict) |
| UI | React 19, TailwindCSS, Radix UI / shadcn-ui |
| 서버 상태 | TanStack Query (React Query) |
| 클라이언트 상태 | Zustand |
| 인증 | httpOnly 쿠키 기반 JWT, GitHub OAuth, Google OAuth |
| 테스트 | Jest, Playwright |
| API Mocking | MSW (Mock Service Worker) |
| 패키지 매니저 | pnpm |

## 프로젝트 구조

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/            # 로그인, 회원가입, OAuth 콜백
│   ├── (main)/            # 인증 필요 페이지 (대시보드, 목표, 캘린더 등)
│   └── api/               # Next.js API Route (프록시, 인증 처리)
├── features/              # 기능별 컴포넌트 & 훅
│   ├── dashboard/
│   ├── goal/
│   ├── note/
│   ├── todo/
│   ├── calendar/
│   └── board/
├── shared/
│   ├── components/        # 공통 UI 컴포넌트
│   ├── hooks/             # 공통 커스텀 훅
│   ├── lib/               # API 클라이언트, 유틸리티
│   ├── stores/            # Zustand 전역 스토어
│   ├── locales/           # i18n 번역 파일
│   ├── mocks/             # MSW 핸들러
│   └── types/             # 공통 TypeScript 타입
└── styles/                # 전역 스타일, 디자인 시스템
```

## 시작하기

### 요구사항

- Node.js 20 이상
- pnpm 8.15.9 이상


### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 결과물 실행
pnpm start
```

## 개발 명령어

```bash
pnpm dev            # 개발 서버
pnpm build          # 프로덕션 빌드
pnpm lint           # ESLint + TypeScript 검사
pnpm test           # Jest 단위 테스트
pnpm test:e2e       # Playwright E2E 테스트 (headless)
pnpm test:e2e:ui    # Playwright E2E 테스트 (UI 모드)
pnpm api:gen        # OpenAPI 스펙으로 타입 자동 생성
```

## 아키텍처 특징

### API 프록시 패턴
클라이언트 요청은 `/api/proxy/v1/*`를 통해 백엔드로 전달됩니다. httpOnly 쿠키에 저장된 토큰이 직접 노출되지 않도록 서버 사이드에서 처리합니다.

### 서버 컴포넌트 + Hydration
초기 데이터는 서버에서 fetch 후 React Query 캐시로 dehydrate하여 클라이언트에 전달합니다.

### 낙관적 업데이트(Optimistic Update)
서버 응답 전 UI를 먼저 업데이트하여 빠른 UX를 제공합니다.

### 노멀 / 개발자 모드
`useTodoModeStore`로 전역 모드 상태를 관리합니다. 개발자 모드에서는 GitHub Issue/PR 연동 UI가 활성화됩니다.


