import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { tokenStorage } from '@/api/storage';

const API_PORT = 4000;
const REQUEST_TIMEOUT_MS = 20_000;
const CONFIGURED_URL = (process.env.EXPO_PUBLIC_API_URL || `http://localhost:${API_PORT}`).replace(/\/$/, '');

function devMachineHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];
  for (const value of candidates) {
    const match = String(value || '').match(/(\d{1,3}(?:\.\d{1,3}){3})/);
    if (match && match[1] !== '127.0.0.1') return match[1];
  }
  return null;
}

function configuredHostAndPort() {
  try {
    const url = new URL(CONFIGURED_URL);
    return {
      host: url.hostname,
      port: url.port || String(API_PORT),
    };
  } catch {
    return { host: 'localhost', port: String(API_PORT) };
  }
}

export function getApiBaseUrl() {
  const { host, port } = configuredHostAndPort();
  const expoHost = devMachineHost();

  if (host === 'localhost' || host === '127.0.0.1') {
    if (expoHost) return `http://${expoHost}:${port}`;
    if (Platform.OS === 'android') return `http://10.0.2.2:${port}`;
    return CONFIGURED_URL;
  }

  // En dev sur téléphone : l’IPv4 du PC change — aligner sur l’IP du serveur Expo (même machine).
  if (
    expoHost &&
    host !== expoHost &&
    (host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.'))
  ) {
    return `http://${expoHost}:${port}`;
  }

  return CONFIGURED_URL;
}

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

    const url = `${getApiBaseUrl()}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers, signal: controller.signal });
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      if (aborted) {
        throw new Error(
          `Le serveur ne répond pas (${getApiBaseUrl()}). Vérifiez que l’API tourne et que EXPO_PUBLIC_API_URL pointe vers la bonne IP (ipconfig).`
        );
      }
      throw new Error(
        `Impossible de joindre le serveur JCV Pay (${getApiBaseUrl()}). Même Wi‑Fi que le PC ? API démarrée ?`
      );
    } finally {
      clearTimeout(timeoutId);
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
