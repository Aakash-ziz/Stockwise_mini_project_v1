import type { IDashboardService, DashboardMetrics, ServiceResponse, SalesVelocityItem } from '../types/inventory';
import { DUMMY_DASHBOARD_METRICS } from '../data/dummyData';
import { salesService } from './salesService';
import { productService } from './productService';

export const dashboardService: IDashboardService = {
  getDashboardMetrics: async (): Promise<ServiceResponse<DashboardMetrics>> => {
    try {
      // 1. Get products list to calculate stock health distribution metrics
      const prodRes = await productService.getProducts();
      let optimal = 70;
      let overstocked = 15;
      let critical = 15;

      if (prodRes.success && prodRes.data) {
        const items = prodRes.data;
        const total = items.length;
        if (total > 0) {
          critical = items.filter((p: any) => p.quantity <= p.minStock).length;
          overstocked = items.filter((p: any) => p.quantity > p.minStock * 4).length;
          const optimalCount = Math.max(0, total - critical - overstocked);

          optimal = Math.round((optimalCount / total) * 100);
          overstocked = Math.round((overstocked / total) * 100);
          critical = Math.round((critical / total) * 100);
        }
      }

      // 2. Get sales list to compile sales velocity graph values
      const salesRes = await salesService.getSales();
      const salesVelocity: SalesVelocityItem[] = [
        { day: 'MON', value: 1250 },
        { day: 'TUE', value: 2400 },
        { day: 'WED', value: 4850 },
        { day: 'THU', value: 3100 },
        { day: 'FRI', value: 3950 },
        { day: 'SAT', value: 1800 },
        { day: 'SUN', value: 1420 },
      ];

      if (salesRes.success && salesRes.data && salesRes.data.length > 0) {
        const items = salesRes.data;
        items.forEach((item) => {
          const dateStr = item.date;
          if (dateStr) {
            const date = new Date(dateStr);
            const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday...
            const targetIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            salesVelocity[targetIndex].value += Number(item.totalPrice || 0);
          }
        });

        salesVelocity.forEach((v) => {
          v.value = Math.round(v.value);
        });

        let maxVal = -1;
        let maxIndex = -1;
        salesVelocity.forEach((item, index) => {
          if (item.value > maxVal) {
            maxVal = item.value;
            maxIndex = index;
          }
        });

        if (maxIndex !== -1) {
          salesVelocity[maxIndex].highlighted = true;
        }
      }

      return {
        success: true,
        data: {
          salesVelocity,
          stockHealth: {
            optimal,
            overstocked,
            critical,
          },
        },
      };
    } catch {
      return {
        success: true,
        data: DUMMY_DASHBOARD_METRICS,
      };
    }
  },
};
