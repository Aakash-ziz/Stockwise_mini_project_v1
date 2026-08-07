import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ErrorStateProps } from '../../types/ui';

/**
 * Standardized ErrorState feedback panel.
 * Exposes a generic visual layout, assertive ARIA announcements, and manual retry callback parameters.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Operation Failed', 
  message = 'An unexpected error occurred. Please try again.', 
  onRetry,
  retryText = 'Retry Request'
}) => {
  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className="flex flex-col items-center justify-center py-10 px-6 border border-status-out-bg rounded bg-status-out-bg/10 text-center animate-fade-in select-none"
    >
      <AlertCircle className="h-10 w-10 text-status-out-text mb-3" />
      <h3 className="text-sm font-bold text-status-out-text">{title}</h3>
      <p className="caption text-brand-secondary mt-1 max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-1.5 bg-brand-primary hover:bg-neutral-800 text-brand-bg font-semibold text-xs rounded transition-colors select-none cursor-pointer"
        >
          {retryText}
        </button>
      )}
    </div>
  );
};
