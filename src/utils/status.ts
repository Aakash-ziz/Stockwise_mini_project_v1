/**
 * Calculates stock status based on current quantity and threshold limit.
 */
export const calculateStatus = (qty: number, minStock: number): 'IN STOCK' | 'LOW STOCK' | 'OUT OF STOCK' => {
  if (qty <= 0) return 'OUT OF STOCK';
  if (qty <= minStock) return 'LOW STOCK';
  return 'IN STOCK';
};
