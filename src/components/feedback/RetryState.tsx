import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { RetryStateProps } from '../../types/ui';

/**
 * Standardized RetryState connector component.
 */
export const RetryState: React.FC<RetryStateProps> = ({ 
  onRetry, 
  title = 'Service Offline', 
  message = 'Failed to communicate with service. Would you like to reconnect?', 
  retryText = 'Reconnect' 
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-6 border border-brand-border rounded bg-brand-bg/30 text-center max-w-sm mx-auto select-none"
    >
      <RefreshCw className="h-8 w-8 text-brand-secondary mb-3 animate-spin duration-3000" />
      <h4 className="text-sm font-semibold text-brand-primary">{title}</h4>
      <p className="caption text-brand-secondary mt-1 leading-normal">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-bg text-xs font-bold rounded transition-all select-none cursor-pointer"
      >
        {retryText}
      </button>
    </div>
  );
};
