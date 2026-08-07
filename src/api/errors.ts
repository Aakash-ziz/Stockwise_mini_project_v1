import type { ApiResponseMetadata } from './types';

/**
 * Standardized fields returned inside error payloads.
 */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  validationErrors?: Record<string, string[]>;
}

/**
 * Wrapper returned when endpoint failures occur.
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  metadata?: ApiResponseMetadata;
}
