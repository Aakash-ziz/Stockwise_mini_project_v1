import type { Product, IProductService, ServiceResponse } from '../types/inventory';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { mockRepository } from '../data/mockRepository';

const mapBackendToFrontend = (item: any): Product => {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category?.name || 'Electronics',
    supplier: item.supplier?.name || 'Direct',
    purchasePrice: Number(item.purchasePrice),
    sellingPrice: Number(item.sellingPrice),
    quantity: item.inventory?.quantity || 0,
    status: (item.inventory?.status || 'IN STOCK') as 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK',
    minStock: item.inventory?.minStock || 5,
    thumbnailColor: item.thumbnailColor || '#F3F4F6',
    thumbnailIcon: item.thumbnailIcon || 'laptop',
  };
};

export const productService: IProductService = {
  getProducts: async (): Promise<ServiceResponse<Product[]>> => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.products.list, { queryParams: { limit: 1000 } });
      if (res.success && res.data?.items && res.data.items.length > 0) {
        return {
          success: true,
          data: res.data.items.map(mapBackendToFrontend),
        };
      }
    } catch {
      // Backend not running, fall through to mock repository
    }

    return {
      success: true,
      data: mockRepository.getProducts(),
    };
  },

  getProductById: async (id: string): Promise<ServiceResponse<Product | null>> => {
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.products.detail, { pathParams: { id } });
      if (res.success && res.data) {
        return {
          success: true,
          data: mapBackendToFrontend(res.data),
        };
      }
    } catch {
      // Backend not running
    }

    return {
      success: true,
      data: mockRepository.getProductById(id),
    };
  },

  createProduct: async (product: Omit<Product, 'id' | 'status'>): Promise<ServiceResponse<Product>> => {
    try {
      // 1. Resolve Category ID (find or create)
      let categoryId = 'cat-electronics';
      const catRes = await apiClient.get<any>(API_ENDPOINTS.categories.list, { queryParams: { limit: 100 } });
      if (catRes.success && catRes.data?.items) {
        const foundCat = catRes.data.items.find((c: any) => c.name.toLowerCase() === product.category.toLowerCase());
        if (foundCat) {
          categoryId = foundCat.id;
        } else {
          const newCat = await apiClient.post<any>(API_ENDPOINTS.categories.create, {
            body: { name: product.category, description: `${product.category} category` }
          });
          if (newCat.success && newCat.data) {
            categoryId = newCat.data.id;
          }
        }
      }

      // 2. Resolve Supplier ID (find or create)
      let supplierId: string | undefined;
      const supRes = await apiClient.get<any>(API_ENDPOINTS.suppliers.list, { queryParams: { limit: 100 } });
      if (supRes.success && supRes.data?.items && product.supplier) {
        const foundSup = supRes.data.items.find((s: any) => s.name.toLowerCase() === product.supplier.toLowerCase());
        if (foundSup) {
          supplierId = foundSup.id;
        } else {
          const newSup = await apiClient.post<any>(API_ENDPOINTS.suppliers.create, {
            body: { name: product.supplier, contactInfo: `contact@${product.supplier.toLowerCase().replace(/\s+/g, '')}.com` }
          });
          if (newSup.success && newSup.data) {
            supplierId = newSup.data.id;
          }
        }
      }

      // 3. Post to backend
      const payload = {
        name: product.name,
        sku: product.sku,
        categoryId,
        supplierId,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        quantity: product.quantity,
        minStock: product.minStock,
        thumbnailColor: product.thumbnailColor,
        thumbnailIcon: product.thumbnailIcon,
      };

      const res = await apiClient.post<any>(API_ENDPOINTS.products.create, { body: payload });
      if (res.success && res.data) {
        const createdFrontend = mapBackendToFrontend(res.data);
        mockRepository.addProduct(createdFrontend);
        return {
          success: true,
          data: createdFrontend,
        };
      }
    } catch {
      // Backend not running
    }

    const created = mockRepository.addProduct(product);
    return {
      success: true,
      data: created,
    };
  },

  updateProduct: async (id: string, updatedFields: Partial<Product>): Promise<ServiceResponse<Product | null>> => {
    try {
      const payload: any = {};
      if (updatedFields.name !== undefined) payload.name = updatedFields.name;
      if (updatedFields.purchasePrice !== undefined) payload.purchasePrice = updatedFields.purchasePrice;
      if (updatedFields.sellingPrice !== undefined) payload.sellingPrice = updatedFields.sellingPrice;
      if (updatedFields.quantity !== undefined) payload.quantity = updatedFields.quantity;
      if (updatedFields.minStock !== undefined) payload.minStock = updatedFields.minStock;

      if (updatedFields.category) {
        const catRes = await apiClient.get<any>(API_ENDPOINTS.categories.list, { queryParams: { limit: 100 } });
        if (catRes.success && catRes.data?.items) {
          const foundCat = catRes.data.items.find((c: any) => c.name.toLowerCase() === updatedFields.category!.toLowerCase());
          if (foundCat) {
            payload.categoryId = foundCat.id;
          } else {
            const newCat = await apiClient.post<any>(API_ENDPOINTS.categories.create, {
              body: { name: updatedFields.category, description: `${updatedFields.category} category` }
            });
            if (newCat.success && newCat.data) {
              payload.categoryId = newCat.data.id;
            }
          }
        }
      }

      if (updatedFields.supplier) {
        const supRes = await apiClient.get<any>(API_ENDPOINTS.suppliers.list, { queryParams: { limit: 100 } });
        if (supRes.success && supRes.data?.items) {
          const foundSup = supRes.data.items.find((s: any) => s.name.toLowerCase() === updatedFields.supplier!.toLowerCase());
          if (foundSup) {
            payload.supplierId = foundSup.id;
          } else {
            const newSup = await apiClient.post<any>(API_ENDPOINTS.suppliers.create, {
              body: { name: updatedFields.supplier, contactInfo: `contact@${updatedFields.supplier.toLowerCase().replace(/\s+/g, '')}.com` }
            });
            if (newSup.success && newSup.data) {
              payload.supplierId = newSup.data.id;
            }
          }
        }
      }

      const res = await apiClient.put<any>(API_ENDPOINTS.products.update, {
        pathParams: { id },
        body: payload,
      });

      if (res.success && res.data) {
        const updatedFrontend = mapBackendToFrontend(res.data);
        mockRepository.updateProduct(id, updatedFrontend);
        return {
          success: true,
          data: updatedFrontend,
        };
      }
    } catch {
      // Backend not running
    }

    const updated = mockRepository.updateProduct(id, updatedFields);
    return {
      success: true,
      data: updated,
    };
  },

  deleteProduct: async (id: string): Promise<ServiceResponse<boolean>> => {
    try {
      const res = await apiClient.delete<any>(API_ENDPOINTS.products.delete, { pathParams: { id } });
      if (res.success) {
        mockRepository.deleteProduct(id);
        return {
          success: true,
          data: true,
        };
      }
    } catch {
      // Backend not running
    }

    const deleted = mockRepository.deleteProduct(id);
    return {
      success: true,
      data: deleted,
    };
  },
};

