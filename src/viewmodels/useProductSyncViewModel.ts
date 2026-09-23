import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ProductRepository,
  type ProductSyncProgress,
} from '../repositories/ProductRepository';

export type ProductSyncStatus = 'idle' | 'syncing' | 'success' | 'error';

const productRepository = new ProductRepository();

function normalizeErrorMessage(error: unknown) {
  const fallback = 'Não foi possível sincronizar os produtos.';

  if (!(error instanceof Error) || !error.message.trim()) {
    return fallback;
  }

  if (/<(!doctype|html|head|body|style|script)\b/i.test(error.message)) {
    return 'A retaguarda retornou uma resposta inválida. Verifique a BaseURL configurada e tente novamente.';
  }

  const message = error.message
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return message.length > 280 ? `${message.slice(0, 277)}...` : message;
}

export function useProductSyncViewModel(
  visible: boolean,
  onCompleted: () => void,
) {
  const [status, setStatus] = useState<ProductSyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState<ProductSyncProgress | null>(null);
  const [productCount, setProductCount] = useState(0);
  const runningRef = useRef(false);
  const wasVisibleRef = useRef(false);

  const synchronize = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    setStatus('syncing');
    setErrorMessage('');
    setProgress(null);

    try {
      const synchronizedProducts = await productRepository.synchronize(setProgress);
      setProductCount(synchronizedProducts);
      setStatus('success');
      setTimeout(onCompleted, 850);
    } catch (error) {
      setErrorMessage(normalizeErrorMessage(error));
      setStatus('error');
    } finally {
      runningRef.current = false;
    }
  }, [onCompleted]);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      wasVisibleRef.current = true;
      void synchronize();
      return;
    }

    if (!visible && wasVisibleRef.current) {
      wasVisibleRef.current = false;
      setStatus('idle');
      setErrorMessage('');
      setProgress(null);
      setProductCount(0);
    }
  }, [synchronize, visible]);

  return {
    errorMessage,
    productCount,
    progress,
    retry: synchronize,
    status,
  };
}
