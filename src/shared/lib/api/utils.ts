type ApiRequestOptions<TBody> = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  params?: Record<string, unknown>;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const isClient = typeof window !== 'undefined';
const ACCESS_TOKEN_COOKIE = 'accessToken';
const serverApiBaseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');

// 서버에서 쿠키를 읽어오는 함수
const getServerAccessToken = async () => {
  if (isClient) return undefined;

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  } catch {
    return undefined;
  }
};

export const apiRequest = async <TResponse, TBody = unknown>(
  url: string,
  { method = 'GET', params, body, headers, signal, cache = 'no-store', next }: ApiRequestOptions<TBody> = {},
): Promise<TResponse> => {
  const searchParams = new URLSearchParams();
  // tags=a&tags=b 형식을 지원하기 위해 배열 처리 로직 추가
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString() ? '?' + searchParams.toString() : '';

  const cleanUrl = isClient ? url.replace(/^\/api\/v1\/?/, '/') : url;

  // 클라이언트 요청이면 프록시 경로를 사용하고, 서버 요청이면 API_BASE_URL을 사용
  if (!isClient && !serverApiBaseUrl) {
    throw new ApiError(500, 'API_BASE_URL is not defined in environment variables');
  }

  const fullUrl = isClient ? `/api/proxy${cleanUrl}${queryString}` : `${serverApiBaseUrl}${url}${queryString}`;

  // 서버 요청이면 쿠키에서 액세스 토큰을 가져와서 Authorization 헤더에 추가
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  if (!isClient && !requestHeaders.has('Authorization')) {
    const accessToken = await getServerAccessToken();
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  // 최종 fetch 요청
  return fetch(fullUrl, {
    ...(isClient ? { credentials: 'include' } : {}),
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache,
    next,
  }).then(async (response) => {
    if (!response.ok) {
      let errorMessage = response.statusText || 'HTTP ' + response.status;
      let errorCode: string | undefined;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        // 에러 본문 파싱 실패 시 무시
      }
      throw new ApiError(response.status, errorMessage, errorCode);
    }

    if (response.status === 204) return undefined as TResponse;

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<TResponse>;
    }
    return response.text() as unknown as TResponse;
  });
};
