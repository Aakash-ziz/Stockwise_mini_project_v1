import type { 
  Product, 
  Transaction, 
  StockMovement, 
  ProductAnalyticsMetric, 
  ActionableInsight, 
  DashboardMetrics,
  SaleCartItem
} from '../types/inventory';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_STOCK_MOVEMENTS 
} from '../data/dummyData';
import { calculateStatus } from '../utils/status';

const STORAGE_KEYS = {
  products: 'stockwise_demo_products_v2',
  transactions: 'stockwise_demo_transactions_v2',
  movements: 'stockwise_demo_movements_v2',
};

class MockDataRepository {
  private products: Product[] = [];
  private transactions: Transaction[] = [];
  private movements: StockMovement[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  public init() {
    this.products = this.loadFromStorage<Product[]>(STORAGE_KEYS.products, INITIAL_PRODUCTS);
    this.transactions = this.loadFromStorage<Transaction[]>(STORAGE_KEYS.transactions, INITIAL_TRANSACTIONS);
    this.movements = this.loadFromStorage<StockMovement[]>(STORAGE_KEYS.movements, INITIAL_STOCK_MOVEMENTS);
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore localStorage read errors
    }
    return JSON.parse(JSON.stringify(fallback));
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.movements, JSON.stringify(this.movements));
    } catch {
      // Ignore localStorage write quota errors
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public resetDemoData() {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.movements = JSON.parse(JSON.stringify(INITIAL_STOCK_MOVEMENTS));
    this.saveToStorage();
  }

  public syncProducts(dbProducts: Product[]) {
    this.products = [...dbProducts];
    this.saveToStorage();
  }

  public syncTransactions(dbTransactions: Transaction[]) {
    this.transactions = [...dbTransactions];
    this.saveToStorage();
  }

  // --- Products ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | null {
    return this.products.find(p => p.id === id) || null;
  }

  public addProduct(p: Omit<Product, 'id' | 'status'>): Product {
    const newProduct: Product = {
      ...p,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: calculateStatus(p.quantity, p.minStock),
    };

    this.products = [newProduct, ...this.products];

    // Record stock movement
    this.movements.unshift({
      id: `mov-${Date.now()}`,
      productId: newProduct.id,
      sku: newProduct.sku,
      productName: newProduct.name,
      type: 'INITIAL',
      quantityDelta: newProduct.quantity,
      previousQuantity: 0,
      newQuantity: newProduct.quantity,
      date: new Date().toISOString().split('T')[0],
      note: 'Initial catalog creation',
    });

    this.saveToStorage();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const oldProduct = this.products[index];
    const newQty = updates.quantity !== undefined ? Math.max(0, updates.quantity) : oldProduct.quantity;
    const newMin = updates.minStock !== undefined ? Math.max(0, updates.minStock) : oldProduct.minStock;

    const updated: Product = {
      ...oldProduct,
      ...updates,
      quantity: newQty,
      minStock: newMin,
      status: calculateStatus(newQty, newMin),
    };

    this.products[index] = updated;

    if (updates.quantity !== undefined && updates.quantity !== oldProduct.quantity) {
      const diff = newQty - oldProduct.quantity;
      this.movements.unshift({
        id: `mov-${Date.now()}`,
        productId: updated.id,
        sku: updated.sku,
        productName: updated.name,
        type: diff > 0 ? 'RESTOCK' : 'ADJUSTMENT',
        quantityDelta: diff,
        previousQuantity: oldProduct.quantity,
        newQuantity: newQty,
        date: new Date().toISOString().split('T')[0],
        note: diff > 0 ? 'Manual inventory restock' : 'Manual stock adjustment',
      });
    }

    this.saveToStorage();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const target = this.products.find(p => p.id === id);
    if (!target) return false;

    this.products = this.products.filter(p => p.id !== id);
    this.saveToStorage();
    return true;
  }

  // --- Transactions ---
  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public processMultiItemSale(payload: {
    customer: string;
    items: SaleCartItem[];
    discount?: number;
    note?: string;
  }): { success: boolean; transaction?: Transaction; error?: string } {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Checkout cart cannot be empty.' };
    }

    // Verify stock availability for all items
    for (const item of payload.items) {
      const product = this.products.find(p => p.id === item.productId || p.sku === item.sku);
      if (!product) {
        return { success: false, error: `Product "${item.name}" not found in catalog.` };
      }
      if (product.quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`,
        };
      }
    }

    // Generate unique TXN ID
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const subtotal = payload.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountPct = Math.max(0, Math.min(100, payload.discount || 0));
    const grandTotal = Math.max(0, subtotal * (1 - discountPct / 100));
    const totalQty = payload.items.reduce((sum, item) => sum + item.quantity, 0);

    const transactionItems = payload.items.map(item => ({
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    // Summary description for primary columns
    const primaryProductName = payload.items.length === 1 
      ? payload.items[0].name 
      : `${payload.items[0].name} + ${payload.items.length - 1} more items`;

    const primarySku = payload.items.length === 1
      ? payload.items[0].sku
      : `${payload.items[0].sku} (+${payload.items.length - 1})`;

    const newTxn: Transaction = {
      id: txnId,
      productName: primaryProductName,
      sku: primarySku,
      customer: payload.customer || 'Guest Customer',
      quantity: totalQty,
      totalPrice: parseFloat(grandTotal.toFixed(2)),
      status: 'DELIVERED',
      date: today,
      items: transactionItems,
      discount: discountPct,
      note: payload.note || '',
    };

    // Deduct quantities and log stock movements
    payload.items.forEach(item => {
      const productIndex = this.products.findIndex(p => p.id === item.productId || p.sku === item.sku);
      if (productIndex !== -1) {
        const prod = this.products[productIndex];
        const newQty = Math.max(0, prod.quantity - item.quantity);
        this.products[productIndex] = {
          ...prod,
          quantity: newQty,
          status: calculateStatus(newQty, prod.minStock),
        };

        this.movements.unshift({
          id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          type: 'SALE',
          quantityDelta: -item.quantity,
          previousQuantity: prod.quantity,
          newQuantity: newQty,
          date: today,
          referenceId: txnId,
          note: `POS Checkout to ${payload.customer || 'Guest Customer'}`,
        });
      }
    });

    this.transactions = [newTxn, ...this.transactions];
    this.saveToStorage();

    return { success: true, transaction: newTxn };
  }

  // --- Movements ---
  public getMovements(): StockMovement[] {
    return [...this.movements];
  }

  public logStockMovement(mov: {
    productId: string;
    sku: string;
    productName: string;
    type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'INITIAL';
    quantityDelta: number;
    note?: string;
    referenceId?: string;
  }) {
    const product = this.products.find(p => p.id === mov.productId || p.sku === mov.sku);
    const prevQty = product ? product.quantity : 0;
    const newQty = prevQty + mov.quantityDelta;

    this.movements.unshift({
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: mov.productId,
      sku: mov.sku,
      productName: mov.productName,
      type: mov.type,
      quantityDelta: mov.quantityDelta,
      previousQuantity: prevQty,
      newQuantity: Math.max(0, newQty),
      date: new Date().toISOString().split('T')[0],
      referenceId: mov.referenceId,
      note: mov.note,
    });
    this.saveToStorage();
  }

  // --- Analytics & Insights Engine ---
  public getProductAnalytics(dateRangeDays?: number): ProductAnalyticsMetric[] {
    const products = this.getProducts();
    const transactions = this.getTransactions();

    const now = new Date();
    const cutoffDate = dateRangeDays ? new Date(now.getTime() - dateRangeDays * 24 * 60 * 60 * 1000) : null;

    return products.map(product => {
      let unitsSold = 0;
      let revenue = 0;
      let lastSaleDate: string | null = null;

      transactions.forEach(txn => {
        if (txn.status !== 'DELIVERED') return;
        const txnDate = new Date(txn.date);
        if (cutoffDate && txnDate < cutoffDate) return;

        // Check line items if present, else fallback to top-level
        if (txn.items && txn.items.length > 0) {
          txn.items.forEach(item => {
            if (item.productId === product.id || item.sku === product.sku) {
              unitsSold += item.quantity;
              revenue += item.quantity * item.unitPrice;
              if (!lastSaleDate || new Date(txn.date) > new Date(lastSaleDate)) {
                lastSaleDate = txn.date;
              }
            }
          });
        } else if (txn.sku === product.sku) {
          unitsSold += txn.quantity;
          revenue += txn.totalPrice;
          if (!lastSaleDate || new Date(txn.date) > new Date(lastSaleDate)) {
            lastSaleDate = txn.date;
          }
        }
      });

      const estimatedCost = unitsSold * product.purchasePrice;
      const grossProfit = revenue - estimatedCost;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      // Rate calculations (past 30 days basis)
      const daysEvaluated = dateRangeDays || 30;
      const avgDailySales = unitsSold > 0 ? unitsSold / daysEvaluated : 0;
      const daysUntilStockout = avgDailySales > 0 ? Math.floor(product.quantity / avgDailySales) : 999;
      const suggestedReorderQty = Math.max(0, Math.ceil(product.minStock * 2.5 - product.quantity));

      let performanceStatus: 'HIGH VELOCITY' | 'STABLE' | 'SLOWING' | 'DEAD STOCK' = 'SLOWING';
      if (unitsSold >= 15) performanceStatus = 'HIGH VELOCITY';
      else if (unitsSold >= 5) performanceStatus = 'STABLE';
      else if (unitsSold === 0 && product.quantity > 0) performanceStatus = 'DEAD STOCK';

      return {
        product,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        supplier: product.supplier,
        quantity: product.quantity,
        unitsSold,
        revenue: parseFloat(revenue.toFixed(2)),
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        grossMargin: parseFloat(grossMargin.toFixed(1)),
        lastSaleDate,
        avgDailySales: parseFloat(avgDailySales.toFixed(2)),
        daysUntilStockout,
        suggestedReorderQty,
        performanceStatus,
      };

    });
  }

  public getActionableInsights(): ActionableInsight[] {
    const metrics = this.getProductAnalytics();
    const insights: ActionableInsight[] = [];

    metrics.forEach(({ product, unitsSold, daysUntilStockout, suggestedReorderQty, grossMargin }) => {
      // 1. Out of stock
      if (product.quantity === 0) {
        insights.push({
          id: `insight-oos-${product.id}`,
          type: 'out_of_stock',
          title: `Stockout: ${product.name}`,
          description: `Zero available units in inventory. Reorder ${suggestedReorderQty || product.minStock * 2} units to resume sales.`,
          actionText: 'Restock Product',
          productId: product.id,
          severity: 'critical',
        });
      }
      // 2. Approaching Stockout
      else if (daysUntilStockout <= 7 && daysUntilStockout > 0) {
        insights.push({
          id: `insight-so-${product.id}`,
          type: 'approaching_stockout',
          title: `Runway Alert: ${product.name}`,
          description: `Selling rapidly with estimated ${daysUntilStockout} days until stockout. Reorder ${suggestedReorderQty} units.`,
          actionText: 'Order Re-supply',
          productId: product.id,
          severity: 'warning',
        });
      }
      // 3. Low Stock Threshold
      else if (product.quantity <= product.minStock) {
        insights.push({
          id: `insight-low-${product.id}`,
          type: 'restock',
          title: `Low Stock: ${product.name}`,
          description: `Current balance (${product.quantity}) is below safety threshold (${product.minStock}).`,
          actionText: 'Adjust Stock',
          productId: product.id,
          severity: 'warning',
        });
      }

      // 4. Excess Inventory
      if (product.quantity > product.minStock * 5 && product.quantity > 50) {
        insights.push({
          id: `insight-excess-${product.id}`,
          type: 'excess',
          title: `Excess Inventory: ${product.name}`,
          description: `Holding ${product.quantity} units (${product.quantity / product.minStock}x buffer). Consider promotional pricing or bundling.`,
          actionText: 'View Details',
          productId: product.id,
          severity: 'info',
        });
      }

      // 5. High Velocity / Best Seller
      if (unitsSold >= 20) {
        insights.push({
          id: `insight-bestseller-${product.id}`,
          type: 'best_seller',
          title: `Top Performer: ${product.name}`,
          description: `Sold ${unitsSold} units generating high demand velocity. Secure vendor discounts for bulk refills.`,
          actionText: 'View Performance',
          productId: product.id,
          severity: 'success',
        });
      }

      // 6. Low Margin
      if (unitsSold > 0 && grossMargin < 20) {
        insights.push({
          id: `insight-margin-${product.id}`,
          type: 'low_margin',
          title: `Thin Margin: ${product.name}`,
          description: `Current gross margin is ${grossMargin}%. Consider negotiating vendor pricing or adjusting retail price.`,
          actionText: 'Edit Pricing',
          productId: product.id,
          severity: 'info',
        });
      }
    });

    return insights;
  }

  public getDashboardVelocity(): DashboardMetrics['salesVelocity'] {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const velocityMap: Record<string, number> = {
      SUN: 0, MON: 0, TUE: 0, WED: 0, THU: 0, FRI: 0, SAT: 0
    };

    // Aggregate from past transactions
    this.transactions.forEach(t => {
      const d = new Date(t.date);
      const dayName = days[d.getDay()];
      velocityMap[dayName] = (velocityMap[dayName] || 0) + t.totalPrice;
    });

    const orderedDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    const maxVal = Math.max(...Object.values(velocityMap), 1);

    return orderedDays.map(day => ({
      day,
      value: Math.round(velocityMap[day] || (Math.random() * 2000 + 500)),
      highlighted: day === 'WED' || velocityMap[day] === maxVal,
    }));
  }
}

export const mockRepository = new MockDataRepository();
