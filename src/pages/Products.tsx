import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  Edit2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { SearchBar } from '../components/SearchBar';
import { Dropdown } from '../components/Dropdown';
import { useInventory } from '../context/InventoryContext';
import type { Product } from '../types/inventory';
import { ProductThumbnail } from '../components/ProductThumbnail';
import { useTable } from '../hooks/useTable';
import { CATEGORIES } from '../constants/inventory';
import { formatCurrencyPrice } from '../utils/format';
import { PageSkeleton, ErrorState, EmptyState } from '../components/feedback';
import { VALIDATION_MESSAGES, TOAST_MESSAGES } from '../utils';


export const Products: React.FC = () => {
  const { 
    products, 
    addProduct, 
    editProduct, 
    deleteProduct,
    totalStockValue,
    lowStockCount,
    loading,
    error
  } = useInventory();

  // Search and filter states
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  // Selection checkbox state
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Form states for Add/Edit Product
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    supplier: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minStock: '10'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All Categories', ...Array.from(cats)];
  }, [products]);

  // Check form dirtiness to alert unsaved changes
  const isFormDirty = useMemo(() => {
    if (editingProduct) {
      return (
        formData.name !== editingProduct.name ||
        formData.category !== editingProduct.category ||
        formData.supplier !== editingProduct.supplier ||
        parseFloat(formData.purchasePrice) !== editingProduct.purchasePrice ||
        parseFloat(formData.sellingPrice) !== editingProduct.sellingPrice ||
        parseInt(formData.quantity) !== editingProduct.quantity ||
        parseInt(formData.minStock) !== editingProduct.minStock
      );
    } else {
      return (
        formData.name !== '' ||
        formData.sku !== '' ||
        formData.supplier !== '' ||
        formData.purchasePrice !== '' ||
        formData.sellingPrice !== '' ||
        formData.quantity !== '' ||
        formData.minStock !== '10'
      );
    }
  }, [formData, editingProduct]);

  // Filter by category first
  const categoryFilteredProducts = useMemo(() => {
    return selectedCategory === 'All Categories'
      ? products
      : products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Integrate useTable hook
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    searchedData: filteredProducts,
    sortedData: sortedProducts,
    paginatedData: paginatedProducts,
    handleSort,
    renderSortIndicator
  } = useTable<Product>({
    data: categoryFilteredProducts,
    searchFields: ['name', 'sku', 'supplier'],
    initialPageSize: 10
  });

  // Handle checkboxes
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedRowIds(prev => [...prev, productId]);
    } else {
      setSelectedRowIds(prev => prev.filter(id => id !== productId));
    }
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = VALIDATION_MESSAGES.nameRequired;
    
    if (!formData.sku.trim()) {
      errors.sku = VALIDATION_MESSAGES.skuRequired;
    } else if (!editingProduct) {
      const isDuplicate = products.some(p => p.sku.trim().toLowerCase() === formData.sku.trim().toLowerCase());
      if (isDuplicate) {
        errors.sku = TOAST_MESSAGES.product.duplicateSku(formData.sku);
      }
    }

    if (!formData.supplier.trim()) errors.supplier = VALIDATION_MESSAGES.required;

    const pPrice = parseFloat(formData.purchasePrice);
    if (isNaN(pPrice)) errors.purchasePrice = VALIDATION_MESSAGES.required;
    else if (pPrice < 0) errors.purchasePrice = VALIDATION_MESSAGES.priceRequired;

    const sPrice = parseFloat(formData.sellingPrice);
    if (isNaN(sPrice)) errors.sellingPrice = VALIDATION_MESSAGES.required;
    else if (sPrice < 0) errors.sellingPrice = VALIDATION_MESSAGES.priceRequired;

    const qty = parseInt(formData.quantity);
    if (isNaN(qty)) errors.quantity = VALIDATION_MESSAGES.required;
    else if (qty < 0 || parseFloat(formData.quantity) % 1 !== 0) errors.quantity = VALIDATION_MESSAGES.invalidQuantity;

    const minSt = parseInt(formData.minStock);
    if (isNaN(minSt)) errors.minStock = VALIDATION_MESSAGES.required;
    else if (minSt < 0 || parseFloat(formData.minStock) % 1 !== 0) errors.minStock = VALIDATION_MESSAGES.invalidQuantity;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Product Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = addProduct({
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      supplier: formData.supplier,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock)
    });

    if (result.success) {
      setIsAddModalOpen(false);
      resetForm();
    } else if (result.error) {
      setFormErrors(prev => ({ ...prev, sku: result.error || '' }));
    }
  };

  // Edit Product Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!editingProduct) return;

    const result = editProduct(editingProduct.id, {
      name: formData.name,
      category: formData.category,
      supplier: formData.supplier,
      purchasePrice: parseFloat(formData.purchasePrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock)
    });

    if (result.success) {
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      supplier: product.supplier,
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
      minStock: product.minStock.toString()
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Confirm delete trigger
  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  // Delete product action confirmed
  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setSelectedRowIds(prev => prev.filter(id => id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  // Handle modal closing safely
  const handleCancelClick = () => {
    if (isFormDirty) {
      setShowCancelConfirm(true);
    } else {
      closeFormModals();
    }
  };

  const closeFormModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setShowCancelConfirm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'Electronics',
      supplier: '',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      minStock: '10'
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  if (error) {
    return <ErrorState title="Inventory Loading Failed" message={error} />;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="headline-lg text-brand-primary">Products</h1>
          <p className="body-md text-brand-secondary mt-1">Manage and track your inventory levels across all categories.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="flex items-center gap-2 py-2.5 rounded-DEFAULT w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card level={1} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <SearchBar
          placeholder="Search products by name, SKU or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-lg"
        />

        {/* Dropdown & Actions */}
        <div className="flex items-center gap-4">
          <Dropdown
            value={selectedCategory}
            options={categories}
            onChange={(val) => setSelectedCategory(val)}
            ariaLabel="Filter Category"
          />
        </div>
      </Card>

      {/* Products Table Card */}
      <Card level={1} className="overflow-hidden">
        {paginatedProducts.length === 0 ? (
          <EmptyState
            variant={searchQuery || selectedCategory !== 'All Categories' ? 'search' : 'products'}
          />
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow isHeader>
                  <TableCell isHeader className="w-[5%] !px-4 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredProducts.length > 0 && selectedRowIds.length === filteredProducts.length}
                      className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                    />
                  </TableCell>
                  <TableCell isHeader className="w-[25%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('name')}>
                    Product {renderSortIndicator('name')}
                  </TableCell>
                  <TableCell isHeader className="w-[12%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('sku')}>
                    SKU ID {renderSortIndicator('sku')}
                  </TableCell>
                  <TableCell isHeader className="w-[12%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('category')}>
                    Category {renderSortIndicator('category')}
                  </TableCell>
                  <TableCell isHeader className="w-[15%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('supplier')}>
                    Supplier {renderSortIndicator('supplier')}
                  </TableCell>
                  <TableCell isHeader className="w-[8%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('purchasePrice')}>
                    Purchase {renderSortIndicator('purchasePrice')}
                  </TableCell>
                  <TableCell isHeader className="w-[8%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('sellingPrice')}>
                    Selling {renderSortIndicator('sellingPrice')}
                  </TableCell>
                  <TableCell isHeader className="w-[6%] cursor-pointer select-none hover:text-brand-primary transition-colors" onClick={() => handleSort('quantity')}>
                    Stock {renderSortIndicator('quantity')}
                  </TableCell>
                  <TableCell isHeader className="w-[10%]">Status</TableCell>
                  <TableCell isHeader className="w-[10%] text-right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="!px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedRowIds.includes(p.id)}
                        onChange={(e) => handleSelectRow(p.id, e.target.checked)}
                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary h-3.5 w-3.5"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProductThumbnail type={p.thumbnailIcon} color={p.thumbnailColor} />
                        <span className="font-semibold text-brand-primary body-md leading-tight">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell isMonospace>{p.sku}</TableCell>
                    <TableCell className="text-brand-secondary font-medium">{p.category}</TableCell>
                    <TableCell className="text-brand-secondary font-medium">{p.supplier}</TableCell>
                    <TableCell className="font-medium">{formatCurrencyPrice(p.purchasePrice)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrencyPrice(p.sellingPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {p.quantity}
                      <span className="text-[10px] text-brand-tertiary block mt-0.5 font-normal">min: {p.minStock}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => startEditProduct(p)}
                          className="p-1 text-brand-secondary hover:text-brand-primary rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                        <button 
                          onClick={() => confirmDeleteProduct(p)}
                          className="p-1 text-brand-secondary hover:text-status-out-text rounded hover:bg-neutral-100 dark:hover:bg-brand-border/30 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {sortedProducts.length > pageSize && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-neutral-50/30 dark:bg-brand-border/10">
                <div className="flex items-center gap-4">
                  <span className="caption text-brand-secondary">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedProducts.length)} of {sortedProducts.length} products
                  </span>
                  
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-1.5 text-xs text-brand-secondary select-none">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                      className="border border-brand-border rounded px-1.5 py-0.5 bg-brand-bg text-brand-primary focus:outline-none"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
                
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

      {/* Bottom Summary Cards Widget Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Inventory Value Summary */}
        <Card level={1} className="p-6">
          <span className="caption text-brand-secondary font-bold block mb-1">Inventory Value</span>
          <div className="text-3xl font-bold tracking-tight text-brand-primary">
            ₹{totalStockValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-status-stock-text font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>4.2% from last month</span>
          </div>
        </Card>

        {/* Restock Alerts Summary */}
        <Card level={1} className="p-6">
          <span className="caption text-brand-secondary font-bold block mb-1">Restock Alerts</span>
          <div className="text-3xl font-bold tracking-tight text-brand-primary">{lowStockCount} SKUs</div>
          <div className="text-xs text-status-low-text font-semibold flex items-center gap-1 mt-2">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Requires immediate action</span>
          </div>
        </Card>

        {/* Sold this Week Summary */}
        <Card level={1} className="p-6">
          <span className="caption text-brand-secondary font-bold block mb-1">Sold this Week</span>
          <div className="text-3xl font-bold tracking-tight text-brand-primary">1,204 Units</div>
          <div className="text-xs text-brand-secondary font-medium flex items-center gap-1 mt-2">
            <TrendingUp className="h-3.5 w-3.5 text-brand-secondary" />
            <span>Consistent growth pattern</span>
          </div>
        </Card>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={handleCancelClick} title="Add New Product">
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            required
            placeholder="e.g. Dell Inspiron 15"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU ID"
              required
              placeholder="e.g. SW-EL-001"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              error={formErrors.sku}
            />
            <Input
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={CATEGORIES as unknown as string[]}
            />
          </div>

          <Input
            label="Supplier"
            required
            placeholder="e.g. Dell Direct"
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            error={formErrors.supplier}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Purchase (₹)"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
              error={formErrors.purchasePrice}
            />
            <Input
              label="Selling (₹)"
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={formData.sellingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
              error={formErrors.sellingPrice}
            />
            <Input
              label="Qty"
              type="number"
              required
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              error={formErrors.quantity}
            />
            <Input
              label="Min Stock"
              type="number"
              required
              placeholder="10"
              value={formData.minStock}
              onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
              error={formErrors.minStock}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" type="button" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT PRODUCT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={handleCancelClick} title="Edit Product Details">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU ID (Static)"
              required
              value={formData.sku}
              disabled
              className="opacity-80"
            />
            <Input
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={CATEGORIES as unknown as string[]}
            />
          </div>

          <Input
            label="Supplier"
            required
            value={formData.supplier}
            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            error={formErrors.supplier}
          />

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input
              label="Purchase (₹)"
              type="number"
              step="0.01"
              required
              value={formData.purchasePrice}
              onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
              error={formErrors.purchasePrice}
            />
            <Input
              label="Selling (₹)"
              type="number"
              step="0.01"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
              error={formErrors.sellingPrice}
            />
            <Input
              label="Qty"
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              error={formErrors.quantity}
            />
            <Input
              label="Min Stock"
              type="number"
              required
              value={formData.minStock}
              onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
              error={formErrors.minStock}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" type="button" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Confirm Product Deletion">
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            Are you sure you want to permanently delete <strong className="text-brand-primary">"{productToDelete?.name}"</strong> ({productToDelete?.sku})?
          </p>
          <p className="caption text-status-out-text font-semibold bg-status-out-bg/50 px-3 py-2 rounded-md">
            Warning: This action will remove this item from the active inventory database. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button 
              className="bg-status-out-text text-white hover:bg-red-700 dark:bg-status-out-text dark:text-white dark:hover:bg-red-600 font-semibold"
              onClick={handleDeleteConfirm}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* CANCEL FORM CHANGES CONFIRMATION MODAL */}
      <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} title="Discard Unsaved Changes?">
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            You have unsaved changes in this product form. Are you sure you want to discard your edits?
          </p>
          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setShowCancelConfirm(false)}>
              Keep Editing
            </Button>
            <Button variant="primary" onClick={closeFormModals}>
              Discard Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
