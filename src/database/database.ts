import * as SQLite from 'expo-sqlite';

import type { Collection, CollectionFilter } from '../models/collections/Collection';
import { DEFAULT_COLLECTION_STATUS } from '../models/collections/Collection';
import type { CollectionItem } from '../models/collections/CollectionItem';
import type {
  Product,
  ProductListItem,
  ProductListPage,
} from '../models/products/Product';

const DATABASE_NAME = 'collector.db';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function createDatabase() {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY NOT NULL,
      product_id INTEGER NOT NULL,
      barcode TEXT NOT NULL,
      reference TEXT NOT NULL,
      sku TEXT NOT NULL,
      sku_attributes TEXT NOT NULL,
      name TEXT NOT NULL,
      purchase_price REAL NOT NULL,
      sale_price REAL NOT NULL,
      stock REAL NOT NULL,
      unit TEXT NOT NULL,
      group_name TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      supplier TEXT NOT NULL,
      synced_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS products_barcode_idx ON products (barcode);
    CREATE INDEX IF NOT EXISTS products_sku_idx ON products (sku);
    CREATE INDEX IF NOT EXISTS products_name_idx ON products (name);
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0,
      item_count INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS collections_created_at_idx ON collections (created_at);
    CREATE INDEX IF NOT EXISTS collections_archived_idx ON collections (archived);
    CREATE INDEX IF NOT EXISTS collections_name_idx ON collections (name);
  `);

  // Isola a migration de itens para nunca derrubar a sync de produtos.
  try {
    await ensureCollectionItemsTable(database);
    await backfillCollectionItemsPurchasePrice(database);
  } catch (error) {
    console.warn('[Collector][DB] Recriando collection_items após falha de migration', error);
    await database.execAsync(`
      DROP TABLE IF EXISTS collection_items;
      DROP TABLE IF EXISTS collection_items_new;
    `);
    await ensureCollectionItemsTable(database);
  }

  return database;
}

const COLLECTION_ITEMS_CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    collection_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_local_id INTEGER NOT NULL DEFAULT 0,
    barcode TEXT NOT NULL DEFAULT '',
    sku TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    purchase_price REAL NOT NULL DEFAULT 0,
    quantity REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL DEFAULT 0,
    UNIQUE(collection_id, product_id)
  );
  CREATE INDEX IF NOT EXISTS collection_items_collection_idx
    ON collection_items (collection_id);
  CREATE INDEX IF NOT EXISTS collection_items_barcode_idx
    ON collection_items (barcode);
`;

async function ensureCollectionItemsTable(database: SQLite.SQLiteDatabase) {
  await database.execAsync(COLLECTION_ITEMS_CREATE_SQL);

  const columns = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(collection_items)',
  );
  const columnNames = new Set(columns.map((column) => column.name));
  const requiredColumns = [
    'id',
    'collection_id',
    'product_id',
    'product_local_id',
    'barcode',
    'sku',
    'name',
    'purchase_price',
    'quantity',
    'created_at',
    'updated_at',
  ];
  const missingColumns = requiredColumns.filter((column) => !columnNames.has(column));

  if (missingColumns.length === 0) {
    return;
  }

  // Schema antigo: recria a tabela preservando o que for possível.
  await database.execAsync(`
    DROP TABLE IF EXISTS collection_items_new;
    CREATE TABLE collection_items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      collection_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_local_id INTEGER NOT NULL DEFAULT 0,
      barcode TEXT NOT NULL DEFAULT '',
      sku TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL DEFAULT '',
      purchase_price REAL NOT NULL DEFAULT 0,
      quantity REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT 0,
      UNIQUE(collection_id, product_id)
    );
  `);

  const selectId = columnNames.has('id') ? 'id' : 'NULL';
  const selectCollectionId = columnNames.has('collection_id') ? 'collection_id' : '0';
  const selectProductId = columnNames.has('product_id') ? 'product_id' : '0';
  const selectProductLocalId = columnNames.has('product_local_id')
    ? 'product_local_id'
    : '0';
  const selectBarcode = columnNames.has('barcode') ? 'barcode' : "''";
  const selectSku = columnNames.has('sku') ? 'sku' : "''";
  const selectName = columnNames.has('name') ? 'name' : "''";
  const selectPurchasePrice = columnNames.has('purchase_price')
    ? 'purchase_price'
    : '0';
  const selectQuantity = columnNames.has('quantity') ? 'quantity' : '0';
  const selectCreatedAt = columnNames.has('created_at') ? 'created_at' : '0';
  const selectUpdatedAt = columnNames.has('updated_at') ? 'updated_at' : '0';

  await database.execAsync(`
    INSERT OR IGNORE INTO collection_items_new (
      id, collection_id, product_id, product_local_id, barcode, sku, name,
      purchase_price, quantity, created_at, updated_at
    )
    SELECT
      ${selectId},
      ${selectCollectionId},
      ${selectProductId},
      ${selectProductLocalId},
      ${selectBarcode},
      ${selectSku},
      ${selectName},
      ${selectPurchasePrice},
      ${selectQuantity},
      ${selectCreatedAt},
      ${selectUpdatedAt}
    FROM collection_items;

    DROP TABLE collection_items;
    ALTER TABLE collection_items_new RENAME TO collection_items;
    CREATE INDEX IF NOT EXISTS collection_items_collection_idx
      ON collection_items (collection_id);
    CREATE INDEX IF NOT EXISTS collection_items_barcode_idx
      ON collection_items (barcode);
  `);
}

