import React from 'react';

/**
 * PageSkeleton loader layout component to avoid custom placeholders logic.
 */
export const PageSkeleton: React.FC<{ variant?: 'dashboard' | 'table' }> = ({ variant = 'dashboard' }) => {
  if (variant === 'table') {
    return (
      <div 
        role="status" 
        aria-live="polite" 
        className="animate-pulse flex flex-col gap-4 w-full p-4 border border-brand-border rounded bg-brand-bg select-none"
      >
        <div className="flex gap-4 border-b border-brand-border pb-3">
          <div className="h-4 bg-neutral-200 dark:bg-brand-border rounded flex-1" />
          <div className="h-4 bg-neutral-200 dark:bg-brand-border rounded flex-1" />
          <div className="h-4 bg-neutral-200 dark:bg-brand-border rounded flex-1" />
        </div>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <div className="h-3.5 bg-neutral-100 dark:bg-brand-border rounded flex-1" />
            <div className="h-3.5 bg-neutral-100 dark:bg-brand-border rounded flex-1" />
            <div className="h-3.5 bg-neutral-100 dark:bg-brand-border rounded flex-1" />
          </div>
        ))}
      </div>
    );
  }

  // Dashboard skeleton layout
  return (
    <div 
      role="status" 
      aria-live="polite" 
      className="animate-pulse flex flex-col gap-6 w-full select-none"
    >
      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 border border-brand-border rounded bg-brand-bg/50 p-4 flex flex-col justify-between">
            <div className="h-3 bg-neutral-200 dark:bg-brand-border rounded w-1/2" />
            <div className="h-6 bg-neutral-100 dark:bg-brand-border rounded w-3/4" />
          </div>
        ))}
      </div>
      {/* Split block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-64">
        <div className="lg:col-span-2 border border-brand-border rounded bg-brand-bg/50" />
        <div className="border border-brand-border rounded bg-brand-bg/50" />
      </div>
    </div>
  );
};
export type PageSkeletonType = typeof PageSkeleton;
