import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { todoQueries, goalQueries, userQueries } from '@/shared/lib/query/queryKeys';
import CalendarClient from '@/features/calendar/components/CalendarClient';
import { DataBoundary } from '@/shared/components/ErrorSuspenseBoundary';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const queryClient = new QueryClient();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  await Promise.all([
    queryClient.prefetchQuery(todoQueries.calendar({ year, month })),
    queryClient.prefetchQuery(goalQueries.list()),
    queryClient.prefetchQuery(userQueries.current()),
  ]);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="mx-auto flex h-full w-full max-w-[1312px] flex-col">
        <DataBoundary>
          <CalendarClient />
        </DataBoundary>
      </div>
    </HydrationBoundary>
  );
}