async function backfillCollectionItemsPurchasePrice(
  database: SQLite.SQLiteDatabase,
) {
  const columns = await database.getAllAsync<{ name: string }>(
    'PRAGMA table_info(collection_items)',
  );
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('purchase_price') || !columnNames.has('product_id')) {
    return;
  }

  await database.execAsync(`
    UPDATE collection_items
    SET purchase_price = (
      SELECT p.purchase_price
      FROM products p
      WHERE p.product_id = collection_items.product_id
      LIMIT 1
    )
    WHERE (purchase_price IS NULL OR purchase_price = 0)
      AND EXISTS (
        SELECT 1
        FROM products p
        WHERE p.product_id = collection_items.product_id
          AND p.purchase_price IS NOT NULL
          AND p.purchase_price != 0
      )
  `);
}

type CollectionRow = {
  id: number;
  name: string;
  status: string;
  archived: number;
  item_count: number;
  created_at: number;
};

function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    status: row.status === 'Sincronizado' ? 'Sincronizado' : DEFAULT_COLLECTION_STATUS,
    archived: row.archived === 1,
    itemCount: row.item_count,
    createdAt: row.created_at,
  };
}

export function getDatabase() {
  databasePromise ??= createDatabase().catch((error) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

export async function clearProducts() {
  const database = await getDatabase();

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync('DELETE FROM products');
    await transaction.runAsync(
      "DELETE FROM sync_metadata WHERE key IN ('products_last_sync', 'products_count')",
    );
  });
}

