import React, { useState, useMemo } from 'react';
import { 
  Package, 
  DollarSign, 
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
  FileDown,
  Sparkles,
  ShoppingBag,
  History,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { SearchBar } from '../components/SearchBar';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { useInventory } from '../context/InventoryContext';
import { formatCurrency, formatCurrencyPrice } from '../utils/format';
import { useTable } from '../hooks/useTable';
import type { ProductAnalyticsMetric } from '../types/inventory';
import { PageSkeleton, ErrorState, EmptyState } from '../components/feedback';


export const ProductAnalysis: React.FC = () => {
  const { 
    products, 
    transactions, 
    movements, 
    totalProductsCount, 
    totalStockCount, 
    totalStockValue, 
    lowStockCount, 
    outOfStockCount,
    getProductAnalytics,
    getActionableInsights,
    loading,
    error 
  } = useInventory();

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All Statuses');
  const [selectedTimeline, setSelectedTimeline] = useState('Last 30 Days');
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'insights'>('table');

  // Individual product inspection modal
  const [inspectedProductId, setInspectedProductId] = useState<string | null>(null);

  // Time filter conversion
  const timelineDays = useMemo(() => {
    switch (selectedTimeline) {
      case 'Last 7 Days': return 7;
      case 'Last 30 Days': return 30;
      case 'Last 90 Days': return 90;
      default: return 365;
    }
  }, [selectedTimeline]);

  // Dynamic metrics from shared mock repository
  const analyticsData = useMemo(() => {
    return getProductAnalytics(timelineDays);
  }, [getProductAnalytics, timelineDays]);

  const actionableInsights = useMemo(() => {
    return getActionableInsights();
  }, [getActionableInsights]);


  // Aggregate high-level summary cards metrics
  const totalSalesRevenue = useMemo(() => {
    return analyticsData.reduce((sum, item) => sum + item.revenue, 0);
  }, [analyticsData]);

  const totalGrossProfit = useMemo(() => {
    return analyticsData.reduce((sum, item) => sum + item.grossProfit, 0);
  }, [analyticsData]);

  const bestSellingProduct = useMemo(() => {
    if (analyticsData.length === 0) return null;
    return [...analyticsData].sort((a, b) => b.unitsSold - a.unitsSold)[0];
  }, [analyticsData]);

  // Extract categories for dropdown
  const categoryOptions = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All Categories', ...Array.from(cats)];
  }, [products]);

  const statusOptions = ['All Statuses', 'IN STOCK', 'LOW STOCK', 'OUT OF STOCK'];

  // Multi-filter dataset
  const filteredAnalytics = useMemo(() => {
    return analyticsData.filter(item => {
      const matchCat = selectedCategory === 'All Categories' || item.product.category === selectedCategory;
      const matchStatus = selectedStockStatus === 'All Statuses' || item.product.status === selectedStockStatus;
      return matchCat && matchStatus;
    });
  }, [analyticsData, selectedCategory, selectedStockStatus]);

  // Table pagination and sorting
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    sortedData,
    paginatedData,
    handleSort,
    renderSortIndicator
  } = useTable<ProductAnalyticsMetric>({
    data: filteredAnalytics,
    searchFields: ['productName', 'sku', 'category', 'supplier'],
    initialPageSize: 10
  });


  // Inspected product object
  const inspectedMetric = useMemo(() => {
    if (!inspectedProductId) return null;
    return analyticsData.find(m => m.product.id === inspectedProductId) || null;
  }, [inspectedProductId, analyticsData]);

  // Inspected product transactions and stock movements
  const inspectedProductSales = useMemo(() => {
    if (!inspectedProductId) return [];
    return transactions.filter(t => {
      if (t.items && t.items.length > 0) {
        return t.items.some(i => i.productId === inspectedProductId);
      }
      const prod = products.find(p => p.id === inspectedProductId);
      return prod && t.sku === prod.sku;
    });
  }, [inspectedProductId, transactions, products]);

  const inspectedProductMovements = useMemo(() => {
    if (!inspectedProductId) return [];
    return movements.filter(m => m.productId === inspectedProductId);
  }, [inspectedProductId, movements]);

  // Export CSV handler
  const handleExportCSV = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Stock Qty', 'Units Sold', 'Revenue (INR)', 'Purchase Price', 'Selling Price', 'Gross Profit', 'Margin (%)', 'Status'];
    const rows = filteredAnalytics.map(m => [
      `"${m.product.name}"`,
      m.product.sku,
      m.product.category,
      m.product.quantity,
      m.unitsSold,
      m.revenue,
      m.product.purchasePrice,
      m.product.sellingPrice,
      m.grossProfit,
      `${m.grossMargin}%`,
      m.product.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockWise_Product_Analysis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  if (error) {
    return <ErrorState title="Product Analytics Failed" message={error} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="headline-lg text-brand-primary">Product Analysis & Insights</h1>
          <p className="body-md text-brand-secondary mt-1">
            Deep performance evaluation, velocity tracking, gross margins, and stockout projections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Dropdown
            value={selectedTimeline}
            options={['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year']}
            onChange={(val) => setSelectedTimeline(val)}
            icon={<Calendar className="h-4 w-4 text-brand-secondary" />}
            ariaLabel="Timeline Select"
          />

          <Button 
            variant="secondary" 
            onClick={handleExportCSV}
            className="flex items-center gap-2 py-2"
          >
            <FileDown className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 8 SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Products */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Total Products</span>
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-primary">{totalProductsCount}</div>
            <span className="caption text-brand-secondary">Across {categoryOptions.length - 1} categories</span>
          </div>
        </Card>

        {/* 2. Total Units in Stock */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Total Units in Stock</span>
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-primary">{totalStockCount.toLocaleString()}</div>
            <span className="caption text-brand-secondary">Available inventory items</span>
          </div>
        </Card>

        {/* 3. Total Inventory Value */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Total Inventory Value</span>
            <DollarSign className="h-4 w-4 text-brand-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-primary">{formatCurrency(totalStockValue)}</div>
            <span className="caption text-status-stock-text font-medium">Selling value on hand</span>
          </div>
        </Card>

        {/* 4. Total Sales Revenue */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <TrendingUp className="h-4 w-4 text-status-stock-text" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-primary">{formatCurrency(totalSalesRevenue)}</div>
            <span className="caption text-brand-secondary">In selected period</span>
          </div>
        </Card>

        {/* 5. Estimated Gross Profit */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Gross Profit</span>
            <Sparkles className="h-4 w-4 text-brand-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-primary">{formatCurrency(totalGrossProfit)}</div>
            <span className="caption text-status-stock-text font-medium">
              {totalSalesRevenue > 0 ? `${((totalGrossProfit / totalSalesRevenue) * 100).toFixed(1)}% margin` : '0% margin'}
            </span>
          </div>
        </Card>

        {/* 6. Low-Stock Products */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-status-low-text">
            <span className="caption font-bold uppercase tracking-wider">Low-Stock Items</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-status-low-text">{lowStockCount} SKUs</div>
            <span className="caption text-brand-secondary">At or below reorder threshold</span>
          </div>
        </Card>

        {/* 7. Out-of-Stock Products */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-status-out-text">
            <span className="caption font-bold uppercase tracking-wider">Out-of-Stock</span>
            <X className="h-4 w-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-status-out-text">{outOfStockCount} SKUs</div>
            <span className="caption text-brand-secondary">Requires urgent purchase orders</span>
          </div>
        </Card>

        {/* 8. Best-Selling Product */}
        <Card level={1} className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-center text-brand-secondary">
            <span className="caption font-bold uppercase tracking-wider">Best Seller</span>
            <ShoppingBag className="h-4 w-4 text-brand-primary" />
          </div>
          <div>
            <div className="text-base font-bold text-brand-primary truncate">
              {bestSellingProduct ? bestSellingProduct.product.name : 'None'}
            </div>
            <span className="caption text-brand-secondary font-mono">
              {bestSellingProduct ? `${bestSellingProduct.unitsSold} units sold (${formatCurrencyPrice(bestSellingProduct.revenue)})` : '-'}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs navigation: Table vs Charts vs Actionable Insights */}
      <div className="flex border-b border-brand-border gap-2">
        <button
          onClick={() => setActiveTab('table')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'table'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-secondary hover:text-brand-primary'
          }`}
        >
          Performance Table ({filteredAnalytics.length})
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'charts'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-secondary hover:text-brand-primary'
          }`}
        >
          Visual Analytics & Trends
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'insights'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-secondary hover:text-brand-primary'
          }`}
        >
          <span>Actionable Insights</span>
          <span className="px-1.5 py-0.2 bg-brand-primary text-brand-bg rounded-full text-[10px]">
            {actionableInsights.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PRODUCT PERFORMANCE TABLE */}
      {activeTab === 'table' && (
        <div className="flex flex-col gap-4">
          {/* Filters Bar */}
          <Card level={1} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <SearchBar
              placeholder="Search product name, SKU, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Dropdown
                value={selectedCategory}
                options={categoryOptions}
                onChange={(val) => setSelectedCategory(val)}
                ariaLabel="Category Filter"
              />

              <Dropdown
                value={selectedStockStatus}
                options={statusOptions}
                onChange={(val) => setSelectedStockStatus(val)}
                ariaLabel="Stock Status Filter"
              />
            </div>
          </Card>

          {/* Table Card */}
          <Card level={1} className="overflow-hidden">
            {paginatedData.length === 0 ? (
              <EmptyState variant="products" />
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow isHeader>
                      <TableCell isHeader className="w-[24%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('productName')}>
                        Product & SKU {renderSortIndicator('productName')}
                      </TableCell>
                      <TableCell isHeader className="w-[11%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('category')}>
                        Category {renderSortIndicator('category')}
                      </TableCell>
                      <TableCell isHeader className="w-[8%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('quantity')}>
                        Stock {renderSortIndicator('quantity')}
                      </TableCell>
                      <TableCell isHeader className="w-[9%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('unitsSold')}>
                        Sold {renderSortIndicator('unitsSold')}
                      </TableCell>
                      <TableCell isHeader className="w-[12%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('revenue')}>
                        Revenue {renderSortIndicator('revenue')}
                      </TableCell>
                      <TableCell isHeader className="w-[12%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('grossProfit')}>
                        Gross Profit {renderSortIndicator('grossProfit')}
                      </TableCell>
                      <TableCell isHeader className="w-[8%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('grossMargin')}>
                        Margin {renderSortIndicator('grossMargin')}
                      </TableCell>
                      <TableCell isHeader className="w-[8%]">Status</TableCell>
                      <TableCell isHeader className="w-[8%] text-right">Inspect</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedData.map((m) => (
                      <TableRow key={m.product.id}>
                        <TableCell>
                          <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setInspectedProductId(m.product.id)}
                          >
                            <ProductThumbnail type={m.product.thumbnailIcon} color={m.product.thumbnailColor} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-brand-primary body-md group-hover:underline truncate">
                                {m.product.name}
                              </span>
                              <span className="font-mono text-[10px] text-brand-secondary tracking-wider uppercase">
                                {m.product.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-brand-secondary font-medium">{m.product.category}</TableCell>
                        <TableCell className="font-semibold">
                          <span className={m.product.quantity === 0 ? 'text-status-out-text' : m.product.quantity <= m.product.minStock ? 'text-status-low-text' : ''}>
                            {m.product.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{m.unitsSold}</TableCell>
                        <TableCell className="font-semibold">{formatCurrencyPrice(m.revenue)}</TableCell>
                        <TableCell className="font-bold text-status-stock-text">
                          {formatCurrencyPrice(m.grossProfit)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {m.grossMargin}%
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={m.product.status} />
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Button 
                            variant="secondary"
                            onClick={() => setInspectedProductId(m.product.id)}
                            className="text-xs py-1 px-2.5"
                          >
                            Analyze
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {sortedData.length > pageSize && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-neutral-50/30 dark:bg-brand-border/10">
                    <span className="caption text-brand-secondary">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} items
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
        </div>
      )}

      {/* TAB 2: FUNCTIONAL CHARTS */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Best-Selling Products by Quantity */}
          <Card level={1} className="p-6">
            <h3 className="headline-sm text-brand-primary font-bold mb-1">Best-Selling Products</h3>
            <p className="caption text-brand-secondary mb-6">Ranked by total units sold in {selectedTimeline.toLowerCase()}.</p>
            
            <div className="flex flex-col gap-4">
              {[...analyticsData]
                .sort((a, b) => b.unitsSold - a.unitsSold)
                .slice(0, 5)
                .map((item) => {
                  const maxSold = Math.max(...analyticsData.map(d => d.unitsSold), 1);
                  const pct = Math.round((item.unitsSold / maxSold) * 100);
                  return (
                    <div key={item.product.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-primary truncate max-w-[240px]">{item.product.name}</span>
                        <span className="text-brand-secondary">{item.unitsSold} units</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Chart 2: Revenue Contribution by Product */}
          <Card level={1} className="p-6">
            <h3 className="headline-sm text-brand-primary font-bold mb-1">Top Revenue Generators</h3>
            <p className="caption text-brand-secondary mb-6">Gross sales revenue contribution per item.</p>

            <div className="flex flex-col gap-4">
              {[...analyticsData]
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5)
                .map((item) => {
                  const maxRev = Math.max(...analyticsData.map(d => d.revenue), 1);
                  const pct = Math.round((item.revenue / maxRev) * 100);
                  return (
                    <div key={item.product.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-primary truncate max-w-[240px]">{item.product.name}</span>
                        <span className="text-brand-primary font-bold">{formatCurrencyPrice(item.revenue)}</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-status-stock-text rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Chart 3: Estimated Profit by Product */}
          <Card level={1} className="p-6">
            <h3 className="headline-sm text-brand-primary font-bold mb-1">Gross Profit Margins</h3>
            <p className="caption text-brand-secondary mb-6">Net profit contribution margin percentage.</p>

            <div className="flex flex-col gap-4">
              {[...analyticsData]
                .filter(m => m.unitsSold > 0)
                .sort((a, b) => b.grossMargin - a.grossMargin)
                .slice(0, 5)
                .map((item) => {
                  return (
                    <div key={item.product.id} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-brand-primary truncate max-w-[240px]">{item.product.name}</span>
                        <span className="text-brand-primary font-bold">{item.grossMargin}% ({formatCurrencyPrice(item.grossProfit)})</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, Math.max(0, item.grossMargin))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Chart 4: Inventory Distribution by Category */}
          <Card level={1} className="p-6">
            <h3 className="headline-sm text-brand-primary font-bold mb-1">Inventory Valuation by Category</h3>
            <p className="caption text-brand-secondary mb-6">Capital allocation across product categories.</p>

            <div className="flex flex-col gap-4">
              {categoryOptions.filter(c => c !== 'All Categories').map((cat) => {
                const catProducts = products.filter(p => p.category === cat);
                const catValue = catProducts.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);
                const pct = totalStockValue > 0 ? Math.round((catValue / totalStockValue) * 100) : 0;
                return (
                  <div key={cat} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-brand-primary">{cat}</span>
                      <span className="text-brand-secondary font-medium">{formatCurrencyPrice(catValue)} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 dark:bg-brand-border rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-800 dark:bg-neutral-200 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: ACTIONABLE INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionableInsights.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-brand-secondary">
              No immediate critical anomalies or recommendations detected.
            </div>
          ) : (
            actionableInsights.map((insight) => {
              let borderClass = 'border-brand-border';
              let badgeClass = 'bg-neutral-100 text-brand-primary';

              if (insight.severity === 'critical') {
                borderClass = 'border-status-out-text/40 bg-status-out-bg/10';
                badgeClass = 'bg-status-out-bg text-status-out-text font-bold';
              } else if (insight.severity === 'warning') {
                borderClass = 'border-status-low-text/40 bg-status-low-bg/10';
                badgeClass = 'bg-status-low-bg text-status-low-text font-bold';
              } else if (insight.severity === 'success') {
                borderClass = 'border-status-stock-text/40 bg-status-stock-bg/10';
                badgeClass = 'bg-status-stock-bg text-status-stock-text font-bold';
              }

              return (
                <Card key={insight.id} level={1} className={`p-5 flex flex-col justify-between border ${borderClass}`}>
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${badgeClass}`}>
                        {insight.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="body-md font-bold text-brand-primary mb-2 leading-snug">
                      {insight.title}
                    </h4>

                    <p className="caption text-brand-secondary leading-relaxed">
                      {insight.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-border/50 mt-4 flex justify-end">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (insight.productId) setInspectedProductId(insight.productId);
                      }}
                      className="text-xs py-1.5 px-3"
                    >
                      {insight.actionText}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* INDIVIDUAL PRODUCT ANALYSIS MODAL */}
      <Modal
        isOpen={!!inspectedMetric}
        onClose={() => setInspectedProductId(null)}
        title={inspectedMetric ? inspectedMetric.product.name : 'Product Inspection'}
      >
        {inspectedMetric && (
          <div className="flex flex-col gap-6 py-2 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header info */}
            <div className="flex items-center justify-between p-4 rounded-md border border-brand-border bg-neutral-50/50 dark:bg-brand-border/20">
              <div className="flex items-center gap-3">
                <ProductThumbnail type={inspectedMetric.product.thumbnailIcon} color={inspectedMetric.product.thumbnailColor} />
                <div>
                  <h3 className="body-lg font-bold text-brand-primary">{inspectedMetric.product.name}</h3>
                  <span className="caption font-mono text-brand-secondary">{inspectedMetric.product.sku} &bull; {inspectedMetric.product.category}</span>
                </div>
              </div>
              <StatusBadge status={inspectedMetric.product.status} />
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 border border-brand-border rounded">
                <span className="caption text-brand-secondary uppercase block">Available Stock</span>
                <strong className="body-lg text-brand-primary">{inspectedMetric.product.quantity} units</strong>
                <span className="text-[10px] text-brand-tertiary block mt-0.5">Min safety: {inspectedMetric.product.minStock}</span>
              </div>

              <div className="p-3 border border-brand-border rounded">
                <span className="caption text-brand-secondary uppercase block">Units Sold</span>
                <strong className="body-lg text-brand-primary">{inspectedMetric.unitsSold} units</strong>
                <span className="text-[10px] text-brand-tertiary block mt-0.5">{inspectedMetric.performanceStatus}</span>
              </div>

              <div className="p-3 border border-brand-border rounded">
                <span className="caption text-brand-secondary uppercase block">Revenue</span>
                <strong className="body-lg text-brand-primary">{formatCurrencyPrice(inspectedMetric.revenue)}</strong>
                <span className="text-[10px] text-status-stock-text block mt-0.5">{formatCurrencyPrice(inspectedMetric.grossProfit)} profit</span>
              </div>

              <div className="p-3 border border-brand-border rounded">
                <span className="caption text-brand-secondary uppercase block">Stockout Runway</span>
                <strong className="body-lg text-brand-primary">
                  {inspectedMetric.daysUntilStockout > 365 ? '> 1 Year' : `${inspectedMetric.daysUntilStockout} Days`}
                </strong>
                <span className="text-[10px] text-brand-tertiary block mt-0.5">~{inspectedMetric.avgDailySales}/day</span>
              </div>
            </div>

            {/* Reorder Recommendation Box */}
            <div className="p-4 rounded-md border border-brand-border bg-neutral-100/60 dark:bg-brand-border/30 flex items-start justify-between gap-4">
              <div>
                <strong className="text-xs font-bold text-brand-primary block uppercase tracking-wide">
                  Inventory Optimization Advisory
                </strong>
                <p className="caption text-brand-secondary mt-1">
                  Based on recent movement trends and threshold buffer, recommended reorder quantity is{' '}
                  <strong className="text-brand-primary">{inspectedMetric.suggestedReorderQty} units</strong>.
                  Last sale was logged on <strong className="font-mono">{inspectedMetric.lastSaleDate || 'No recent sale'}</strong>.
                </p>
              </div>
              <span className="caption font-mono font-bold bg-brand-primary text-brand-bg px-2.5 py-1 rounded shrink-0">
                Reorder +{inspectedMetric.suggestedReorderQty}
              </span>
            </div>

            {/* Stock Movement Audit Log */}
            <div>
              <h4 className="caption font-bold text-brand-primary uppercase mb-2 flex items-center gap-1.5">
                <History className="h-4 w-4" />
                <span>Stock Movement History</span>
              </h4>

              {inspectedProductMovements.length === 0 ? (
                <span className="caption text-brand-tertiary block p-4 border border-brand-border rounded text-center">
                  No stock movements recorded yet.
                </span>
              ) : (
                <div className="border border-brand-border rounded divide-y divide-brand-border text-xs max-h-48 overflow-y-auto">
                  {inspectedProductMovements.map((mov) => (
                    <div key={mov.id} className="p-2.5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-brand-primary">{mov.note || mov.type}</span>
                        <span className="caption text-brand-secondary font-mono">{mov.date} &bull; Ref: {mov.referenceId || 'Manual'}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${mov.quantityDelta > 0 ? 'text-status-stock-text' : 'text-status-out-text'}`}>
                          {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta}
                        </span>
                        <span className="caption text-brand-tertiary block">Bal: {mov.newQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sales Transaction History for this item */}
            <div>
              <h4 className="caption font-bold text-brand-primary uppercase mb-2 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Related Customer Transactions</span>
              </h4>

              {inspectedProductSales.length === 0 ? (
                <span className="caption text-brand-tertiary block p-4 border border-brand-border rounded text-center">
                  No sales recorded for this product yet.
                </span>
              ) : (
                <div className="border border-brand-border rounded divide-y divide-brand-border text-xs max-h-44 overflow-y-auto">
                  {inspectedProductSales.map((sale) => (
                    <div key={sale.id} className="p-2.5 flex justify-between items-center">
                      <div>
                        <strong className="text-brand-primary block">{sale.customer}</strong>
                        <span className="caption font-mono text-brand-secondary">{sale.id} &bull; {sale.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-brand-primary">{formatCurrencyPrice(sale.totalPrice)}</span>
                        <span className="caption text-status-stock-text block font-semibold">{sale.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-brand-border pt-4">
              <Button variant="secondary" onClick={() => setInspectedProductId(null)}>
                Close Analysis
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
