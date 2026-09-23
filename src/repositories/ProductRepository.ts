import { AppConstants } from '../constants/AppConstants';
import {
  clearProducts,
  getProductsPage,
  replaceProducts,
} from '../database/database';
import type { Product } from '../models/products/Product';
import {
  requestIntegrationToken,
  requestProductsPage,
} from '../services/products';

export type ProductSyncProgress = {
  currentPage: number;
  lastPage: number;
  downloadedProducts: number;
};

export class ProductRepository {
  async synchronize(
    onProgress?: (progress: ProductSyncProgress) => void,
  ) {
    await clearProducts();

    const tokenResponse = await requestIntegrationToken();
    AppConstants.setProductsToken(
      tokenResponse.token,
      tokenResponse.expiresIn,
    );

    const products: Product[] = [];
    let pageNumber = 1;
    let lastPage = 1;

    do {
      const page = await requestProductsPage(tokenResponse.token, pageNumber);
      products.push(...page.products);
      lastPage = page.lastPage;
      onProgress?.({
        currentPage: page.currentPage,
        lastPage,
        downloadedProducts: products.length,
      });
      pageNumber = page.currentPage + 1;
    } while (pageNumber <= lastPage);

    await replaceProducts(products);
    return products.length;
  }

  getLocalPage(page: number, pageSize: number, search: string) {
    return getProductsPage(page, pageSize, search);
  }
}
