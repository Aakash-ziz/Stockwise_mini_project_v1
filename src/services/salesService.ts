import type { Transaction, ISalesService, ServiceResponse } from '../types/inventory';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const mapBackendToTransaction = (item: any): Transaction => {
  const firstItem = item.saleItems?.[0] || {};
  const productName = firstItem.product?.name || 'Unknown Product';
  const sku = firstItem.product?.sku || 'UNKNOWN';

  return {
    id: item.id,
    productName,
    sku,
    customer: item.customerName || 'Guest Customer',
    quantity: firstItem.quantity || 0,
    totalPrice: Number(item.totalPrice),
    status: item.status || 'DELIVERED',
    date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
  };
};

export const salesService: ISalesService = {
  getSales: async (): Promise<ServiceResponse<Transaction[]>> => {
    const res = await apiClient.get<any>(API_ENDPOINTS.sales.list, { queryParams: { limit: 1000 } });
    if (!res.success) {
      return {
        success: false,
        data: [],
        error: {
          code: res.error?.code || 'API_ERROR',
          message: res.message || 'Failed to fetch sales history',
        },
      };
    }
    const items = res.data?.items || [];
    return {
      success: true,
      data: items.map(mapBackendToTransaction),
    };
  },

  createSale: async (sale: Omit<Transaction, 'id' | 'date' | 'status'>): Promise<ServiceResponse<Transaction>> => {
    try {
      // 1. Resolve product UUID by searching products by SKU
      const prodRes = await apiClient.get<any>(API_ENDPOINTS.products.list, { queryParams: { search: sale.sku, limit: 10 } });
      if (!prodRes.success || !prodRes.data?.items || prodRes.data.items.length === 0) {
        return {
          success: false,
          data: null as any,
          error: {
            code: 'NOT_FOUND',
            message: `Product SKU "${sale.sku}" was not found in database.`,
          },
        };
      }

      const product = prodRes.data.items[0];

      // 2. Prepare payload
      const payload = {
        customerName: sale.customer || 'Guest Customer',
        discount: 0,
        createdBy: 'usr-sales1', // default authenticated operator user ID placeholder from seeds
        items: [
          {
            productId: product.id,
            quantity: sale.quantity,
            unitPrice: Number(product.sellingPrice),
          },
        ],
      };

      // 3. Post checkout request to backend
      const res = await apiClient.post<any>(API_ENDPOINTS.sales.create, { body: payload });
      if (!res.success) {
        return {
          success: false,
          data: null as any,
          error: {
            code: res.error?.code || 'API_ERROR',
            message: res.message || 'Failed to process checkout transaction',
          },
        };
      }

      return {
        success: true,
        data: mapBackendToTransaction(res.data),
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        error: {
          code: 'API_ERROR',
          message: err.message || 'An error occurred during sales checkout processing',
        },
      };
    }
  },
};