export async function replaceProducts(products: Product[]) {
  const database = await getDatabase();
  const syncedAt = Date.now();

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync('DELETE FROM products');
    const statement = await transaction.prepareAsync(`
      INSERT OR REPLACE INTO products (
        id, product_id, barcode, reference, sku, sku_attributes, name,
        purchase_price, sale_price, stock, unit, group_name, manufacturer,
        supplier, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      for (const product of products) {
        await statement.executeAsync([
          product.id,
          product.productId,
          product.barcode,
          product.reference,
          product.sku,
          JSON.stringify(product.skuAttributes),
          product.name,
          product.purchasePrice,
          product.salePrice,
          product.stock,
          product.unit,
          product.group,
          product.manufacturer,
          product.supplier,
          syncedAt,
        ]);
      }
    } finally {
      await statement.finalizeAsync();
    }

    await transaction.runAsync(
      `INSERT INTO sync_metadata (key, value)
       VALUES ('products_last_sync', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      String(syncedAt),
    );
    await transaction.runAsync(
      `INSERT INTO sync_metadata (key, value)
       VALUES ('products_count', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      String(products.length),
    );
  });
}

export async function getProductsCount() {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM products',
  );

  return result?.count ?? 0;
}

export async function getProductsPage(
  requestedPage: number,
  pageSize: number,
  search: string,
): Promise<ProductListPage> {
  const database = await getDatabase();
  const normalizedSearch = search.trim();
  const whereClause = normalizedSearch
    ? `WHERE name LIKE ? COLLATE NOCASE
       OR barcode LIKE ? COLLATE NOCASE
       OR sku LIKE ? COLLATE NOCASE
       OR reference LIKE ? COLLATE NOCASE
       OR CAST(product_id AS TEXT) LIKE ?
       OR CAST(id AS TEXT) LIKE ?`
    : '';
  const searchValue = `%${normalizedSearch}%`;
  const searchParams = normalizedSearch
    ? Array(6).fill(searchValue)
    : [];
  const countResult = await database.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM products ${whereClause}`,
    searchParams,
  );
  const total = countResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const offset = (page - 1) * pageSize;
  const items = await database.getAllAsync<ProductListItem>(
    `SELECT
       id,
       product_id AS productId,
       barcode,
       sku,
       name
     FROM products
     ${whereClause}
     ORDER BY name COLLATE NOCASE, id
     LIMIT ? OFFSET ?`,
    [...searchParams, pageSize, offset],
  );

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function createCollection(name: string): Promise<Collection> {
  const database = await getDatabase();
  const createdAt = Date.now();
  const result = await database.runAsync(
    `INSERT INTO collections (name, status, archived, item_count, created_at)
     VALUES (?, ?, 0, 0, ?)`,
    name.trim(),
    DEFAULT_COLLECTION_STATUS,
    createdAt,
  );

  const created = await database.getFirstAsync<CollectionRow>(
    `SELECT id, name, status, archived, item_count, created_at
     FROM collections
     WHERE id = ?`,
    result.lastInsertRowId,
  );

  if (!created) {
    throw new Error('Não foi possível criar a coleta.');
  }

  return mapCollection(created);
}

export async function listCollections(
  filter: CollectionFilter,
  search: string,
): Promise<Collection[]> {
  const database = await getDatabase();
  const normalizedSearch = search.trim();
  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filter === 'recentes') {
    conditions.push('archived = 0');
    conditions.push('created_at >= ?');
    params.push(Date.now() - SEVEN_DAYS_MS);
  } else if (filter === 'todas') {
    conditions.push('archived = 0');
  } else {
    conditions.push('archived = 1');
  }

  if (normalizedSearch) {
    conditions.push(
      '(name LIKE ? COLLATE NOCASE OR CAST(id AS TEXT) LIKE ?)',
    );
    const searchValue = `%${normalizedSearch}%`;
    params.push(searchValue, searchValue);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';
  const rows = await database.getAllAsync<CollectionRow>(
    `SELECT id, name, status, archived, item_count, created_at
     FROM collections
     ${whereClause}
     ORDER BY created_at DESC, id DESC`,
    params,
  );

  return rows.map(mapCollection);
}

export async function archiveCollection(id: number) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE collections SET archived = 1 WHERE id = ?',
    id,
  );
}

export async function unarchiveCollection(id: number) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE collections SET archived = 0 WHERE id = ?',
    id,
  );
}

export async function deleteCollection(id: number) {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'DELETE FROM collection_items WHERE collection_id = ?',
      id,
    );
    await transaction.runAsync('DELETE FROM collections WHERE id = ?', id);
  });
}

