import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { PageLayout } from './layouts/PageLayout';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { Toast } from './components/Toast';
import { Package, CreditCard } from 'lucide-react';
import './App.css';

// Separate routing component to use navigate safely
const AppContent = () => {
  const navigate = useNavigate();
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);

  const handleAction = (destination: string) => {
    setIsNewEntryModalOpen(false);
    navigate(destination);
  };

  return (
    <>
      <Toast />
      <PageLayout onNewEntryClick={() => setIsNewEntryModalOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </PageLayout>

      {/* Global New Entry Shortcut Modal */}
      <Modal 
        isOpen={isNewEntryModalOpen} 
        onClose={() => setIsNewEntryModalOpen(false)} 
        title="Initialize New Entry"
      >
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            Select the type of record you wish to initialize. You will be redirected to the respective interface.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {/* Add product option */}
            <button
              onClick={() => handleAction('/products')}
              className="flex flex-col items-center justify-center p-6 border border-brand-border rounded-md hover:bg-neutral-50 dark:hover:bg-brand-border/30 transition-all select-none group text-left w-full h-36 cursor-pointer"
            >
              <Package className="h-8 w-8 text-brand-secondary group-hover:text-brand-primary transition-colors stroke-[1.5]" />
              <span className="text-sm font-semibold text-brand-primary mt-3">Add Product</span>
              <span className="caption text-brand-tertiary mt-1">Register new inventory item</span>
            </button>

            {/* Complete Sale option */}
            <button
              onClick={() => handleAction('/sales')}
              className="flex flex-col items-center justify-center p-6 border border-brand-border rounded-md hover:bg-neutral-50 dark:hover:bg-brand-border/30 transition-all select-none group text-left w-full h-36 cursor-pointer"
            >
              <CreditCard className="h-8 w-8 text-brand-secondary group-hover:text-brand-primary transition-colors stroke-[1.5]" />
              <span className="text-sm font-semibold text-brand-primary mt-3">Process Sale</span>
              <span className="caption text-brand-tertiary mt-1">Complete customer purchase</span>
            </button>
          </div>

          <div className="flex justify-end border-t border-brand-border pt-4 mt-4">
            <Button variant="secondary" onClick={() => setIsNewEntryModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
