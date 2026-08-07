export const CONSTANTS = {
  defaultPageSize: 10,
  maxUploadSizeBytes: 5242880, // 5MB limit
  localStorageKeys: {
    theme: 'theme',
    authToken: 'stockwise_auth_token',
  },
  theme: {
    light: 'light',
    dark: 'dark',
  },
  formats: {
    date: 'YYYY-MM-DD',
    currency: 'INR',
  },
  notifications: {
    defaultDurationMs: 4000,
  },
} as const;