export async function getCollectionById(id: number): Promise<Collection | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<CollectionRow>(
    `SELECT id, name, status, archived, item_count, created_at
     FROM collections
     WHERE id = ?`,
    id,
  );

  return row ? mapCollection(row) : null;
}

type ProductRow = {
  id: number;
  product_id: number;
  barcode: string;
  reference: string;
  sku: string;
  sku_attributes: string;
  name: string;
  purchase_price: number;
  sale_price: number;
  stock: number;
  unit: string;
  group_name: string;
  manufacturer: string;
  supplier: string;
};

function mapProductRow(row: ProductRow): Product {
  let skuAttributes: Product['skuAttributes'] = [];
  try {
    const parsed = JSON.parse(row.sku_attributes) as Product['skuAttributes'];
    skuAttributes = Array.isArray(parsed) ? parsed : [];
  } catch {
    skuAttributes = [];
  }

  return {
    id: row.id,
    productId: row.product_id,
    barcode: row.barcode,
    reference: row.reference,
    sku: row.sku,
    skuAttributes,
    name: row.name,
    purchasePrice: row.purchase_price,
    salePrice: row.sale_price,
    stock: row.stock,
    unit: row.unit,
    group: row.group_name,
    manufacturer: row.manufacturer,
    supplier: row.supplier,
  };
}

export async function findProductByBarcode(barcode: string): Promise<Product | null> {
  const database = await getDatabase();
  const normalized = barcode.trim();

  if (!normalized) {
    return null;
  }

  const row = await database.getFirstAsync<ProductRow>(
    `SELECT
       id,
       product_id,
       barcode,
       reference,
       sku,
       sku_attributes,
       name,
       purchase_price,
       sale_price,
       stock,
       unit,
       group_name,
       manufacturer,
       supplier
     FROM products
     WHERE barcode = ?
        OR reference = ?
        OR CAST(product_id AS TEXT) = ?
     LIMIT 1`,
    normalized,
    normalized,
    normalized,
  );

  return row ? mapProductRow(row) : null;
}

export async function searchProducts(query: string, limit = 40): Promise<Product[]> {
  const database = await getDatabase();
  const normalized = query.trim();

  if (!normalized) {
    return [];
  }

  const searchValue = `%${normalized}%`;
  const rows = await database.getAllAsync<ProductRow>(
    `SELECT
       id,
       product_id,
       barcode,
       reference,
       sku,
       sku_attributes,
       name,
       purchase_price,
       sale_price,
       stock,
       unit,
       group_name,
       manufacturer,
       supplier
     FROM products
     WHERE name LIKE ? COLLATE NOCASE
        OR barcode LIKE ? COLLATE NOCASE
        OR reference LIKE ? COLLATE NOCASE
        OR sku LIKE ? COLLATE NOCASE
        OR CAST(product_id AS TEXT) LIKE ?
     ORDER BY name COLLATE NOCASE, id
     LIMIT ?`,
    searchValue,
    searchValue,
    searchValue,
    searchValue,
    searchValue,
    limit,
  );

  return rows.map(mapProductRow);
}

type CollectionItemRow = {
  id: number;
  collection_id: number;
  product_id: number;
  product_local_id: number;
  barcode: string;
  sku: string;
  name: string;
  purchase_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
};

