import { requestInterceptors, responseInterceptors } from './apiClient.js';
import { HEADER_KEYS } from './headers.js';

export interface RequestInterceptor {
  onSuccess?: (config: any) => any | Promise<any>;
  onError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onSuccess?: (response: any) => any | Promise<any>;
  onError?: (error: any) => any;
}

/**
 * Configure default request and response interceptors.
 * Prepares future authentication header wrappers and logs API request times.
 */
export const registerInterceptors = (): void => {
  // 1. Request Interceptor: Setup Correlation ID & prepare future Auth tokens
  requestInterceptors.push({
    onSuccess: (config) => {
      // Setup dynamic correlation header for request auditing
      config.headers = {
        ...config.headers,
        [HEADER_KEYS.correlationId]: `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // TODO: Fetch token from localStorage/cookies and inject Bearer header:
      // const token = localStorage.getItem('token');
      // if (token) {
      //   config.headers[HEADER_KEYS.authorization] = `Bearer ${token}`;
      // }

      return config;
    },
    onError: (error) => {
      return Promise.reject(error);
    },
  });

  // 2. Response Interceptor: Setup response logging metrics
  responseInterceptors.push({
    onSuccess: (response) => {
      // Track successes
      return response;
    },
    onError: (error) => {
      // Handle global error log translations
      return Promise.reject(error);
    },
  });
};
