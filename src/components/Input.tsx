import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  type?: string;
  options?: { value: string; label: string }[] | string[];
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  type = 'text',
  options,
  icon,
  className = '',
  id,
  ...props
}) => {
  const baseInputStyles =
    'w-full py-2.5 border rounded-DEFAULT bg-brand-bg text-brand-primary body-md focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:bg-neutral-50 dark:disabled:bg-brand-border/30 disabled:cursor-not-allowed';
  
  const paddingStyle = icon ? 'pl-10 pr-4' : 'px-3';

  const borderStyle = error
    ? 'border-status-out-text focus:border-status-out-text focus:ring-status-out-text'
    : 'border-brand-border';

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="caption font-bold text-brand-primary uppercase tracking-wide select-none"
        >
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {type === 'select' ? (
          <select
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`${baseInputStyles} ${paddingStyle} ${borderStyle}`}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {options?.map((opt) => {
              const val = typeof opt === 'string' ? opt : opt.value;
              const labelStr = typeof opt === 'string' ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {labelStr}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            id={inputId}
            type={type}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={`${baseInputStyles} ${paddingStyle} ${borderStyle}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {error && (
        <span
          id={errorId}
          className="text-[11px] font-semibold text-status-out-text leading-none mt-0.5 animate-fade-in"
        >
          {error}
        </span>
      )}
    </div>
  );
};
