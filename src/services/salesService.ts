import type { Transaction, ISalesService, ServiceResponse, SaleCartItem } from '../types/inventory';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockRepository } from '../data/mockRepository';

const mapBackendToTransaction = (item: any): Transaction => {
  const firstItem = item.saleItems?.[0] || {};
  const itemCount = item.saleItems?.length || 0;
  const productName = itemCount > 1 
    ? `${firstItem.product?.name || 'Product'} + ${itemCount - 1} more items`
    : (firstItem.product?.name || 'Unknown Product');
  const sku = itemCount > 1
    ? `${firstItem.product?.sku || 'UNKNOWN'} (+${itemCount - 1})`
    : (firstItem.product?.sku || 'UNKNOWN');

  const items = (item.saleItems || []).map((si: any) => ({
    productId: si.productId || si.product?.id,
    productName: si.product?.name || 'Product',
    sku: si.product?.sku || 'SKU',
    quantity: Number(si.quantity),
    unitPrice: Number(si.unitPrice),
  }));

  const totalQuantity = (item.saleItems || []).reduce((sum: number, si: any) => sum + Number(si.quantity || 0), 0);

  return {
    id: item.id,
    productName,
    sku,
    customer: item.customerName || 'Guest Customer',
    quantity: totalQuantity || firstItem.quantity || 0,
    totalPrice: Number(item.totalPrice),
    status: item.status || 'DELIVERED',
    date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
    items,
    discount: Number(item.discount || 0),
  };
};

export const salesService: ISalesService & {
  processCheckout: (payload: {
    customer: string;
    items: SaleCartItem[];
    discount?: number;
    note?: string;
  }) => Promise<ServiceResponse<Transaction>>;
} = {
  getSales: async (): Promise<ServiceResponse<Transaction[]>> => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.sales.list, { queryParams: { limit: 1000 } });
      if (res.success && res.data?.items && res.data.items.length > 0) {
        return {
          success: true,
          data: res.data.items.map(mapBackendToTransaction),
        };
      }
    } catch {
      // Backend not running
    }

    return {
      success: true,
      data: mockRepository.getTransactions(),
    };
  },

  createSale: async (sale: Omit<Transaction, 'id' | 'date' | 'status'>): Promise<ServiceResponse<Transaction>> => {
    try {
      const prodRes = await apiClient.get<any>(API_ENDPOINTS.products.list, { queryParams: { search: sale.sku, limit: 10 } });
      if (prodRes.success && prodRes.data?.items && prodRes.data.items.length > 0) {
        const product = prodRes.data.items[0];
        const payload = {
          customerName: sale.customer,
          discount: sale.discount || 0,
          createdBy: 'usr-sales1',
          items: [
            {
              productId: product.id,
              quantity: sale.quantity,
              unitPrice: product.sellingPrice,
            },
          ],
        };

        const res = await apiClient.post<any>(API_ENDPOINTS.sales.create, { body: payload });
        if (res.success && res.data) {
          return {
            success: true,
            data: mapBackendToTransaction(res.data),
          };
        }
      }
    } catch {
      // Backend not running
    }

    // Convert single sale into mock repository multi-item format
    const cartItem: SaleCartItem = {
      productId: `prod-${sale.sku}`,
      name: sale.productName,
      sku: sale.sku,
      quantity: sale.quantity,
      unitPrice: sale.quantity > 0 ? sale.totalPrice / sale.quantity : sale.totalPrice,
      total: sale.totalPrice,
    };

    const result = mockRepository.processMultiItemSale({
      customer: sale.customer,
      items: [cartItem],
      discount: sale.discount,
      note: sale.note,
    });

    if (result.success && result.transaction) {
      return {
        success: true,
        data: result.transaction,
      };
    }

    return {
      success: false,
      data: null as any,
      error: { code: 'SALE_FAILED', message: result.error || 'Failed to process sale' },
    };
  },

  processCheckout: async (payload: {
    customer: string;
    items: SaleCartItem[];
    discount?: number;
    note?: string;
  }): Promise<ServiceResponse<Transaction>> => {
    try {
      const backendPayload = {
        customerName: payload.customer,
        discount: payload.discount || 0,
        createdBy: 'usr-sales1',
        items: payload.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const res = await apiClient.post<any>(API_ENDPOINTS.sales.create, { body: backendPayload });
      if (res.success && res.data) {
        const mapped = mapBackendToTransaction(res.data);
        // Record movements in mockRepository for analysis page visibility
        payload.items.forEach(item => {
          mockRepository.logStockMovement({
            productId: item.productId,
            sku: item.sku,
            productName: item.name,
            type: 'SALE',
            quantityDelta: -item.quantity,
            note: `POS Checkout to ${payload.customer || 'Guest Customer'}`,
            referenceId: mapped.id,
          });
        });
        return {
          success: true,
          data: mapped,
        };
      }
    } catch {
      // Backend not running
    }

    const result = mockRepository.processMultiItemSale(payload);
    if (result.success && result.transaction) {
      return {
        success: true,
        data: result.transaction,
      };
    }

    return {
      success: false,
      data: null as any,
      error: { code: 'CHECKOUT_FAILED', message: result.error || 'Failed to process checkout' },
    };
  },
};

