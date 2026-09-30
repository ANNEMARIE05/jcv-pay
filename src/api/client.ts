import { tokenStorage } from '@/api/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

let token: string | null = null;

export function getApiBaseUrl() {
  return BASE_URL;
}

export const api = {
  setToken(value: string | null) {
    token = value;
  },
  async restoreToken() {
    token = await tokenStorage.get('jcv_token');
    return token;
  },
  async persistToken(value: string | null) {
    token = value;
    if (value) await tokenStorage.set('jcv_token', value);
    else await tokenStorage.remove('jcv_token');
  },
  async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    } catch {
      throw new Error('Impossible de joindre le serveur JCV Pay.');
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.message || 'La requête a échoué.');
    }
    return body as T;
  },
  get<T = any>(path: string) {
    return this.request<T>(path);
  },
  post<T = any>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(data ?? {}) });
  },
  patch<T = any>(path: string, data?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body: JSON.stringify(data ?? {}) });
  },
};
