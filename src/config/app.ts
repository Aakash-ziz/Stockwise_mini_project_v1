import { environment } from './environment';

export interface AppConfig {
  appName: string;
  version: string;
  defaultTheme: 'light' | 'dark';
  defaultLanguage: string;
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  dateFormat: string;
  currencyCode: string;
  timeZone: string;
}

/**
 * General application configurations.
 * NOTE: For preparation only. Do NOT import/use this inside application layouts or page views yet.
 */
export const appConfig: AppConfig = {
  appName: environment.appName,
  version: environment.appVersion,
  defaultTheme: 'light',
  defaultLanguage: 'en',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
  dateFormat: 'YYYY-MM-DD',
  currencyCode: 'INR',
  timeZone: 'UTC',
};
