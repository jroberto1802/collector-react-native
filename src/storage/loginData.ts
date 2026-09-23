import * as SecureStore from 'expo-secure-store';

import {
  parseLoginResponse,
  type LoginResponse,
} from '../models/auth/LoginResponse';

const LOGIN_DATA_KEY = 'collector.login-data';

export async function loadLoginData() {
  const savedValue = await SecureStore.getItemAsync(LOGIN_DATA_KEY);

  if (!savedValue) {
    return null;
  }

  try {
    return parseLoginResponse(JSON.parse(savedValue));
  } catch {
    await SecureStore.deleteItemAsync(LOGIN_DATA_KEY);
    return null;
  }
}

export async function saveLoginData(loginData: LoginResponse) {
  await SecureStore.setItemAsync(LOGIN_DATA_KEY, JSON.stringify(loginData));
}

export async function clearLoginData() {
  await SecureStore.deleteItemAsync(LOGIN_DATA_KEY);
}
