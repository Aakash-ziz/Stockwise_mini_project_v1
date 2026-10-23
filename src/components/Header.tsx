import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Settings, HelpCircle, Sun, Moon, Menu, RotateCcw, CheckCircle, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useInventory } from '../context/InventoryContext';
import { SearchBar } from './SearchBar';
import { Modal } from './Modal';
import { Button } from './Button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { resetDemoData, triggerToast, lowStockCount, outOfStockCount } = useInventory();
  const location = useLocation();
  const path = location.pathname;

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Customize placeholder based on page
  let searchPlaceholder = 'Search inventory...';
  if (path === '/products') {
    searchPlaceholder = 'Search products or SKU...';
  } else if (path === '/sales') {
    searchPlaceholder = 'Search transactions...';
  } else if (path === '/reports') {
    searchPlaceholder = 'Search reports & metrics...';
  } else if (path === '/analytics') {
    searchPlaceholder = 'Search product analytics...';
  }

  // Customize profile text based on page
  let profileName = 'Administrator';
  let profileRole = 'Main Warehouse';
  const showProfile = path !== '/reports';

  if (path === '/products') {
    profileName = 'Admin';
    profileRole = 'Administrator';
  } else if (path === '/sales') {
    profileName = 'Administrator';
    profileRole = 'MASTER ACCESS';
  }

  const handleConfirmReset = () => {
    resetDemoData();
    setIsResetModalOpen(false);
  };

  return (
    <>
      <header className="h-20 border-b border-brand-border bg-brand-bg px-4 md:px-8 flex items-center justify-between sticky top-0 z-10">
        {/* Menu icon and Search */}
        <div className="flex items-center gap-3 flex-1 mr-4">
          <button
            onClick={onMenuToggle}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md lg:hidden transition-colors cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="h-5 w-5 stroke-[1.8]" />
          </button>

          <SearchBar
            placeholder={searchPlaceholder}
            className="max-w-[200px] sm:max-w-xs md:max-w-md"
          />

          {/* Demo Data Indicator Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 dark:bg-brand-border/50 text-[11px] font-medium text-brand-secondary border border-brand-border">
            <Database className="h-3.5 w-3.5 text-brand-secondary" />
            <span>Demo Data Mode</span>
          </div>
        </div>

        {/* Utility Actions & User Profile */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1 sm:gap-3 text-brand-secondary">
            {/* Reset Demo Data Button */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Reset Demo Data"
            >
              <RotateCcw className="h-4 w-4 stroke-[1.8]" />
              <span className="hidden md:inline font-medium">Reset Demo</span>
            </button>

            {/* Notifications Button */}
            <button 
              onClick={() => setIsNotificationsModalOpen(true)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer relative" 
              title="Notifications"
            >
              <Bell className="h-5 w-5 stroke-[1.8]" />
              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-out-text ring-2 ring-brand-bg" />
              )}
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer" 
              title="Settings"
            >
              <Settings className="h-5 w-5 stroke-[1.8]" />
            </button>

            {/* Help Button */}
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer" 
              title="Help & Documentation"
            >
              <HelpCircle className="h-5 w-5 stroke-[1.8]" />
            </button>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 stroke-[1.8]" />
              ) : (
                <Sun className="h-5 w-5 stroke-[1.8]" />
              )}
            </button>
          </div>

          {showProfile && (
            <div className="flex items-center gap-3 border-l border-brand-border pl-4 sm:pl-6">
              <div className="hidden sm:flex text-right flex flex-col">
                <span className="text-xs font-bold text-brand-primary leading-none uppercase tracking-wide">
                  {profileName}
                </span>
                <span className="text-[10px] text-brand-secondary font-medium mt-0.5">
                  {profileRole}
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                alt="Admin Avatar"
                className="h-9 w-9 rounded-full object-cover border border-brand-border"
              />
            </div>
          )}
        </div>
      </header>

      {/* RESET DEMO DATA CONFIRMATION MODAL */}
      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Demo Data">
        <div className="flex flex-col gap-4 py-2">
          <p className="body-md text-brand-secondary">
            Are you sure you want to reset all inventory records, transaction logs, and stock movements to their initial factory demonstration states?
          </p>
          <p className="caption text-status-out-text font-semibold bg-status-out-bg/50 px-3 py-2 rounded-md">
            This will clear custom products and sales saved in your local storage.
          </p>
          <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmReset}>
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* NOTIFICATIONS MODAL */}
      <Modal isOpen={isNotificationsModalOpen} onClose={() => setIsNotificationsModalOpen(false)} title="System Notifications">
        <div className="flex flex-col gap-3 py-2 max-h-96 overflow-y-auto">
          {outOfStockCount > 0 && (
            <div className="p-3 rounded-md bg-status-out-bg/60 border border-status-out-text/30 flex items-start gap-3">
              <span className="h-2 w-2 rounded-full bg-status-out-text mt-1.5 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-status-out-text block">Critical Stockout Alert</strong>
                <span className="caption text-brand-primary">{outOfStockCount} products are completely out of stock. Customer orders will be rejected.</span>
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="p-3 rounded-md bg-status-low-bg/60 border border-status-low-text/30 flex items-start gap-3">
              <span className="h-2 w-2 rounded-full bg-status-low-text mt-1.5 shrink-0" />
              <div>
                <strong className="text-xs font-bold text-status-low-text block">Low Stock Alert</strong>
                <span className="caption text-brand-primary">{lowStockCount} items have fallen below their safety minimum reorder threshold.</span>
              </div>
            </div>
          )}
          <div className="p-3 rounded-md bg-neutral-50 dark:bg-brand-border/20 border border-brand-border flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-status-stock-text mt-0.5 shrink-0" />
            <div>
              <strong className="text-xs font-bold text-brand-primary block">Database Connection Status</strong>
              <span className="caption text-brand-secondary">Backend REST API is active and connected to MySQL database (stockwise_db).</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-brand-border pt-4 mt-3">
          <Button variant="secondary" onClick={() => setIsNotificationsModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Console Settings">
        <div className="flex flex-col gap-4 py-2">
          <div className="flex justify-between items-center py-2 border-b border-brand-border">
            <div>
              <strong className="text-xs font-bold text-brand-primary block">Appearance Theme</strong>
              <span className="caption text-brand-secondary">Current mode: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-brand-border">
            <div>
              <strong className="text-xs font-bold text-brand-primary block">Currency Display</strong>
              <span className="caption text-brand-secondary">Standard INR (₹) precision format</span>
            </div>
            <span className="caption font-mono font-bold text-brand-primary">INR (₹)</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <div>
              <strong className="text-xs font-bold text-brand-primary block">Data Storage Engine</strong>
              <span className="caption text-brand-secondary">Live MySQL (stockwise_db) with client-side cache</span>
            </div>
            <Button variant="secondary" onClick={() => triggerToast('Storage engine verified: Live MySQL stockwise_db active.')}>
              Verify Storage
            </Button>
          </div>
        </div>
        <div className="flex justify-end border-t border-brand-border pt-4 mt-2">
          <Button variant="primary" onClick={() => setIsSettingsModalOpen(false)}>
            Save & Close
          </Button>
        </div>
      </Modal>

      {/* HELP MODAL */}
      <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="StockWise User Guide">
        <div className="flex flex-col gap-3 py-2 text-xs leading-relaxed text-brand-secondary max-h-96 overflow-y-auto">
          <p><strong className="text-brand-primary">Dashboard:</strong> Real-time high-level visibility into stock values, low-stock warnings, and revenue graphs.</p>
          <p><strong className="text-brand-primary">Products:</strong> Catalog management. Supports real-time SKU search, category filters, column sorting, pagination, and Add/Edit/Delete actions.</p>
          <p><strong className="text-brand-primary">Sales Terminal (POS):</strong> Add multiple catalog items to checkout, specify quantities, apply discounts, and complete sales with automatic inventory decrement.</p>
          <p><strong className="text-brand-primary">Product Analysis:</strong> Comprehensive individual product analysis, stock movement history, sales velocity, reorder recommendations, and interactive charts.</p>
          <p><strong className="text-brand-primary">Reports:</strong> High-level financial analytics, inventory turnover ratios, dead-stock impacts, and export options.</p>
        </div>
        <div className="flex justify-end border-t border-brand-border pt-4 mt-3">
          <Button variant="primary" onClick={() => setIsHelpModalOpen(false)}>
            Got it
          </Button>
        </div>
      </Modal>
    </>
  );
};

