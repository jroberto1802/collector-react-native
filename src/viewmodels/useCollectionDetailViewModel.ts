import { useCallback, useEffect, useRef, useState } from 'react';

import type { Collection } from '../models/collections/Collection';
import type { CollectionItem } from '../models/collections/CollectionItem';
import {
  formatCollectionItemQuantity,
  formatCollectionQuantity,
  parseCollectionQuantity,
} from '../models/collections/CollectionItem';
import type { Product } from '../models/products/Product';
import {
  PRICE_TYPE,
  SEARCH_TYPE,
  type PriceType,
  type SearchType,
} from '../constants/SettingsConstants';
import { AppConstants } from '../constants/AppConstants';
import { CollectionDetailRepository } from '../repositories/CollectionDetailRepository';
import { loadAppSettings, saveAppSettings } from '../storage/settings';
import {
  formatIsoToBrDate,
  isManufacturingAfterExpiration,
  maskBrDateInput,
  parseBrDateToIso,
} from '../utils/dateMask';

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
  const [lotText, setLotText] = useState('');
  const [manufacturingDateText, setManufacturingDateText] = useState('');
  const [expirationDateText, setExpirationDateText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isProductSearchVisible, setProductSearchVisible] = useState(false);
  const [isActionsVisible, setActionsVisible] = useState(false);
  const [menuItem, setMenuItem] = useState<CollectionItem | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [editQuantityText, setEditQuantityText] = useState('');
  const [editLotText, setEditLotText] = useState('');
  const [editManufacturingDateText, setEditManufacturingDateText] =
    useState('');
  const [editExpirationDateText, setEditExpirationDateText] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isQuickCollection, setQuickCollection] = useState(false);
  const [isLotSerial, setLotSerial] = useState(false);
  const [isGrade, setGrade] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>(SEARCH_TYPE.BARCODE);
  const [priceType, setPriceType] = useState<PriceType>(PRICE_TYPE.PURCHASE);

  const quantityTextRef = useRef(quantityText);
  const lotTextRef = useRef(lotText);
  const manufacturingDateTextRef = useRef(manufacturingDateText);
  const expirationDateTextRef = useRef(expirationDateText);
  const isAddingRef = useRef(false);
  const isQuickCollectionRef = useRef(false);
  const isLotSerialRef = useRef(false);
  const searchTypeRef = useRef<SearchType>(SEARCH_TYPE.BARCODE);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    quantityTextRef.current = quantityText;
  }, [quantityText]);

  useEffect(() => {
    lotTextRef.current = lotText;
  }, [lotText]);

  useEffect(() => {
    manufacturingDateTextRef.current = manufacturingDateText;
  }, [manufacturingDateText]);

  useEffect(() => {
    expirationDateTextRef.current = expirationDateText;
  }, [expirationDateText]);

  useEffect(() => {
    isQuickCollectionRef.current = isQuickCollection;
  }, [isQuickCollection]);

  useEffect(() => {
    isLotSerialRef.current = isLotSerial;
  }, [isLotSerial]);

  useEffect(() => {
    searchTypeRef.current = searchType;
  }, [searchType]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  const clearLotFields = useCallback(() => {
    setLotText('');
    setManufacturingDateText('');
    setExpirationDateText('');
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [collectionData, itemData, settings] = await Promise.all([
        repository.getCollection(collectionId),
        repository.listItems(collectionId),
        loadAppSettings(),
      ]);

      setQuickCollection(settings.quickCollection);

      const lotSerialEnabled =
        settings.lotSerial && AppConstants.isSoftcomshop;
      setLotSerial(lotSerialEnabled);
      setGrade(settings.grade);
      setSearchType(settings.searchType);
      setPriceType(settings.priceType);

      if (settings.lotSerial && !AppConstants.isSoftcomshop) {
        void saveAppSettings({ ...settings, lotSerial: false });
      }

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

  const resolveLotFieldsForSave = useCallback(() => {
    if (!isLotSerialRef.current) {
      return { lot: '', manufacturingDate: '', expirationDate: '' };
    }

    const manufacturingIso = parseBrDateToIso(
      manufacturingDateTextRef.current,
    );
    const expirationIso = parseBrDateToIso(expirationDateTextRef.current);

    if (!manufacturingIso) {
      throw new Error('Informe a data de fabricação (DD/MM/AAAA).');
    }

    if (!expirationIso) {
      throw new Error('Informe a data de validade (DD/MM/AAAA).');
    }

    if (isManufacturingAfterExpiration(manufacturingIso, expirationIso)) {
      throw new Error(
        'A data de fabricação não pode ser maior que a data de validade.',
      );
    }

    return {
      lot: lotTextRef.current.trim(),
      manufacturingDate: manufacturingIso,
      expirationDate: expirationIso,
    };
  }, []);

  const addProduct = useCallback(
    async (product: Product) => {
      if (isAddingRef.current) {
        return;
      }

      const quantity = parseCollectionQuantity(quantityTextRef.current);
      if (quantity == null || quantity <= 0) {
        setFeedback('Informe uma quantidade válida.');
        return;
      }

      let lotFields: {
        lot: string;
        manufacturingDate: string;
        expirationDate: string;
      };

      try {
        lotFields = resolveLotFieldsForSave();
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : 'Informe os dados de lote/serial.',
        );
        return;
      }

      isAddingRef.current = true;
      setIsAdding(true);
      setFeedback('');

      try {
        await repository.addItem(collectionId, product, quantity, lotFields);
        setProductQuery('');
        setSelectedProduct(null);
        setQuantityText(DEFAULT_QUANTITY);
        clearLotFields();
        await load();
        if (isQuickCollectionRef.current) {
          showToast('Produto Adicionado!');
        }
      } catch (error) {
        setFeedback(
          error instanceof Error
            ? error.message
            : 'Não foi possível adicionar o item.',
        );
      } finally {
        isAddingRef.current = false;
        setIsAdding(false);
      }
    },
    [clearLotFields, collectionId, load, resolveLotFieldsForSave, showToast],
  );

  useEffect(() => {
    let cancelled = false;
    const query = productQuery.trim();

    if (!query) {
      setSelectedProduct(null);
      return;
    }

    const timer = setTimeout(() => {
      void repository
        .findBySearchCode(query, searchTypeRef.current)
        .then((product) => {
          if (cancelled) {
            return;
          }

          setSelectedProduct(product);
          if (product) {
            setFeedback('');
            if (isQuickCollectionRef.current) {
              void addProduct(product);
            }
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [addProduct, productQuery]);

  const applyBarcode = useCallback(
    async (barcode: string) => {
      const normalized = barcode.trim();
      setScannerVisible(false);

      const product = await repository.findByBarcode(normalized);
      if (!product) {
        setProductQuery(normalized);
        setSelectedProduct(null);
        setFeedback('Nenhum produto encontrado com este código de barras.');
        return;
      }

      setFeedback('');
      if (isQuickCollectionRef.current) {
        setProductQuery('');
        setSelectedProduct(null);
        await addProduct(product);
        return;
      }

      setProductQuery(normalized);
      setSelectedProduct(product);
    },
    [addProduct],
  );

  const selectProductFromSearch = useCallback(
    (product: Product) => {
      setProductSearchVisible(false);
      setFeedback('');

      if (isQuickCollectionRef.current) {
        setProductQuery('');
        setSelectedProduct(null);
        void addProduct(product);
        return;
      }

      const code =
        searchTypeRef.current === SEARCH_TYPE.REFERENCE
          ? product.reference.trim() || String(product.productId)
          : product.barcode.trim() || String(product.productId);

      setSelectedProduct(product);
      setProductQuery(code);
    },
    [addProduct],
  );

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
      setFeedback(
        'Informe um código de barras válido para localizar o produto.',
      );
      return;
    }

    await addProduct(selectedProduct);
  }, [addProduct, selectedProduct]);

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
    setEditLotText(menuItem.lot ?? '');
    setEditManufacturingDateText(formatIsoToBrDate(menuItem.manufacturingDate));
    setEditExpirationDateText(formatIsoToBrDate(menuItem.expirationDate));
    setEditError('');
    setMenuItem(null);
  }, [menuItem]);

  const closeEditItem = useCallback(() => {
    if (isSavingEdit) {
      return;
    }

    setEditingItem(null);
    setEditQuantityText('');
    setEditLotText('');
    setEditManufacturingDateText('');
    setEditExpirationDateText('');
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

    let lot = editingItem.lot ?? '';
    let manufacturingDate = editingItem.manufacturingDate ?? '';
    let expirationDate = editingItem.expirationDate ?? '';

    if (isLotSerialRef.current) {
      const manufacturingIso = parseBrDateToIso(editManufacturingDateText);
      const expirationIso = parseBrDateToIso(editExpirationDateText);

      if (!manufacturingIso) {
        setEditError('Informe a data de fabricação (DD/MM/AAAA).');
        return;
      }

      if (!expirationIso) {
        setEditError('Informe a data de validade (DD/MM/AAAA).');
        return;
      }

      if (isManufacturingAfterExpiration(manufacturingIso, expirationIso)) {
        setEditError(
          'A data de fabricação não pode ser maior que a data de validade.',
        );
        return;
      }

      lot = editLotText.trim();
      manufacturingDate = manufacturingIso;
      expirationDate = expirationIso;
    }

    setIsSavingEdit(true);
    setEditError('');

    try {
      await repository.updateItem(editingItem.id, {
        quantity,
        lot,
        manufacturingDate,
        expirationDate,
      });
      setEditingItem(null);
      setEditQuantityText('');
      setEditLotText('');
      setEditManufacturingDateText('');
      setEditExpirationDateText('');
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
  }, [
    editExpirationDateText,
    editLotText,
    editManufacturingDateText,
    editQuantityText,
    editingItem,
    load,
  ]);

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
    editExpirationDateText,
    editLotText,
    editManufacturingDateText,
    editQuantityText,
    editingItem,
    expirationDateText,
    feedback,
    toastMessage,
    increaseQuantity,
    isActionsVisible,
    isAdding,
    isGrade,
    isLoading,
    isLotSerial,
    isProductSearchVisible,
    isQuickCollection,
    isSavingEdit,
    isScannerVisible,
    items,
    loadError,
    lotText,
    manufacturingDateText,
    menuItem,
    openActions: () => setActionsVisible(true),
    openItemMenu,
    openProductSearch: () => setProductSearchVisible(true),
    openScanner: () => setScannerVisible(true),
    priceType,
    productQuery,
    quantityText,
    removeSelectedItem,
    requestEditItem,
    saveEditedItem,
    searchType,
    selectProductFromSearch,
    selectedProduct,
    setEditExpirationDateText: (value: string) =>
      setEditExpirationDateText(maskBrDateInput(value)),
    setEditLotText,
    setEditManufacturingDateText: (value: string) =>
      setEditManufacturingDateText(maskBrDateInput(value)),
    setEditQuantityText,
    setExpirationDateText: (value: string) =>
      setExpirationDateText(maskBrDateInput(value)),
    setLotText,
    setManufacturingDateText: (value: string) =>
      setManufacturingDateText(maskBrDateInput(value)),
    setProductQuery,
    setQuantityText,
  };
}
