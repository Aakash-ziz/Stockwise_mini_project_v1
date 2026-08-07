import { environment } from './environment';

export interface ApiConfig {
  baseUrl: string;
  requestTimeout: number;
  defaultHeaders: Record<string, string>;
  contentType: string;
  auth: {
    tokenStorageKey: string;
    tokenPrefix: string;
    authHeaderKey: string;
  };
}

/**
 * Centrally managed API configuration mappings.
 * NOTE: For preparation only. Do NOT import/use this inside components or HTTP clients yet.
 */
export const apiConfig: ApiConfig = {
  baseUrl: environment.apiBaseUrl,
  requestTimeout: environment.requestTimeout,
  defaultHeaders: {
    'Accept': 'application/json',
  },
  contentType: 'application/json',
  auth: {
    tokenStorageKey: 'stockwise_auth_token',
    tokenPrefix: 'Bearer',
    authHeaderKey: 'Authorization',
  },
};
