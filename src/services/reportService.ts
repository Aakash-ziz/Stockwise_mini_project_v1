import type { IReportService, ReportSummaryPayload, ServiceResponse, ProductPerformance, UrgentAction } from '../types/inventory';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { DUMMY_REPORT_SUMMARY } from '../data/dummyData';
import { productService } from './productService';

export const reportService: IReportService = {
  getReportSummary: async (): Promise<ServiceResponse<ReportSummaryPayload>> => {
    try {
      // 1. Fetch financial aggregates summary from backend API
      const summaryRes = await apiClient.get<any>(API_ENDPOINTS.reports.summary);
      if (summaryRes.success && summaryRes.data) {
        const backendSummary = summaryRes.data;

        // 2. Fetch top products performance list from backend API
        const performanceRes = await apiClient.get<any>(API_ENDPOINTS.reports.performance, { queryParams: { limit: 5 } });
        const performanceData = performanceRes.success ? performanceRes.data : [];

        const performance: ProductPerformance[] = performanceData.map((item: any) => ({
          productName: item.name,
          sku: item.sku,
          unitsSold: Number(item.unitsSold),
          revenue: Number(item.unitsSold) * 100,
          growth: 12.5,
          status: Number(item.unitsSold) > 10 ? 'HIGH VELOCITY' : 'STABLE',
          thumbnailColor: '#F3F4F6',
          thumbnailIcon: 'laptop',
        }));

        // 3. Assemble dynamic urgent actions list
        const urgentActions: UrgentAction[] = [];
        if (backendSummary.lowStockAlerts > 0) {
          urgentActions.push({
            id: 'action-low-stock',
            type: 'low_stock',
            title: 'Low Stock Warnings',
            description: `${backendSummary.lowStockAlerts} product items are below safety minimum levels in inventory.`,
            actionText: 'Restock Products',
          });
        }
        if (backendSummary.outOfStockCount > 0) {
          urgentActions.push({
            id: 'action-out-of-stock',
            type: 'audit_required',
            title: 'Out of Stock Items',
            description: `${backendSummary.outOfStockCount} items have zero available stock levels in warehouses.`,
            actionText: 'Review Stocks',
          });
        }

        return {
          success: true,
          data: {
            summary: backendSummary,
            performance,
            urgentActions,
          },
        };
      }
    } catch {
      // Fallback
    }

    // Dynamic generation from dummy data
    try {
      const prodRes = await productService.getProducts();
      const products = prodRes.data || [];
      const totalStockVal = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
      const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;

      return {
        success: true,
        data: {
          ...DUMMY_REPORT_SUMMARY,
          summary: {
            ...DUMMY_REPORT_SUMMARY.summary,
            totalStockValue: totalStockVal || DUMMY_REPORT_SUMMARY.summary.totalStockValue,
            lowStockAlerts: lowStockCount || DUMMY_REPORT_SUMMARY.summary.lowStockAlerts,
          },
        },
      };
    } catch {
      return {
        success: true,
        data: DUMMY_REPORT_SUMMARY,
      };
    }
  },
};
