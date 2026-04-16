'use client';

import ErrorFallbackUI from '@/shared/components/ErrorFallbackUI';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ErrorFallbackUI onRetry={reset} />
    </div>
  );
}
