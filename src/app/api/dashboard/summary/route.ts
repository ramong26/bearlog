import { NextResponse } from 'next/server';

<<<<<<< HEAD
import { fetchDashboard } from '@/shared/lib/api/fetchDashboard';

export async function GET() {
  try {
    const result = await fetchDashboard.getDashboardSummaryResult();
=======
import { getDashboardSummaryResult } from '@/shared/lib/customApi/getDashboardSummaryResult';

export async function GET() {
  try {
    const result = await getDashboardSummaryResult();
>>>>>>> 97ec23b9b02894d7b559c607539a8f29546a813a

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
