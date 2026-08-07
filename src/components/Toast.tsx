import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, dismissToast } = useInventory();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = '';
        
        switch (toast.type) {
          case 'success':
            Icon = CheckCircle;
            colorClasses = 'border-status-stock-text text-status-stock-text dark:text-[#81c784]';
            break;
          case 'error':
            Icon = AlertCircle;
            colorClasses = 'border-status-out-text text-status-out-text dark:text-[#e57373]';
            break;
          case 'info':
          default:
            Icon = Info;
            colorClasses = 'border-brand-primary text-brand-primary';
            break;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-center justify-between gap-3 bg-brand-card-bg border border-brand-border border-l-2 p-4 rounded-md shadow-subtle-precision animate-slide-up"
            style={{ borderLeftColor: toast.type === 'success' ? 'var(--status-stock-text)' : toast.type === 'error' ? 'var(--status-out-text)' : 'var(--brand-primary)' }}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`h-5 w-5 shrink-0 stroke-[1.8] ${colorClasses}`} />
              <span className="body-md font-semibold text-brand-primary leading-tight">
                {toast.message}
              </span>
            </div>
            
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-brand-border/30 rounded text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer"
              title="Close Notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
