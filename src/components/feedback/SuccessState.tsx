import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { SuccessStateProps } from '../../types/ui';

/**
 * Standardized SuccessState component.
 */
export const SuccessState: React.FC<SuccessStateProps> = ({ title = 'Success', message }) => {
  return (
    <div 
      role="status" 
      aria-live="polite"
      className="flex flex-col items-center justify-center py-8 px-6 text-center animate-fade-in select-none"
    >
      <CheckCircle2 className="h-12 w-12 text-status-stock-text mb-3 animate-pulse" />
      <h3 className="text-sm font-bold text-brand-primary">{title}</h3>
      <p className="caption text-brand-secondary mt-1 leading-relaxed">
        {message}
      </p>
    </div>
  );
};
