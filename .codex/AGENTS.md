# Frontend Codex Rules

## 컨텍스트

이 프로젝트는 Next.js(App Router) + React + TypeScript 기반이다.

항상 기존 코드 스타일과 구조를 따른다.
새로운 패턴 도입 금지.

---

## 필수 규칙

- package.json을 확인하고 라이브러리 버전에 맞게 작성
- TypeScript strict 준수
- any 사용 금지 (불가피하면 이유 주석)
- default export 금지 → named export 사용

---

## 컴포넌트 규칙

- 컴포넌트는 단일 책임만 가진다

- props가 5개 이상이면:
  // TODO: props 분리 필요

- 공통 UI → shared/components
- 도메인 로직 → features/\*

---

## 상태 관리

- 서버 상태 → TanStack Query
- 전역 상태 → Zustand

전역 상태 구조 수정 금지

필요 시:
// TODO: 전역 상태 구조 개선 필요

---

## 폼 / 스타일

- 폼 → React Hook Form
- 스타일 → Tailwind CSS

---

## 접근성

항상 확인:

- button type 지정
- label 연결
- aria-\* 속성

---

## 코드 작성 전 (필수)

반드시 확인:

1. 기존에 동일한 컴포넌트가 있는지
2. 기존 API 호출 패턴이 있는지 + api 호출 할 때 타입이 바뀌었거나 해당 바디 등 전체적인 api 호출이 바뀌었으면 해당 api fetch 관련 함수를 수정
3. 기존 에러 처리 방식이 있는지
4. 네이밍 규칙

있으면 반드시 재사용

---

## 수정 규칙

- 필요한 파일만 최소 수정
- 관련 없는 리팩토링 금지
- 구조 변경 금지

구조 변경 필요 시:

// TODO: 구조 개선 필요 (이유 작성)

---

## 금지 사항

- 새로운 라이브러리 추가 금지
- 폴더 구조 변경 금지
- 새로운 아키텍처 도입 금지
- 상태 관리 방식 변경 금지

---

## 출력 형식 (반드시 지킬 것)

1. 변경 요약
2. 수정 파일 목록
3. 코드
4. 이유
5. 주의할 점

---

## 네이밍 규칙

- boolean → is / has
- 함수 → handle prefix
- query key → 배열 형태 유지

---

## 행동 규칙

- 항상 기존 코드 우선
- 변경은 최소화
- 확신 없으면 기존 패턴 유지
