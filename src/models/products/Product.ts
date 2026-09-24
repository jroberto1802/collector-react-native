import { normalizeSkuAttributes } from '../../utils/skuAttributes';

export type ProductSkuAttribute = {
  id: number;
  name: string;
  itemId: number;
  itemName: string;
};

export type Product = {
  id: number;
  productId: number;
  barcode: string;
  reference: string;
  sku: string;
  skuAttributes: ProductSkuAttribute[];
  name: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  unit: string;
  group: string;
  manufacturer: string;
  supplier: string;
};

export type ProductsPage = {
  currentPage: number;
  lastPage: number;
  products: Product[];
  total: number;
};

export type ProductListItem = {
  id: number;
  productId: number;
  barcode: string;
  sku: string;
  name: string;
  size: string;
  color: string;
};

export type ProductListPage = {
  items: ProductListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }

    const normalized = trimmed.includes(',')
      ? trimmed.replace(/\./g, '').replace(',', '.')
      : trimmed;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value == null) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseProduct(value: unknown): Product {
  const product = asRecord(value);
  const id = asNumber(product.id);

  if (!id) {
    throw new Error('A API retornou um produto sem identificador válido.');
  }

  return {
    id,
    productId: asNumber(product.produto_id),
    barcode: asString(product.codigo_barras),
    reference: asString(product.referencia),
    sku: asString(product.sku),
    skuAttributes: normalizeSkuAttributes(product.sku_atributo),
    name: asString(product.nome),
    purchasePrice: asNumber(product.preco_compra),
    salePrice: asNumber(product.preco_venda),
    stock: asNumber(product.estoque),
    unit: asString(product.unidade_medida),
    group: asString(product.grupo),
    manufacturer: asString(product.fabricante),
    supplier: asString(product.fornecedor),
  };
}

export function parseProductsPage(payload: unknown): ProductsPage {
  const pagePayload = Array.isArray(payload) ? payload[0] : payload;
  const page = asRecord(pagePayload);

  if (!Array.isArray(page.data)) {
    throw new Error('A API não retornou uma lista válida de produtos.');
  }

  return {
    currentPage: Math.max(1, asNumber(page.current_page)),
    lastPage: Math.max(1, asNumber(page.last_page)),
    products: page.data.map(parseProduct),
    total: asNumber(page.total),
  };
}
