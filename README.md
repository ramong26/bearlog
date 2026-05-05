# Bearlog

개인 목표와 할 일을 관리하는 풀스택 웹 애플리케이션입니다.
일반 모드와 개발자 모드를 지원하며, 개발자 모드에서는 GitHub Issue/PR을 할 일로 연동할 수 있습니다.

**배포 주소** → https://bearlog.vercel.app
<img width="1422" height="952" alt="image" src="https://github.com/user-attachments/assets/f97532e2-15a2-4911-a3ef-25d0872460d1" />

---

## 목차

1. [주요 기능](#주요-기능)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [시작하기](#시작하기)
5. [아키텍처](#아키텍처)
6. [성능 최적화](#성능-최적화--대시보드-k6-스트레스-테스트)

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 대시보드 | 진행률 요약, 최근 할 일, 즐겨찾기 한눈에 보기 |
| 목표(Goal) 관리 | 목표 생성 및 하위 할 일로 진행률 추적 |
| 할 일(Todo) 관리 | 마감일, 태그, 즐겨찾기, 첨부파일 지원 |
| 노트(Note) | Tiptap 기반 리치 텍스트 에디터로 할 일에 노트 연결 |
| 캘린더 | 날짜 기준 할 일 시각화 |
| GitHub 연동 | 저장소 연결 후 Issue/PR을 할 일로 동기화 (개발자 모드) |
| 다국어 지원 | 한국어, 영어, 일본어, 중국어 |
| 다크/라이트 테마 | 전역 테마 전환 |

---

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

---

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

---

## 시작하기

### 요구사항

- Node.js 20 이상
- pnpm 8.15.9 이상


### 설치 및 실행

```bash
pnpm install       # 의존성 설치
pnpm dev           # 개발 서버 (http://localhost:3000)
pnpm build         # 프로덕션 빌드
pnpm start         # 빌드 결과물 실행
```

---

## 아키텍처

### API 프록시 패턴

클라이언트 요청은 `/api/proxy/v1/*`를 통해 백엔드로 전달됩니다.
httpOnly 쿠키에 저장된 JWT가 직접 노출되지 않도록 서버 사이드에서 처리합니다.

```
클라이언트 → /api/proxy/v1/* (Next.js Route) → 백엔드 API
서버 컴포넌트 → 백엔드 API (직접 호출, 쿠키 포함)
```

### 서버 컴포넌트 + Hydration

초기 데이터는 서버에서 fetch 후 React Query 캐시로 dehydrate하여 클라이언트에 전달합니다.
클라이언트는 추가 요청 없이 즉시 데이터를 사용합니다.

### 낙관적 업데이트(Optimistic Update)

서버 응답 전 UI를 먼저 업데이트하여 빠른 UX를 제공합니다.
실패 시 이전 상태로 자동 롤백됩니다.

### 노멀 / 개발자 모드

`useTodoModeStore`로 전역 모드 상태를 관리합니다.
개발자 모드에서는 GitHub Issue/PR 연동 UI가 활성화됩니다.

---

## 성능 최적화 — 대시보드 k6 스트레스 테스트

### 문제 파악

대시보드 페이지 1회 진입 시 서버 컴포넌트가 내부적으로 다음 API들을 연쇄 호출하고 있었습니다.

- 유저 정보, 진행률, 최근 Todo, 목표 목록
- **목표 개수만큼** 각 목표 상세 + 미완료/완료 Todo 목록

브라우저는 `/dashboard` 한 번만 요청하지만, 서버는 렌더링을 위해 수십 개의 HTTP 요청을 발생시키는 구조였습니다.

### 개선 방향

1. **DashboardSummary만 먼저 prefetch** — 첫 화면에 반드시 필요한 상단 요약 영역만 서버에서 미리 불러오고, Detail은 클라이언트에서 지연 렌더링
2. **Summary 전용 API로 통합** — 유저 정보 / 진행률 / 최근 Todo를 하나의 `getDashboardSummary()` 요청으로 묶어 오버페칭 감소

```ts
export const dashboardQueries = {
  summary: () =>
    queryOptions({
      queryKey: dashboardKeys.summary(),
      queryFn: () => fetchDashboard.getDashboardSummary(),
      staleTime: DASHBOARD_STALE_TIME,
    }),
};
```

### k6 테스트 결과

| 지표 | 개선 전 | 개선 후 | 개선율 |
|------|---------|---------|--------|
| p95 응답시간 (SSR) | 15.44s | 5.46s | **약 65% 감소** |
| 평균 응답시간 | 9.8s | 3.49s | **약 64% 감소** |
| iteration_duration | 10.22s | 6.85s | 개선 |





