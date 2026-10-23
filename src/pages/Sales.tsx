import React, { useState, useMemo, useRef } from 'react';
import { 
  User, 
  Tag, 
  FileText, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Scan,
  ShoppingCart,
  Trash2,
  Eye
} from 'lucide-react';

import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { SearchBar } from '../components/SearchBar';
import { useInventory } from '../context/InventoryContext';
import type { Product, Transaction, SaleCartItem } from '../types/inventory';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { useClickOutside } from '../hooks/useClickOutside';
import { useTable } from '../hooks/useTable';
import { formatCurrency, formatCurrencyPrice } from '../utils/format';
import { PageSkeleton, ErrorState, EmptyState } from '../components/feedback';


export const Sales: React.FC = () => {
  const { 
    products, 
    transactions, 
    processCheckout,
    soldTodayRevenue,
    loading,
    error
  } = useInventory();

  // Multi-item Cart state
  const [cart, setCart] = useState<SaleCartItem[]>([]);
  const [customer, setCustomer] = useState('');
  
  // Toggles and inputs
  const [showDiscount, setShowDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  
  // Product Search & Quick Add
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [dropdownFocusedIndex, setDropdownFocusedIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedTransactionForModal, setSelectedTransactionForModal] = useState<Transaction | null>(null);

  // Autocomplete matching in products list
  const productMatches = useMemo(() => {
    if (!productSearch) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

  useClickOutside(dropdownRef, () => setIsProductDropdownOpen(false));

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
    setItemQuantity(1);
  };

  // Add selected item to multi-item cart
  const handleAddToCart = () => {
    if (!selectedProduct || itemQuantity <= 0) return;

    // Check if item already in cart
    const existingIndex = cart.findIndex(c => c.productId === selectedProduct.id);
    const existingQty = existingIndex !== -1 ? cart[existingIndex].quantity : 0;
    const combinedQty = existingQty + itemQuantity;

    if (combinedQty > selectedProduct.quantity) {
      alert(`Cannot add ${itemQuantity} units. Maximum available stock for ${selectedProduct.name} is ${selectedProduct.quantity}.`);
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = combinedQty;
      updated[existingIndex].total = combinedQty * selectedProduct.sellingPrice;
      setCart(updated);
    } else {
      setCart(prev => [
        ...prev,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          quantity: itemQuantity,
          unitPrice: selectedProduct.sellingPrice,
          total: itemQuantity * selectedProduct.sellingPrice,
        }
      ]);
    }

    setSelectedProduct(null);
    setItemQuantity(1);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // Adjust cart item quantity
  const updateCartItemQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeCartItem(productId);
      return;
    }

    if (newQty > product.quantity) {
      alert(`Only ${product.quantity} units available in inventory.`);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.unitPrice,
        };
      }
      return item;
    }));
  };

  const removeCartItem = (productId: string) => {
    setCart(prev => prev.filter(c => c.productId !== productId));
  };

  // Financial calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return cartSubtotal * (Math.max(0, Math.min(100, discount)) / 100);
  }, [cartSubtotal, discount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, cartSubtotal - discountAmount);
  }, [cartSubtotal, discountAmount]);

  const totalCartUnits = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const isFormDirty = cart.length > 0 || customer !== '' || discount > 0 || note !== '';

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await processCheckout({
        customer: customer.trim() || 'Walk-in Customer',
        items: cart,
        discount,
        note,
      });

      if (result.success && result.transaction) {
        setSelectedTransactionForModal(result.transaction);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCart([]);
    setSelectedProduct(null);
    setProductSearch('');
    setItemQuantity(1);
    setCustomer('');
    setDiscount(0);
    setShowDiscount(false);
    setNote('');
    setShowNote(false);
  };

  // Transactions table using useTable hook
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
          <h1 className="headline-lg text-brand-primary">Sales Terminal (POS)</h1>
          <p className="body-md text-brand-secondary mt-1">Multi-item point-of-sale checkout terminal with real-time stock deduction.</p>
        </div>
        
        {/* Today's Revenue Card */}
        <Card level={1} className="px-5 py-3 flex flex-col justify-center min-w-44 select-none w-full sm:w-auto">
          <span className="caption text-brand-secondary font-bold uppercase tracking-wider">Today's Revenue</span>
          <span className="text-xl font-bold tracking-tight text-brand-primary mt-1">
            {formatCurrency(soldTodayRevenue, 2)}
          </span>
        </Card>
      </div>

      {/* Main Terminal Interface Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Product Selection & Active Cart */}
        <Card level={1} className="p-6 lg:col-span-2 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-brand-primary font-bold">POS Terminal</h2>
            <div className="flex items-center gap-2">
              <span className="caption font-mono bg-neutral-100 dark:bg-brand-border px-2.5 py-1 rounded text-brand-secondary font-semibold">
                Terminal #01
              </span>
              <span className="caption bg-status-stock-bg text-status-stock-text px-2 py-0.5 rounded font-bold">
                Online
              </span>
            </div>
          </div>

          {/* Product Search & Add Row */}
          <div className="flex flex-col gap-4 border-b border-brand-border pb-6">
            <label className="caption font-bold text-brand-primary uppercase block select-none">
              Search & Add Product to Cart
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-8 relative" ref={dropdownRef}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scan className="h-4 w-4 text-brand-tertiary" />
                  </div>
                  
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Scan barcode or type SKU / product name..."
                    value={productSearch}
                    onKeyDown={handleSearchKeyDown}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setIsProductDropdownOpen(true);
                      setDropdownFocusedIndex(-1);
                    }}
                    onFocus={() => setIsProductDropdownOpen(true)}
                    className="w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-DEFAULT bg-brand-bg text-brand-primary body-md focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                </div>

                {/* Autocomplete Dropdown overlay */}
                {isProductDropdownOpen && productMatches.length > 0 && (
                  <div 
                    role="listbox" 
                    className="absolute left-0 mt-1 w-full bg-brand-bg border border-brand-border rounded-DEFAULT shadow-subtle-precision py-1 z-30 max-h-56 overflow-y-auto animate-fade-in"
                  >
                    {productMatches.map((p, idx) => {
                      const isFocused = idx === dropdownFocusedIndex;
                      const isOutOfStock = p.quantity === 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => selectProduct(p)}
                          className={`w-full text-left px-4 py-2.5 flex justify-between items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                            isFocused ? 'bg-neutral-50 dark:bg-brand-border/40 font-semibold' : 'hover:bg-neutral-50 dark:hover:bg-brand-border/30'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="body-md font-semibold text-brand-primary">{p.name}</span>
                            <span className="caption text-brand-tertiary font-mono">{p.sku}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="body-md font-bold text-brand-primary">{formatCurrencyPrice(p.sellingPrice)}</span>
                            <span className={`caption font-semibold ${isOutOfStock ? 'text-status-out-text' : 'text-brand-secondary'}`}>
                              {isOutOfStock ? 'OUT OF STOCK' : `${p.quantity} available`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  max={selectedProduct ? selectedProduct.quantity : 99}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!selectedProduct}
                  className="w-full px-3 py-2.5 border border-brand-border rounded-DEFAULT bg-brand-bg text-brand-primary body-md text-center focus:outline-none focus:border-brand-primary disabled:opacity-50"
                  placeholder="Qty"
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  variant="primary"
                  type="button"
                  disabled={!selectedProduct}
                  onClick={handleAddToCart}
                  className="w-full py-2.5 rounded-DEFAULT flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            {/* Currently picked product badge */}
            {selectedProduct && (
              <div className="flex items-center justify-between p-3 rounded bg-neutral-50 dark:bg-brand-border/20 border border-brand-border mt-1">
                <div className="flex items-center gap-2.5">
                  <ProductThumbnail type={selectedProduct.thumbnailIcon} color={selectedProduct.thumbnailColor} />
                  <div>
                    <span className="text-xs font-bold text-brand-primary block">{selectedProduct.name}</span>
                    <span className="text-[10px] font-mono text-brand-secondary">{selectedProduct.sku}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-primary block">{formatCurrencyPrice(selectedProduct.sellingPrice)}</span>
                  <span className="text-[10px] text-status-stock-text font-semibold">{selectedProduct.quantity} units in stock</span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="caption font-bold text-brand-primary uppercase">
                Active Checkout Items ({cart.length})
              </span>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-status-out-text hover:underline cursor-pointer font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 border border-dashed border-brand-border rounded-md text-center flex flex-col items-center justify-center text-brand-tertiary">
                <ShoppingCart className="h-8 w-8 mb-2 stroke-[1.5] text-brand-secondary/40" />
                <span className="body-md font-semibold text-brand-secondary">Cart is currently empty</span>
                <span className="caption text-brand-tertiary mt-1">Scan an item or pick from the search box above to begin.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div 
                    key={item.productId}
                    className="flex items-center justify-between p-3 border border-brand-border rounded-md bg-brand-bg hover:bg-neutral-50/50 dark:hover:bg-brand-border/10 transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="body-md font-semibold text-brand-primary truncate">{item.name}</span>
                      <span className="caption text-brand-secondary font-mono">{item.sku} &bull; {formatCurrencyPrice(item.unitPrice)} each</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center border border-brand-border rounded">
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-brand-secondary hover:bg-neutral-100 dark:hover:bg-brand-border/30 cursor-pointer font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-0.5 body-md font-bold text-brand-primary min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-brand-secondary hover:bg-neutral-100 dark:hover:bg-brand-border/30 cursor-pointer font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="body-md font-bold text-brand-primary min-w-[4.5rem] text-right">
                        {formatCurrencyPrice(item.total)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeCartItem(item.productId)}
                        className="p-1 text-brand-secondary hover:text-status-out-text cursor-pointer transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Checkout Summary & Customer Details */}
        <Card level={1} className="p-6 flex flex-col justify-between h-full">
          <div>
            <h2 className="headline-sm text-brand-primary font-bold border-b border-brand-border pb-4 mb-5">
              Checkout & Payment
            </h2>

            <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
              <Input
                label="Customer Name / Organization"
                placeholder="Walk-in Customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                icon={<User className="h-4 w-4 text-brand-tertiary" />}
              />

              {/* Action Toggles for Discount and Note */}
              <div className="flex gap-4 items-center pt-1 select-none">
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

              {/* Discount Input */}
              {showDiscount && (
                <Input
                  label="Discount Percentage (%)"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                />
              )}

              {/* Note Input */}
              {showNote && (
                <Input
                  label="Transaction Memo"
                  placeholder="Internal notes or invoice remark..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              )}

              {/* Cart Calculations Summary */}
              <div className="border-t border-brand-border pt-4 mt-2 flex flex-col gap-2 bg-neutral-50/50 dark:bg-brand-border/20 p-4 rounded-md">
                <div className="flex justify-between text-xs text-brand-secondary font-medium">
                  <span>Total Items</span>
                  <span className="font-semibold text-brand-primary">{totalCartUnits} units ({cart.length} line items)</span>
                </div>
                <div className="flex justify-between text-xs text-brand-secondary font-medium">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-primary">{formatCurrencyPrice(cartSubtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-status-out-text font-medium">
                    <span>Discount ({discount}%)</span>
                    <span>-{formatCurrencyPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base text-brand-primary font-bold border-t border-brand-border pt-2 mt-1">
                  <span>Grand Total</span>
                  <span className="text-lg">{formatCurrencyPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Complete Checkout Button */}
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-DEFAULT text-sm font-bold disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Processing Transaction...' : 'Complete Sale & Print Invoice'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                {isFormDirty && (
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full py-2.5 rounded-DEFAULT text-xs"
                  >
                    Discard Transaction
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Transaction History Section */}
      <Card level={1} className="overflow-hidden mt-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center px-6 py-5 border-b border-brand-border gap-4">
          <div>
            <h2 className="headline-sm text-brand-primary font-bold">Transaction History</h2>
            <p className="caption text-brand-secondary mt-0.5">Audit log of all completed and pending point-of-sale invoices.</p>
          </div>
          
          <SearchBar
            placeholder="Search invoice TXN, product, SKU, customer..."
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
                    Invoice Code {renderSortIndicator('id')}
                  </TableCell>
                  <TableCell isHeader className="w-[30%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('productName')}>
                    Item Summary {renderSortIndicator('productName')}
                  </TableCell>
                  <TableCell isHeader className="w-[18%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('customer')}>
                    Customer {renderSortIndicator('customer')}
                  </TableCell>
                  <TableCell isHeader className="w-[10%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('quantity')}>
                    Qty Sold {renderSortIndicator('quantity')}
                  </TableCell>
                  <TableCell isHeader className="w-[12%] cursor-pointer select-none hover:text-brand-primary" onClick={() => handleSort('totalPrice')}>
                    Total Amount {renderSortIndicator('totalPrice')}
                  </TableCell>
                  <TableCell isHeader className="w-[10%]">Status</TableCell>
                  <TableCell isHeader className="w-[5%] text-right"></TableCell>
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
                    <TableCell className="text-right pr-4">
                      <button
                        onClick={() => setSelectedTransactionForModal(txn)}
                        className="p-1 text-brand-secondary hover:text-brand-primary rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 cursor-pointer transition-colors"
                        title="View Invoice Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
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

      {/* INVOICE DETAIL MODAL */}
      <Modal 
        isOpen={!!selectedTransactionForModal} 
        onClose={() => setSelectedTransactionForModal(null)} 
        title={`Sales Receipt: ${selectedTransactionForModal?.id}`}
      >
        {selectedTransactionForModal && (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex justify-between items-center pb-3 border-b border-brand-border">
              <div>
                <span className="caption text-brand-secondary font-bold block uppercase">Billed Customer</span>
                <strong className="body-lg text-brand-primary">{selectedTransactionForModal.customer}</strong>
              </div>
              <div className="text-right">
                <span className="caption text-brand-secondary font-bold block uppercase">Invoice Date</span>
                <span className="body-md font-mono text-brand-primary">{selectedTransactionForModal.date}</span>
              </div>
            </div>

            {/* Line items breakdown */}
            <div className="flex flex-col gap-2">
              <span className="caption font-bold text-brand-primary uppercase">Purchased Items</span>
              <div className="border border-brand-border rounded-md divide-y divide-brand-border">
                {selectedTransactionForModal.items && selectedTransactionForModal.items.length > 0 ? (
                  selectedTransactionForModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-brand-primary block">{item.productName}</strong>
                        <span className="text-brand-secondary font-mono">{item.sku} &bull; {item.quantity} x {formatCurrencyPrice(item.unitPrice)}</span>
                      </div>
                      <span className="font-bold text-brand-primary">{formatCurrencyPrice(item.quantity * item.unitPrice)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-brand-primary block">{selectedTransactionForModal.productName}</strong>
                      <span className="text-brand-secondary font-mono">{selectedTransactionForModal.sku} &bull; {selectedTransactionForModal.quantity} units</span>
                    </div>
                    <span className="font-bold text-brand-primary">{formatCurrencyPrice(selectedTransactionForModal.totalPrice)}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTransactionForModal.discount !== undefined && selectedTransactionForModal.discount > 0 && (
              <div className="flex justify-between text-xs text-status-out-text font-semibold px-1">
                <span>Applied Discount</span>
                <span>{selectedTransactionForModal.discount}% OFF</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-brand-border text-base font-bold text-brand-primary px-1">
              <span>Grand Total</span>
              <span className="text-lg">{formatCurrencyPrice(selectedTransactionForModal.totalPrice)}</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-brand-border">
              <Button variant="secondary" onClick={() => setSelectedTransactionForModal(null)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => { window.print(); }}>
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CLEAR FORM CONFIRMATION MODAL */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Discard Transaction Inputs?">
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            You have active items in your checkout cart. Are you sure you want to discard this transaction?
          </p>
          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Keep Cart
            </Button>
            <Button variant="primary" onClick={() => { resetForm(); setShowClearConfirm(false); }}>
              Clear Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

