export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRetryConfig {
  retries: number;
  retryDelayMs: number;
  retryStatusCodes: number[];
}

export interface ApiRequestOptions<TBody = any, TQueryParams = any> {
  headers?: Record<string, string>;
  queryParams?: TQueryParams;
  pathParams?: Record<string, string | number>;
  body?: TBody;
  timeout?: number;
  retryConfig?: ApiRetryConfig;
  abortSignal?: AbortSignal;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
}

export interface ApiResponseMetadata {
  timestamp: string;
  requestId: string;
  processingTimeMs: number;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiHeaders {
  contentType?: string;
  accept?: string;
  authorization?: string;
  acceptLanguage?: string;
  timezone?: string;
  deviceInfo?: string;
  clientVersion?: string;
  correlationId?: string;
}
