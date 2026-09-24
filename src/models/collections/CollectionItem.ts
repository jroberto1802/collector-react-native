export type CollectionItem = {
  id: number;
  collectionId: number;
  productId: number;
  productLocalId: number;
  barcode: string;
  reference: string;
  sku: string;
  name: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  lot: string;
  /** AAAA-MM-DD */
  manufacturingDate: string;
  /** AAAA-MM-DD */
  expirationDate: string;
  /** Visualização Grade — vem de sku_attributes */
  size: string;
  /** Visualização Grade — vem de sku_attributes */
  color: string;
  createdAt: number;
  updatedAt: number;
};

export function formatCollectionQuantity(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

export function formatCollectionItemQuantity(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

export function formatCurrencyBrl(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parseCollectionQuantity(raw: string): number | null {
  const normalized = raw.trim().replace(/\./g, '').replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
