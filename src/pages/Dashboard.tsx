import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PackageOpen, 
  Coins, 
  AlertTriangle, 
  ShoppingCart, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { useInventory } from '../context/InventoryContext';
import { dashboardService } from '../services/dashboardService';
import type { SalesVelocityItem } from '../types/inventory';
import { formatCurrencyCompact, formatCurrencyPrice } from '../utils/format';
import { PageSkeleton, ErrorState } from '../components/feedback';

export const Dashboard: React.FC = () => {
  const { 
    products, 
    totalProductsCount, 
    totalStockCount, 
    totalStockValue, 
    lowStockCount, 
    soldTodayCount,
    loading,
    error
  } = useInventory();

  const [recentPage, setRecentPage] = useState(0);
  const itemsPerPage = 4;
  const [salesVelocity, setSalesVelocity] = useState<SalesVelocityItem[]>([]);

  useEffect(() => {
    dashboardService.getDashboardMetrics().then(res => {
      if (res.success) {
        setSalesVelocity(res.data.salesVelocity);
      }
    });
  }, []);


  // Calculate stock health distribution dynamically
  const total = products.length;
  const criticalCount = products.filter(p => p.quantity <= p.minStock).length;
  const overstockedCount = products.filter(p => p.quantity > p.minStock * 4).length;
  
  const criticalPct = total > 0 ? Math.round((criticalCount / total) * 100) : 0;
  const overstockedPct = total > 0 ? Math.round((overstockedCount / total) * 100) : 0;
  const optimalPct = total > 0 ? Math.max(0, 100 - criticalPct - overstockedPct) : 0;


  // Slice recent products based on pagination
  const paginatedRecent = products.slice(recentPage * itemsPerPage, (recentPage + 1) * itemsPerPage);

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (error) {
    return <ErrorState title="Inventory Loading Failed" message={error} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="headline-lg text-brand-primary">Dashboard Overview</h1>
        <p className="body-md text-brand-secondary mt-1">Real-time status of your inventory and sales performance.</p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL PRODUCTS */}
        <Card level={1} className="p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="label-caps text-brand-secondary font-bold">Total Products</span>
            <PackageOpen className="h-5 w-5 text-brand-secondary" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-brand-primary">{totalProductsCount}</div>
            <div className="text-xs text-brand-secondary font-medium mt-1">
              <span className="text-brand-primary font-semibold">{totalStockCount}</span> units in total stock
            </div>
          </div>
        </Card>

        {/* TOTAL STOCK VALUE */}
        <Card level={1} className="p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="label-caps text-brand-secondary font-bold">Total Stock Value</span>
            <Coins className="h-5 w-5 text-brand-secondary" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-brand-primary">{formatCurrencyCompact(totalStockValue)}</div>
            <div className="text-xs text-brand-secondary font-medium mt-1">
              <span className="text-status-stock-text font-semibold">+0.8%</span> market fluctuation
            </div>
          </div>
        </Card>

        {/* LOW STOCK ITEMS */}
        <Card level={1} className="p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="label-caps text-brand-secondary font-bold">Low Stock Items</span>
            <AlertTriangle className="h-5 w-5 text-status-out-text" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-brand-primary">{lowStockCount}</div>
            <div className="text-xs font-semibold text-status-out-text mt-1">
              Reorder required for {lowStockCount} SKUs
            </div>
          </div>
        </Card>

        {/* SOLD TODAY */}
        <Card level={1} className="p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="label-caps text-brand-secondary font-bold">Sold Today</span>
            <ShoppingCart className="h-5 w-5 text-brand-secondary" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-brand-primary">{soldTodayCount}</div>
            <div className="text-xs text-brand-secondary font-medium mt-1">
              <span className="text-brand-primary font-bold">84%</span> of daily target met
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Products Card */}
      <Card level={1} className="overflow-hidden">
        <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border">
          <h2 className="headline-sm text-brand-primary font-bold">Recent Products</h2>
          <Link to="/products" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <Table>
          <TableHead>
            <TableRow isHeader>
              <TableCell isHeader className="w-[30%]">Product Name</TableCell>
              <TableCell isHeader className="w-[15%]">SKU ID</TableCell>
              <TableCell isHeader className="w-[15%]">Category</TableCell>
              <TableCell isHeader className="w-[15%]">Quantity</TableCell>
              <TableCell isHeader className="w-[15%]">Unit Price</TableCell>
              <TableCell isHeader className="w-[10%]">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRecent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-brand-tertiary">
                  No products registered.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecent.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductThumbnail type={p.thumbnailIcon} color={p.thumbnailColor} />
                      <span className="font-semibold text-brand-primary body-md">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell isMonospace>{p.sku}</TableCell>
                  <TableCell className="text-brand-secondary font-medium">{p.category}</TableCell>
                  <TableCell className="font-medium">{p.quantity}</TableCell>
                  <TableCell className="font-semibold">{formatCurrencyPrice(p.sellingPrice)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer info & simple pagination */}
        {products.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-neutral-50/30 dark:bg-brand-border/10">
            <span className="caption text-brand-secondary">
              Showing {recentPage * itemsPerPage + 1} to {Math.min((recentPage + 1) * itemsPerPage, products.length)} of {products.length} products
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setRecentPage(p => Math.max(0, p - 1))}
                disabled={recentPage === 0}
                className="p-1 border border-brand-border rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-brand-secondary" />
              </button>
              <button 
                onClick={() => setRecentPage(p => Math.min(Math.ceil(products.length / itemsPerPage) - 1, p + 1))}
                disabled={(recentPage + 1) * itemsPerPage >= products.length}
                className="p-1 border border-brand-border rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4 text-brand-secondary" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Charts & Health Widgets Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Velocity Chart */}
        <Card level={1} className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-brand-primary font-bold">Sales Velocity</h2>
            <div className="flex items-center gap-1 px-2.5 py-1 border border-brand-border rounded text-xs text-brand-secondary font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-brand-border/30 select-none">
              <span>Last 7 Days</span>
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="flex items-end justify-between h-48 px-4 border-b border-brand-border pb-2 relative">
            {salesVelocity.map((item, idx) => {
              // Scale height based on percentage
              const heightPct = `${item.value}%`;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  {/* Hover tooltip show value */}
                  <div className="h-full w-12 md:w-16 flex items-end justify-center group relative">
                    <div 
                      className={`w-10 rounded-sm transition-all duration-300 ${
                        item.highlighted 
                          ? 'bg-brand-primary' 
                          : 'bg-neutral-200 dark:bg-brand-border group-hover:bg-neutral-300 dark:group-hover:bg-brand-tertiary'
                      }`}
                      style={{ height: heightPct }}
                    />
                    {/* Tooltip value */}
                    <div className="absolute opacity-0 group-hover:opacity-100 bg-brand-primary text-brand-bg text-[10px] px-1.5 py-0.5 rounded -top-8 transition-opacity duration-150 shadow-sm pointer-events-none font-semibold">
                      {item.value} units
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-4 pt-2 text-[10px] font-bold text-brand-secondary tracking-wider">
            {salesVelocity.map((item, idx) => (
              <span key={idx} className="w-12 md:w-16 text-center">{item.day}</span>
            ))}
          </div>
        </Card>

        {/* Stock Health Progress Bars */}
        <Card level={1} className="p-6 flex flex-col justify-between h-full">
          <div>
            <h2 className="headline-sm text-brand-primary font-bold">Stock Health</h2>
            <p className="caption text-brand-secondary mt-1">Categorical distribution of inventory status.</p>
            
            {/* Progress Bars Stack */}
            <div className="flex flex-col gap-5 mt-6">
              {/* Optimal Stock */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-brand-primary mb-1.5">
                  <span>Optimal Stock</span>
                  <span>{optimalPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary rounded-full" 
                    style={{ width: `${optimalPct}%` }}
                  />
                </div>
              </div>

              {/* Overstocked */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-brand-primary mb-1.5">
                  <span>Overstocked</span>
                  <span>{overstockedPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-300 dark:bg-neutral-600 rounded-full" 
                    style={{ width: `${overstockedPct}%` }}
                  />
                </div>
              </div>

              {/* Low/Critical */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-brand-primary mb-1.5">
                  <span className="text-status-out-text">Low/Critical</span>
                  <span className="text-status-out-text">{criticalPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-status-out-text rounded-full" 
                    style={{ width: `${criticalPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/reports" className="block w-full">
              <Button variant="secondary" className="w-full py-2.5">
                Generate Full Report
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
