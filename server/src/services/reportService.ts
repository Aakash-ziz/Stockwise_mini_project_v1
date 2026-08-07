import { prisma } from '../config/database.js';

export const reportService = {
  getSummary: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      categoryCount,
      supplierCount,
      inventoryItems,
      lowStockAlerts,
      outOfStockCount,
      todaySales,
      monthSales,
      totalSales,
    ] = await Promise.all([
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.category.count({ where: { deletedAt: null } }),
      prisma.supplier.count(),
      prisma.inventory.findMany({
        where: { deletedAt: null },
        include: { product: true },
      }),
      prisma.inventory.count({
        where: {
          quantity: { gt: 0 },
          product: { deletedAt: null },
          status: 'LOW STOCK',
        },
      }),
      prisma.inventory.count({
        where: {
          quantity: 0,
          product: { deletedAt: null },
        },
      }),
      prisma.sale.findMany({
        where: {
          date: { gte: todayStart },
          deletedAt: null,
        },
        select: { totalPrice: true },
      }),
      prisma.sale.findMany({
        where: {
          date: { gte: monthStart },
          deletedAt: null,
        },
        select: { totalPrice: true },
      }),
      prisma.sale.findMany({
        where: {
          deletedAt: null,
        },
        select: { totalPrice: true },
      }),
    ]);

    // Revenue calculations
    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const monthlyRevenue = monthSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    const totalRevenue = totalSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);

    // Inventory Value calculations
    let totalStockValue = 0; // Cost Value
    let totalSellingValue = 0; // Selling Value

    inventoryItems.forEach((item) => {
      const cost = item.product.purchasePrice ? Number(item.product.purchasePrice) : 0;
      const sell = item.product.sellingPrice ? Number(item.product.sellingPrice) : 0;

      totalStockValue += item.quantity * cost;
      totalSellingValue += item.quantity * sell;
    });

    const totalProfitPotential = totalSellingValue - totalStockValue;
    const profitMargin =
      totalSellingValue > 0 ? (totalProfitPotential / totalSellingValue) * 100 : 0;

    return {
      totalProducts,
      categoryCount,
      supplierCount,
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalStockValue: parseFloat(totalStockValue.toFixed(2)),
      totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
      totalProfitPotential: parseFloat(totalProfitPotential.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      lowStockAlerts,
      outOfStockCount,
    };
  },

  getTodayRevenue: async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: todayStart },
        deletedAt: null,
      },
      select: { totalPrice: true },
    });

    const total = sales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    return parseFloat(total.toFixed(2));
  },

  getMonthlyRevenue: async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: monthStart },
        deletedAt: null,
      },
      select: { totalPrice: true },
    });

    const total = sales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    return parseFloat(total.toFixed(2));
  },

  getTotalRevenue: async () => {
    const sales = await prisma.sale.findMany({
      where: {
        deletedAt: null,
      },
      select: { totalPrice: true },
    });

    const total = sales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    return parseFloat(total.toFixed(2));
  },

  getCategoryCount: async () => {
    return prisma.category.count({ where: { deletedAt: null } });
  },

  getSupplierCount: async () => {
    return prisma.supplier.count();
  },

  getInventoryValuation: async () => {
    const inventoryItems = await prisma.inventory.findMany({
      where: { deletedAt: null },
      include: { product: true },
    });

    let totalCostValue = 0;
    let totalSellingValue = 0;

    inventoryItems.forEach((item) => {
      const cost = item.product.purchasePrice ? Number(item.product.purchasePrice) : 0;
      const sell = item.product.sellingPrice ? Number(item.product.sellingPrice) : 0;

      totalCostValue += item.quantity * cost;
      totalSellingValue += item.quantity * sell;
    });

    return {
      totalCostValue: parseFloat(totalCostValue.toFixed(2)),
      totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
    };
  },

  getProfitabilityMetrics: async () => {
    const inventoryValuation = await reportService.getInventoryValuation();
    const totalProfitPotential =
      inventoryValuation.totalSellingValue - inventoryValuation.totalCostValue;
    const profitMargin =
      inventoryValuation.totalSellingValue > 0
        ? (totalProfitPotential / inventoryValuation.totalSellingValue) * 100
        : 0;

    return {
      totalProfitPotential: parseFloat(totalProfitPotential.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
    };
  },

  getPerformance: async (limit: number = 5) => {
    const aggregations = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const performanceList = await Promise.all(
      aggregations.map(async (agg) => {
        const product = await prisma.product.findUnique({
          where: { id: agg.productId },
          include: { category: true },
        });
        return {
          productId: agg.productId,
          name: product?.name || 'Unknown Product',
          sku: product?.sku || '',
          categoryName: product?.category.name || '',
          unitsSold: agg._sum.quantity || 0,
        };
      })
    );

    return performanceList;
  },

  getTopRevenueProducts: async (limit: number = 5) => {
    const saleItems = await prisma.saleItem.findMany({
      where: { deletedAt: null },
      select: {
        productId: true,
        quantity: true,
        unitPrice: true,
      },
    });

    // Aggregate total revenue (qty * unitPrice) by product
    const revenueMap: Record<string, number> = {};
    saleItems.forEach((item) => {
      const revenue = item.quantity * Number(item.unitPrice);
      revenueMap[item.productId] = (revenueMap[item.productId] || 0) + revenue;
    });

    // Sort and limit
    const sorted = Object.entries(revenueMap)
      .map(([productId, totalRevenue]) => ({ productId, totalRevenue }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    const topRevenueList = await Promise.all(
      sorted.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          sku: product?.sku || '',
          categoryName: product?.category.name || '',
          totalRevenue: parseFloat(item.totalRevenue.toFixed(2)),
        };
      })
    );

    return topRevenueList;
  },
};
