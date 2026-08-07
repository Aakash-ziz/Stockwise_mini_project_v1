import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2;
  roundedSize?: 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  level = 1,
  roundedSize = 'md',
  children,
  className = '',
  ...props
}) => {
  const borderStyle = 'border border-brand-border bg-brand-card-bg';
  
  const roundedClass = {
    md: 'rounded-md', // 12px
    lg: 'rounded-lg', // 16px
  }[roundedSize];

  const shadowClass = {
    1: 'shadow-none',
    2: 'shadow-subtle-precision',
  }[level];

  return (
    <div
      className={`${borderStyle} ${roundedClass} ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
