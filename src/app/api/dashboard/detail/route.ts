import { NextResponse } from 'next/server';

import { getDashboardDetailTodos } from '@/shared/lib/customApi/getDashboardDetailTodos';

const parseGoalIds = (rawGoalIds: string | null): number[] => {
  if (!rawGoalIds) return [];
  return rawGoalIds
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goalIds = parseGoalIds(searchParams.get('goalIds'));
    const result = await getDashboardDetailTodos(goalIds);

    return NextResponse.json(result, {
      status: result.hasAnySuccess ? 200 : 502,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch dashboard detail todos' }, { status: 502 });
  }
}
