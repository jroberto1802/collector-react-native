import { useCallback, useEffect, useState } from 'react';

import { AppConstants } from '../constants/AppConstants';
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type PriceType,
  type SearchType,
} from '../constants/SettingsConstants';
import { loadAppSettings, saveAppSettings } from '../storage/settings';

export function useSettingsViewModel() {
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_APP_SETTINGS,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSoftcomshop, setIsSoftcomshop] = useState(AppConstants.isSoftcomshop);

  useEffect(() => {
    let cancelled = false;

    void loadAppSettings().then(async (loaded) => {
      if (cancelled) {
        return;
      }

      const softcomshop = AppConstants.isSoftcomshop;
      setIsSoftcomshop(softcomshop);

      const next =
        !softcomshop && loaded.lotSerial
          ? { ...loaded, lotSerial: false }
          : loaded;

      if (next.lotSerial !== loaded.lotSerial) {
        await saveAppSettings(next);
      }

      setSettings(next);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await saveAppSettings(next);
  }, []);

  const setQuickCollection = useCallback(
    (value: boolean) => {
      if (value) {
        void persist({
          ...settings,
          quickCollection: true,
          lotSerial: false,
          grade: false,
        });
        return;
      }

      void persist({ ...settings, quickCollection: false });
    },
    [persist, settings],
  );

  const setLotSerial = useCallback(
    (value: boolean) => {
      if (!AppConstants.isSoftcomshop) {
        return;
      }

      if (value) {
        void persist({
          ...settings,
          lotSerial: true,
          quickCollection: false,
        });
        return;
      }

      void persist({ ...settings, lotSerial: false });
    },
    [persist, settings],
  );

  const setGrade = useCallback(
    (value: boolean) => {
      if (value) {
        void persist({
          ...settings,
          grade: true,
          quickCollection: false,
        });
        return;
      }

      void persist({ ...settings, grade: false });
    },
    [persist, settings],
  );

  const setSearchType = useCallback(
    (value: SearchType) => {
      void persist({ ...settings, searchType: value });
    },
    [persist, settings],
  );

  const setPriceType = useCallback(
    (value: PriceType) => {
      void persist({ ...settings, priceType: value });
    },
    [persist, settings],
  );

  const isQuickCollectionExclusive = settings.quickCollection;
  const isDetailedModeExclusive = settings.lotSerial || settings.grade;
  const isLotSerialAvailable = isSoftcomshop;
  const isLotSerialDisabled =
    !isLotSerialAvailable || isQuickCollectionExclusive;

  return {
    isDetailedModeExclusive,
    isLoading,
    isLotSerialAvailable,
    isLotSerialDisabled,
    isQuickCollectionExclusive,
    setGrade,
    setLotSerial,
    setPriceType,
    setQuickCollection,
    setSearchType,
    settings,
  };
}
