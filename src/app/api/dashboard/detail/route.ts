import { NextResponse } from 'next/server';

import { getDashboardDetailTodos } from '@/shared/lib/customApi/getDashboardDetailTodos';

export async function GET() {
  try {
    const result = await getDashboardDetailTodos();

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
