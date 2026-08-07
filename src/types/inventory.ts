export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  status: 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK';
  minStock: number; // minimum stock threshold to trigger low stock alert
  thumbnailColor: string; // color for visual mockup representation
  thumbnailIcon: string;  // icon type for rendering
}

export interface Transaction {
  id: string;
  productName: string;
  sku: string;
  customer: string;
  quantity: number;
  totalPrice: number;
  status: 'DELIVERED' | 'PROCESSING' | 'ON HOLD';
  date: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  customerName: string;
  discount: number;
  note: string;
  date: string;
  totalPrice: number;
}

export interface SalesVelocityItem {
  day: string;
  value: number;
  highlighted?: boolean;
}

export interface StockHealth {
  optimal: number;
  overstocked: number;
  critical: number;
}

export interface ReportsSummary {
  totalStockValue: number;
  totalStockValueGrowth: string;
  lowStockAlerts: number;
  lowStockLevel: 'Critical' | 'Warning';
  inventoryTurnover: number;
  inventoryTurnoverStatus: string;
  deadStockRate: number;
  deadStockRateGrowth: string;
  deadStockImpact: string;
}

export interface ProductPerformance {
  productName: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  status: 'HIGH VELOCITY' | 'STABLE' | 'SLOWING';
  thumbnailColor: string;
  thumbnailIcon?: string;
}

export interface UrgentAction {
  id: string;
  type: 'low_stock' | 'excess_inventory' | 'audit_required';
  title: string;
  description: string;
  actionText: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface DashboardMetrics {
  salesVelocity: SalesVelocityItem[];
  stockHealth: StockHealth;
}

export interface ReportSummaryPayload {
  summary: ReportsSummary;
  performance: ProductPerformance[];
  urgentActions: UrgentAction[];
}

export interface InventoryOverview {
  products: Product[];
  transactions: Transaction[];
}

export interface IProductService {
  getProducts(): Promise<ServiceResponse<Product[]>>;
  getProductById(id: string): Promise<ServiceResponse<Product | null>>;
  createProduct(product: Omit<Product, 'id' | 'status'>): Promise<ServiceResponse<Product>>;
  updateProduct(id: string, updatedFields: Partial<Product>): Promise<ServiceResponse<Product | null>>;
  deleteProduct(id: string): Promise<ServiceResponse<boolean>>;
}

export interface ISalesService {
  getSales(): Promise<ServiceResponse<Transaction[]>>;
  createSale(sale: Omit<Transaction, 'id' | 'date' | 'status'>): Promise<ServiceResponse<Transaction>>;
}

export interface IDashboardService {
  getDashboardMetrics(): Promise<ServiceResponse<DashboardMetrics>>;
}

export interface IReportService {
  getReportSummary(): Promise<ServiceResponse<ReportSummaryPayload>>;
}

export interface IInventoryService {
  getInventoryOverview(): Promise<ServiceResponse<InventoryOverview>>;
}

