'use client';

import { API_URL } from './config';
import { useAuthStore } from '@/stores/auth-store';
import { SessionPayload } from '@/types/api';

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      useAuthStore.getState().clearSession();
      return false;
    }

    const session = (await response.json()) as SessionPayload;
    useAuthStore.getState().setSession(session);
    return true;
  } catch {
    useAuthStore.getState().clearSession();
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, retry = true) {
  const accessToken = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);

  if (!options.skipAuth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 401 && !options.skipAuth && retry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (response.status === 204) {
    return null as T;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || 'Request failed.');
  }

  return (await response.json()) as T;
}

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const session = await apiRequest<SessionPayload>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    });
    useAuthStore.getState().setSession(session);
    return session;
  },
  async register(payload: Record<string, unknown>) {
    const session = await apiRequest<SessionPayload>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    });
    useAuthStore.getState().setSession(session);
    return session;
  },
  async logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
      skipAuth: true
    });
    useAuthStore.getState().clearSession();
  }
};
