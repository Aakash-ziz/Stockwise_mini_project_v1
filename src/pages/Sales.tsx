import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Tag, 
  FileText, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Scan
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { SearchBar } from '../components/SearchBar';
import { useInventory } from '../context/InventoryContext';
import type { Product, Transaction } from '../types/inventory';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { useClickOutside } from '../hooks/useClickOutside';
import { useTable } from '../hooks/useTable';
import { formatCurrency, formatCurrencyPrice } from '../utils/format';
import { PageSkeleton, ErrorState, EmptyState } from '../components/feedback';
import { VALIDATION_MESSAGES, TOAST_MESSAGES } from '../utils';

export const Sales: React.FC = () => {
  const { 
    products, 
    transactions, 
    addTransaction,
    soldTodayRevenue,
    loading,
    error
  } = useInventory();

  // Terminal inputs state
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState('');
  
  // Toggles and inputs
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  
  // Dropdown autocomplete search matches
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [dropdownFocusedIndex, setDropdownFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clear form confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Is form dirty?
  const isFormDirty = useMemo(() => {
    return selectedProduct !== null || quantity > 1 || customer !== '' || discount > 0 || note !== '' || productSearch !== '';
  }, [selectedProduct, quantity, customer, discount, note, productSearch]);

  // Handle autocomplete matching in products list
  const productMatches = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

  // Handle outside clicks to close product dropdown using useClickOutside hook
  useClickOutside(dropdownRef, () => setIsProductDropdownOpen(false));

  // Keyboard navigation for autocomplete list
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isProductDropdownOpen || productMatches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDropdownFocusedIndex(prev => (prev + 1) % productMatches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDropdownFocusedIndex(prev => (prev - 1 + productMatches.length) % productMatches.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (dropdownFocusedIndex >= 0 && dropdownFocusedIndex < productMatches.length) {
        selectProduct(productMatches[dropdownFocusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsProductDropdownOpen(false);
      setDropdownFocusedIndex(-1);
    }
  };

  const selectProduct = (p: Product) => {
    setSelectedProduct(p);
    setProductSearch('');
    setIsProductDropdownOpen(false);
    setDropdownFocusedIndex(-1);
    setQuantity(1); // default back to 1
  };

  // Compute total price based on selected product and discount percentage
  const computedTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    const rawTotal = selectedProduct.sellingPrice * quantity;
    const discountAmt = rawTotal * (discount / 100);
    return Math.max(0, rawTotal - discountAmt);
  }, [selectedProduct, quantity, discount]);

  // Compute inline form validation errors
  const quantityError = useMemo(() => {
    if (!selectedProduct) return '';
    if (quantity <= 0 || quantity % 1 !== 0) return VALIDATION_MESSAGES.invalidQuantity;
    if (quantity > selectedProduct.quantity) {
      return TOAST_MESSAGES.sale.insufficientStock(selectedProduct.quantity);
    }
    return '';
  }, [selectedProduct, quantity]);

  const discountError = useMemo(() => {
    if (discount < 0 || discount > 100 || discount % 1 !== 0) return VALIDATION_MESSAGES.discountRange;
    return '';
  }, [discount]);

  // Add transaction submit
  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantityError || discountError) return;

    const result = addTransaction({
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      customer: customer || 'Guest Customer',
      quantity,
      totalPrice: computedTotal
    });

    if (result.success) {
      resetForm();
    }
  };

  const handleClearClick = () => {
    if (isFormDirty) {
      setShowClearConfirm(true);
    } else {
      resetForm();
    }
  };

  const confirmClearForm = () => {
    resetForm();
    setShowClearConfirm(false);
  };

  const resetForm = () => {
    setProductSearch('');
    setSelectedProduct(null);
    setQuantity(1);
    setCustomer('');
    setDiscount(0);
    setShowDiscount(false);
    setNote('');
    setShowNote(false);
    setDropdownFocusedIndex(-1);
  };

  // Compute transactions using useTable hook
  const {
    searchQuery: txSearchQuery,
    setSearchQuery: setTxSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    sortedData: sortedTransactions,
    paginatedData: paginatedTransactions,
    handleSort,
    renderSortIndicator
  } = useTable<Transaction>({
    data: transactions,
    searchFields: ['id', 'productName', 'customer', 'sku'],
    initialPageSize: 5
  });


  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  if (error) {
    return <ErrorState title="Inventory Loading Failed" message={error} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in relative">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="headline-lg text-brand-primary">Sales Terminal</h1>
          <p className="body-md text-brand-secondary mt-1">Process new transactions and review daily performance.</p>
        </div>
        
        {/* Today's Revenue Card */}
        <Card level={1} className="px-5 py-3 flex flex-col justify-center min-w-44 select-none w-full sm:w-auto">
          <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Today's Revenue</span>
          <span className="text-xl font-bold tracking-tight text-brand-primary mt-1">
            {formatCurrency(soldTodayRevenue + 8500, 2)}
          </span>
        </Card>
      </div>

      {/* Main Terminal Interface Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Transaction Input Panel */}
        <Card level={1} className="p-6 lg:col-span-2 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-brand-primary font-bold">Initialize New Transaction</h2>
            <span className="caption font-mono bg-neutral-100 dark:bg-brand-border px-2 py-0.5 rounded text-brand-secondary font-semibold">Terminal A1</span>
          </div>

          <form onSubmit={handleCompleteSale} className="flex flex-col gap-5">
            {/* Product selection search bar */}
            <div className="relative" ref={dropdownRef}>
              <label className="caption font-bold text-brand-primary uppercase block mb-1.5 select-none">
                Product SKU / Name
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scan className="h-4 w-4 text-brand-tertiary" />
                </div>
                
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={selectedProduct ? selectedProduct.name : "Start typing product name..."}
                  required={!selectedProduct}
                  value={productSearch}
                  onKeyDown={handleSearchKeyDown}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsProductDropdownOpen(true);
                    setDropdownFocusedIndex(-1);
                  }}
                  onFocus={() => {
                    setIsProductDropdownOpen(true);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-DEFAULT bg-brand-bg text-brand-primary body-md focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                />
              </div>

              {/* Autocomplete Dropdown overlay */}
              {isProductDropdownOpen && productMatches.length > 0 && (
                <div 
                  role="listbox" 
                  aria-label="Product Search Results"
                  className="absolute left-0 mt-1 w-full bg-brand-bg border border-brand-border rounded-DEFAULT shadow-subtle-precision py-1 z-20 max-h-48 overflow-y-auto animate-fade-in"
                >
                  {productMatches.map((p, idx) => {
                    const isFocused = idx === dropdownFocusedIndex;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={isFocused}
                        onClick={() => selectProduct(p)}
                        className={`w-full text-left px-4 py-2 flex justify-between items-center transition-colors cursor-pointer ${
                          isFocused ? 'bg-neutral-50 dark:bg-brand-border/40 font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-brand-border/30'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="body-md font-semibold text-brand-primary">{p.name}</span>
                          <span className="caption text-brand-tertiary font-mono">{p.sku}</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="body-md font-bold text-brand-primary">{formatCurrencyPrice(p.sellingPrice)}</span>
                          <span className="caption text-brand-secondary">{p.quantity} in stock</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Product info Card */}
            {selectedProduct && (
              <div className="border border-brand-border p-3.5 rounded-md flex justify-between items-center bg-neutral-50/20 dark:bg-brand-border/10">
                <div className="flex items-center gap-3">
                  <ProductThumbnail type={selectedProduct.thumbnailIcon} color={selectedProduct.thumbnailColor} />
                  <div>
                    <strong className="text-brand-primary body-md font-semibold block">{selectedProduct.name}</strong>
                    <span className="caption text-brand-secondary font-mono tracking-wider">{selectedProduct.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="caption text-brand-secondary uppercase font-bold block">Available Stock</span>
                  <strong className="text-brand-primary body-lg font-bold">{selectedProduct.quantity} units</strong>
                </div>
              </div>
            )}

            {/* Quantity */}
            <Input
              label="Quantity"
              type="number"
              min="1"
              required
              disabled={!selectedProduct}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              error={quantityError}
            />

            {/* Customer CRM info */}
            <Input
              label="Customer Name / Organization"
              placeholder="Guest or Search CRM..."
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              disabled={!selectedProduct}
              icon={<User className="h-4 w-4 text-brand-tertiary" />}
            />

            {/* Action Toggles for Discount and Note */}
            <div className="flex gap-4 items-center pt-2 select-none">
              <button
                type="button"
                onClick={() => setShowDiscount(!showDiscount)}
                className={`flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer ${
                  showDiscount ? 'text-brand-primary' : 'text-brand-secondary hover:text-brand-primary'
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>{showDiscount ? 'Remove Discount' : '+ Add Discount'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowNote(!showNote)}
                className={`flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer ${
                  showNote ? 'text-brand-primary' : 'text-brand-secondary hover:text-brand-primary'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{showNote ? 'Remove Note' : '+ Add Note'}</span>
              </button>
            </div>

            {/* Optional Discount Input */}
            {showDiscount && (
              <Input
                label="Discount Percentage (%)"
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                error={discountError}
              />
            )}

            {/* Optional Note Input */}
            {showNote && (
              <Input
                label="Transaction Note"
                placeholder="Add context or notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}

            {/* Purchase Details Indicator */}
            {selectedProduct && !quantityError && !discountError && (
              <div className="border-t border-dashed border-brand-border pt-4 flex flex-col gap-1.5 bg-neutral-50/50 dark:bg-brand-border/20 p-4 rounded-md animate-fade-in">
                <div className="flex justify-between text-xs text-brand-secondary font-medium">
                  <span>Subtotal ({quantity} x {formatCurrencyPrice(selectedProduct.sellingPrice)})</span>
                  <span>{formatCurrencyPrice(selectedProduct.sellingPrice * quantity)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-status-out-text font-medium">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatCurrencyPrice((selectedProduct.sellingPrice * quantity) * (discount / 100))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-brand-primary font-bold border-t border-brand-border pt-2 mt-1">
                  <span>Grand Total</span>
                  <span>{formatCurrencyPrice(computedTotal)}</span>
                </div>
              </div>
            )}

            {/* Submission button panel */}
            <div className="border-t border-brand-border pt-4 mt-2 flex gap-3">
              {isFormDirty && (
                <Button
                  variant="secondary"
                  type="button"
                  onClick={handleClearClick}
                  className="flex-1 py-3 rounded-DEFAULT"
                >
                  Clear Form
                </Button>
              )}
              <Button
                variant="primary"
                type="submit"
                disabled={!selectedProduct || !!quantityError || !!discountError}
                className={`${isFormDirty ? 'flex-[2]' : 'w-full'} flex items-center justify-center gap-2 py-3 rounded-DEFAULT`}
              >
                <span>Complete Sale</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Stock Insights Panel */}
        <Card level={1} className="p-6 flex flex-col justify-between h-full min-h-[460px]">
          <div>
            <h2 className="headline-sm text-brand-primary font-bold border-b border-brand-border pb-4 mb-5">Stock Insights</h2>
            
            <div className="flex flex-col gap-6">
              {/* Low Stock Alerts */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-brand-secondary">Low Stock Alerts</span>
                <span className="text-sm font-bold text-status-out-text bg-status-out-bg px-2.5 py-0.5 rounded-full">
                  {products.filter(p => p.quantity <= p.minStock).length}
                </span>
              </div>

              {/* Pending Shipments */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-brand-secondary">Pending Shipments</span>
                <span className="text-sm font-bold text-status-low-text bg-status-low-bg px-2.5 py-0.5 rounded-full">4</span>
              </div>

              {/* Best Seller */}
              <div className="flex justify-between items-center border-t border-brand-border pt-5 mt-2">
                <span className="text-sm font-semibold text-brand-secondary">Best Seller</span>
                <span className="caption font-mono uppercase bg-neutral-100 dark:bg-brand-border text-brand-primary px-3 py-1 rounded font-bold tracking-wider">
                  MacBook Pro M2
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-brand-border">
            <Link to="/reports" className="block w-full">
              <Button variant="secondary" className="w-full py-2.5">
                View Analytics
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Sales Section */}
      <Card level={1} className="overflow-hidden mt-2">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-6 py-5 border-b border-brand-border gap-4">
          <h2 className="headline-sm text-brand-primary font-bold">Recent Sales</h2>
          
          <SearchBar
            placeholder="Search transaction ID, SKU, product, customer..."
            value={txSearchQuery}
            onChange={(e) => setTxSearchQuery(e.target.value)}
            className="max-w-xs text-xs"
          />
        </div>

        {paginatedTransactions.length === 0 ? (
          <EmptyState
            variant={txSearchQuery ? 'search' : 'sales'}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow isHeader>
                  <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('id')}>
                    Transaction ID {renderSortIndicator('id')}
                  </TableCell>
                  <TableCell isHeader className="w-[30%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('productName')}>
                    Product {renderSortIndicator('productName')}
                  </TableCell>
                  <TableCell isHeader className="w-[20%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('customer')}>
                    Customer {renderSortIndicator('customer')}
                  </TableCell>
                  <TableCell isHeader className="w-[10%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('quantity')}>
                    Quantity {renderSortIndicator('quantity')}
                  </TableCell>
                  <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('totalPrice')}>
                    Total Price {renderSortIndicator('totalPrice')}
                  </TableCell>
                  <TableCell isHeader className="w-[10%]">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell isMonospace className="font-semibold text-brand-primary">{txn.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-brand-primary body-md leading-tight">{txn.productName}</span>
                        <span className="font-mono text-[10px] text-brand-secondary mt-0.5 tracking-wider uppercase">{txn.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-brand-secondary font-medium">{txn.customer}</TableCell>
                    <TableCell className="font-medium">{txn.quantity}</TableCell>
                    <TableCell className="font-bold">{formatCurrencyPrice(txn.totalPrice)}</TableCell>
                    <TableCell>
                      <StatusBadge status={txn.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {sortedTransactions.length > pageSize && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-neutral-50/30 dark:bg-brand-border/10">
                <span className="caption text-brand-secondary">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedTransactions.length)} of {sortedTransactions.length} transactions
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

      {/* Floating circular black "+" action button on bottom right */}
      <button 
        onClick={() => {
          if (searchInputRef.current) searchInputRef.current.focus();
        }}
        className="fixed bottom-6 right-6 h-12 w-12 bg-brand-primary text-brand-bg rounded-full shadow-subtle-precision flex items-center justify-center hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all select-none hover:scale-105 active:scale-95 cursor-pointer z-30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
        title="Quick Initialize"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* CLEAR FORM CONFIRMATION MODAL */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Discard Transaction Inputs?">
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            You have unsaved changes in this sales transaction form. Are you sure you want to clear all inputs?
          </p>
          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Keep Editing
            </Button>
            <Button variant="primary" onClick={confirmClearForm}>
              Clear Form
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
