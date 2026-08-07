import type { Product, IProductService, ServiceResponse } from '../types/inventory';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';

const mapBackendToFrontend = (item: any): Product => {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category?.name || 'Electronics',
    supplier: item.supplier?.name || 'Dell Direct',
    purchasePrice: Number(item.purchasePrice),
    sellingPrice: Number(item.sellingPrice),
    quantity: item.inventory?.quantity || 0,
    status: (item.inventory?.status || 'IN STOCK') as 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK',
    minStock: item.inventory?.minStock || 5,
    thumbnailColor: item.thumbnailColor || '#F3F4F6',
    thumbnailIcon: item.thumbnailIcon || 'laptop',
  };
};

const resolveCategoryId = async (name: string): Promise<string> => {
  const res = await apiClient.get<any>(API_ENDPOINTS.categories.list, { queryParams: { limit: 100 } });
  if (res.success && res.data?.items) {
    const matched = res.data.items.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
    if (matched) return matched.id;
  }
  // Dynamic creation if category not found
  const createRes = await apiClient.post<any>(API_ENDPOINTS.categories.create, { body: { name } });
  if (createRes.success && createRes.data) {
    return createRes.data.id;
  }
  return 'cat-electronics'; // fallback seed uuid
};

const resolveSupplierId = async (name: string): Promise<string> => {
  const res = await apiClient.get<any>(API_ENDPOINTS.suppliers.list, { queryParams: { limit: 100 } });
  if (res.success && res.data?.items) {
    const matched = res.data.items.find((s: any) => s.name.toLowerCase() === name.toLowerCase());
    if (matched) return matched.id;
  }
  // Dynamic creation if supplier not found
  const createRes = await apiClient.post<any>(API_ENDPOINTS.suppliers.create, { body: { name } });
  if (createRes.success && createRes.data) {
    return createRes.data.id;
  }
  return 'sup-dell'; // fallback seed uuid
};

export const productService: IProductService = {
  getProducts: async (): Promise<ServiceResponse<Product[]>> => {
    const res = await apiClient.get<any>(API_ENDPOINTS.products.list, { queryParams: { limit: 1000 } });
    if (!res.success) {
      return {
        success: false,
        data: [],
        error: {
          code: res.error?.code || 'API_ERROR',
          message: res.message || 'Failed to fetch products',
        },
      };
    }
    const items = res.data?.items || [];
    return {
      success: true,
      data: items.map(mapBackendToFrontend),
    };
  },

  getProductById: async (id: string): Promise<ServiceResponse<Product | null>> => {
    const res = await apiClient.get<any>(API_ENDPOINTS.products.detail, { pathParams: { id } });
    if (!res.success) {
      return {
        success: false,
        data: null,
        error: {
          code: res.error?.code || 'API_ERROR',
          message: res.message || 'Failed to fetch product details',
        },
      };
    }
    return {
      success: true,
      data: mapBackendToFrontend(res.data),
    };
  },

  createProduct: async (product: Omit<Product, 'id' | 'status'>): Promise<ServiceResponse<Product>> => {
    try {
      const categoryId = await resolveCategoryId(product.category);
      const supplierId = await resolveSupplierId(product.supplier);

      const payload = {
        name: product.name,
        sku: product.sku,
        categoryId,
        supplierId,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        thumbnailColor: product.thumbnailColor,
        thumbnailIcon: product.thumbnailIcon,
        quantity: product.quantity,
        minStock: product.minStock,
      };

      const res = await apiClient.post<any>(API_ENDPOINTS.products.create, { body: payload });
      if (!res.success) {
        return {
          success: false,
          data: null as any,
          error: {
            code: res.error?.code || 'API_ERROR',
            message: res.message || 'Failed to create product',
          },
        };
      }
      return {
        success: true,
        data: mapBackendToFrontend(res.data),
      };
    } catch (err: any) {
      return {
        success: false,
        data: null as any,
        error: {
          code: 'API_ERROR',
          message: err.message || 'An error occurred during product creation',
        },
      };
    }
  },

  updateProduct: async (id: string, updatedFields: Partial<Product>): Promise<ServiceResponse<Product | null>> => {
    try {
      const payload: any = {
        name: updatedFields.name,
        sku: updatedFields.sku,
        purchasePrice: updatedFields.purchasePrice,
        sellingPrice: updatedFields.sellingPrice,
        thumbnailColor: updatedFields.thumbnailColor,
        thumbnailIcon: updatedFields.thumbnailIcon,
        quantity: updatedFields.quantity,
        minStock: updatedFields.minStock,
      };

      if (updatedFields.category) {
        payload.categoryId = await resolveCategoryId(updatedFields.category);
      }
      if (updatedFields.supplier) {
        payload.supplierId = await resolveSupplierId(updatedFields.supplier);
      }

      const res = await apiClient.put<any>(API_ENDPOINTS.products.update, {
        pathParams: { id },
        body: payload,
      });

      if (!res.success) {
        return {
          success: false,
          data: null,
          error: {
            code: res.error?.code || 'API_ERROR',
            message: res.message || 'Failed to update product',
          },
        };
      }
      return {
        success: true,
        data: mapBackendToFrontend(res.data),
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        error: {
          code: 'API_ERROR',
          message: err.message || 'An error occurred during product update',
        },
      };
    }
  },

  deleteProduct: async (id: string): Promise<ServiceResponse<boolean>> => {
    const res = await apiClient.delete<any>(API_ENDPOINTS.products.delete, { pathParams: { id } });
    if (!res.success) {
      return {
        success: false,
        data: false,
        error: {
          code: res.error?.code || 'API_ERROR',
          message: res.message || 'Failed to delete product',
        },
      };
    }
    return {
      success: true,
      data: true,
    };
  },
};
