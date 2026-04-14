import { NextResponse } from 'next/server';

const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
const isDevApi = process.env.NEXT_PUBLIC_USE_DEV_API === 'true';
const loginEndpoint = isDevApi ? '/api/v1/dev/auth/login' : '/api/v1/auth/login';

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const response = await fetch(`${apiBaseUrl}${loginEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const nextResponse = NextResponse.json({ ok: true });

  if (data.accessToken) {
    nextResponse.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30,
    });
  }
  if (data.refreshToken) {
    nextResponse.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return nextResponse;
}
/**
 * 'use server'로
 * 해당 서버용 fetch로 함. 클라이언트 호출 x
 */
