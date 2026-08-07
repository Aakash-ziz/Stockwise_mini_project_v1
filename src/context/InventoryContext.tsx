import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, Transaction, ToastMessage } from '../types/inventory';
import { calculateStatus } from '../utils/status';
import { productService } from '../services/productService';
import { salesService } from '../services/salesService';

interface InventoryContextType {
  products: Product[];
  transactions: Transaction[];
  toasts: ToastMessage[];
  addProduct: (product: Omit<Product, 'id' | 'status' | 'thumbnailColor' | 'thumbnailIcon'>) => { success: boolean; error?: string };
  editProduct: (id: string, updatedFields: Omit<Product, 'id' | 'status' | 'sku' | 'thumbnailColor' | 'thumbnailIcon'>) => { success: boolean; error?: string };
  deleteProduct: (id: string) => void;
  addTransaction: (transaction: { productName: string; sku: string; customer: string; quantity: number; totalPrice: number }) => { success: boolean; error?: string };
  triggerToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  
  // Dashboard & Reports Statistics
  totalProductsCount: number; // Unique SKUs
  totalStockCount: number; // Sum of available quantities
  totalStockValue: number; // Sum of qty * sellingPrice
  lowStockCount: number; // Count of products where quantity <= minStock
  soldTodayCount: number; // Total item quantities sold in transactions today
  soldTodayRevenue: number; // Today's transactions revenue
  
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load inventory details asynchronously from services
  useEffect(() => {
    setLoading(true);
    Promise.all([
      productService.getProducts(),
      salesService.getSales()
    ])
      .then(([prodsRes, txsRes]) => {
        if (prodsRes.success && txsRes.success) {
          setProducts(prodsRes.data.map(p => ({
            ...p,
            status: calculateStatus(p.quantity, p.minStock)
          })));
          setTransactions(txsRes.data);
        } else {
          setError(prodsRes.error?.message || txsRes.error?.message || 'Failed to initialize inventory.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load inventory data.');
        setLoading(false);
      });
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Automatically remove after 4 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addProduct = (
    newP: Omit<Product, 'id' | 'status' | 'thumbnailColor' | 'thumbnailIcon'>
  ): { success: boolean; error?: string } => {
    // Check duplicate SKU
    const isDuplicate = products.some(p => p.sku.trim().toLowerCase() === newP.sku.trim().toLowerCase());
    if (isDuplicate) {
      return { success: false, error: 'SKU ID must be unique. This SKU is already registered.' };
    }

    // Dynamic icon assignment based on category
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
    t: { productName: string; sku: string; customer: string; quantity: number; totalPrice: number }
  ): { success: boolean; error?: string } => {
    // Find the product
    const targetProduct = products.find(p => p.sku === t.sku);
    if (!targetProduct) {
      return { success: false, error: 'Product SKU not found in inventory.' };
    }

    if (targetProduct.quantity < t.quantity) {
      return { success: false, error: `Insufficient stock. Only ${targetProduct.quantity} units available.` };
    }

    const salePayload = {
      productName: t.productName,
      sku: t.sku,
      customer: t.customer || 'Guest Customer',
      quantity: t.quantity,
      totalPrice: t.totalPrice
    };

    // Deduct stock quantity and process sale record through services
    salesService.createSale(salePayload).then(txnRes => {
      if (txnRes.success) {
        setTransactions(prev => [txnRes.data, ...prev]);

        const newQty = Math.max(0, targetProduct.quantity - t.quantity);
        productService.updateProduct(targetProduct.id, { quantity: newQty }).then(prodRes => {
          if (prodRes.success && prodRes.data) {
            setProducts(prev => prev.map(p => {
              if (p.id === targetProduct.id) {
                return {
                  ...prodRes.data!,
                  status: calculateStatus(prodRes.data!.quantity, prodRes.data!.minStock)
                };
              }
              return p;
            }));
          }
        });

        triggerToast(`Sale of ${t.quantity}x "${t.productName}" processed successfully.`);
      } else {
        triggerToast(`Failed to complete transaction: ${txnRes.error?.message}`, 'error');
      }
    }).catch(err => {
      triggerToast(`Failed to complete transaction: ${err.message || err}`, 'error');
    });

    return { success: true };
  };

  // Computations
  const totalProductsCount = products.length; // Unique SKUs
  const totalStockCount = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxns = transactions.filter(t => t.date === todayStr);
  const soldTodayCount = todayTxns.reduce((sum, t) => sum + t.quantity, 0);
  const soldTodayRevenue = todayTxns.reduce((sum, t) => sum + t.totalPrice, 0);

  return (
    <InventoryContext.Provider value={{
      products,
      transactions,
      toasts,
      addProduct,
      editProduct,
      deleteProduct,
      addTransaction,
      triggerToast,
      dismissToast,
      
      totalProductsCount,
      totalStockCount,
      totalStockValue,
      lowStockCount,
      soldTodayCount,
      soldTodayRevenue,
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
