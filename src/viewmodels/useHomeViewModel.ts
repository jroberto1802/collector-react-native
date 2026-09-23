import { useCallback, useState } from 'react';

import { AppConstants } from '../constants/AppConstants';
import { clearLoginData as clearStoredLoginData } from '../storage/loginData';

type UseHomeViewModelParams = {
  initialSyncRequired: boolean;
  onInitialSyncCompleted: () => void;
  onLogout: () => void;
  onOpenProducts: () => void;
};

export function useHomeViewModel({
  initialSyncRequired,
  onInitialSyncCompleted,
  onLogout,
  onOpenProducts,
}: UseHomeViewModelParams) {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isSyncConfirmationVisible, setSyncConfirmationVisible] =
    useState(false);
  const [isProductSyncVisible, setProductSyncVisible] =
    useState(initialSyncRequired);

  const closeMenu = useCallback(() => setMenuVisible(false), []);
  const finishProductSync = useCallback(() => {
    setProductSyncVisible(false);

    if (initialSyncRequired) {
      onInitialSyncCompleted();
    }
  }, [initialSyncRequired, onInitialSyncCompleted]);
  const cancelSync = useCallback(
    () => setSyncConfirmationVisible(false),
    [],
  );
  const confirmSync = useCallback(() => {
    setSyncConfirmationVisible(false);
    setProductSyncVisible(true);
  }, []);
  const requestSync = useCallback(() => {
    setMenuVisible(false);
    setSyncConfirmationVisible(true);
  }, []);
  const openProducts = useCallback(() => {
    setMenuVisible(false);
    onOpenProducts();
  }, [onOpenProducts]);
  const logout = useCallback(async () => {
    setMenuVisible(false);
    await clearStoredLoginData();
    AppConstants.clearLoginData();
    onLogout();
  }, [onLogout]);

  return {
    cancelSync,
    closeMenu,
    confirmSync,
    finishProductSync,
    isMenuVisible,
    isProductSyncVisible,
    isSyncConfirmationVisible,
    logout,
    openMenu: () => setMenuVisible(true),
    openProducts,
    requestSync,
  };
}
