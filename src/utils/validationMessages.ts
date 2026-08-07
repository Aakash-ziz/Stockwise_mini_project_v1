export const VALIDATION_MESSAGES = {
  required: 'This field is required.',
  invalidEmail: 'Please enter a valid email address.',
  invalidQuantity: 'Quantity must be a positive whole number.',
  priceRequired: 'Price must be greater than zero.',
  nameRequired: 'Product name must be provided.',
  skuRequired: 'SKU Identifier is required.',
  skuFormat: 'SKU must match format (e.g. SW-EL-001).',
  discountRange: 'Discount percentage must be between 0 and 100.',
  unknown: 'Validation check failed. Unknown fields error.',
} as const;
export type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
