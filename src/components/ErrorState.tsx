import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  retryText = 'Retry Operation'
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 select-none animate-fade-in" role="alert">
      <div className="h-12 w-12 rounded-full bg-status-out-bg border border-status-out-text/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-status-out-text stroke-[1.8]" />
      </div>
      
      <h3 className="text-sm font-semibold text-brand-primary leading-tight">
        {title}
      </h3>
      
      <p className="caption text-brand-secondary mt-1.5 max-w-sm leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 py-2 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{retryText}</span>
        </Button>
      )}
    </div>
  );
};
