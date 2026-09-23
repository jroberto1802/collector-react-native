import { useCallback, useEffect, useState } from 'react';

import type { Collection } from '../models/collections/Collection';
import type { CollectionItem } from '../models/collections/CollectionItem';
import {
  formatCollectionItemQuantity,
  formatCollectionQuantity,
  parseCollectionQuantity,
} from '../models/collections/CollectionItem';
import type { Product } from '../models/products/Product';
import { CollectionDetailRepository } from '../repositories/CollectionDetailRepository';

const repository = new CollectionDetailRepository();
const DEFAULT_QUANTITY = '1,000';

type UseCollectionDetailViewModelParams = {
  collectionId: number;
};

export function useCollectionDetailViewModel({
  collectionId,
}: UseCollectionDetailViewModelParams) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productQuery, setProductQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityText, setQuantityText] = useState(DEFAULT_QUANTITY);
  const [feedback, setFeedback] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isProductSearchVisible, setProductSearchVisible] = useState(false);
  const [isActionsVisible, setActionsVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<CollectionItem | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [editQuantityText, setEditQuantityText] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [collectionData, itemData] = await Promise.all([
        repository.getCollection(collectionId),
        repository.listItems(collectionId),
      ]);

      if (!collectionData) {
        setLoadError('Coleta não encontrada.');
        setCollection(null);
        setItems([]);
        return;
      }

      setCollection(collectionData);
      setItems(itemData);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar a coleta.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    const query = productQuery.trim();

    if (!query) {
      setSelectedProduct(null);
      return;
    }

    const timer = setTimeout(() => {
      void repository.findByBarcode(query).then((product) => {
        if (!cancelled) {
          setSelectedProduct(product);
          if (product) {
            setFeedback('');
          }
        }
      });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [productQuery]);

  const applyBarcode = useCallback(async (barcode: string) => {
    const normalized = barcode.trim();
    setProductQuery(normalized);
    setScannerVisible(false);

    const product = await repository.findByBarcode(normalized);
    setSelectedProduct(product);
    setFeedback(
      product ? '' : 'Nenhum produto encontrado com este código de barras.',
    );
  }, []);

  const selectProductFromSearch = useCallback((product: Product) => {
    const code =
      product.barcode.trim() ||
      product.reference.trim() ||
      String(product.productId);

    setSelectedProduct(product);
    setProductQuery(code);
    setFeedback('');
    setProductSearchVisible(false);
  }, []);

  const increaseQuantity = useCallback(() => {
    const current = parseCollectionQuantity(quantityText) ?? 1;
    setQuantityText(formatCollectionQuantity(current + 1));
  }, [quantityText]);

  const decreaseQuantity = useCallback(() => {
    const current = parseCollectionQuantity(quantityText) ?? 1;
    const next = Math.max(0.001, current - 1);
    setQuantityText(formatCollectionQuantity(next));
  }, [quantityText]);

  const addItem = useCallback(async () => {
    if (!selectedProduct) {
      setFeedback('Informe um código de barras válido para localizar o produto.');
      return;
    }

    const quantity = parseCollectionQuantity(quantityText);
    if (quantity == null || quantity <= 0) {
      setFeedback('Informe uma quantidade válida.');
      return;
    }

    setIsAdding(true);
    setFeedback('');

    try {
      await repository.addItem(collectionId, selectedProduct, quantity);
      setProductQuery('');
      setSelectedProduct(null);
      setQuantityText(DEFAULT_QUANTITY);
      await load();
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar o item.',
      );
    } finally {
      setIsAdding(false);
    }
  }, [collectionId, load, quantityText, selectedProduct]);

  const openItemMenu = useCallback((item: CollectionItem) => {
    setMenuItem(item);
  }, []);

  const closeItemMenu = useCallback(() => {
    setMenuItem(null);
  }, []);

  const requestEditItem = useCallback(() => {
    if (!menuItem) {
      return;
    }

    setEditingItem(menuItem);
    setEditQuantityText(formatCollectionItemQuantity(menuItem.quantity));
    setEditError('');
    setMenuItem(null);
  }, [menuItem]);

  const closeEditItem = useCallback(() => {
    if (isSavingEdit) {
      return;
    }

    setEditingItem(null);
    setEditQuantityText('');
    setEditError('');
  }, [isSavingEdit]);

  const saveEditedItem = useCallback(async () => {
    if (!editingItem) {
      return;
    }

    const quantity = parseCollectionQuantity(editQuantityText);
    if (quantity == null || quantity <= 0) {
      setEditError('Informe uma quantidade válida.');
      return;
    }

    setIsSavingEdit(true);
    setEditError('');

    try {
      await repository.updateItemQuantity(editingItem.id, quantity);
      setEditingItem(null);
      setEditQuantityText('');
      await load();
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o item.',
      );
    } finally {
      setIsSavingEdit(false);
    }
  }, [editQuantityText, editingItem, load]);

  const removeSelectedItem = useCallback(async () => {
    if (!menuItem) {
      return;
    }

    const itemId = menuItem.id;
    setMenuItem(null);
    await repository.removeItem(itemId);
    await load();
  }, [load, menuItem]);

  return {
    addItem,
    applyBarcode,
    closeActions: () => setActionsVisible(false),
    closeEditItem,
    closeItemMenu,
    closeProductSearch: () => setProductSearchVisible(false),
    closeScanner: () => setScannerVisible(false),
    collection,
    decreaseQuantity,
    editError,
    editQuantityText,
    editingItem,
    feedback,
    increaseQuantity,
    isActionsVisible,
    isAdding,
    isLoading,
    isProductSearchVisible,
    isSavingEdit,
    isScannerVisible,
    items,
    loadError,
    menuItem,
    openActions: () => setActionsVisible(true),
    openItemMenu,
    openProductSearch: () => setProductSearchVisible(true),
    openScanner: () => setScannerVisible(true),
    productQuery,
    quantityText,
    removeSelectedItem,
    requestEditItem,
    saveEditedItem,
    selectProductFromSearch,
    selectedProduct,
    setEditQuantityText,
    setProductQuery,
    setQuantityText,
  };
}
