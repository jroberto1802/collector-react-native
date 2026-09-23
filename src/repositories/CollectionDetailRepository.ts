import {
  addOrUpdateCollectionItem,
  deleteCollectionItem,
  findProductByBarcode,
  getCollectionById,
  listCollectionItems,
  searchProducts,
  updateCollectionItemQuantity,
} from '../database/database';
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

  searchProducts(query: string) {
    return searchProducts(query);
  }

  addItem(collectionId: number, product: Product, quantity: number) {
    return addOrUpdateCollectionItem({
      collectionId,
      product,
      quantity,
    });
  }

  updateItemQuantity(itemId: number, quantity: number) {
    return updateCollectionItemQuantity(itemId, quantity);
  }

  removeItem(itemId: number) {
    return deleteCollectionItem(itemId);
  }
}
