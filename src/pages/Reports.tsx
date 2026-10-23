import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  FileDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  AlertTriangle,
  Package,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Dropdown } from '../components/Dropdown';
import { useInventory } from '../context/InventoryContext';
import { reportService } from '../services/reportService';
import { ProductThumbnail } from '../components/ProductThumbnail';
import type { ProductPerformance, ReportsSummary, UrgentAction } from '../types/inventory';
import { useTable } from '../hooks/useTable';
import { TIMELINES } from '../constants/inventory';
import { formatCurrency } from '../utils/format';
import { PageSkeleton, ErrorState, EmptyState } from '../components/feedback';

export const Reports: React.FC = () => {
  const { 
    products, 
    transactions,
    totalStockValue,
    lowStockCount,
    loading,
    error
  } = useInventory();

  const [selectedTimeline, setSelectedTimeline] = useState('Last 30 Days');
  const [reportsSummary, setReportsSummary] = useState<ReportsSummary>({
    totalStockValue: 1284490,
    totalStockValueGrowth: '+4.2%',
    lowStockAlerts: 14,
    lowStockLevel: 'Critical',
    inventoryTurnover: 5.2,
    inventoryTurnoverStatus: 'Optimal',
    deadStockRate: 2.4,
    deadStockRateGrowth: '-0.8%',
    deadStockImpact: '₹30.8k'
  });
  const [urgentActions, setUrgentActions] = useState<UrgentAction[]>([]);

  useEffect(() => {
    reportService.getReportSummary().then(res => {
      if (res.success) {
        setReportsSummary(res.data.summary);
        setUrgentActions(res.data.urgentActions);
      }
    });
  }, []);

  // Compute dynamic performance dataset
  const performanceData = useMemo(() => {
    return products.map(p => {
      // Aggregate units sold from transaction history (accounting for multi-item carts)
      let unitsSold = 0;
      let revenue = 0;

      transactions.forEach(t => {
        if (t.status !== 'DELIVERED') return;
        if (t.items && t.items.length > 0) {
          t.items.forEach(item => {
            if (item.productId === p.id || item.sku === p.sku) {
              unitsSold += item.quantity;
              revenue += item.quantity * item.unitPrice;
            }
          });
        } else if (t.sku === p.sku) {
          unitsSold += t.quantity;
          revenue += t.totalPrice;
        }
      });
      
      // Determine velocity status based on sales quantity
      let status: 'HIGH VELOCITY' | 'STABLE' | 'SLOWING' = 'SLOWING';
      if (unitsSold > 10) status = 'HIGH VELOCITY';
      else if (unitsSold > 0) status = 'STABLE';

      // Provide dynamic growth based on units sold
      const growth = unitsSold > 5 ? 12.4 : unitsSold > 0 ? 1.2 : -4.1;

      return {
        productName: p.name,
        sku: p.sku,
        unitsSold,
        revenue,
        growth,
        status,
        thumbnailColor: p.thumbnailColor,
        thumbnailIcon: p.thumbnailIcon
      };
    });
  }, [products, transactions]);

  // Paginated and sorted performance table using useTable hook
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    sortedData: sortedPerformance,
    paginatedData: paginatedPerformance,
    handleSort,
    renderSortIndicator
  } = useTable<ProductPerformance>({
    data: performanceData,
    initialPageSize: 5
  });


  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  if (error) {
    return <ErrorState title="Reports Load Failed" message={error} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="headline-lg text-brand-primary">Reports & Analytics</h1>
          <p className="body-md text-brand-secondary mt-1">Comprehensive overview of inventory health and movement.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Dropdown
            value={selectedTimeline}
            options={TIMELINES as unknown as string[]}
            onChange={(val) => setSelectedTimeline(val)}
            icon={<Calendar className="h-4 w-4 text-brand-secondary" />}
            ariaLabel="Timeline select"
          />

          <Button 
            variant="secondary" 
            onClick={() => {
              const headers = ['Product Name', 'SKU', 'Units Sold', 'Revenue', 'Growth (%)', 'Status'];
              const rows = sortedPerformance.map(p => [
                `"${p.productName}"`,
                p.sku,
                p.unitsSold,
                p.revenue,
                `${p.growth}%`,
                p.status
              ]);
              const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `StockWise_Report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>


      {/* Inventory Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Stock Value */}
        <Card level={1} className="p-5 flex flex-col justify-between h-44">
          <div className="flex flex-col">
            <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Total Stock Value</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-brand-primary">
                {formatCurrency(totalStockValue)}
              </span>
              <span className="text-xs font-semibold text-status-stock-text">
                {reportsSummary.totalStockValueGrowth}
              </span>
            </div>
          </div>
          {/* Black horizontal bar chart graphic */}
          <div className="mt-4">
            <div className="w-full h-2 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card level={1} className="p-5 flex flex-col justify-between h-44">
          <div className="flex flex-col">
            <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-brand-primary">
                {lowStockCount}
              </span>
              <span className="text-xs font-bold text-status-out-text">
                {lowStockCount > 5 ? 'Critical' : 'Warning'}
              </span>
            </div>
          </div>
          {/* Circle dots graphic */}
          <div className="mt-4 flex gap-1.5 items-center">
            {Array.from({ length: 4 }).map((_, idx) => (
              <span 
                key={idx} 
                className={`h-2.5 w-2.5 rounded-full ${
                  idx < lowStockCount ? 'bg-status-out-text' : 'bg-neutral-200 dark:bg-brand-border'
                }`} 
              />
            ))}
          </div>
        </Card>

        {/* Inventory Turnover */}
        <Card level={1} className="p-5 flex flex-col justify-between h-44">
          <div className="flex flex-col">
            <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Inventory Turnover</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-brand-primary">
                {reportsSummary.inventoryTurnover}x
              </span>
              <span className="text-xs font-semibold text-brand-secondary">
                {reportsSummary.inventoryTurnoverStatus}
              </span>
            </div>
          </div>
          <span className="caption text-brand-tertiary mt-4">
            Industry avg: 4.8x
          </span>
        </Card>

        {/* Dead Stock Rate */}
        <Card level={1} className="p-5 flex flex-col justify-between h-44">
          <div className="flex flex-col">
            <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Dead Stock Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-brand-primary">
                {reportsSummary.deadStockRate}%
              </span>
              <span className="text-xs font-semibold text-status-stock-text">
                {reportsSummary.deadStockRateGrowth}
              </span>
            </div>
          </div>
          <span className="caption text-brand-tertiary mt-4">
            Approx. {reportsSummary.deadStockImpact} impact
          </span>
        </Card>
      </div>

      {/* Main Reports Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Product Performance Table Panel */}
        <Card level={1} className="overflow-hidden lg:col-span-2">
          <div className="flex justify-between items-center px-6 py-5 border-b border-brand-border">
            <h2 className="headline-sm text-brand-primary font-bold">Product Performance</h2>
          </div>

          {sortedPerformance.length === 0 ? (
            <EmptyState
              variant="reports"
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow isHeader>
                    <TableCell isHeader className="w-[40%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('productName')}>
                      Product & SKU {renderSortIndicator('productName')}
                    </TableCell>
                    <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('unitsSold')}>
                      Units Sold {renderSortIndicator('unitsSold')}
                    </TableCell>
                    <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('revenue')}>
                      Revenue {renderSortIndicator('revenue')}
                    </TableCell>
                    <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('growth')}>
                      Growth {renderSortIndicator('growth')}
                    </TableCell>
                    <TableCell isHeader className="w-[15%]">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPerformance.map((p, idx) => {
                    const isPositive = p.growth >= 0;
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProductThumbnail type={p.thumbnailIcon} color={p.thumbnailColor} />
                            <div className="flex flex-col">
                              <span className="font-semibold text-brand-primary body-md leading-tight">{p.productName}</span>
                              <span className="font-mono text-[10px] text-brand-secondary mt-0.5 tracking-wider uppercase">{p.sku}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{p.unitsSold.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(p.revenue)}</TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-0.5 font-bold ${isPositive ? 'text-status-stock-text' : 'text-status-out-text'}`}>
                            {isPositive ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            <span>{isPositive ? '+' : ''}{p.growth}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {sortedPerformance.length > pageSize && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-neutral-50/30 dark:bg-brand-border/10">
                  <span className="caption text-brand-secondary">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedPerformance.length)} of {sortedPerformance.length} items
                  </span>
                  
                  <div className="flex items-center gap-1 text-xs">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-brand-border rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-brand-secondary" />
                    </button>
                    
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      const isActive = page === currentPage;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2.5 py-1 border rounded font-semibold cursor-pointer ${
                            isActive 
                              ? 'border-brand-primary bg-brand-primary text-brand-bg' 
                              : 'border-brand-border hover:bg-neutral-50 dark:hover:bg-brand-border/30 text-brand-secondary'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-brand-border rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-brand-secondary" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* AI Engine & Action List Panels */}
        <div className="flex flex-col gap-6">
          
          {/* AI Insight Engine Card */}
          <Card level={2} roundedSize="lg" className="bg-neutral-900 text-white dark:bg-brand-card-bg dark:text-brand-primary border-none p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-neutral-300 fill-neutral-300 dark:text-brand-tertiary dark:fill-brand-tertiary" />
              <span className="caption tracking-wider uppercase font-semibold text-neutral-300 dark:text-brand-tertiary">AI Insight Engine</span>
            </div>

            <h3 className="text-base font-bold text-white dark:text-brand-primary leading-snug">
              Optimization Opportunity Detected: Bulk Restock of SKU: PK2-B-0041
            </h3>
            
            <p className="caption text-neutral-300 dark:text-brand-secondary mt-3 leading-relaxed">
              Current demand trends indicate a 15% surge for Precision Keyboards next month. We recommend placing a bulk order of 500 units by Friday to secure the 8% vendor discount and avoid stockout.
            </p>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-semibold py-2 px-3 rounded transition-colors select-none cursor-pointer">
                Execute Order
              </button>
              <button className="flex-1 bg-transparent border border-neutral-600 hover:border-neutral-400 dark:border-brand-border dark:hover:bg-brand-border/20 dark:text-brand-primary text-white text-xs font-semibold py-2 px-3 rounded transition-colors select-none cursor-pointer">
                Analyze Data
              </button>
            </div>
          </Card>

          {/* Urgent Actions Card */}
          <Card level={1} className="p-6">
            <h3 className="headline-sm text-brand-primary font-bold border-b border-brand-border pb-4 mb-4">
              Urgent Actions
            </h3>

            {/* List */}
            <div className="flex flex-col gap-4">
              {urgentActions.map((act) => {
                // Determine icon based on action type
                let LeftIcon = AlertTriangle;
                let bgIcon = 'bg-status-out-bg text-status-out-text';
                
                if (act.type === 'excess_inventory') {
                  LeftIcon = Package;
                  bgIcon = 'bg-neutral-100 dark:bg-brand-border text-neutral-500 dark:text-brand-secondary';
                } else if (act.type === 'audit_required') {
                  LeftIcon = ClipboardCheck;
                  bgIcon = 'bg-neutral-100 dark:bg-brand-border text-neutral-500 dark:text-brand-secondary';
                }

                return (
                  <div key={act.id} className="flex gap-4 items-start">
                    <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${bgIcon}`}>
                      <LeftIcon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="caption text-brand-secondary font-bold uppercase tracking-wide leading-tight">
                        {act.title}
                      </span>
                      <p className="caption text-brand-primary mt-0.5 leading-snug">
                        {act.description}
                      </p>
                      <button className="text-left font-bold text-[10px] text-brand-primary hover:underline mt-1 bg-transparent border-none p-0 select-none">
                        {act.actionText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
