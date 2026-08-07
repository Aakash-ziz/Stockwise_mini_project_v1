import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-DEFAULT button-font px-4 py-2 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-brand-primary text-brand-bg hover:bg-neutral-800 border-none font-medium dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200',
    secondary: 'bg-brand-bg border border-brand-border text-brand-primary hover:bg-neutral-50 font-medium dark:bg-transparent dark:border-brand-border dark:text-brand-primary dark:hover:bg-brand-border/20',
    ghost: 'bg-transparent border-none text-brand-secondary hover:text-brand-primary font-medium px-2 py-1 dark:hover:bg-brand-border/10',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
