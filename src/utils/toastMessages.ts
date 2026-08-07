export const TOAST_MESSAGES = {
  product: {
    created: (name: string) => `Product "${name}" registered successfully.`,
    updated: (name: string) => `Product "${name}" updated successfully.`,
    deleted: (name: string) => `Product "${name}" was deleted from inventory.`,
    duplicateSku: (sku: string) => `SKU ID "${sku}" is already registered.`,
  },
  sale: {
    recorded: (qty: number, name: string) => `Sale of ${qty}x "${name}" processed successfully.`,
    insufficientStock: (qty: number) => `Insufficient stock. Only ${qty} units available.`,
    skuNotFound: 'Product SKU not found in inventory.',
  },
  general: {
    validationFailed: 'Validation checks failed. Please check form parameters.',
    unexpectedError: 'An unexpected system error occurred.',
    networkError: 'Network communication failed. Operating offline.',
    saveFailed: 'Failed to save changes. Please try again.',
  }
} as const;
export type ToastMessageConfig = typeof TOAST_MESSAGES;
