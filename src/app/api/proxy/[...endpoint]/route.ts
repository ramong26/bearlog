import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const apiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type'] as const;
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'location'] as const;

const ALLOWED_PATH_PREFIXES = [
  'auth/',
  'dev/auth/',
  'todos',
  'goals',
  'notes',
  'notifications',
  'tags',
  'users/me',
  'integrations/github',
  'images',
] as const;

type ProxyRouteContext = {
  params: Promise<{ endpoint: string[] }>;
};

const isAllowedPath = (pathname: string) => {
  return ALLOWED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}`));
};

const shouldSyncAuthCookies = (pathname: string) => {
  return pathname.startsWith('auth/') || pathname.startsWith('dev/auth/');
};

const getRefreshEndpoint = (pathname: string) => {
  return pathname.startsWith('dev/auth/') ? 'dev/auth/refresh' : 'auth/refresh';
};

const buildUpstreamHeaders = (request: NextRequest, accessToken?: string) => {
  const headers = new Headers();

  for (const headerName of FORWARDED_REQUEST_HEADERS) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
};

const buildResponseHeaders = (response: Response) => {
  const headers = new Headers();

  for (const headerName of FORWARDED_RESPONSE_HEADERS) {
    const headerValue = response.headers.get(headerName);
    if (headerValue) {
      headers.set(headerName, headerValue);
    }
  }

  return headers;
};

const copyResponse = async (response: Response) => {
  const headers = buildResponseHeaders(response);
  const body = response.status === 204 ? null : await response.arrayBuffer();

  return new NextResponse(body, {
    status: response.status,
    headers,
  });
};

const syncAuthCookies = async (pathname: string, response: Response, nextResponse: NextResponse) => {
  if (!shouldSyncAuthCookies(pathname) || !response.ok) {
    return;
  }

  if (pathname === 'auth/logout' || pathname === 'dev/auth/logout') {
    nextResponse.cookies.delete(ACCESS_TOKEN_COOKIE);
    nextResponse.cookies.delete(REFRESH_TOKEN_COOKIE);
    return;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return;
  }

  try {
    const data = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (data.accessToken) {
      nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 30,
      });
    }

    if (data.refreshToken) {
      nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
        ...AUTH_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  } catch {
    // auth 응답이 예상한 JSON 형식이 아니면 무시
  }
};

const requestUpstream = async ({
  request,
  pathname,
  search,
  accessToken,
  body,
}: {
  request: NextRequest;
  pathname: string;
  search: string;
  accessToken?: string;
  body?: string;
}) => {
  const targetUrl = `${apiBaseUrl}/api/v1/${pathname}${search}`;
  const headers = buildUpstreamHeaders(request, accessToken);

  return fetch(targetUrl, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : body,
    cache: 'no-store',
  });
};

const refreshAccessToken = async (pathname: string, refreshToken?: string) => {
  if (!refreshToken) return null;

  const refreshUrl = `${apiBaseUrl}/api/v1/${getRefreshEndpoint(pathname)}`;

  const response = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const cloned = response.clone();

  try {
    const data = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (!data.accessToken) {
      return null;
    }

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      response: cloned,
    };
  } catch {
    return null;
  }
};

const handler = async (request: NextRequest, context: ProxyRouteContext) => {
  if (!apiBaseUrl) {
    return NextResponse.json({ message: 'API_BASE_URL is not defined in environment variables' }, { status: 500 });
  }

  const { endpoint } = await context.params;
  const pathname = endpoint.join('/');

  if (!pathname || !isAllowedPath(pathname)) {
    return NextResponse.json({ message: 'Not allowed path' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  const requestBody = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();

  try {
    let upstreamResponse = await requestUpstream({
      request,
      pathname,
      search: request.nextUrl.search,
      accessToken,
      body: requestBody,
    });

    // auth 관련 요청은 그대로 응답 + 쿠키 동기화
    if (shouldSyncAuthCookies(pathname)) {
      const authResponse = upstreamResponse.clone();
      const nextResponse = await copyResponse(upstreamResponse);
      await syncAuthCookies(pathname, authResponse, nextResponse);
      return nextResponse;
    }

    // 일반 API 요청에서 accessToken 만료 시 refresh 후 1회 재시도
    if (upstreamResponse.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken(pathname, refreshToken);

      if (refreshed?.accessToken) {
        upstreamResponse = await requestUpstream({
          request,
          pathname,
          search: request.nextUrl.search,
          accessToken: refreshed.accessToken,
          body: requestBody,
        });

        const nextResponse = await copyResponse(upstreamResponse);

        nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
          ...AUTH_COOKIE_OPTIONS,
          maxAge: 60 * 30,
        });

        if (refreshed.refreshToken) {
          nextResponse.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, {
            ...AUTH_COOKIE_OPTIONS,
            maxAge: 60 * 60 * 24 * 7,
          });
        }

        return nextResponse;
      }

      const unauthorizedResponse = await copyResponse(upstreamResponse);
      unauthorizedResponse.cookies.delete(ACCESS_TOKEN_COOKIE);
      unauthorizedResponse.cookies.delete(REFRESH_TOKEN_COOKIE);
      return unauthorizedResponse;
    }

    return copyResponse(upstreamResponse);
  } catch {
    return NextResponse.json({ message: 'Upstream request failed' }, { status: 502 });
  }
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
