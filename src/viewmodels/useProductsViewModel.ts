import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ProductListItem } from '../models/products/Product';
import { ProductRepository } from '../repositories/ProductRepository';

const PAGE_SIZE = 10;
const productRepository = new ProductRepository();

export function useProductsViewModel() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isSyncConfirmationVisible, setSyncConfirmationVisible] =
    useState(false);
  const [isProductSyncVisible, setProductSyncVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);

      void productRepository
        .getLocalPage(page, PAGE_SIZE, search)
        .then((result) => {
          if (!active) {
            return;
          }

          setProducts(result.items);
          setTotal(result.total);
          setTotalPages(result.totalPages);

          if (result.page !== page) {
            setPage(result.page);
          }
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, refreshVersion, search]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);
  const cancelSync = useCallback(
    () => setSyncConfirmationVisible(false),
    [],
  );
  const confirmSync = useCallback(() => {
    setSyncConfirmationVisible(false);
    setProductSyncVisible(true);
  }, []);
  const finishProductSync = useCallback(() => {
    setProductSyncVisible(false);
    setPage(1);
    setRefreshVersion((version) => version + 1);
  }, []);
  const range = useMemo(() => {
    if (!total) {
      return { from: 0, to: 0 };
    }

    const from = (page - 1) * PAGE_SIZE + 1;
    return {
      from,
      to: Math.min(from + products.length - 1, total),
    };
  }, [page, products.length, total]);

  return {
    cancelSync,
    confirmSync,
    finishProductSync,
    goToNextPage: () => setPage((value) => Math.min(totalPages, value + 1)),
    goToPreviousPage: () => setPage((value) => Math.max(1, value - 1)),
    isLoading,
    isProductSyncVisible,
    isSyncConfirmationVisible,
    page,
    pageSize: PAGE_SIZE,
    products,
    range,
    requestSync: () => setSyncConfirmationVisible(true),
    search,
    setSearch,
    total,
    totalPages,
  };
}
