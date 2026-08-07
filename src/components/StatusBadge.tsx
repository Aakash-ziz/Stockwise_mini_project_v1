import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normStatus = status.trim().toUpperCase();

  let colorClasses = '';

  switch (normStatus) {
    case 'IN STOCK':
    case 'DELIVERED':
    case 'HIGH VELOCITY':
      colorClasses = 'bg-status-stock-bg text-status-stock-text';
      break;
    case 'LOW STOCK':
    case 'PROCESSING':
    case 'ON HOLD':
    case 'WARNING':
      colorClasses = 'bg-status-low-bg text-status-low-text';
      break;
    case 'OUT OF STOCK':
    case 'SLOWING':
    case 'CRITICAL':
    case 'ERROR':
      colorClasses = 'bg-status-out-bg text-status-out-text';
      break;
    case 'STABLE':
    default:
      colorClasses = 'bg-neutral-100 text-neutral-600 dark:bg-brand-border dark:text-brand-secondary';
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase select-none ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
};
