import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  BarChart3, 
  LineChart,
  Plus,
  X
} from 'lucide-react';

import { Button } from './Button';

interface SidebarProps {
  onNewEntryClick: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewEntryClick, isOpen = false, onClose }) => {
  const location = useLocation();
  const isReportsPage = location.pathname === '/reports';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Sales', path: '/sales', icon: CreditCard },
    { name: 'Product Analysis', path: '/analytics', icon: LineChart },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];


  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 border-r border-brand-border bg-brand-bg flex flex-col justify-between h-screen py-8 select-none z-50
        transition-transform duration-300 ease-in-out
        lg:sticky lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col">
          {/* Brand / Logo */}
          <div className="px-8 mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-brand-primary leading-none">StockWise</h1>
              <span className="text-xs text-brand-tertiary font-medium">Admin Console</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-brand-border/30 hover:text-brand-primary rounded-md lg:hidden transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="h-5 w-5 stroke-[1.8]" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-1 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => `
                    relative flex items-center gap-3 px-8 py-3.5 body-md transition-all duration-150
                    ${isActive 
                      ? 'text-brand-primary font-semibold after:content-[""] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-[3px] after:bg-brand-primary bg-neutral-50/20 dark:bg-brand-border/40' 
                      : 'text-brand-secondary hover:text-brand-primary hover:bg-neutral-50/30 dark:hover:bg-brand-border/20'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 stroke-[1.8]" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-6 flex flex-col gap-6">
          {/* "+ New Entry" Button */}
          <Button 
            variant="primary" 
            onClick={() => { onClose?.(); onNewEntryClick(); }} 
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-DEFAULT"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </Button>

          {/* Profile (Only on Reports Page) */}
          {isReportsPage && (
            <div className="flex items-center gap-3 border-t border-brand-border pt-6">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                alt="Administrator Avatar"
                className="h-10 w-10 rounded-full object-cover border border-brand-border"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-brand-primary truncate">Administrator</span>
                <span className="text-xs text-brand-secondary truncate">admin@stockwise.com</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