function mapCollectionItem(row: CollectionItemRow): CollectionItem {
  return {
    id: row.id,
    collectionId: row.collection_id,
    productId: row.product_id,
    productLocalId: row.product_local_id,
    barcode: row.barcode,
    sku: row.sku,
    name: row.name,
    purchasePrice: row.purchase_price ?? 0,
    quantity: row.quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const COLLECTION_ITEM_SELECT = `
  id,
  collection_id,
  product_id,
  product_local_id,
  barcode,
  sku,
  name,
  purchase_price,
  quantity,
  created_at,
  updated_at
`;

export async function listCollectionItems(
  collectionId: number,
): Promise<CollectionItem[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<CollectionItemRow>(
    `SELECT
       ci.id,
       ci.collection_id,
       ci.product_id,
       ci.product_local_id,
       ci.barcode,
       ci.sku,
       ci.name,
       COALESCE(
         NULLIF(ci.purchase_price, 0),
         (
           SELECT p.purchase_price
           FROM products p
           WHERE p.product_id = ci.product_id
           LIMIT 1
         ),
         0
       ) AS purchase_price,
       ci.quantity,
       ci.created_at,
       ci.updated_at
     FROM collection_items ci
     WHERE ci.collection_id = ?
     ORDER BY ci.updated_at DESC, ci.id DESC`,
    collectionId,
  );

  return rows.map(mapCollectionItem);
}

export async function addOrUpdateCollectionItem(input: {
  collectionId: number;
  product: Product;
  quantity: number;
}): Promise<CollectionItem> {
  const database = await getDatabase();
  const now = Date.now();
  const quantity = input.quantity;

  if (!(quantity > 0)) {
    throw new Error('Informe uma quantidade válida.');
  }

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const existing = await transaction.getFirstAsync<{ id: number; quantity: number }>(
      `SELECT id, quantity
       FROM collection_items
       WHERE collection_id = ? AND product_id = ?`,
      input.collectionId,
      input.product.productId,
    );

    if (existing) {
      await transaction.runAsync(
        `UPDATE collection_items
         SET quantity = ?, updated_at = ?, name = ?, barcode = ?, sku = ?, purchase_price = ?
         WHERE id = ?`,
        existing.quantity + quantity,
        now,
        input.product.name,
        input.product.barcode,
        input.product.sku,
        input.product.purchasePrice,
        existing.id,
      );
    } else {
      await transaction.runAsync(
        `INSERT INTO collection_items (
           collection_id, product_id, product_local_id, barcode, sku, name,
           purchase_price, quantity, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        input.collectionId,
        input.product.productId,
        input.product.id,
        input.product.barcode,
        input.product.sku,
        input.product.name,
        input.product.purchasePrice,
        quantity,
        now,
        now,
      );
    }

    const countResult = await transaction.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM collection_items WHERE collection_id = ?',
      input.collectionId,
    );
    await transaction.runAsync(
      'UPDATE collections SET item_count = ? WHERE id = ?',
      countResult?.count ?? 0,
      input.collectionId,
    );
  });

  const item = await database.getFirstAsync<CollectionItemRow>(
    `SELECT ${COLLECTION_ITEM_SELECT}
     FROM collection_items
     WHERE collection_id = ? AND product_id = ?`,
    input.collectionId,
    input.product.productId,
  );

  if (!item) {
    throw new Error('Não foi possível adicionar o item à coleta.');
  }

  return mapCollectionItem(item);
}

export async function updateCollectionItemQuantity(
  itemId: number,
  quantity: number,
): Promise<void> {
  if (!(quantity > 0)) {
    throw new Error('Informe uma quantidade válida.');
  }

  const database = await getDatabase();
  await database.runAsync(
    `UPDATE collection_items
     SET quantity = ?, updated_at = ?
     WHERE id = ?`,
    quantity,
    Date.now(),
    itemId,
  );
}

export async function deleteCollectionItem(itemId: number): Promise<void> {
  const database = await getDatabase();

  await database.withExclusiveTransactionAsync(async (transaction) => {
    const item = await transaction.getFirstAsync<{ collection_id: number }>(
      'SELECT collection_id FROM collection_items WHERE id = ?',
      itemId,
    );

    if (!item) {
      return;
    }

    await transaction.runAsync('DELETE FROM collection_items WHERE id = ?', itemId);

    const countResult = await transaction.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM collection_items WHERE collection_id = ?',
      item.collection_id,
    );
    await transaction.runAsync(
      'UPDATE collections SET item_count = ? WHERE id = ?',
      countResult?.count ?? 0,
      item.collection_id,
    );
  });
}
