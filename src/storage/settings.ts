import * as SecureStore from 'expo-secure-store';

import {
  DEFAULT_APP_SETTINGS,
  PRICE_TYPE,
  SEARCH_TYPE,
  type AppSettings,
  type PriceType,
  type SearchType,
} from '../constants/SettingsConstants';

const SETTINGS_KEY = 'collector.app-settings';

function isSearchType(value: unknown): value is SearchType {
  return value === SEARCH_TYPE.REFERENCE || value === SEARCH_TYPE.BARCODE;
}

function isPriceType(value: unknown): value is PriceType {
  return value === PRICE_TYPE.PURCHASE || value === PRICE_TYPE.SALE;
}

function normalizeSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_APP_SETTINGS };
  }

  const data = raw as Partial<AppSettings>;

  return {
    quickCollection:
      typeof data.quickCollection === 'boolean'
        ? data.quickCollection
        : DEFAULT_APP_SETTINGS.quickCollection,
    lotSerial:
      typeof data.lotSerial === 'boolean'
        ? data.lotSerial
        : DEFAULT_APP_SETTINGS.lotSerial,
    grade:
      typeof data.grade === 'boolean' ? data.grade : DEFAULT_APP_SETTINGS.grade,
    searchType: isSearchType(data.searchType)
      ? data.searchType
      : DEFAULT_APP_SETTINGS.searchType,
    priceType: isPriceType(data.priceType)
      ? data.priceType
      : DEFAULT_APP_SETTINGS.priceType,
  };
}

export async function loadAppSettings(): Promise<AppSettings> {
  const savedValue = await SecureStore.getItemAsync(SETTINGS_KEY);

  if (!savedValue) {
    return { ...DEFAULT_APP_SETTINGS };
  }

  try {
    return normalizeSettings(JSON.parse(savedValue));
  } catch {
    await SecureStore.deleteItemAsync(SETTINGS_KEY);
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
}
