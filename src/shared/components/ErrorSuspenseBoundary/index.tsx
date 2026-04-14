'use client';

import { Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import Empty from '../Empty';

const IS_DEV = process.env.NODE_ENV === 'development';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Empty>
      <p className="mb-4 text-sm text-gray-600">
        {IS_DEV && error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="w-full rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
      >
        다시 시도
      </button>
    </Empty>
  );
}

function SuspenseFallback() {
  return <Empty>잠시만 기다려주세요...</Empty>;
}

interface ErrorSuspenseBoundaryProps {
  children: React.ReactNode;
  /**
   * @description
   * errorFallback: 오류가 발생했을 때 보여줄 컴포넌트 (기본값: ErrorFallback)
   */
  errorFallback?: React.ComponentType<FallbackProps>;
  /**
   * @description
   * suspenseFallback: Suspense가 로딩 중일 때 보여줄 컴포넌트 (기본값: SuspenseFallback)
   */
  suspenseFallback?: React.ReactNode;
  /**
   *  @description
   *  onReset: 오류가 발생한 후 "다시 시도" 버튼이 클릭되었을 때 호출되는 콜백 함수
   */
  onReset?: () => void;
  /**
   * @description
   * resetKeys: 오류 상태를 재설정할 때 사용하는 키 배열. 이 배열의 값이 변경되면 오류 상태가 초기화됩니다.
   */
  resetKeys?: unknown[];
}
export function ErrorSuspenseBoundary({
  children,
  errorFallback,
  suspenseFallback,
  onReset,
  resetKeys,
}: ErrorSuspenseBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={errorFallback ?? ErrorFallback} onReset={onReset} resetKeys={resetKeys}>
      <Suspense fallback={suspenseFallback ?? <SuspenseFallback />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

// 리액트 쿼리와 함께 사용할 수 있는 데이터 경계 컴포넌트
export function DataBoundary({
  children,
  errorFallback,
  suspenseFallback,
  onReset,
  resetKeys,
}: ErrorSuspenseBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          FallbackComponent={errorFallback ?? ErrorFallback}
          onReset={() => {
            reset();
            onReset?.();
          }}
          resetKeys={resetKeys}
        >
          <Suspense fallback={suspenseFallback ?? <SuspenseFallback />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
