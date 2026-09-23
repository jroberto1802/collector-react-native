import { AppConstants } from '../constants/AppConstants';
import type { LoginCredentials } from '../models/auth/LoginCredentials';
import {
  parseLoginResponse,
  type LoginResponse,
} from '../models/auth/LoginResponse';

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const response = payload as Record<string, unknown>;
  const message = response.message ?? response.error ?? response.detail;

  return typeof message === 'string' && message.trim() ? message : fallback;
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AppConstants.requestTimeoutMs,
  );

  try {
    const response = await fetch(AppConstants.authenticationUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: controller.signal,
    });

    const rawBody = await response.text();
    let payload: unknown = {};

    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = { message: rawBody };
      }
    }

    if (!response.ok) {
      throw new Error(
        getErrorMessage(payload, 'Não foi possível realizar o login.'),
      );
    }

    return parseLoginResponse(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('A conexão demorou demais. Tente novamente.');
    }

    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à internet.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
