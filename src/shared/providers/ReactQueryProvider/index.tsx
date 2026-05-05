'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider, HydrationBoundary, DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * @see https://soobing.github.io/react/next-app-router-react-query/
 */
export function ReactQueryProvider({ children, state }: { children: React.ReactNode; state?: DehydratedState }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 3,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
