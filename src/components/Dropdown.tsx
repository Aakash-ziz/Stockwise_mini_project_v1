import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

interface DropdownProps {
  value: string;
  options: string[] | { value: string; label: string }[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  minWidthClass?: string;
  align?: 'left' | 'right';
  ariaLabel?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  options,
  onChange,
  icon,
  minWidthClass = 'min-w-44',
  align = 'right',
  ariaLabel = 'Select option'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useClickOutside(dropdownRef, () => setIsOpen(false));


  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeLabel = options.reduce<string>((acc, opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? opt : opt.label;
    if (val === value) return label;
    return acc;
  }, value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-4 py-2 border border-brand-border rounded-DEFAULT bg-brand-bg text-brand-primary text-sm font-medium hover:bg-neutral-50 dark:hover:bg-brand-border/30 ${minWidthClass} justify-between select-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="truncate">{activeLabel}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-brand-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-full bg-brand-bg border border-brand-border rounded-DEFAULT shadow-subtle-precision py-1 z-20 max-h-60 overflow-y-auto animate-fade-in`}
        >
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            const isSelected = val === value;
            return (
              <button
                key={val}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(val)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-brand-border/30 transition-colors cursor-pointer ${
                  isSelected ? 'font-semibold text-brand-primary bg-neutral-50/50 dark:bg-brand-border/40' : 'text-brand-secondary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
