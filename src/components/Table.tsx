import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full border-collapse text-left ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-brand-header-bg border-b border-brand-border ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-brand-border bg-brand-card-bg ${className}`} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  isHeader?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, isHeader = false, className = '', ...props }) => {
  const rowStyles = isHeader
    ? 'h-10'
    : 'h-16 hover:bg-neutral-50/50 dark:hover:bg-brand-border/20 transition-colors duration-100';
  return (
    <tr className={`${rowStyles} ${className}`} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
  isMonospace?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  isMonospace = false,
  className = '',
  ...props
}) => {
  const cellStyles = isHeader
    ? 'px-6 py-2 label-caps text-brand-secondary font-semibold'
    : 'px-6 py-3 body-md text-brand-primary align-middle';
  const monoClass = isMonospace ? 'font-mono text-xs text-brand-secondary font-medium tracking-wider' : '';
  
  if (isHeader) {
    return (
      <th className={`${cellStyles} ${className}`} {...props}>
        {children}
      </th>
    );
  }

  return (
    <td className={`${cellStyles} ${monoClass} ${className}`} {...props}>
      {children}
    </td>
  );
};
