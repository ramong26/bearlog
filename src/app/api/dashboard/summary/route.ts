import { NextResponse } from 'next/server';

import { fetchDashboard } from '@/shared/lib/api/fetchDashboard';

export async function GET() {
  try {
    const result = await fetchDashboard.getDashboardSummaryResult();

    return NextResponse.json(result, {
      status: result.hasAnySuccess ? 200 : 502,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch dashboard summary' }, { status: 502 });
  }
}
