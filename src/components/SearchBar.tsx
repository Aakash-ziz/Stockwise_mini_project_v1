import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', ...props }) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-brand-tertiary" />
      </div>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-DEFAULT bg-neutral-50/30 dark:bg-brand-border/20 text-brand-primary placeholder:text-brand-tertiary body-md focus:outline-none focus:border-brand-primary focus:bg-brand-bg dark:focus:bg-brand-card-bg focus:ring-1 focus:ring-brand-primary transition-all"
        {...props}
      />
    </div>
  );
};
