import { getAccessToken, supabase } from './auth';

const BASE_URL = process.env['EXPO_PUBLIC_API_URL'];
if (!BASE_URL) throw new Error('EXPO_PUBLIC_API_URL is not set');

export interface ApiError {
  error: string;
  code: string;
  [key: string]: unknown;
}

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let token = await getAccessToken();

  const doFetch = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    return fetch(`${BASE_URL}/v1${path}`, { ...options, headers });
  };

  let res = await doFetch(token);

  // Re-auth once on 401
  if (res.status === 401) {
    await supabase.auth.refreshSession();
    token = await getAccessToken();
    res = await doFetch(token);
  }

  if (!res.ok) {
    const body = (await res.json()) as ApiError;
    throw new ApiRequestError(body.code, body.error, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'GET', headers }),

  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
