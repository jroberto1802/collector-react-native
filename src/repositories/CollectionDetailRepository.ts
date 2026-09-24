import {
  addOrUpdateCollectionItem,
  deleteCollectionItem,
  findProductByBarcode,
  findProductBySearchCode,
  getCollectionById,
  listCollectionItems,
  searchProducts,
  updateCollectionItem,
  updateCollectionItemQuantity,
} from '../database/database';
import type { SearchType } from '../constants/SettingsConstants';
import type { Product } from '../models/products/Product';

export class CollectionDetailRepository {
  getCollection(id: number) {
    return getCollectionById(id);
  }

  listItems(collectionId: number) {
    return listCollectionItems(collectionId);
  }

  findByBarcode(barcode: string) {
    return findProductByBarcode(barcode);
  }

  findBySearchCode(code: string, searchType: SearchType) {
    return findProductBySearchCode(code, searchType);
  }

  searchProducts(query: string, searchType: SearchType) {
    return searchProducts(query, searchType);
  }

  addItem(
    collectionId: number,
    product: Product,
    quantity: number,
    lotFields?: {
      lot?: string;
      manufacturingDate?: string;
      expirationDate?: string;
    },
  ) {
    return addOrUpdateCollectionItem({
      collectionId,
      product,
      quantity,
      lot: lotFields?.lot,
      manufacturingDate: lotFields?.manufacturingDate,
      expirationDate: lotFields?.expirationDate,
    });
  }

  updateItemQuantity(itemId: number, quantity: number) {
    return updateCollectionItemQuantity(itemId, quantity);
  }

  updateItem(
    itemId: number,
    input: {
      quantity: number;
      lot?: string;
      manufacturingDate?: string;
      expirationDate?: string;
    },
  ) {
    return updateCollectionItem(itemId, input);
  }

  removeItem(itemId: number) {
    return deleteCollectionItem(itemId);
  }
}
