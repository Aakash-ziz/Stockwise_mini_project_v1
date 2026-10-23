import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Product, 
  Transaction, 
  ToastMessage, 
  StockMovement, 
  SaleCartItem,
  ProductAnalyticsMetric,
  ActionableInsight 
} from '../types/inventory';
import { calculateStatus } from '../utils/status';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';
import { mockRepository } from '../data/mockRepository';

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  movements: StockMovement[];
  toasts: ToastMessage[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'thumbnailColor' | 'thumbnailIcon'>) => { success: boolean; error?: string };
  editProduct: (id: string, updatedFields: Omit<Product, 'id' | 'status' | 'sku' | 'thumbnailColor' | 'thumbnailIcon'>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: { productName: string; sku: string; customer: string; quantity: number; totalPrice: number; discount?: number; note?: string }) => { success: boolean; error?: string };
  processCheckout: (payload: { customer: string; items: SaleCartItem[]; discount?: number; note?: string }) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  resetDemoData: () => void;
  refreshData: () => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  
  // Dashboard & Reports Statistics
  totalProductsCount: number; // Unique SKUs
  totalStockCount: number; // Sum of available quantities
  totalStockValue: number; // Sum of qty * sellingPrice
  totalEstimatedCost: number; // Sum of qty * purchasePrice
  lowStockCount: number; // Count of products where quantity <= minStock
  outOfStockCount: number; // Count of products where quantity === 0
  soldTodayCount: number; // Total item quantities sold in transactions today
  soldTodayRevenue: number; // Today's transactions revenue
  
  // Advanced Analytics Helpers
  getProductAnalytics: (days?: number) => ProductAnalyticsMetric[];
  getActionableInsights: () => ActionableInsight[];
  
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [prodsRes, txsRes] = await Promise.all([
        productService.getProducts(),
        salesService.getSales()
      ]);

      if (prodsRes.success && txsRes.success) {
        const mappedProducts = prodsRes.data.map(p => ({
          ...p,
          status: calculateStatus(p.quantity, p.minStock)
        }));
        setProducts(mappedProducts);
        setTransactions(txsRes.data);
        mockRepository.syncProducts(mappedProducts);
        mockRepository.syncTransactions(txsRes.data);
        setMovements(mockRepository.getMovements());
      } else {
        setError(prodsRes.error?.message || txsRes.error?.message || 'Failed to initialize inventory.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetDemoData = () => {
    mockRepository.resetDemoData();
    loadData();
    triggerToast('Demo dataset has been reset to default values.', 'info');
  };

  const addProduct = (
    newP: Omit<Product, 'id' | 'status' | 'thumbnailColor' | 'thumbnailIcon'>
  ): { success: boolean; error?: string } => {
    const isDuplicate = products.some(p => p.sku.trim().toLowerCase() === newP.sku.trim().toLowerCase());
    if (isDuplicate) {
      return { success: false, error: 'SKU ID must be unique. This SKU is already registered.' };
    }

    let thumbnailIcon = 'keyboard';
    const catLower = newP.category.toLowerCase();
    if (catLower.includes('electron')) thumbnailIcon = 'laptop';
    else if (catLower.includes('mouse') || catLower.includes('periph')) thumbnailIcon = 'mouse';
    else if (catLower.includes('monit') || catLower.includes('hardw')) thumbnailIcon = 'monitor';
    else if (catLower.includes('stand') || catLower.includes('accessor')) thumbnailIcon = 'stand';
    else if (catLower.includes('mat') || catLower.includes('station')) thumbnailIcon = 'mat';

    const payload: Omit<Product, 'id' | 'status'> = {
      ...newP,
      thumbnailColor: newP.quantity % 2 === 0 ? '#F3F4F6' : '#E5E7EB',
      thumbnailIcon
    };

    productService.createProduct(payload).then(res => {
      if (res.success) {
        setProducts(prev => [
          {
            ...res.data,
            status: calculateStatus(res.data.quantity, res.data.minStock)
          },
          ...prev
        ]);
        triggerToast(`Product "${res.data.name}" added successfully.`);
      } else {
        triggerToast(`Failed to add product: ${res.error?.message}`, 'error');
      }
    }).catch(err => {
      triggerToast(`Failed to add product: ${err.message || err}`, 'error');
    });

    return { success: true };
  };

  const editProduct = (
    id: string,
    updatedFields: Omit<Product, 'id' | 'status' | 'sku' | 'thumbnailColor' | 'thumbnailIcon'>
  ): { success: boolean; error?: string } => {
    const existing = products.find(p => p.id === id);
    if (!existing) {
      return { success: false, error: 'Product not found.' };
    }

    productService.updateProduct(id, updatedFields).then(res => {
      if (res.success && res.data) {
        setProducts(prev => prev.map(p => {
          if (p.id === id) {
            return {
              ...res.data!,
              status: calculateStatus(res.data!.quantity, res.data!.minStock)
            };
          }
          return p;
        }));
        triggerToast(`Product "${res.data.name}" updated successfully.`);
      } else {
        triggerToast(`Failed to update product: ${res.error?.message}`, 'error');
      }
    }).catch(err => {
      triggerToast(`Failed to update product: ${err.message || err}`, 'error');
    });

    return { success: true };
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    productService.deleteProduct(id).then(res => {
      if (res.success && res.data) {
        setProducts(prev => prev.filter(p => p.id !== id));
        triggerToast(`Product "${target.name}" was deleted from inventory.`, 'info');
      } else {
        triggerToast(`Failed to delete product: ${res.error?.message}`, 'error');
      }
    }).catch(err => {
      triggerToast(`Failed to delete product: ${err.message || err}`, 'error');
    });
  };

  const addTransaction = (
    t: { productName: string; sku: string; customer: string; quantity: number; totalPrice: number; discount?: number; note?: string }
  ): { success: boolean; error?: string } => {
    const targetProduct = products.find(p => p.sku === t.sku);
    if (!targetProduct) {
      return { success: false, error: 'Product SKU not found in inventory.' };
    }

    if (targetProduct.quantity < t.quantity) {
      return { success: false, error: `Insufficient stock. Only ${targetProduct.quantity} units available.` };
    }

    const cartItem: SaleCartItem = {
      productId: targetProduct.id,
      name: targetProduct.name,
      sku: targetProduct.sku,
      quantity: t.quantity,
      unitPrice: targetProduct.sellingPrice,
      total: t.totalPrice,
    };

    processCheckout({
      customer: t.customer,
      items: [cartItem],
      discount: t.discount,
      note: t.note,
    });

    return { success: true };
  };

  const processCheckout = async (payload: {
    customer: string;
    items: SaleCartItem[];
    discount?: number;
    note?: string;
  }): Promise<{ success: boolean; error?: string; transaction?: Transaction }> => {
    try {
      const res = await salesService.processCheckout(payload);
      if (res.success && res.data) {
        triggerToast(`Checkout completed: Invoice ${res.data.id} generated for ${payload.customer || 'Guest'}.`);
        loadData();
        return { success: true, transaction: res.data };
      } else {
        const errMsg = res.error?.message || 'Transaction checkout failed.';
        triggerToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.message || 'Checkout error';
      triggerToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  // Computations
  const totalProductsCount = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
  const totalEstimatedCost = products.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxns = transactions.filter(t => t.date === todayStr);
  const soldTodayCount = todayTxns.reduce((sum, t) => sum + t.quantity, 0);
  const soldTodayRevenue = todayTxns.reduce((sum, t) => sum + t.totalPrice, 0);

  const getProductAnalytics = (days?: number) => mockRepository.getProductAnalytics(days);
  const getActionableInsights = () => mockRepository.getActionableInsights();

  return (
    <InventoryContext.Provider value={{
      products,
      transactions,
      movements,
      toasts,
      addProduct,
      editProduct,
      deleteProduct,
      addTransaction,
      processCheckout,
      resetDemoData,
      refreshData: loadData,
      triggerToast,
      dismissToast,
      
      totalProductsCount,
      totalStockCount,
      totalStockValue,
      totalEstimatedCost,
      lowStockCount,
      outOfStockCount,
      soldTodayCount,
      soldTodayRevenue,
      
      getProductAnalytics,
      getActionableInsights,
      
      loading,
      error
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

