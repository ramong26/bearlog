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

export const apiRequest = async <TResponse, TBody = unknown>(
  url: string,
  { method = 'GET', params, body, headers, signal, cache = 'no-store', next }: ApiRequestOptions<TBody> = {},
): Promise<TResponse> => {
  const cleanParams = params
    ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null))
    : undefined;
  const queryString = cleanParams ? `?${new URLSearchParams(cleanParams as Record<string, string>)}` : '';

  const cleanUrl = isClient ? url.replace(/^\/api\/v1\//, '/') : url;

  const fullUrl = isClient
    ? `/api/proxy${cleanUrl}${queryString}`
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}${queryString}`;

  return fetch(fullUrl, {
    ...(isClient ? { credentials: 'include' } : {}),
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache,
    next,
  }).then((response) => {
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    return response.json() as Promise<TResponse>;
  });
};
