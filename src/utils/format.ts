/**
 * Formats a numeric value into a compact currency format (e.g. ₹1.3L or ₹84.2K).
 */
export const formatCurrencyCompact = (val: number): string => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)}Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}K`;
  }
  return val.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
};

/**
 * Formats a numeric value into a standard currency representation with customizable decimals.
 */
export const formatCurrency = (val: number, decimals: number = 0): string => {
  return val.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a price value with exactly two decimal places.
 */
export const formatCurrencyPrice = (val: number): string => {
  return `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

