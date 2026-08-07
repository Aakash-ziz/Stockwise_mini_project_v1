export interface Environment {
  appName: string;
  appVersion: string;
  env: 'development' | 'testing' | 'staging' | 'production';
  apiBaseUrl: string;
  requestTimeout: number;
  featureFlags: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableDebug: boolean;
    enableDarkMode: boolean;
    enableExperimentalFeatures: boolean;
  };
}

/**
 * Centrally managed environment configuration.
 * NOTE: Placeholder values are defined statically. Do NOT consume import.meta.env yet
 * and do NOT import/initialize this configuration in active application files.
 */
export const environment: Environment = {
  appName: 'StockWise',
  appVersion: '1.0.0',
  env: 'development',
  apiBaseUrl: 'http://localhost:5000/api',
  requestTimeout: 30000,
  featureFlags: {
    enableAnalytics: false,
    enableNotifications: true,
    enableDebug: true,
    enableDarkMode: true,
    enableExperimentalFeatures: false,
  },
};
