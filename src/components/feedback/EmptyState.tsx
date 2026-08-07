import React from 'react';
import { PackageOpen, Search, AlertCircle, Sparkles, Bell } from 'lucide-react';
import { FEEDBACK_CONFIG } from '../../constants/feedback';
import type { EmptyStateProps } from '../../types/ui';

/**
 * Standardized EmptyState component mapping variants to centralized configurations and visual icons.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ variant = 'generic', title, description, action }) => {
  const defaults = FEEDBACK_CONFIG.emptyState[variant];
  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;

  let Icon = PackageOpen;
  if (variant === 'search') Icon = Search;
  else if (variant === 'reports') Icon = Sparkles;
  else if (variant === 'sales') Icon = AlertCircle;
  else if (variant === 'notifications') Icon = Bell;

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 select-none animate-fade-in">
      <div className="h-12 w-12 rounded-full border border-brand-border flex items-center justify-center mb-4 bg-neutral-50/50 dark:bg-brand-border/10">
        <Icon className="h-6 w-6 text-brand-secondary stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-brand-primary leading-tight">{finalTitle}</h3>
      <p className="caption text-brand-secondary mt-1.5 max-w-xs leading-relaxed">
        {finalDescription}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
