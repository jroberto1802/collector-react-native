import * as SecureStore from 'expo-secure-store';

import type { LoginCredentials } from '../models/auth/LoginCredentials';

const CREDENTIALS_KEY = 'collector.saved-credentials';

export async function loadSavedCredentials() {
  const savedValue = await SecureStore.getItemAsync(CREDENTIALS_KEY);

  if (!savedValue) {
    return null;
  }

  try {
    const credentials = JSON.parse(savedValue) as Partial<LoginCredentials>;

    if (
      typeof credentials.email === 'string' &&
      typeof credentials.password === 'string'
    ) {
      return credentials as LoginCredentials;
    }
  } catch {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
  }

  return null;
}

export async function saveCredentials(credentials: LoginCredentials) {
  await SecureStore.setItemAsync(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export async function clearSavedCredentials() {
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
}
