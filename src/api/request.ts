import type { ApiMethod, ApiRequestOptions } from './types';

/**
 * Declares options and properties defining an API HTTP Request model.
 */
export interface ApiRequest<TBody = any, TQueryParams = any> {
  url: string;
  method: ApiMethod;
  options?: ApiRequestOptions<TBody, TQueryParams>;
}

export interface ApiRequestMetadata {
  correlationId?: string;
  clientTimestamp: string;
  deviceId?: string;
}
