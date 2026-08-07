import React from 'react';
import type { LoadingStateProps } from '../../types/ui';

/**
 * Standardized loading state indicator component.
 * Supports page, card, spinner, and button options with full theme-awareness and ARIA attributes.
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ variant = 'spinner', label = 'Loading data...' }) => {
  if (variant === 'page') {
    return (
      <div 
        role="status" 
        aria-live="polite" 
        className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center select-none"
      >
        <div className="h-10 w-10 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
        <span className="text-xs font-semibold text-brand-secondary">{label}</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div 
        role="status" 
        aria-live="polite"
        className="animate-pulse flex flex-col gap-4 p-5 border border-brand-border rounded bg-brand-bg/50"
      >
        <div className="h-4 bg-neutral-200 dark:bg-brand-border rounded w-1/3" />
        <div className="h-8 bg-neutral-100 dark:bg-brand-border rounded w-3/4" />
        <div className="h-3 bg-neutral-200 dark:bg-brand-border rounded w-1/2" />
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className="h-3.5 w-3.5 border-2 border-brand-border border-t-brand-primary rounded-full animate-spin" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="flex items-center gap-2 justify-center py-4"
    >
      <div className="h-5 w-5 border-2 border-brand-border border-t-brand-primary rounded-full animate-spin" />
      {label && <span className="caption text-brand-secondary font-medium">{label}</span>}
    </div>
  );
};
