import { tokenStorage } from '@/api/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const PUBLIC_AUTH = [
  '/api/auth/connexion',
  '/api/auth/inscription',
  '/api/auth/mot-de-passe/demande',
  '/api/auth/mot-de-passe/reinitialiser',
];

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function readMessage(body: { message?: unknown }) {
  if (typeof body.message === 'string' && body.message.trim()) return body.message;
  if (Array.isArray(body.message)) {
    const text = body.message.filter((item) => typeof item === 'string').join('\n');
    if (text) return text;
  }
  return 'La requête a échoué.';
}

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
      if (response.status === 401 && !PUBLIC_AUTH.some((item) => path.startsWith(item))) {
        await this.persistToken(null);
        onUnauthorized?.();
      }
      throw new Error(readMessage(body));
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
