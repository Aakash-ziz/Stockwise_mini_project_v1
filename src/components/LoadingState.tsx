import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-neutral-100 dark:bg-brand-border/40 rounded-sm ${className}`} />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full flex flex-col gap-4 py-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex gap-4 px-6 py-4 items-center border-b border-brand-border last:border-b-0">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-4 ${
                cIdx === 0 ? 'w-[30%]' : cIdx === 1 ? 'w-[15%]' : 'w-[10%]'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="border border-brand-border bg-brand-card-bg rounded-md p-6 flex flex-col justify-between h-36">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
};

export const LoadingState: React.FC<{ variant?: 'table' | 'card' | 'spinner' }> = ({ variant = 'spinner' }) => {
  if (variant === 'table') {
    return <TableSkeleton />;
  }

  if (variant === 'card') {
    return <CardSkeleton />;
  }

  return (
    <div className="flex items-center justify-center p-8 w-full h-full min-h-[200px]" aria-busy="true" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-secondary border-t-brand-primary" />
    </div>
  );
};
