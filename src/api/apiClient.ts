import type { ApiRequestOptions } from './types.js';
import type { ApiResponse } from './response.js';
import { HEADER_KEYS } from './headers.js';

export interface ApiClient {
  get<TResponse = any, TQueryParams = any>(
    url: string,
    options?: ApiRequestOptions<never, TQueryParams>
  ): Promise<ApiResponse<TResponse>>;

  post<TResponse = any, TBody = any, TQueryParams = any>(
    url: string,
    options?: ApiRequestOptions<TBody, TQueryParams>
  ): Promise<ApiResponse<TResponse>>;

  put<TResponse = any, TBody = any, TQueryParams = any>(
    url: string,
    options?: ApiRequestOptions<TBody, TQueryParams>
  ): Promise<ApiResponse<TResponse>>;

  patch<TResponse = any, TBody = any, TQueryParams = any>(
    url: string,
    options?: ApiRequestOptions<TBody, TQueryParams>
  ): Promise<ApiResponse<TResponse>>;

  delete<TResponse = any, TQueryParams = any>(
    url: string,
    options?: ApiRequestOptions<never, TQueryParams>
  ): Promise<ApiResponse<TResponse>>;
}

// Interceptor lists exposed internally
export const requestInterceptors: Array<{
  onSuccess?: (config: any) => any | Promise<any>;
  onError?: (error: any) => any;
}> = [];

export const responseInterceptors: Array<{
  onSuccess?: (response: any) => any | Promise<any>;
  onError?: (error: any) => any;
}> = [];

const executeRequest = async <TResponse>(
  url: string,
  method: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<TResponse>> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const timeout = options.timeout || 10000;

  // 1. Resolve path variables & build full URL
  let path = url;
  if (options.pathParams) {
    Object.entries(options.pathParams).forEach(([key, value]) => {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    });
  }

  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const urlObj = new URL(`${cleanBaseUrl}${cleanPath}`);
  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
  }

  // 2. Prepare headers
  const headers: Record<string, string> = {
    [HEADER_KEYS.contentType]: 'application/json',
    [HEADER_KEYS.accept]: 'application/json',
    ...options.headers,
  };

  // 3. Prepare config object for request interceptors
  let config: any = {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.abortSignal,
  };

  // Run request interceptors
  for (const interceptor of requestInterceptors) {
    if (interceptor.onSuccess) {
      config = await interceptor.onSuccess(config);
    }
  }

  // 4. Handle request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const signal = config.signal || controller.signal;

  try {
    const response = await fetch(urlObj.toString(), {
      ...config,
      signal,
    });

    clearTimeout(timeoutId);

    // Run response interceptor onSuccess
    let resultResponse = response;
    for (const interceptor of responseInterceptors) {
      if (interceptor.onSuccess) {
        resultResponse = await interceptor.onSuccess(resultResponse);
      }
    }

    // Parse response
    let data: any = null;
    const contentType = resultResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && resultResponse.status !== 204) {
      data = await resultResponse.json();
    }

    if (!resultResponse.ok) {
      return {
        success: false,
        data: null as any,
        message: data?.message || `HTTP error! Status: ${resultResponse.status}`,
        error: {
          code: data?.error?.code || 'API_ERROR',
          message: data?.message || data?.error?.message || 'An unknown network error occurred',
          status: resultResponse.status,
          details: data?.errors || data?.error?.details || [],
        },
      };
    }

    // Normalized success response
    return {
      success: true,
      data: (data && 'data' in data ? data.data : data) as TResponse,
      message: data?.message || 'Success',
      pagination: data?.pagination,
      metadata: data?.metadata,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    let isTimeout = false;
    if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('aborted')) {
      isTimeout = true;
    }

    // Run response interceptor onError
    let finalError = error;
    for (const interceptor of responseInterceptors) {
      if (interceptor.onError) {
        finalError = await interceptor.onError(finalError);
      }
    }

    if (isTimeout) {
      return {
        success: false,
        data: null as any,
        message: 'Request timed out',
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'The connection timed out. Please try again.',
          status: 408,
          details: [],
        },
      };
    }

    return {
      success: false,
      data: null as any,
      message: finalError.message || 'Network connection unavailable',
      error: {
        code: 'NETWORK_ERROR',
        message: finalError.message || 'Failed to connect to the backend server. Verify your connection.',
        status: 503,
        details: [],
      },
    };
  }
};

export const apiClient: ApiClient = {
  get: (url, options) => executeRequest(url, 'GET', options),
  post: (url, options) => executeRequest(url, 'POST', options),
  put: (url, options) => executeRequest(url, 'PUT', options),
  patch: (url, options) => executeRequest(url, 'PATCH', options),
  delete: (url, options) => executeRequest(url, 'DELETE', options),
};
